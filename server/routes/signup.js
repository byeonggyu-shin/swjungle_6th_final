import express from 'express';
import '../dotenv.js';
import { db } from '../connect.js';

/* log */
import { logger } from '../winston/logger.js';

const router = express.Router();

// 일반 유저 회원가입
router.post('/', async (req, res) => {
    const { email, name, password} = req.body;

    console.log(req.body);

    let connection = null;

    const imageUrl = 'https://cdn.pixabay.com/photo/2023/04/15/17/19/cat-7928232_1280.png'

    try {
      connection = await db.getConnection();
      const findUserSql = `SELECT * FROM User WHERE email = '${email}'`;
      const [result] = await connection.query(findUserSql)
      
      if(result[0]) {
        logger.info(`/routes/signup 폴더, post, ${email} 기존 회원이므로 회원가입 실패 !`);
        res.send({ success: false});
        return
      }

      const insertSql = `INSERT INTO User(email, user_name, profile_img, password) 
          VALUES (?, ?, ?, ?)`;
      await connection.query(insertSql, [email, name, imageUrl, password]);
      connection.release();

      logger.info(`/routes/signup 폴더, post, ${email} 회원가입 성공 !`);
      res.send({ success: true});

    } catch (err) {
      connection?.release();
      logger.error("/routes/signup 폴더, post, err : ", err);
      res.status(500).send('Internal Server Error'); // Send error response
    }
  
  });

export default router;