// SQL запросы для аутентификации
const LOGIN = `
    SELECT 
        u.USER_ID as id,
        TRIM(u.USER_NAME) as name,
        TRIM(u.USER_SECONDNAME) as surname,
        TRIM(u.USER_PATRONYMIC) as patronymic,
        u.ROLE_ID as roleId,
        TRIM(r.ROLE_NAME) as roleName,
        e.STOR_ID as storageId,
        TRIM(s.STOR_FULLNAME) as storageName
    FROM "USER" u
    INNER JOIN ROLE r ON u.ROLE_ID = r.ROLE_ID
    LEFT JOIN EMPLOYER e ON u.USER_ID = e.USER_ID
    LEFT JOIN STORAGE s ON e.STOR_ID = s.STOR_ID
    WHERE TRIM(u.USER_NAME) = $1 
        AND u.USER_PASSWORD = $2;
`;

const GET_USER_BY_ID = `
    SELECT 
        u.USER_ID as id,
        TRIM(u.USER_NAME) as name,
        TRIM(u.USER_SECONDNAME) as surname,
        TRIM(u.USER_PATRONYMIC) as patronymic,
        u.ROLE_ID as roleId,
        TRIM(r.ROLE_NAME) as roleName,
        e.STOR_ID as storageId,
        TRIM(s.STOR_FULLNAME) as storageName
    FROM "USER" u
    INNER JOIN ROLE r ON u.ROLE_ID = r.ROLE_ID
    LEFT JOIN EMPLOYER e ON u.USER_ID = e.USER_ID
    LEFT JOIN STORAGE s ON e.STOR_ID = s.STOR_ID
    WHERE u.USER_ID = $1;
`;

const GET_PARTNER_ID_BY_USER = `
    SELECT PARTNER_ID FROM PARTNER WHERE USER_ID = $1
`;

module.exports = {
    LOGIN,
    GET_PARTNER_ID_BY_USER,
    GET_USER_BY_ID
};