const dotenv = require('dotenv');
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');

dotenv.config({path: './.env'});

const uploadRouter = require('./routes/multipleUpload');
const app = express();


app.set('port', process.env.PORT || 3000);
app.use(morgan('dev'));
app.use('/static', express.static(path.join(__dirname, 'public-0001')));
app.use('/upload', uploadRouter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
    name: 'session-cookie',
}));

const fs = require('fs');
const { promisify } = require('util');

const readdirAsync = promisify(fs.readdir);
const mkdirSync = promisify(fs.mkdir);

// pictures 폴더가 없을 경우 생성
async function createPicturesFolder() {
    try {
        await readdirAsync('./public-0001/pictures');
    } catch (error) {
        console.error('Pictures folder does not exist, creating pictures folder.');
        fs.mkdirSync('./public-0001/pictures', { recursive: true });
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// app.get('/photo', (req, res) => {
//     res.sendFile(path.join(__dirname, '/public-0001/pictures/1686311755862.png'));
// });   

app.post('/content', (req, res) => {
    res.send(req.body.content);
});

// 404 에러 핸들러
app.use((req, res, next) => {
    res.status(404).send('404 Not Found');
});


// 404 외의 모든 에러 핸들러
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(err.message);
});


// 실행
async function startServer () {
    try {
        createPicturesFolder();
        app.listen(app.get('port'), () => {
            console.log(`Server running on port ${app.get('port')}`);
        });
    } catch (error) {
        console.error('Error starting the server:', error);
    }
}

startServer();