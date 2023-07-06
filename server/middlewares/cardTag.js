import '../dotenv.js';
import { db } from '../connect.js';
import { tagCardsQuery } from '../db/tagQueries.js';
import { cardTagsQuery } from '../db/tagQueries.js';

import { logger } from '../winston/logger.js';


export const getTagInfos = async (req, res) => {
  const tagname = req.query.tagname;
  // console.log(tagname);
  /* 로그인 유저 */
  const { user } = res.locals;    // authMiddleware 리턴값
  const userId = user.user_id;
  /* 다른 유저 */
  const otherUserId = req.query.userId;
  try {
    /* 다른 유저 태그 조회 */
    if (otherUserId) {
      const data = await getTagInfo(otherUserId, tagname);
      logger.info(`/routes/cards/cardTag 폴더 getTagInfos함수, get, otherUserId : ${otherUserId} 다른 유저 태그 조회!`);
      return res.status(200).send(data);
    }
    /* 내 태그 조회 */
    const data = await getTagInfo(userId, tagname);
    logger.info(`/routes/cards/cardTag 폴더 getTagInfos함수, get, userId : ${userId} 내 태그 조회!`);
    res.status(200).send(data);
  } catch (err) {
    logger.error('/routes/cards/cardTag 폴더 getTagInfos함수, get, err : ', err);
    res.status(500).send('Internal Server Error'); // Send error response
  }
};


const getTagInfo = async (userId, tagname) => {
  let connection = null;
  try {
    connection = await db.getConnection();
    const [result1] = await connection.query(tagCardsQuery, [userId, tagname]);

    let data = [];    // 최종 리턴할 배열
    for (let i = 0; i < result1.length; i++) {      // 해당 태그에 대한 파일들
      const [result2] = await connection.query(cardTagsQuery, [userId, result1[i].file_id]);

      let cardTag = [];
      for (let i = 0; i < result2.length; i++) {    // 한 파일에 대한 태그들
        cardTag.push(result2[i].tag);
      }
      let obj = {
        'cardId' : result1[i].file_id,
        'cardTag' : cardTag,
        'cardImg' : result1[i].img_url,
        'cardContent' : result1[i].content,
      };
      data.push(obj);
      // console.log(JSON.stringify(obj));
    }    
    connection.release();
    // logger.info(`/routes/cards/cardTag 폴더 getTagInfo함수, get, data : ${data}`);
    return data;

  } catch (err) {
    connection?.release();
    logger.error('/routes/cards/cardTag 폴더 getTagInfo함수, get, err : ', err);
    throw new Error('Internal Server Error'); // Send error response
  }
};
