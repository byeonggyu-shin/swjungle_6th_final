/* 카드 상세정보 */
export const cardInfoQuery = 
  `SELECT Tag.tag, File.img_url, File.content
    FROM Tag
    JOIN File ON Tag.file_id = File.file_id
    WHERE File.user_id = ? AND File.file_id = ?`;

/* Copying card from others */
export const copyQuery1 = 
  `INSERT INTO File (user_id, img_url, content)
    SELECT ?, img_url, content 
    FROM File
    WHERE file_id = ?`;

export const copyQuery2 = 
  `INSERT INTO Tag (file_id, tag, tag_index) 
    SELECT ?, tag, tag_index
    FROM Tag
    WHERE file_id = ?`; 

/* 최근 업데이트한 카드 조회 */
export const updatedCardQuery = 
  `SELECT File.file_id 
    FROM File
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 10`;

export const selectCardToClone = 
  `SELECT a.tag_id as tagId
    FROM Tag a
    JOIN File b
    ON a.file_id = b.file_id
    WHERE a.File_id = ?`; 


export const cardCloneQuery = 
  `INSERT INTO Tag (file_id, tag, tag_index) 
  SELECT ?, tag, tag_index
  FROM Tag
  WHERE tag_id = ?`; 
