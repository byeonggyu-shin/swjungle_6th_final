export const insertFileQuery = 
    `INSERT INTO 
        File (user_id, img_url, content) 
        VALUES (?, ?, ?)`;

export const insertTagQuery = 
    `INSERT INTO 
        Tag (file_id, tag, tag_index) 
        VALUES (?, TRIM(?), ?)`;

export const insertTaglistQuery = 
    `INSERT IGNORE INTO 
        taglist (user_id, englishKeyword, koreanKeyword, tag_index) 
        VALUES (?, TRIM(?), TRIM(?), ?)`;

export const findTagIndexByKwdFromTagList = `SELECT 
    t.koreanKeyword, t.tag_index 
    FROM taglist AS t 
    WHERE user_id = ? AND replace(ucase(englishKeyword), ' ', '') = ?`;

export const getTagIndicesByUser = 
    `SELECT DISTINCT TRIM(b.tag) as tag, b.tag_index
        FROM file a
        JOIN tag b
        ON a.file_id = b.file_id
        WHERE a.user_id = ? AND b.tag = TRIM(?)
        GROUP BY b.tag_id, b.tag, b.tag_index
        ORDER BY b.tag_index`;

export const getTagListIndicesByUser = 
    `SELECT DISTINCT TRIM(koreanKeyword) as tag, tag_index
        FROM taglist
        WHERE user_id = ? AND koreanKeyword = TRIM(?)
        GROUP BY koreanKeyword, tag_index
        ORDER BY tag_index`;

export const getNextTagIndex = 
    `SELECT MAX(tag_index) + 1 AS next_index 
        FROM taglist 
        WHERE user_id = ?`;