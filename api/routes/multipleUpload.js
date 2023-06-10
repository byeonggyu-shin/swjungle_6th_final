const dotenv = require('dotenv');
dotenv.config({path: './.env'});

const express = require('express');
const path = require('path');
const multer = require('multer');
const { processOCR } = require('../routes/requestOCR.js')
const router = express.Router();
const app = express();

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, './public-0001/pictures/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, Date.now() + ext);
        },
    }),
    limits: {fileSize: 5 * 1024 * 1024},
});

router.post('/images', upload.array('image'), async (req, res) => {
    // console.log(req.files);
    let ocrList = [];
    for (const file of req.files) {
        const imgUrl = process.env.MY_PROXY + '/static/pictures/' + file.filename; 
        const ext = path.extname(file.filename).substring(1);
        const resultOCR = await processOCR(imgUrl, ext);
        ocr_list.push(resultOCR);
    };
    res.send(ocrList);
});

module.exports = router;