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

/* Tag LINE ADDED */
// import { generate } from '../services/generate.js';
import { generateConversation } from '../services/generate.js';
import { extractList } from '../services/jsonUtils.js';

import { setTimeout } from 'timers/promises';   

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

const extractTagFromImage = async (req, res, imgUrl, userId) => {
  const time = Date.now();
  const arrival = Date.now() - time;
  console.log('arrival: ', arrival);
  
  const processedData = {
    imgUrl,
    content: '<Image>',
    tags: [],
  };
  
  const sumText = await processOCR(imgUrl);
  
  // console.log('isImage :', isImage);
  if (!isImage(sumText)) {
    const tag = await generateConversation(req, res, sumText, userId);    
    console.log("extractTagFromImage :", tag);

    if (!processedData.tags || !processedData.tags) {
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
    processedData.tags.push(...['기타']);
  }

  console.log(processedData);
  return processedData;
};

const insertTagAndTagList = async (connection, flag, fileId, tag, tagIndex, userId) => {
  logger.info('*** insertTagAndTagList in /routes/uploads');
  console.log('*** insertTagAndTagList in /routes/uploads');
  console.log('*** tagIndex :', tagIndex);

  try {
    if (flag == true) {
      // 1. tag 테이블에만 insert
      console.log('1. --------------------------------------');
      console.log(' *** tagIndex :', tagIndex);
      await connection.query(insertTagQuery, [ fileId, tag, tagIndex ]);  
    } else {
      console.log('2. --------------------------------------');
      console.log(' *** tagIndex :', tagIndex);
      // 2-1. taglist 테이블에 insert
      await connection.query(insertTaglistQuery, [ userId, tag, tag, tagIndex ]);
      // 2-2. tag 테이블에 insert
      await connection.query(insertTagQuery, [ fileId, tag, tagIndex ]);
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
  console.log('/routes/uploads 폴더 in executeQueries');
  const { imgUrl, content, tags } = result;

  /* transaction 시작 */
  await connection.beginTransaction();

  try {
    const [ fileResult ] = await connection.query(insertFileQuery, [ userId, imgUrl, content ]);

    /* tagJSON의 tags가 'image'인 것은 tag:'기타', tag_index:0 으로 tag에 insert */
    if (tags == '<Image>') {
      console.log('***');
      console.log("tagJSON.tags == '<Image>'");
      console.log(tags);
      await connection.query(insertTagQuery, [ fileResult.insertId, content, 0 ]);
      connection.commit();

    } else {

      /* for문 2) N개의 각 태그에 대해 */
      // TODO: tags의 type이 array인지 확인하기가 필요한지 논의
      for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        console.log('*** i :', i);
        console.log('*** tag: ', tag);
        
        // 1. fix -> Taglist가 부모이므로 taglist에서 먼저 확인해야 한다.   
        const searchTag = tag.trim();
        console.log('*** searchTag: ', searchTag);
        const [tagListResult] = await connection.query(getTagListIndicesByUser, [userId, searchTag ]);
      
        // 2-1. Taglist에 tag가 존재한다면
        if (tagListResult.length == 1) {
          console.log("*** Taglist에 tag가 존재한다면");
          // taglist 테이블에 insert, insertTagAndTagList에 전달할 flag가 true, taglist의 tag_index를 전달한다.
          connection = await insertTagAndTagList(connection, true, fileResult.insertId, tag, tagListResult[0].tag_index, userId);
        
        // 2-2. Taglist에 tag가 존재하지 않는다면
        } else if (tagListResult.length == 0) {
          console.log("*** Taglist에 tag가 존재하지 않는다면");
          // 다음 tag_index를 구해서 taglist 테이블에도, tag 테이블에도 insert해야 한다.
          const [indexResult] = await connection.query(getNextTagIndex, []);
          console.log(" %%%%%%%%%%%%%%%% ");
          console.log("nextIndex");
          console.log(indexResult[0].nextIndex);
          connection = await insertTagAndTagList(connection, false, fileResult.insertId, tag, indexResult[0].nextIndex, userId);
        
        // 프론트로 보낼 태그 리스트
        // streamTags.push(tag);

        // 3. 예외 처리: 그외의 경우는 데이터 정합성이 안 맞는 경우이다. 
        } else {
          throw new Error("Tag table and taglist table don't match2, 데이터 정합성이 맞지 않음");
        }
      }
    }
    connection.commit();
    console.log('commit!');
    return connection;
  } catch (err) {
    connection.rollback();
    console.log('rollback!');
    logger.error('/routes/uploads 폴더, executeQueries', err);
  }
  return connection;
}

async function processSlice(req, res, urlList, userId) {
  try {
    const results = await Promise.all(urlList.map(async (imgUrl) => {
    console.log("*** processSlice");
    console.log('imgUrl :', imgUrl);

    const processedData = await extractTagFromImage(req, res, imgUrl, userId);
    console.log('processedData');
    console.log(processedData);
  
    return processedData;
    }));
  } catch (err) {
    logger.error('/routes/uploads 폴더, processSlice:', err);
    throw err; // Rethrow the error to be caught in the calling function
  }
}

async function processChunk(req, res, chunk, delay, userId) {
  try {
    const results = [];
    for (const imgUrl of chunk) {
      console.log("*** processChunk");
      console.log('imgUrl :', imgUrl);
      const processedData = await extractTagFromImage(req, res, imgUrl, userId);
      console.log('processedData');
      console.log(processedData);
      results.push(processedData);
      console.log(`processedData completed for ${imgUrl}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return results;
  } catch (err) {
    logger.error('/routes/uploads 폴더, processChunk:', err);
    throw err; // Rethrow the error to be caught in the calling function
  }
}


async function processImgUrlList(req, res, imgUrlList, limitCall, userId) {
  console.log('processImgUrlList');
  const imgUrlListLength = imgUrlList.length;
  const chunkSize = Math.ceil(imgUrlListLength / limitCall);
  const promises = [];
  try {
    if (imgUrlListLength < limitCall) {
      const promise = processSlice(req, res, imgUrlList, userId);
      promises.push(promise);
    } else {
      for (let i = 0; i < imgUrlListLength; i += chunkSize) {
        const chunk = imgUrlList.slice(i, i + chunkSize);
        const promise = processChunk(req, res, chunk, 1000, userId);
        promises.push(promise);
      }
    }
    return await Promise.all(promises); // Await the resolution of promises and return the resolved array
  } catch (err) {
    logger.error('/routes/uploads 폴더, processImgUrlList : ', err);
    throw err;
  }
}


router.post('/', upload.array('photos'),
  async (req, res) => {
    console.log('/routes/uploads 폴더 in post/upload');

    const { user } = res.locals;    // authMiddleware 리턴값
    const userId = user.user_id;
    const imgUrlList = req.body;

    console.log('imgUrlList :', imgUrlList);
    console.log(req.body);

    let connection = null;
    try {
      connection = await db.getConnection();        
     
      /* NaverOCR api call limit이 넘지 않게 5번 씩 나눠 보내기 */
      const limitCall = process.env.OCR_CALL_LIMIT;
      const promises = processImgUrlList(req, res, imgUrlList, limitCall, userId)
      try {
        console.log('Promise.all(promises) start');
        console.log(promises);
        const processedList = await Promise.all(processImgUrlList(req, res, imgUrlList, limitCall, userId));
        console.log('Promise.all(promises) done');
        console.log('processedList');
        console.log(processedList);
      } catch (err) {
        console.log(promises);
        logger.error("Promise.all in post('/', upload.array('photos') :", err);
      }
      

      /* for문 각 이미지에 대해 */
      let j = 0;
      console.log();
      for (const results of processedList) {
        for (const result of results) {
          console.log('*** result(', j, ')');
          console.log('imgUrl, content, tags :', result.imgUrl, result.content, result.tags);

          // 2. 이미지 파일로 추출된 태그 저장
          /* Tag 가공 -> index, KR */
          connection = await executeQueries(connection, result, userId);
        }
        j++;
      }
    } catch (err) {
      connection?.release();
      logger.error("post('/', upload.array('photos') :", err);
      res.status(400).send('ERROR');
    }
    connection.release();
    res.end(); 
  },
);


export default router;