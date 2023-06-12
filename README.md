<br />

server/.env
```
PORT = 8000

MYSQL_HOST = 127.0.0.1
MYSQL_USERNAME = root
MYSQL_PASSWORD = 비빌번호
MYSQL_DB = 데이터베이스
MYSQL_PORT = 3306
```

<br />
서버 실행

```
cd server
nodeman index
```

<br />
클라이언트 실행

```
npm run dev
```

<br />
로그인 기능 <br />
 - google 소셜 로그인 <br />
 - JWT Access Token (Chrom - [Application] - [Loal Storage] - [ https://localhost:3000/] - token 확인 가능)<br />
 - 서버 Session Management <br />