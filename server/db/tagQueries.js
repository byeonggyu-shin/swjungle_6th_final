/* 태그명에 해당하는 file_id, content 
                -> cardId, cardContent */
export const tagCardsQuery = 
  `SELECT File.file_id, File.content, File.img_url
    FROM File
    JOIN Tag ON File.file_id = Tag.file_id
    WHERE File.user_id = ? AND Tag.tag = ?`;

/* 파일id에 해당하는 태그 */
export const cardTagsQuery = 
`SELECT Tag.tag
  FROM Tag
  JOIN File ON Tag.file_id = File.file_id
  WHERE File.user_id = ? AND File.file_id = ?`;