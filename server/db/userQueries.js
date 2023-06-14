export const userInfoQuery = (userId) => { 
    return `SELECT U.user_name AS userName, COUNT(DISTINCT T.tag_id) AS tagCnt, COUNT(DISTINCT F.file_id) AS cardCnt
        FROM User U
        LEFT JOIN File F ON U.user_id = F.user_id
        LEFT JOIN FileTag FT ON F.file_id = FT.file_id
        LEFT JOIN Tag T ON FT.tag_id = T.tag_id
        WHERE U.user_id = ${userId}
        GROUP BY U.user_id, U.user_name;`
};

export const userProfileQuery = (userId) => {
    return `SELECT profile_img FROM User where User.user_id = ${userId};`
};