import '../dotenv.js';
import { db } from '../connect.js';
import { followAddQuery } from '../db/followQueries.js';
import { followDeleteQuery } from '../db/followQueries.js';
import { findFollowQuery } from '../db/followQueries.js';
import { recentCardQuery } from '../db/followQueries.js';
import { profileQuery } from '../db/socialQueries.js';

import { logger } from '../winston/logger.js';


export const followAdd = async (req, res) => {
  const { user } = res.locals;
  const userId = user.user_id;
  const following_id = req.query.followId;

  let connection = null;
  try {
    connection = await db.getConnection();
    const [result] = await connection.query(followAddQuery, [userId, following_id]);
    connection.release();
    logger.info('/routes/social/follow 폴더 followAdd함수, post 성공 !');
    res.status(200).send(`User ${userId} has started following User ${following_id}.`);
  } catch (err) {
    connection?.release();
    logger.error('/routes/social/follow 폴더 followAdd함수, post, err : ', err);
    res.status(500).send('Internal Server Error');
  }
};


export const followDelete = async (req, res) => {
  const { user } = res.locals;
  const userId = user.user_id;
  const following_id = req.query.followId;

  let connection = null;
  try {
    connection = await db.getConnection();
    const [result] = await connection.query(followDeleteQuery, [userId, following_id]);
    connection.release();
    logger.info('/routes/social/follow 폴더 followDelete함수, post 성공 !');
    res.status(200).send(`User ${userId} has canceled a follow to User ${following_id}.`);
  } catch (err) {
    connection?.release();
    logger.error('/routes/social/follow 폴더 followDelete함수, post, err : ', err);
    res.status(500).send('Internal Server Error');
  }
};


export const updatedCards = async (req, res) => {
  const { user } = res.locals;
  const userId = user.user_id;

  let connection = null;
  try {
    connection = await db.getConnection();
    const [followList] = await connection.query(findFollowQuery, [userId]);
    /* admin 계정 디폴트로 띄우기 */
    followList.unshift( { following_id: 130 });
    
    // console.log('fr: ', followList);

    let data = [];
    for (const user of followList) {
      const following_id = user.following_id;
      /* 최근 업로드한 카드 한 장 */
      const [recentCard] = await connection.query(recentCardQuery, following_id);
      
      /* If recentCard[0] is not defined, skip to the next iteration */
      if (!recentCard[0]) continue;
      const cardId = recentCard[0].file_id;

      /* 유저 정보 */
      const [userResult] = await connection.query(profileQuery, following_id);

      const obj = {
        cardId: cardId,
        userId: following_id,
        userName: userResult[0].user_name,
        profile_img: userResult[0].profile_img,
      };
      data.push(obj);
    }
    connection.release();
    logger.info('/routes/social/follow 폴더 updatedCards함수, post 성공 !');
    res.status(200).send(data);
  } catch (err) {
    connection?.release();
    logger.error('/routes/social/follow 폴더 updatedCards함수, post, err : ', err);
    res.status(500).send('Internal Server Error');    
  }
};

