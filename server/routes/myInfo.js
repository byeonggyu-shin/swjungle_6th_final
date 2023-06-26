import express from 'express';
import '../dotenv.js';
import { db } from '../connect.js';
import { myInfoQuery } from '../db/userQueries.js'

import { logger } from '../winston/logger.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { user } = res.locals;
    const userId = user.user_id;
    let connection = null;
    try {
        connection = await db.getConnection();
        const [ result ] = await connection.query(myInfoQuery(userId));
        const { user_name , email, profile_img } = result[0];
        const data = { user_name, email, profile_img };

        connection.release();
        logger.info(`/routes/myInfo 폴더, get 성공 profile_img : ${data.profile_img}`);
        return res.status(200).send(data);
    } catch(err) {
        connection?.release();
        logger.error("//routes/myInfo 폴더, get, err : ", err);
        res.status(500).send('Internal Server Error');
    }

});

export default router;