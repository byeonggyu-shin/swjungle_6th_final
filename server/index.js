const express = require("express");
const jwt = require("jsonwebtoken");

const { Server } = require("http"); // 1. 모듈 불러오기

const pool  = require('./dbconfig');

const bodyParser = require("body-parser"); // 요청정보 처리
const cors = require('cors'); // 미들웨어
const authMiddleware = require("./middlewares/auth-middleware"); // middleware for session management

require('dotenv').config();
const app = express();
const port = process.env.PORT || 8000;

const http = Server(app); // 2. express app을 http 서버로 감싸기

app.use(express.json());
app.use(cors());
// app.use(
//     cors({
//       origin: "http://localhost:3000",
//       methods: ["GET", "POST", "PUT", "DELETE"],
//       credentials: true,
//     })
//   );
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


// 로그인
app.post('/api/login', async (req, res) => {
    const { email, givenName, imageUrl } = req.body;
  
    let connection = null;
  
    try {
      connection = await pool.getConnection();
      const sql = `SELECT * FROM Users 
      WHERE email = '${email}' AND imageUrl='${imageUrl}'`;
      const [result] = await connection.query(sql);
      connection.release();
  
      if (result[0]) {
        console.log(`userId : ${result[0].id}님이 로그인 하셨네!`);
        const token = jwt.sign({ userId: result[0].id }, "customized-secret-key");
        res.send({ success: true, token }); // Send success response
      } else {
        console.log('회원정보 없다..;;; 회원정보에 추가해주고... ');
  
        // 회원가입
        connection = await pool.getConnection();
        const insertSql = `INSERT INTO Users(email, name, imageUrl ) 
        VALUES ('${email}', '${givenName}', '${imageUrl}')`;
        await connection.query(insertSql);
  
        // 토큰발행
        const findUserSql = `SELECT * FROM Users 
        WHERE email = '${email}' AND imageUrl='${imageUrl}'`;
        const [newResult] = await connection.query(findUserSql);
        console.log(`userId : ${newResult[0].id}님이 로그인 하셨네!`);
        const token = jwt.sign({ userId: newResult[0].id }, "customized-secret-key");
        res.send({ success: true, token }); // Send success response
      }
    } catch (err) {
      connection?.release();
      console.log(err);
      res.status(500).send('Internal Server Error'); // Send error response
    }
  });

// session management 용
app.get("/api/users/me", authMiddleware, async (req, res) => {
    const { user } = res.locals;
    console.log("현재 로그인한 유저의 local 정보 : ");
    console.log(user);
    res.send({
        user,
    });
});

// middleware 예시
// router.put("/goods/:goodsId/cart", authMiddleware, async (req, res) => {
//     const { userId } = res.locals.user;
//     const { goodsId } = req.params;
//     const { quantity } = req.body;
// });

app.listen(port, () => {
    console.log(`Server ON : http://127.0.0.1:${port}`);
});

module.exports = http;