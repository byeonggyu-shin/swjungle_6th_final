export const tagList = (userId, keyword) => {
  return `SELECT DISTINCT t.tag
          FROM Tag t
          JOIN File f ON t.file_id = f.file_id
          WHERE f.user_id = ${userId} AND (f.content LIKE '%${keyword}%' OR t.tag LIKE '%${keyword}%');`
}

export const cardList = (userId, tag) => {
  return `SELECT f.file_id as id, t.tag, f.img_url as imageUrl, f.content  
          FROM File f
          JOIN Tag t ON f.file_id = t.file_id
          WHERE t.tag = '${tag}'
            AND f.user_id = ${userId};`
}

export const searchContent = (keyword) => { 
  return `SELECT f.file_id, f.content, t.tag  
            FROM File f
            JOIN Tag t ON f.file_id = t.file_id
            WHERE f.content LIKE '%${keyword}%'
            ORDER BY f.updated_at ASC;`;
};


export const searchTag = (keyword) => {
  return `SELECT t.tag, f.content
            FROM Tag t
            JOIN File f ON t.file_id = f.file_id
            WHERE t.file_id IN (
                SELECT t.file_id
                FROM Tag t
                WHERE t.tag LIKE '%${keyword}%'
            )
            ORDER BY f.created_at DESC;`;
};

