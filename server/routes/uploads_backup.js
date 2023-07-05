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
import { generateConversation } from '../services/generate.js';
import { extractJson } from '../services/jsonUtils.js';
// import { combinedList }  from '../services/taglist.js';  
import translate from 'translate-google';
/* Tag ENDED */
import { setTimeout } from 'timers/promises';   

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


const extractTagFromImage = async (imgUrl, req, res, userId) => {
  const sumText = await processOCR(imgUrl);
  // res.write(JSON.stringify({imgUrl: imgUrl, status: 'process OCR FINISEHD'}));
  let tagJSON = '<Image>';  
  if (!isImage(sumText)) {
    const tag = await generateConversation(req, res, sumText, userId); 
    tagJSON = extractJson(tag);
    console.log('fr: extractTagFromImage: ', tagJSON);

    if (!tagJSON || !tagJSON.tags) {
      logger.error('Invalid JSON data. No "tags" property found in extractTagFromImage.');
      return { imgUrl, sumText, tagJSON, };
    }
    if (tagJSON.tags == null || tagJSON.tags.some(tag => tag == null)) {
      logger.error('/routes/uploads 폴더, post, Some tags are null in extractTagFromImage.');
      return { imgUrl, sumText, tagJSON, };
    }

    
    /* 프론트 */
    // res.write(JSON.stringify({imgUrl: imgUrl, status: 'extract JSON FINISHED', data: tagJSON}));
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
    const userId = user.user_id;
    const imgUrlList = req.body;
    
    // for (let imgUrl of imgUrlList) {
    //   let tag_result = extractTagFromImage(imgUrl, req, res, userId)
    //   console.log(tag_result);
    // }
    let connection = null;
    try {
      connection = await db.getConnection();  
      const q1 = 'INSERT INTO File (user_id, img_url, content) VALUES (?, ?, ?)';                         // SQL - File 
      const q2 = 'INSERT INTO Tag (file_id, tag, tag_index) VALUES (?, ?, ?)';                            // SQL - Tag   
      const q3 = 'INSERT INTO taglist (user_id, englishKeyword, koreanKeyword, tag_index) VALUES (?, ?, ?, ?)';       // SQL - taglist
      const q4 = "SELECT t.koreanKeyword, t.tag_index FROM taglist AS t WHERE user_id = ? AND replace(ucase(englishKeyword), ' ', '') = ?";        // 영어, 대문자로, 공백제거 -> 한글
      const q5 = 'SELECT MAX(tag_index) AS last_index FROM taglist WHERE user_id = ?';
      
    //   /* 모든 이미지를 S3로 저장, sumText.length != 0 인 것만 OCR 및 태그 추출 후 저장 */
      const promises = [];
      for (const imgUrl of imgUrlList) {
        promises.push(extractTagFromImage(imgUrl, req, res, userId));
      }
      const tagList = await Promise.all(promises);  // promise 배열을 한번에 풀어줌. 푸는 순서를 보장하지 않지만 n개를 동시에 풀어줌.
      
      /* for문 1) 각 이미지에 대해 */
      for (const result of tagList) {
        /* null값 에러처리 */
        if (result == null) {
          logger.error('tagJSON null이 제대로 return null 처리됨 in router.post upload.');
          continue;
        }
        const { tagJSON, sumText, imgUrl } = result;
        if (tagJSON === '<Image>' || tagJSON == null) {
          logger.error('tagJSON이 <Image>거나, null이 한 번 더 에러처리로 들어옴 in router.post upload.');
          continue;
        }
        /* SQL - File 사진은 일단 저장 */
        const [ FileResult ] = await connection.query(q1, [ userId, imgUrl, sumText ]);

        let streamTags = [];
        /* for문 2) N개의 각 태그에 대해 */
        for (let i = 0; i < tagJSON.tags.length; i++) {
          const tag = tagJSON.tags[i];
          console.log('fr: 태그: ', tag);
          // 1. taglist 존재 여부
          // SELECT t.koreanKeyword, t.tag_index FROM taglist AS t WHERE user_id = ? AND replace(ucase(englishKeyword), ' ', '') = ?
          const searchTag = tag.toUpperCase().replace(' ', '');
          console.log('searchTag :', searchTag);
          const [tagResult] = await connection.query(q4, [userId, searchTag]);     

          console.log('fr: 해당 태그에 대한 taglist: ', tagResult);
          // 2. 있으면 바로 Tag 테이블 저장.
          if (tagResult.length != 0) {
            await connection.query(q2, [ FileResult.insertId, tagResult[0].koreanKeyword, tagResult[0].tag_index ]);      // file_id, tag, tag_index
            streamTags.push(tagResult[0].koreanKeyword);    // res.write()로 보낼 한글 키워드
          } 
          // 3. 없으면 taglist에 새 태그 저장 후 Tag 테이블 저장
          else {
            logger.info(`/routes/uploads 폴더, post, No matching element found for ${tag}.`);
            // 3-1. 구글 번역 후 taglist 저장
            try {
              const translatedTag = await translate(tag, {to: 'ko'});   // 한글 키워드
              const [indexResult] = await connection.query(q5, userId);         // tag_index
              const tag_index = indexResult[0].last_index + 1;
              console.log('fr: 신규 taglist 영/한: ', tag, translatedTag);

              try {
                await connection.query(q3, [ userId, tag, translatedTag, tag_index ]);     // englishKeyword, koreanKeyword, tag_index + 1
                console.log(`fr: 신규 taglist: ${translatedTag} 저장 성공!`);
                // 3-2. Tag 테이블 저장.
                await connection.query(q2, [ FileResult.insertId, translatedTag, tag_index ]);          // file_id, tag, tag_index
                streamTags.push(translatedTag);
              } catch (err) {
                logger.info('/routes/uploads 폴더, post, Tag 테이블 INSERT 쿼리문 에러 발생: ', err);
              }
            } catch (err) {
              logger.info('/routes/uploads 폴더, post, 구글 translate에서 에러 발생: ', err);
            }
          } 
        }
        /* 프론트 */
        res.write(JSON.stringify({imgUrl: imgUrl, tags: streamTags}));
      }
      connection.release();
      // res.write('SUCCESS');
      return res.end();
      // res.status(200).send('SUCCESS');
      
    } catch (err) {
      connection?.release();
      logger.error('/routes/uploads 폴더, post, err : ', err);
      res.status(400).send('ERROR');
    }
  },
);



export default router;
