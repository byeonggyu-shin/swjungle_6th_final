export const screenshotSubjects_en = [
  'Fashion',
  'Street Fashion',
  'Shoes',
  'One-Piece Dresses',
  'Suits',
  'Secondhand, Resale',
  
  'Health',
  'Diet',
  'Salt Management',
  'diabetes',
  'Fitness',
  'Meditation',
  
  'Content',
  'Movies/Dramas',
  'Netflix',
  'Webtoon',
  'Celebrities',
  'K-pop',
  
  'Education',
  'Coding',
  'Algorithms',
  'Bootcamp',
  'Entrance Exam',
  'University',
  
  'Employment',
  'Pangyo',
  'Coding Test',
  'Software Engineer',
  'Silicon Valley',
  'AI',
  
  'Cosmetics',
  'Olive Young',
  'Foundation',
  'Lipstick',
  'Eye Shadow',
  
  'Food',
  'Date Course',
  'Desserts',
  'Meat',
  'Beer/Cocktails',
  'Meal Kits',
  
  'Sports',
  'Football',
  'Baseball',
  'Basketball',
  
  'Travel',
  'Europe',
  'Japan',
  'China',
  'Domestic',
  'USA',
  'Jeju Island',
  'Public Transportation',
  
  'Performing Arts',
  'Exhibitions',
  'Concerts',
  'Festivals',
  
  'Finance',
  'Stocks',
  'Real Estate',
  'Investment Information',
  'Tax',
  'Pension',
];
  
export const screenshotSubjects_kr = [
  '패션',
  '스트리트 패션',
  '신발',
  '원피스',
  '정장',
  '중고, 리셀',
  
  '건강',
  '다이어트',
  '염분관리',
  '당뇨병',
  '헬스장',
  '명상',
  
  '콘텐츠',
  '영화/드라마',
  '넷플릭스',
  '웹툰',
  '연예인',
  'K-pop',
  
  '교육',
  '코딩',
  '알고리즘',
  '부트캠프',
  '입시',
  '대학',
  
  '취업',
  '판교',
  '코딩테스트',
  '소프트웨어 엔지니어',
  '실리콘 밸리',
  'AI',
  
  '화장품',
  '올리브영',
  '파운데이션',
  '립스틱',
  '아이 섀도우',
  
  '음식',
  '데이트 코스',
  '디저트',
  '고기',
  '맥주/칵테일',
  '밀키트',
  
  '스포츠',
  '축구',
  '야구',
  '농구',
  
  '여행',
  '유럽',
  '일본',
  '중국',
  '국내',
  '미국',
  '제주도',
  '대중교통',
  
  '공연예술',
  '전시회',
  '콘서트',
  '페스티벌',
  
  '금융',
  '주식',
  '부동산',
  '투자 정보',
  '세금',
  '연금',
];


export const combinedList = screenshotSubjects_en.map((subject, index) => {
  return {
    index: index + 1, // Adding 1 to match 1-based indexing
    englishKeyword: subject,
    koreanKeyword: screenshotSubjects_kr[index],
  };
});
// console.log(combinedList);


export const mappedObject = screenshotSubjects_en.reduce((obj, subject, index) => {
  if (screenshotSubjects_en.length == screenshotSubjects_kr.length) {
    obj[subject] = screenshotSubjects_kr[index];
    return obj;
  }
  console.log('영/한 리스트의 길이가 일치하지 않습니다.');
  return null;
}, {});

export const countTags = () => screenshotSubjects_en.length;

export const convertToPlainText = () => {
  let plainText = '';
  const array = screenshotSubjects_en;
  for (let i = 0; i < array.length; i++) {
    plainText += `"${array[i]}"`;
    if (i === array.length - 2) {
      plainText += ' and ';
    } else if (i !== array.length - 1) {
      plainText += ',';
    }
  }
  return plainText;
};

// module.exports = {
//   screenshotSubjects_en,
//   screenshotSubjects_kr,
//   mappedObject,
//   countTags,
//   convertToPlainText,
// };