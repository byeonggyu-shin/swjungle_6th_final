/************************ 친구 추천 로직 ************************/
export const recomUserQuery = (userId, limit) => {
  return `SELECT f.user_id, count(DISTINCT t.tag) as shared_tags_count
  FROM File AS f
  JOIN Tag AS t ON f.file_id = t.file_id
  WHERE t.tag IN (
    SELECT DISTINCT Tag.tag
    FROM Tag
    JOIN File ON Tag.file_id = File.file_id
    WHERE File.user_id = ${userId}
  )
  AND f.user_id <> ${userId}
  AND f.user_id NOT IN (
  SELECT Follow.following_id
  FROM Follow
  WHERE user_id = ${userId}
  )
  GROUP BY f.user_id
  ORDER BY shared_tags_count DESC, COUNT(DISTINCT f.file_id) DESC
  LIMIT ${limit};`;
};


export const coldStartRecomQuery = 
`SELECT
  f.file_id,
  f.user_id,
  f.img_url
  FROM (
  SELECT
    File.file_id,
    File.user_id,
    ROW_NUMBER() OVER (PARTITION BY File.file_id ORDER BY File.created_at DESC) AS rn
  FROM File
  INNER JOIN (
    SELECT user_id, MAX(created_at) AS max_created_at
    FROM File
    GROUP BY user_id
  ) AS recent_files ON File.user_id = recent_files.user_id AND File.created_at = recent_files.max_created_at
  ) AS recent_files
  JOIN File AS f ON recent_files.file_id = f.file_id
  WHERE recent_files.rn = 1
  LIMIT 10;`;



/* 가장 많은 카드 수가 달린 태그 상위 ?개 추출 */
export const tagQuery = `SELECT t.tag, COUNT(*) as tag_count
  FROM Tag AS t
  JOIN File AS f ON t.file_id = f.file_id
  WHERE f.user_id = ?
  GROUP BY t.tag
  ORDER BY tag_count DESC
  LIMIT 2`;

export const profileQuery = `SELECT u.user_name, u.profile_img
  FROM User AS u
  WHERE u.user_id = ?`;

/* 카드 소유자 확인 */
export const fileToUserQurey = `SELECT u.user_id, u.user_name, u.profile_img
  FROM User AS u
  JOIN File AS f ON u.user_id = f.user_id
  WHERE file_id = ?`;

/* 추천 카드 거절 */
export const rejectCardQuery =
  'INSERT INTO z_DeletedCards (user_id, file_id) VALUES (?, ?)';

/************************ 카드 추천 로직 ************************/
/* 1. 친구 피드 */
export const recommendSimilarQuery = (userId) => {
  return `SELECT *
  FROM (
    SELECT
      File.file_id,
      File.user_id,
      Tag.tag,
      File.img_url,
      File.created_at,
      ROW_NUMBER() OVER(PARTITION BY File.user_id ORDER BY File.created_at DESC) as rn
    FROM File
    JOIN Tag ON File.file_id = Tag.file_id
    WHERE File.user_id IN (
      SELECT tmp.user_id
      FROM (
        SELECT f.user_id, COUNT(DISTINCT t.tag) as shared_tags_count
        FROM File AS f
        JOIN Tag AS t ON f.file_id = t.file_id
        WHERE t.tag IN (
          SELECT DISTINCT t1.tag
          FROM Tag AS t1
          JOIN File AS f1 ON t1.file_id = f1.file_id
          WHERE f1.user_id = ${userId}
        ) AND f.user_id IN (
          SELECT Follow.following_id
          FROM Follow
          WHERE Follow.user_id = ${userId}
        )
        GROUP BY f.user_id
        ORDER BY shared_tags_count DESC, COUNT(DISTINCT f.file_id) DESC
        LIMIT 10
      ) as tmp
    ) AND File.file_id NOT IN (
        SELECT file_id
        FROM File
        WHERE File.user_id = ${userId}
    ) AND File.file_id NOT IN (
        SELECT file_id
        FROM z_DeletedCards
        WHERE File.user_id = ${userId}
    ) 
  ) AS subquery
  WHERE rn <= 4
  LIMIT 20;`;
};

/* 2. 친구 아닌 사람 추천카드 */
export const recommendDiscoverQuery = (userId, recommendList) => {
  const listform = recommendList.map((user) => user.user_id).join(', ');
  return `SELECT *
  FROM (
    SELECT
      File.file_id,
      File.user_id,
      Tag.tag,
      File.img_url,
      File.created_at,
      ROW_NUMBER() OVER(PARTITION BY File.user_id ORDER BY File.created_at DESC) as rn
    FROM File
    JOIN Tag ON File.file_id = Tag.file_id
    WHERE File.user_id IN (${listform}) 
    AND File.file_id NOT IN (
        SELECT file_id
        FROM File
        WHERE File.user_id = ${userId}
    ) AND File.file_id NOT IN (
        SELECT file_id
        FROM z_DeletedCards
        WHERE File.user_id = ${userId}
    ) AND Tag.tag NOT IN (
        SELECT DISTINCT Tag.tag
        FROM Tag
        JOIN File ON Tag.file_id = File.file_id
        WHERE File.user_id = ${userId}
    )
  ) AS subquery
WHERE rn <= 4
LIMIT 15`;
};
    
 


// 내가 보지 않았고
// DeletedCards 테이블에 없는
// 1. 유사: 상위 태그 중 카드 추천
// 2. 발견: 내가 갖지 못한 태그 (유사한 유저들이 가진 것 중)
