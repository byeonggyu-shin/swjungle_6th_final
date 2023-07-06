import express from 'express';
import '../dotenv.js';
import { db } from '../connect.js';
import { searchContent , searchTag, tagList, cardList } from '../db/searchQueries.js';

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

  const { tag } = req.body;

  let connection = null;

  try {
    connection = await db.getConnection();
    const [result] = await connection.query(cardList(userId, tag));

    logger.info("/routes/search/cards 폴더, get, 성공");
    res.send({result: result});
  } catch(err) {
    connection?.release();
    logger.error("/routes/search/cards 폴더, get, err : ", err);
    res.status(500).send('Internal Server Error');
  }

});

router.get('/contents', async (req, res) => {
  // console.log(req.query);
  const { search } = req.query;

  let connection = null;

  try {
    connection = await db.getConnection();
    const [ result ] = await connection.query(searchContent(search));

    let arr = [];
    for (let i = 0; i < result.length / 2; i++) {
      arr.push({
        cardTags: [result[i * 2].tag, result[i + 1].tag],
        cardKeyword: '# 1',
        cardContent: result[i * 2].content,
      });
    }

    logger.info(`/routes/search/contents 폴더, get, 내옹수 : ${arr.length} !`);

    return res.send({
      results: [arr[0]],
      cnt : arr.length,
    });
  } catch(err) {
    connection?.release();
    logger.error("/routes/search/contents 폴더, get, err : ", err);
    res.status(500).send('Internal Server Error');
  }
});

// router.get('/tags', async (req, res) => {
//   // console.log(req.query);
//   const { search } = req.query;

//   let connection = null;

//   try {
//     connection = await db.getConnection();
//     const [ result ] = await connection.query(searchTag(search));

//     let arr = [];
//     for (let i = 0; i < result.length / 2; i++) {
//       arr.push({
//         cardTags: [result[i * 2].tag, result[i + 1].tag],
//         cardKeyword: '# 1',
//         cardContent: result[i * 2].content,
//       });
//     }
//     logger.info(`/routes/search/tags 폴더, get, 내옹수 : ${arr.length} !`);

//     return res.send({
//       results: [arr[0]],
//       cnt : arr.length,
//     });
//   } catch(err) {
//     connection?.release();
//     logger.error("/routes/search/tags 폴더, get, err : ", err);
//     res.status(500).send('Internal Server Error');
//   }
// });

router.get('/contents/all', async (req, res) => {
  const { search, page, perPage } = req.query;

  let connection = null;

  try {
    connection = await db.getConnection();
    const [ result ] = await connection.query(searchContent(search));

    let arr = [];
    for (let i = 0; i < Math.floor(result.length / 2); i++) {
      arr.push({
        cardTags: [result[i * 2].tag, result[i * 2 + 1].tag],
        cardKeyword: `# ${i+1}`,
        cardContent: result[i * 2].content,
      });
    }
    
    logger.info(`/routes/search/contents/all 폴더, get, 내옹수 : ${arr.length} !`);

    const startIndex = (page - 1) * perPage;
    const endIndex = page * perPage;
    const slicedResults = arr.slice(startIndex, endIndex);
    
    logger.info(`/routes/search/contents/all 폴더, get, SI: ${startIndex}, EI: ${endIndex}`);

    return res.send({
      results: slicedResults,
      totalResults :  arr.length,
      totalPages: Math.ceil(arr.length / perPage),
      hasNextPage: endIndex < arr.length,
    });
  } catch(err) {
    connection?.release();
    logger.error("/routes/search/contents/all 폴더, get, err : ", err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/tags/all', async (req, res) => {
  const { search, page, perPage } = req.query;

  let connection = null;

  try {
    connection = await db.getConnection();
    const [ result ] = await connection.query(searchTag(search));

    let arr = [];
    for (let i = 0; i < Math.floor(result.length / 2); i++) {
      arr.push({
        cardTags: [result[i * 2].tag, result[i * 2 + 1].tag],
        cardKeyword: `# ${i+1}`,
        cardContent: result[i * 2].content,
      });
    }
    
    logger.info(`/routes/search/tags/all 폴더, get, 내옹수 : ${arr.length} !`);

    const startIndex = (page - 1) * perPage;
    const endIndex = page * perPage;
    const slicedResults = arr.slice(startIndex, endIndex);
    
    logger.info(`/routes/search/tags/all 폴더, get, SI: ${startIndex}, EI: ${endIndex}`);

    return res.send({
      results: slicedResults,
      totalResults :  arr.length,
      totalPages: Math.ceil(arr.length / perPage),
      hasNextPage: endIndex < arr.length,
    });
  } catch(err) {
    connection?.release();
    logger.error("/routes/search/tags/all 폴더, get, err : ", err);
    res.status(500).send('Internal Server Error');
  }
});

export default router;