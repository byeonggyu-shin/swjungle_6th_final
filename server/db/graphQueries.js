export const graphCountQuery = (userId) => {
  return `SELECT 
            convert(c.tag_index, CHAR) as id, 
            c.tag as name, count(c.tag_index) as symbolSize 
          FROM 
            (SELECT b.user_id, a.tag, a.tag_index FROM Tag as a JOIN File as b ON a.file_id = b.file_id 
          WHERE 
            b.user_id = ${userId}) as c 
          GROUP BY c.tag_index, c.tag`;
};

export const graphDirectionQuery = (userId) => {
  return `SELECT 
            b.file_id as file, b.tag_index as node FROM Tag as b
          WHERE 
            b.file_id in (SELECT a.file_id FROM File as a 
          WHERE a.user_id = ${userId});
  `;
};
