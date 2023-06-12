const jwt = require("jsonwebtoken");
const pool  = require('../dbconfig');

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;
  const [authType, authToken] = (authorization || "").split(" ");

  if (!authToken || authType !== "Bearer") {
    res.status(401).send({
      errorMessage: "This function is available after logging in.",
    });
    return;
  }

  try {
    const { userId } = jwt.verify(authToken, "customized-secret-key");

    connection = await pool.getConnection();
      const sql = `SELECT * FROM Users 
                   WHERE id = '${userId}'`;
      const [result] = await connection.query(sql);
      connection.release();

      if (result.length === 0) {
        res.status(401).send({
          errorMessage: "User not found.",
        });
        return;
      }

      const user = result[0];
      res.locals.user = user; // 서버측 구성
      next();
  } catch (err) {
    res.status(401).send({
      errorMessage: "로그인 후 이용 가능한 기능입니다.",
    });
  }
};