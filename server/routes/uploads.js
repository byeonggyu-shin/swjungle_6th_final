import express from 'express';
import '../dotenv.js';
import multer from 'multer';
/* MULTER-S3 ADDED */
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
/* OCR LINE ADDED */
import { db } from '../connect.js';
import { processOCR } from '../services/naverOCR.js';
import path from 'path';
/* OCR ENDED */
/* Tag LINE ADDED */
import { generate } from '../services/generate.js';
import { extractJson } from '../services/jsonUtils.js';
import { combinedList }  from '../services/taglist.js';  
/* Tag ENDED */
// import { setTimeout } from 'timers/promises';   

/* log */
import { logger } from '../winston/logger.js';

const s3 = new S3Client({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  correctClockSkew: true,
});

/* Multer */
const storage = multerS3({
  s3: s3,
  bucket: 'sw-jungle-s3',
  metadata: function (req, file, cb) {
    cb(null, {fieldName: file.fieldname});
  },
  key: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
  },
});

const upload = multer({ storage: storage });
const router = express.Router();

const isImage = (ocrResult) => {
  const tag =  ocrResult || '';
  if (tag.trim().length === 0) {
    return true;
  }
  return false;
};

/* Multer */
// router.get('/', (req, res) => {
//   res.sendFile(path.join(path.resolve(), './multipart.html'));
// });

const extractTagFromImage = async (imgUrl, req, res) => {
  const sumText = await processOCR(imgUrl);
  res.write(JSON.stringify({imgUrl: imgUrl, status: 'process OCR FINISEHD'}));
  let tagJSON = '<Image>';  
  if (!isImage(sumText)) {
    const tag = await generate(req, res, sumText); 
    tagJSON = extractJson(tag);
    console.log(tagJSON);
    /* 실시간 통신 */
    res.write(JSON.stringify({imgUrl: imgUrl, status: 'extract JSON FINISHED', data: tagJSON}));
  }
  return {
    imgUrl,
    sumText,
    tagJSON,
  };
};



router.post('/', upload.array('photos'),
  async (req, res) => {

    const { user } = res.locals;    // authMiddleware 리턴값
    const useId = user.user_id;

    const imgUrlList = req.body;

    let connection = null;
    try {
      connection = await db.getConnection();  
      const q1 = 'INSERT INTO File (user_id, img_url, content) VALUES (?, ?, ?)';   // SQL - File 
      const q2 = 'INSERT INTO Tag (file_id, tag, tag_index) VALUES (?, ?, ?)';      // SQL - Tag  
      
      /* 모든 이미지를 S3로 저장, sumText.length != 0 인 것만 OCR 및 태그 추출 후 저장 */
      const promises = [];
      for (const imgUrl of imgUrlList) {
        promises.push(extractTagFromImage(imgUrl, req, res));
      }
      const tagList = await Promise.all(promises);  // promise 배열을 한번에 풀어줌. 푸는 순서를 보장하지 않지만 n개를 동시에 풀어줌.
      
      for (const { tagJSON, sumText, imgUrl } of tagList) {
        if (tagJSON === '<Image>') continue;
        /* Tag 가공 -> index, KR */
        const tag1 = tagJSON.tags[0];   // tag english string
        const tag2 = tagJSON.tags[1];
        
        const tagRow1 = combinedList.find(item => item.englishKeyword === tag1);
        const tagRow2 = combinedList.find(item => item.englishKeyword === tag2);

        if (tagRow1 && tagRow2) {
        /* SQL - File */
          const [ result1 ] = await connection.query(q1, [ useId, imgUrl, sumText ]);
          // console.log(result1);
          /* SQL - Tag */
          const [ result2 ] = await connection.query(q2, [ result1.insertId, tagRow1.koreanKeyword, tagRow1.index ]);   // file's insertId, tag name(KR), tag[0] enum
          const [ result3 ] = await connection.query(q2, [ result1.insertId, tagRow2.koreanKeyword, tagRow2.index ]);   // file's insertId, tag name(KR), tag[1] enum
        } else {
          if (!tagRow1) {
            logger.info(`/routes/uploads 폴더, post, No matching element found for ${tag1}.`);
          }
          if (!tagRow2) {
            logger.info(`/routes/uploads 폴더, post, No matching element found for ${tag2}.`);
          }
        }
      }
      // console.log(tagList);
      connection.release();

      res.write('SUCCESS');
      return res.end();

    } catch (err) {
      connection?.release();
      logger.error('/routes/uploads 폴더, post, err : ', err);
      res.status(400).send('ERROR');
    }
  },
);



export default router;
