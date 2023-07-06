export const extractJson = (inputString) => {
  // console.log('in extractJson -------------');
  // console.log('input String :', inputString);
  const regex = /{.*}/s;
  const match = inputString.match(regex);
  // console.log('match :', match);
  if (match && match.length > 0) {
    const jsonPart = match[0];
    try {
      // 일단 JSON 형태 변환
      return JSON.parse(jsonPart); 
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  }
  return null;
};
  
// module.exports = {
//   extractJson,
// };