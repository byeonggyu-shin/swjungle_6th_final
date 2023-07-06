import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export const processOCR = async(imgUrl) => {

  const config = {
    headers: {
      'Content-Type' : 'application/json',
      'X-OCR-SECRET' : process.env.MY_OCR_SECRET_KEY,
    },
  };
  
  let timestamp = new Date().getTime();
  let sumText = '';
  
  /* Generate UUID */
  const requestId = uuidv4();
  
  try {
    /* Axios URL Call & Work Response Data */
    const response = await axios.post(process.env.MY_OCR_API_URL, 
      {
        'images': [
          {
            'format': 'png',
            'name': 'medium',
            'data': null,
            'url': imgUrl,
          },
        ],
        'lang': 'ko',
        'requestId': requestId,
        'resultType': 'string',
        'timestamp': timestamp,
        'version': 'V1',
      }, config);
    
    /* Make Response Data */
    response.data.images[0].fields.forEach(element => {
      // console.log(element.inferText);
      sumText += ' ' + element.inferText; 
    });
  
    // console.log("-------------------");
    // console.log(sumText);
    // console.log("-------------------");
  
    return sumText;
  
  } catch (err) {
    console.log(err);
    return null;
  }
};


