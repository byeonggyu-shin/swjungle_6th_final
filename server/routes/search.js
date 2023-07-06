import express from 'express';
import '../dotenv.js';
import { db } from '../connect.js';
import { tagList, cardList, countCard } from '../db/searchQueries.js';

import { logger } from '../winston/logger.js';

const router = express.Router();

router.get('/tags', async (req, res) => {
  const { user } = res.locals;
  const userId = user.user_id;

  const {keyword} = req.query;

  let connection = null;

  try {
    connection = await db.getConnection();
    const [result] = await connection.query(tagList(userId, keyword));
  
    const arr = result.map(item => item.tag);
  
    logger.info("/routes/search/tags 폴더, get, 성공");
    res.send({result : arr});
  } catch(err) {
    connection?.release();
    logger.error("/routes/search/tags 폴더, get, err : ", err);
    res.status(500).send('Internal Server Error');
  }

});

router.post('/cards', async (req, res) => {
  const { user } = res.locals;
  const userId = user.user_id;

  console.log("userId : ", userId);

  const { tag, page, perPage } = req.body;

  let connection = null;

  try {
    connection = await db.getConnection();
    
    const offset = (page - 1) * perPage;
    const [result] = await connection.query(cardList(userId, tag, offset, perPage));

    console.log("result_cnt : ", result.length);

    const [countResult] = await connection.query(countCard(userId, tag));
    const totalResults = countResult[0].total;

    console.log("totalResults : ", totalResults);

    logger.info("/routes/search/cards 폴더, get, 페이지네이션, 성공");

    res.send({
      result,
      totalResults,
      totalPages: Math.ceil(totalResults / perPage),
      hasNextPage: (offset + result.length) < totalResults,
    });
  } catch(err) {
    connection?.release();
    logger.error("/routes/search/cards 폴더, get, err : ", err);
    res.status(500).send('Internal Server Error');
  }

});

export default router;