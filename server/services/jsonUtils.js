import { logger } from '../winston/logger.js';

export const extractJson = (str) => {
  if (str && str.length > 0) {
    const start = str.indexOf('[') + 1;
    const end = str.indexOf(']');
    if (start > 0 && end > start) {
      const extracted = str.slice(start, end);
      const array = JSON.parse(`[${extracted}]`);
      
      const limitedArray = array.slice(0, 2);
      console.log(limitedArray);

      return { tags: limitedArray };
    } else {
      logger.info('/services/jsonUtils 폴더, tags are not in format of [ ].');
      return { tags: '<Image>' };
    }
  }
};





// export const extractJson = (inputString) => {
//   // console.log('in extractJson -------------');
//   // console.log('input String :', inputString);
//   const regex = /{.*}/s;
//   const match = inputString.match(regex);
//   // console.log('match :', match);
//   if (match && match.length > 0) {
//     const jsonPart = match[0];
//     try {
//       // 일단 JSON 형태 변환
//       return JSON.parse(jsonPart); 
//     } catch (error) {
//       console.error('Invalid JSON:', error);
//     }
//   }
//   return null;
// };