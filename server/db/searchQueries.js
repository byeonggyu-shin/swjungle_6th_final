export const tagList = (userId, keyword) => {
  return `SELECT DISTINCT t.tag
          FROM Tag t
          JOIN File f ON t.file_id = f.file_id
          WHERE f.user_id = ${userId} AND (f.content LIKE '%${keyword}%' OR t.tag LIKE '%${keyword}%');`
}

export const cardList = (userId, tag, offset, perPage) => {
  return `SELECT DISTINCT f.file_id as id, t.tag, f.img_url as imageUrl, f.content  
          FROM File f
          JOIN Tag t ON f.file_id = t.file_id
          WHERE t.tag = '${tag}'
            AND f.user_id = ${userId}
          LIMIT ${offset}, ${perPage}`;
}

export const countCard = (userId, tag) => {
  return `SELECT COUNT(*) AS total
          FROM (
            SELECT DISTINCT f.file_id as id, t.tag, f.img_url as imageUrl, f.content
            FROM File f
            JOIN Tag t ON f.file_id = t.file_id
            WHERE t.tag = '${tag}'
              AND f.user_id = ${userId}
          ) AS subquery;`;
}