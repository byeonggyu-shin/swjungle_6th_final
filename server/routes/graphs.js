import express from 'express';
import '../dotenv.js';
import { db } from '../connect.js';

/* log */
import { logger } from '../winston/logger.js';
import { getGraphData } from '../middlewares/graphUtils.js';
import { disconnQuery, existQuery, findToConnQuery, findTobeConnQuery, tagInsertQuery } from '../db/connectQueries.js';

const router = express.Router();

router.get('/', async (req, res) => {

  let userId = undefined;
  if(Object.keys(res.locals).length !==0) { // /api/graph 이면서 token 값 있는 경우 사용자 정보
    /* 로그인 유저*/
    const {user} = res.locals;
    userId = user.user_id;
  }

  /* 다른 유저 */
  const otherUserId = req.query.userId;

  logger.info(`/routes/graphs 폴더, get, otherUserId : ${otherUserId}`);

  try {
    /* 다른 유저 그래프 조회 */
    if (otherUserId) {
      const graphData = await getGraphData(otherUserId);
      logger.info(
        `/routes/graphs 폴더, get, 다른 유저 ${otherUserId} 그래프 조회 !`,
      );
      return res.send(graphData);
    } 
    
    /* 기본 내 그래프 조회 */
    const graphData = await getGraphData(userId);
    logger.info(`/routes/graphs 폴더, get, 내 ${userId} 그래프 조회 !`);
    res.send(graphData);
  } catch (err) {
    logger.error('/routes/graphs 폴더, get, err : ', err);
    res.status(500).send('Internal Server Error'); // Send error response
  }
});


/*************************** 태그 간선 연결/제거  ************************/

/* /disconnect?tag1=A&tag2=B : tag A, B의 간선을 제거  */
router.delete('/disconnect', async (req, res) => {
  const { user } = res.locals;
  const userId = user.user_id;

  const tag1 = req.query.tag1;
  const tag2 = req.query.tag2;

  let connection = null;
  try {
    connection = await db.getConnection();
    /* tag1을 가진 파일 전부 찾기 */
    const [fileList] = await connection.query(findToConnQuery, [tag1, userId, userId]);
    console.log(fileList);

    /* 그 파일들에 대해 전부 tag2를 제거(Tag 테이블) */
    for (const file of fileList) {
      const [tagResult] = await connection.query(existQuery, [tag2, file.file_id]);
      console.log('tagResult: ', tagResult[0].count);
      if (tagResult[0].count > 0) {
        await connection.query(disconnQuery, [file.file_id, tag2]); 
      }
    }
    connection.release();
    console.log(`태그 [${tag1}]와 [${tag2}] 연결 끊기 성공!`);
    res.status(200).send(`태그 [${tag1}]와 [${tag2}] 연결 끊기 성공!`);
  } catch (err) {
    connection?.release();
    logger.error('/routes/graphs/ 폴더 router_delete 함수, post, err : ', err);
    res.status(500).send('Internal Server Error');
  }
});



/* /connect?tag1=A&tag2=B : tag A, B의 간선을 연결  */
router.post('/connect', async (req, res) => {
  const { user } = res.locals;
  const userId = user.user_id;

  const tag1 = req.query.tag1;
  const tag2 = req.query.tag2;

  let connection = null;
  try {
    connection = await db.getConnection();
    // tag1을 가진 파일을 찾는다. 
    const [fileList] = await connection.query(findToConnQuery, [tag1, userId]);
    // console.log(fileList); 

    // tag2 태그 인덱스
    const [tagIndex] = await connection.query(findTobeConnQuery, [tag2, userId]);
    // console.log(tagIndex, tagIndex[0].tag_index);

    // 그 파일에 대한 Tag.tag에 'tag2' 추가: tag, tag_index where user_id = ?
    // 종종 tag2에 대한 tag_index가 여러개인 경우 있지만, 유니크한 것이 정상이므로 첫번째 tag_index로 실행.
    for (const file of fileList) {
      await connection.query(tagInsertQuery, [file.file_id, tag2, tagIndex[0].tag_index]);
    }
    
    connection.release();
    console.log(`태그 [${tag1}]와 [${tag2}] 연결 성공!`);
    res.status(200).send(`태그 [${tag1}]와 [${tag2}] 연결 성공!`);
  } catch (err) {
    connection?.release();
    logger.error('/routes/graphs/ 폴더 router_put 함수, post, err : ', err);
    res.status(500).send('Internal Server Error');
  }
});



export default router;
