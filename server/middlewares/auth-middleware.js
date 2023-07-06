import jwt from'jsonwebtoken';
import '../dotenv.js';
import { db } from '../connect.js';

import { logger } from '../winston/logger.js';

export const authMiddleware = async (req, res, next) => {
  console.log('req.headers.authorization: ', req.headers.authorization);  //@
  const { authorization } = req.headers;
  const [authType, authToken] = (authorization || '').split(' ');

  if (!authToken || authType !== 'Bearer') {
    res.status(401).send({
      errorMessage: 'This function is available after log in.',
    });
    return;
  }

  try {
    const { userId } = jwt.verify(authToken, 'customized-secret-key');
    console.log(userId);

    const connection = await db.getConnection();
    const sql = `SELECT * FROM User
                   WHERE user_id = '${userId}'`;
    const [result] = await connection.query(sql);
    connection.release();

    if (result.length === 0) {
      res.status(401).send({
        errorMessage: 'User not found.',
      });
      return;
    }

    const user = result[0];
    res.locals.user = user; // 서버측 구성
    logger.info(`auth middleware userId : ${userId} 통과`);
    next();
  } catch (err) {
    res.status(401).send({
      errorMessage: '로그인 후 이용 가능한 기능입니다.',
    });

    logger.error("auth middleware 에러 :", err);
  }
};