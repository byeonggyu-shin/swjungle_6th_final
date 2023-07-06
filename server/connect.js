import mysql from 'mysql2/promise';
import './dotenv.js';
const penv = process.env;

export const db = mysql.createPool({
  host: penv.MYSQL_HOST,
  user: penv.MYSQL_USERNAME,
  password: penv.MYSQL_PASSWORD,
  database: penv.MYSQL_DB,
  port: 3306,
  connectTimeout: 5000,
  connectionLimit: 30, //default 10
});
