import express from 'express';
import '../dotenv.js';
import { db } from '../connect.js';


const router = express.Router();


const categories = [
  '패션',
  '건강',
  '콘텐츠',
  '교육',
  '취업',
  '화장품',
  '음식',
  '스포츠',
  '여행',
  '공연 예술',
  '투자 재태크',
];


const categoryTags =
{
  '패션': ['패션', '스트릿패션', '신발', '원피스', '정장', '중고, 리셀'],
  '건강': ['건강', '다이어트', '염분관리', '당뇨병', '헬스장', '명상'],
  '콘텐츠': ['콘텐츠', '영화/드라마', '넷플릭스', '웹툰', '연예인', 'K-pop'],
  '교육': ['교육', '코딩', '알고리즘', '부트캠프', '입시', '대학'],
  '취업': ['취업', '판교', '코딩테스트', '소프트웨어 엔지니어', '실리콘밸리', 'AI'],
  '화장품': ['화장품', '올리브영', '파운데이션', '립스틱', '셰도우'],
  '음식': ['음식', '데이트코스', '디저트', '고기', '맥주/칵테일', '밀키트'],
  '스포츠': ['스포츠', '축구', '야구', '농구'],
  '여행': ['여행', '유럽', '일본', '중국', '국내', '미국', '제주도', '대중교통'],
  '공연 예술': ['공연 예술', '전시회', '콘서트', '페스티벌'],
  '투자 재태크': ['재태크', '주식', '부동산', '투자 정보', '세금', '연금'],
};

const allTags = Object.values(categoryTags).flat();
const tagArray = [];
let index = 1;

// dummy 함수 밖에 있어서 한 번만 실행됨.
allTags.forEach((tag) => {
  tagArray.push({ tag: tag, index: index });
  index++;
});


// router.get('/dummy', async (req, res) => {
//   console.log('dummy');
// });


// Define the base URL
const baseURL = 'https://sw-jungle-s3.s3.ap-northeast-2.amazonaws.com/';

// Function to generate a unique URL
const generateUniqueURL = () => {
  return `${baseURL}${Math.random().toString(36).substring(2, 15)}.jpg`;
};


router.post('/', async (req, res) => {
  try {
    console.log('dummy');
    await dummy();
    res.send('success');
  } catch(err){
    console.log('err');
    console.log(err);
    res.send('fail');
  }
});


const user_select = 'SELECT user_id FROM User WHERE user_id < 3000';
const q1 = 'INSERT INTO File_test (user_id, img_url, content) VALUES (?, ?, ?)';   // SQL - File
const q2 = 'INSERT INTO Tag_test (file_id, tag, tag_index) VALUES (?, ?, ?)';      // SQL - Tag 


const dummy = async () => {
  let connection = null;
  try {
    connection = await db.getConnection(); 
    const [ users ] = await connection.query(user_select);
       
    for (const user of users) {     // 모든 유저에 대해
      /* loop1: category 랜덤
       * loop2: tag 랜덤 (1, 2) 
       */
      let loop1 = Math.floor(Math.random() * (60 - 1)) + 1;         //  반복수 1
      for (let i = 0; i < loop1; i++){
        const categoryIndex = Math.floor(Math.random() * categories.length);    // 카테고리 개수내 랜덤 인덱스
        const category = categories[categoryIndex];                             // 해당 인덱스의 카테고리

        let loop2 = Math.floor(Math.random() * (60 - 1)) + 1;
        for (let j = 0; j < loop2; j++){
          const tags = categoryTags[category];                        // 해당 카테고리내 태그들(list)
          const tagIndex1 = Math.floor(Math.random() * tags.length);  // 태그 list내 랜덤 인덱스
          let tagIndex2 = Math.floor(Math.random() * tags.length);
          if (tagIndex1 === tagIndex2) {
            tagIndex2 = (tagIndex2 + 1) % tags.length;
          }
  
          const tag1 = tags[tagIndex1];     // 최종 태그1, 2
          const tag2 = tags[tagIndex2];

          /* 태그 인덱스 - allTags */
          let tag_index1 = tagArray.find((item) => item.tag === tag1).index;
          let tag_index2 = tagArray.find((item) => item.tag === tag2).index;

          /* SQL - File */
          const [ result1 ] = await connection.query(q1, [ user.user_id, generateUniqueURL(), 'dummy test' ]);
          /* SQL - Tag */
          const [ result2 ] = await connection.query(q2, [ result1.insertId, tag1, tag_index1 ]);   // file's insertId, tag name(KR), tag[0] enum
          const [ result3 ] = await connection.query(q2, [ result1.insertId, tag2, tag_index2 ]);   // file's insertId, tag name(KR), tag[1] enum
        }
      }
      console.log(`User ${user.user_id} loop done`);
    }
    console.log('All users loop done');
    connection.release();
    // return res.status(200).send('SUCCESS');
  } catch (err) {
    connection?.release();
    console.log(err);
    // res.status(400).send('ERROR');
  }
};

// dummy();   /* 주석해제 유의 */


const followDummy = async () => {
  let connection = null;
  try {
    connection = await db.getConnection(); 

    for (let i = 1; i <= 100; i++) {
      // Generate a random following_id from 1 to 100
      let following_id = Math.floor(Math.random() * 100) + 1;
      let q = 
      'INSERT INTO `Follow` (`user_id`, `following_id`, `created_at`, `updated_at`, `deleted_at`)\
        VALUES (?, ?, NOW(), NOW(), NULL)';
      connection.query(q, [i, following_id]);
      console.log(`User ${i} Follow loop done`);
    }
    console.log('All users follow loop done');
    connection.release();
  } catch (err) {
    connection?.release();
    console.log(err);
  }
};

// followDummy();   /* 주석해제 유의 */


export default router;