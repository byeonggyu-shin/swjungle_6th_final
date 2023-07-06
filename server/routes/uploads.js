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
import { extractList } from '../services/jsonUtils.js';
import { combinedList }  from '../services/taglist.js';  
/* Tag ENDED */
// import { setTimeout } from 'timers/promises';   

/* log */
import { logger } from '../winston/logger.js';

/* query */
import { insertFileQuery } from '../db/uploadQueries.js';
import { insertTagQuery } from '../db/uploadQueries.js';


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


const extractTagFromImage = async (imgUrl, req, res) => {
  const time = Date.now();
  const arrival = Date.now() - time;
  console.log('arrival: ', arrival);
  
  const processedData = {
    imgUrl,
    content : '<Image>',
    tags: [],
  };
  
  const sumText = await processOCR(imgUrl);
  
  console.log('isImage :', isImage);
  if (!isImage(sumText)) {
    const tag = await generate(req, res, sumText) 
    console.log("extractTagFromImage :", tag);
    
    console.log('*** processedData.tags: ', processedData.tags);
    if (!processedData || !processedData.tags) {
      logger.error('Invalid JSON data. No "tags" property found in extractTagFromImage.');
      return processedData;
    }

    if (processedData.tags == null || processedData.tags.some(tag => tag == null)) {
      logger.error('/routes/uploads 폴더, post, Some tags are null in extractTagFromImage.');
      return processedData;
    }
    processedData.tags.push(...extractList(tag));
    processedData.content = sumText;
    console.log('not image');
    console.log(processedData);
    return processedData;
  } else {
    processedData.tags.push(...['Other']);
  }

  console.log(processedData);
  return processedData;
};


const executeQueries = async (connection, fileId, tag, tagIndex) => {
  console.log('/routes/uploads 폴더 in executeQueries');
  console.log('*** fileId, tag, tagIndex :', fileId, tag, tagIndex);

  try {
    /* tags가 'image'인 것은 tag:'기타', tag_index:0 으로 tag에 insert */
    if (tag == '<Image>') {
      console.log('***');
      console.log("tag == '<Image>'");
      await connection.query(insertTagQuery, [ fileId, tag, 0 ]);
    } else {
      await connection.query(insertTagQuery, [ fileId, tag, tagIndex]);
    }
  } catch (err) {
    logger.error('/routes/uploads 폴더, executeQueries', err);
  }
  return connection;
}


async function processChunk(req, res, chunk, delay) {
  const results = [];
  for (const imgUrl of chunk) {
    console.log('imgUrl :', imgUrl);
    const processedData = await extractTagFromImage(imgUrl, req, res);
      console.log('processedData');
      console.log(processedData);
      results.push(processedData);
    console.log(`processedData completed for ${imgUrl}`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  return results;
}


router.post('/', upload.array('photos'),
  async (req, res) => {
  console.log('/routes/uploads 폴더 in post/upload');

  const { user } = res.locals;    // authMiddleware 리턴값
  const userId = user.user_id;
  const imgUrlList = req.body;

  let connection = null;

  try {
    connection = await db.getConnection();  

    /* 모든 이미지를 S3로 저장, sumText.length != 0 인 것만 OCR 및 태그 추출 후 저장 */
    const limitCall = process.env.OCR_CALL_LIMIT;

    /* NaverOCR api call limit이 넘지 않게 5번 씩 나눠 보내기 */
    const imgUrlListLength = imgUrlList.length;
    const chunkSize = Math.ceil(imgUrlListLength / limitCall);

    const promises = [];
    for (let i = 0; i < imgUrlListLength; i += chunkSize) {
      const chunk = imgUrlList.slice(i, i + chunkSize);
      promises.push(processChunk(req, res, chunk, 1000));
    }

    const resultList = await Promise.all(promises);  // promise 배열을 한번에 풀어줌. 푸는 순서를 보장하지 않지만 n개를 동시에 풀어줌.
    
    console.log('resultList');
    console.log(resultList);
    connection.beginTransaction();
    for (const results of resultList) {
      for (const result of results) {
        const { imgUrl, content, tags } = result;
        console.log(result);
        console.log(result[0]);
        // 1. 이미지 파일 저장
        console.log('imgUrl, content, tags :', result.imgUrl, result.content, result.tags);
        const [ fileResult ] = await connection.query(insertFileQuery, [ userId, imgUrl, content ]);
        
        console.log('tags :', tags);
        // 2. 이미지 파일로 추출된 태그 저장
        for (const tag of tags) {
          /* Tag 가공 -> index, KR */
          const tagRow = combinedList.find(item => item.englishKeyword === tag);
          if (tagRow) {
            connection = await executeQueries(connection, fileResult.insertId, tagRow.koreanKeyword, tagRow.index);
          } else {
            logger.error(`/routes/uploads 폴더, post, No matching element found for ${tag}.`);
          }
        }
      }
    }
      connection.commit();
      console.log('commit');
      connection.release();
      res.write('SUCCESS');
      return res.end();

    } catch (err) {
      logger.error('/routes/uploads 폴더, post, err : ', err);
      connection.rollback();
      console.log('rollback');
      connection?.release();
      res.status(400).send('ERROR');
    }
  
  },
);



export default router;
