const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const penv = process.env;

export const db = mysql.createPool({
    host: penv.MYSQL_HOST,
    user: penv.MYSQL_USERNAME,
    password: penv.MYSQL_PASSWORD,
    database: penv.MYSQL_DB,
    connectTimeout: 5000,
    connectionLimit: 30 //default 10
});