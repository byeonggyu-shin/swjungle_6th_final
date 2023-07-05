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
// import { generate } from '../services/generate.js';
import { generateConversation } from '../services/generate.js';
import { extractJson } from '../services/jsonUtils.js';
// import { combinedList }  from '../services/taglist.js';  
/* Tag ENDED */
// import { setTimeout } from 'timers/promises';   

/* log */
import { logger } from '../winston/logger.js';

/* query */
import { insertFileQuery } from '../db/uploadQueries.js';
import { insertTagQuery } from '../db/uploadQueries.js';
import { insertTaglistQuery } from '../db/uploadQueries.js';
import { getTagIndicesByUser } from '../db/uploadQueries.js';
import { getTagListIndicesByUser } from '../db/uploadQueries.js';
import { getNextTagIndex } from '../db/uploadQueries.js';


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


const insertTagAndTagList = async (connection, flag, fileId, tag, tagIndex, userId) => {
  console.log('*** tagIndex :', tagIndex);
  logger.info('*** insertTagAndTagList in /routes/uploads');
  try {
    if (flag == true) {
      // 1. tag 테이블에만 insert
      console.log('1. --------------------------------------');
      const tmp1 = await connection.query(insertTagQuery, [ fileId, tag, tagIndex ]);  
    } else {
      // 1. taglist 테이블에 insert
      const tmp2 = await connection.query(insertTaglistQuery, [ userId, tag, tag, tagIndex ]);
      // 2. tag 테이블에 insert
      const tmp1 = await connection.query(insertTagQuery, [ fileId, tag, tagIndex ]);
    }
  } catch (err) {
    connection.rollback();
    logger.error('/routes/uploads 폴더 insertTagAndTagList', err);
    console.log(err);
  }
  connection.commit();
  console.log('*** commit!');
  return connection;
}


const executeQueries = async (connection, result, userId) => {
  logger.info('/routes/uploads 폴더 in executeQueries');
  console.log('*** result :', result);
  const { tagJSON, sumText, imgUrl } = result;

  const streamTags = [];
  
  try {
    /* SQL - File은 일단 저장 */
    const [ fileResult ] = await connection.query(insertFileQuery, [ userId, imgUrl, sumText ]);
  
    /* tagJSON의 tags가 'image'인 것은 tag:'기타', tag_index:0 으로 tag에 insert */
    if (tagJSON.tags == '<Image>') {
      console.log('***');
      console.log("tagJSON.tags == '<Image>'-----------------");
      console.log(tagJSON.tags);
      await connection.query(insertTagQuery, [ fileResult.insertId, '기타', 0 ]);
      connection.release();
      return streamTags;
    }
    
    /* for문 2) N개의 각 태그에 대해 */
    for (let i = 0; i < tagJSON.tags.length; i++) {
      const tag = tagJSON.tags[i];
      console.log('*** tag: ', tag);
      
      // 1. Tag 테이블에서 존재 여부 확인 
      const searchTag = tag.trim();
      console.log('*** searchTag: ', searchTag);
      const [tagResult] = await connection.query(getTagIndicesByUser, [userId, searchTag]);

      // 2. TagList 테이블에서 존재 여부 확인
      const [tagListResult] = await connection.query(getTagListIndicesByUser, [userId, searchTag]);

      console.log('*** tagResult ------------------------');
      console.log(tagResult);

      console.log('*** tagListResult ------------------------');
      console.log(tagListResult);
      
      // 3. 예외 처리 : Tag 테이블과 TagList 테이블의 값이 일치하지 않는다면 데이터 정합성이 문제가 생긴 것이다.
      
      if (JSON.stringify(tagResult) !== JSON.stringify(tagListResult)) {
        throw new Error("Tag table and taglist table don't match1, 데이터 정합성이 맞지 않음");
      }
      
      // 4-1. 두 테이블에 정상적으로 tag가 존재한다면
      if (tagResult.length == 1 && tagListResult.length == 1) {
        console.log("*** 두 테이블에 정상적으로 tag가 존재한다면");
        // 4-1-1. tag, taglist 테이블에 insert
        connection = await insertTagAndTagList(connection, true, fileResult.insertId, tagResult[0].tag, tagResult[0].tag_index, userId);
      } 
      
      // 4-2. 두 테이블에 다 존재하지 않는다면
      else if (tagResult.length == 0 && tagListResult.length == 0) {
        console.log("*** 두 테이블에 다 존재하지 않는다면");
        // 4-2-1. 다음 tag_index를 구해야 한다.
        const [indexResult] = await connection.query(getNextTagIndex, [userId]);
        console.log('index :', indexResult[0].next_index);
        // console.log(indexResult);

        // 4-2-2. 위에서 구한 tag_index를 이용해서 tag, taglist 테이블에 insert
        connection = await insertTagAndTagList(connection, false, fileResult.insertId, tag, indexResult[0].next_index, userId);
        
        // 프론트로 보낼 태그 리스트
        streamTags.push(tag);
      
      // 4-3. 예외 처리: 그외의 경우는 데이터 정합성이 안 맞는 경우이다. 
      } else {
        throw new Error("Tag table and taglist table don't match2, 데이터 정합성이 맞지 않음");
      }
    }
    connection.release();

  } catch (err) {
    connection?.release();
    logger.error('/routes/uploads 폴더, executeQueries', err);
  }

  return streamTags;
}


const extractTagFromImage = async (imgUrl, req, res, userId) => {
  const time = Date.now();
  const sumText = await processOCR(imgUrl);
  const arrival = Date.now() - time;
  console.log('arrival: ', arrival);

  // res.write(JSON.stringify({imgUrl: imgUrl, status: 'process OCR FINISEHD'}));
  let tagJSON = { tags : '<Image>'};  
  if (!isImage(sumText)) {
    // const tag = await generate(req, res, sumText, userId);
    const tag = await generateConversation(req, res, sumText, userId);    
    tagJSON = extractJson(tag);
    console.log('fr: extractTagFromImage: ', tagJSON);

    if (!tagJSON || !tagJSON.tags) {
      logger.error('Invalid JSON data. No "tags" property found in extractTagFromImage.');
      tagJSON = { tags : '<Image>'};
      return { imgUrl, sumText, tagJSON };
    }

    if (tagJSON.tags == null || tagJSON.tags.some(tag => tag == null)) {
      logger.error('/routes/uploads 폴더, post, Some tags are null in extractTagFromImage.');
      tagJSON = { tags : '<Image>'};
      return { imgUrl, sumText, tagJSON };
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
    
    let connection = null;
    try {
      connection = await db.getConnection();        
      /* 모든 이미지를 S3로 저장, sumText.length != 0 인 것만 OCR 및 태그 추출 후 저장 */
      const promises = [];
      let i = 0;
      for (const imgUrl of imgUrlList) {
        console.log('imgUrl(', i, ')');
        let tagJSON = extractTagFromImage(imgUrl, req, res, userId)
        promises.push(tagJSON);
        console.log('tagJSON :', tagJSON);
        i++;
      }

      const tagList = await Promise.all(promises);  // promise 배열을 한번에 풀어줌. 푸는 순서를 보장하지 않지만 n개를 동시에 풀어줌.
      
      /* transaction 시작 */
      await connection.beginTransaction();

      /* for문 각 이미지에 대해 */
      let j = 0;
      for (const result of tagList) {
        console.log('result(', j, ')');
        console.log(result);
        let streamTags = executeQueries(connection, result, userId);

        /* 프론트 */
        res.write(JSON.stringify({imgUrl: result.imgUrl, tags: streamTags}));
        j++;
      }
      return res.end();      
    } catch (err) {
      connection?.release();
      logger.error('/routes/uploads 폴더, post, err : ', err);
      res.status(400).send('ERROR');
    }
  },
);


export default router;
