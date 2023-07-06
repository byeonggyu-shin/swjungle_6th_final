import jwt from'jsonwebtoken';
import '../dotenv.js';
import { db } from '../connect.js';

import { logger } from '../winston/logger.js';

export const authMiddleware = async (req, res, next) => {
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
    logger.info(`auth-middleware 통과, userid : ${userId}`)
    next();
  } catch (err) {
    logger.error(`auth-middleware, err : `, err);
    res.status(401).send({
      errorMessage: '로그인 후 이용 가능한 기능입니다.',
    });
  }
};