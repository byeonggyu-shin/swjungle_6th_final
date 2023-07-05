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
      console.log(' *** tagIndex :', tagIndex);
      const tmp1 = await connection.query(insertTagQuery, [ fileId, tag, tagIndex ]);  
    } else {
      console.log('2. --------------------------------------');
      console.log(' *** tagIndex :', tagIndex);
      // 2-1. taglist 테이블에 insert
      const tmp2 = await connection.query(insertTaglistQuery, [ userId, tag, tag, tagIndex ]);
      // 2-2. tag 테이블에 insert
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
  const { imgUrl, content, tags } = result;

  /* transaction 시작 */
  await connection.beginTransaction();
  
  const streamTags = [];
  try {
    /* SQL - File은 일단 저장 */
    const [ fileResult ] = await connection.query(insertFileQuery, [ userId, imgUrl, content ]);
  
    /* tagJSON의 tags가 'image'인 것은 tag:'기타', tag_index:0 으로 tag에 insert */
    if (tags == '<Image>') {
      console.log('***');
      console.log("tagJSON.tags == '<Image>':");
      console.log(tags);
      await connection.query(insertTagQuery, [ fileResult.insertId, content, 0 ]);
      connection.commit();
      return streamTags;
    }
    
    /* for문 2) N개의 각 태그에 대해 */
    // TODO: tags의 type이 array인지 확인하기가 필요한지 논의
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i];
      console.log('*** tag: ', tag);
      
      // 1. fix -> Taglist가 부모이므로 taglist에서 먼저 확인해야 한다.   
      const searchTag = tag.trim();
      console.log('*** searchTag: ', searchTag);
      const [tagListResult] = await connection.query(getTagListIndicesByUser, [userId, searchTag]);
    
      // 2-1. Taglist에 tag가 존재한다면
      if (tagListResult.length == 1) {
        console.log("*** Taglist에 tag가 존재한다면");
        // taglist 테이블에 insert, insertTagAndTagList에 전달할 flag가 true, taglist의 tag_index를 전달한다.
        connection = await insertTagAndTagList(connection, true, fileResult.insertId, tagListResult[0].tag, tagListResult[0].tag_index, userId);
      } 
      
      // 2-2. Taglist에 tag가 존재하지 않는다면
      else if (tagListResult.length == 0) {
        console.log("*** Taglist에 tag가 존재하지 않는다면");
        // 다음 tag_index를 구해서 taglist 테이블에도, tag 테이블에도 insert해야 한다.
        const nextIndex = await connection.query(getNextTagIndex);
        console.log(" %%%%%%%%%%%%%%%% ");
        console.log("nextIndex");
        console.log(nextIndex);
        connection = await insertTagAndTagList(connection, false, fileResult.insertId, tag, nextIndex, userId);
        
        // 프론트로 보낼 태그 리스트
        streamTags.push(tag);

      // 3. 예외 처리: 그외의 경우는 데이터 정합성이 안 맞는 경우이다. 
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
  const arrival = Date.now() - time;
  console.log('arrival: ', arrival);
  
  const processedData = {
    imgUrl,
    content: '<Image>',
    tags: '기타',
  };
  
  const sumText = await processOCR(imgUrl);
  
  if (!isImage(sumText)) {
    const tag = await generateConversation(req, res, sumText, userId);    
    processedData.tags = extractJson(tag);
    console.log('*** processedData.tags: ', processedData.tags);

    if (!processedData.tags || !processedData.tags) {
      logger.error('Invalid JSON data. No "tags" property found in extractTagFromImage.');
      return processedData;
    }

    if (processedData.tags == null || processedData.tags == '기타') {
      logger.error('/routes/uploads 폴더, post, Some tags are null in extractTagFromImage.');
      return processedData;
    }
    
    /* 프론트 */
    // res.write(JSON.stringify({imgUrl: imgUrl, status: 'extract JSON FINISHED', data: tagJSON}));
  }

  processedData.content = sumText;
  return processedData;
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
      console.log();
      for (const imgUrl of imgUrlList) {
        console.log('*** imgUrl(', i, ')');
        const processedData = extractTagFromImage(imgUrl, req, res, userId)
        promises.push(processedData);
        console.log('processedData : ', processedData);
        i++;
      }

      const processedList = await Promise.all(promises);  // promise 배열을 한번에 풀어줌. 푸는 순서를 보장하지 않지만 n개를 동시에 풀어줌.
      
      /* for문 각 이미지에 대해 */
      let j = 0;
      console.log();
      for (const result of processedList) {
        console.log('*** result(', j, ')');
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
