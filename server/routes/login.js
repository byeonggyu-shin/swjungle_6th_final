import express from 'express';
import '../dotenv.js';
import jwt from 'jsonwebtoken';
import { db } from '../connect.js';

import bcrypt from 'bcrypt';

/* log */
import { logger } from '../winston/logger.js';

const router = express.Router();

router.post('/generic', async(req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  const pwHash = await bcrypt.hash(password, 12);

  let connection = null;

  try {
    connection = await db.getConnection();
    const sql = `SELECT * FROM User WHERE email = '${email}'`;
    const [result] = await connection.query(sql);
    connection.release();
  
    if (result[0]) {
      const hashPassword = result[0].password;

      const isPasswordMatch = await bcrypt.compare(password, hashPassword);

      if (isPasswordMatch) {
        const token = jwt.sign({ userId: result[0].user_id }, 'customized-secret-key');
        const userId = result[0].user_id;
        logger.info(`/routes/login/generic 폴더, post, ${userId} 회원가입 후, 로그인 성공 !`);
        res.send({ success: true, token, userId });  
      } else {
        logger.info('/routes/login/generic 폴더, post 비밀번호 불일치로 로그인 실패');
        res.send({ success: false  });
      }
    } else {
      logger.info('/routes/login/generic 폴더, post 로그인 실패');
      res.send({ success: false  });
    }
  } catch (err) {
    connection?.release();
    logger.error('/routes/login/generic 폴더, post, err : ', err);
    res.status(500).send('Internal Server Error'); // Send error response
  }

});




export default router;