const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const express = require('express');
const { v4 } = require('uuid');

dotenv.config({path: './.env'});

exports.processOCR  = async(imgUrl, ext) => {
    console.log('imgUrl :', imgUrl);
    console.log('ext :', ext);

    const config = {
        headers: {
            "Content-Type" : "application/json",
            "X-OCR-SECRET" : process.env.MY_OCR_SECRET_KEY
        }
    }

    let timestamp = new Date().getTime();
    let ocrResult = '';

    const requestId = v4();

    /* Axios URL Call & Work Response Data */
    try {
        const response = await axios.post(process.env.MY_OCR_INVOKE_URL, 
            {
                "images": [
                {
                  "format": ext,
                  "name": "medium",
                  "data": null,
                  "url": imgUrl
                }
              ],
              "lang": "ko",
              "requestId": requestId,
              "resultType": "string",
              "timestamp": timestamp,
              "version": "V1"
            }, config)
        
        /* Make Response Data */
        response.data.images[0].fields.forEach(element => {
            ocrResult += " " + element.inferText; 
        });
        
        return ocrResult;

    } catch (error) {
        console.error(error);
        // console.log('error');
        return null;
    }
}