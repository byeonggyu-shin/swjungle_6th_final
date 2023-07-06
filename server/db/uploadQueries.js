export const insertFileQuery = 
    `INSERT INTO 
        File (user_id, img_url, content) 
        VALUES (?, ?, ?)`;

export const insertTagQuery = 
    `INSERT INTO 
        Tag (file_id, tag, tag_index) 
        VALUES (?, TRIM(?), ?)`;

export const getTagIndicesByUser = 
    `SELECT DISTINCT TRIM(b.tag) as tag, b.tag_index
        FROM file a
        JOIN tag b
        ON a.file_id = b.file_id
        WHERE a.user_id = ? AND b.tag = TRIM(?)
        GROUP BY b.tag_id, b.tag, b.tag_index
        ORDER BY b.tag_index`;
