// SQL запросы для работы с партнёрами

// Получение списка партнёров с фильтрацией и пагинацией
const GET_PARTNERS = `
    SELECT 
        p.PARTNER_ID as id,
        p.PARTNER_INN as inn,
        TRIM(p.PARTNER_FULLNAME) as fullName,
        p.PARTNER_PHONE as phone,
        TRIM(p.PARTNER_FACT_ADDRESS) as factAddress,
        TRIM(p.PARTNER_POST_ADDRESS) as postAddress,
        p.USER_ID as userId,
        TRIM(u.USER_NAME) || ' ' || TRIM(u.USER_SECONDNAME) as userName
    FROM PARTNER p
    LEFT JOIN "USER" u ON p.USER_ID = u.USER_ID
`;

const COUNT_PARTNERS = `
    SELECT COUNT(*) as count
    FROM PARTNER p
`;

// Получение партнёра по ID
const GET_PARTNER_BY_ID = `
    SELECT 
        p.PARTNER_ID as id,
        p.PARTNER_INN as inn,
        TRIM(p.PARTNER_FULLNAME) as fullName,
        p.PARTNER_PHONE as phone,
        TRIM(p.PARTNER_FACT_ADDRESS) as factAddress,
        TRIM(p.PARTNER_POST_ADDRESS) as postAddress,
        p.USER_ID as userId,
        TRIM(u.USER_NAME) || ' ' || TRIM(u.USER_SECONDNAME) as userName
    FROM PARTNER p
    LEFT JOIN "USER" u ON p.USER_ID = u.USER_ID
    WHERE p.PARTNER_ID = $1
`;

// Создание партнёра
const CREATE_PARTNER = `
    INSERT INTO PARTNER (PARTNER_INN, PARTNER_FULLNAME, PARTNER_PHONE, 
                         PARTNER_FACT_ADDRESS, PARTNER_POST_ADDRESS, USER_ID)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING PARTNER_ID
`;

// Обновление партнёра
const UPDATE_PARTNER = `
    UPDATE PARTNER
    SET PARTNER_INN = COALESCE($1, PARTNER_INN),
        PARTNER_FULLNAME = COALESCE($2, PARTNER_FULLNAME),
        PARTNER_PHONE = COALESCE($3, PARTNER_PHONE),
        PARTNER_FACT_ADDRESS = COALESCE($4, PARTNER_FACT_ADDRESS),
        PARTNER_POST_ADDRESS = COALESCE($5, PARTNER_POST_ADDRESS),
        USER_ID = COALESCE($6, USER_ID)
    WHERE PARTNER_ID = $7
    RETURNING PARTNER_ID
`;

const CHECK_USERNAME_EXISTS = `
    SELECT USER_ID FROM "USER" WHERE TRIM(USER_NAME) = TRIM($1)
`;

// Удаление партнёра
const DELETE_PARTNER = `
    DELETE FROM PARTNER WHERE PARTNER_ID = $1
`;

// Проверка зависимостей (наличие связанных записей)
const CHECK_DEPENDENCIES = `
    SELECT 
        (SELECT COUNT(*) FROM VEHICLE WHERE PARTNER_ID = $1) as vehicleCount,
        (SELECT COUNT(*) FROM DRIVER WHERE PARTNER_ID = $1) as driverCount,
        (SELECT COUNT(*) FROM UPD WHERE PARTNER_ID = $1) as updCount
`;

module.exports = {
    GET_PARTNERS,
    COUNT_PARTNERS,
    GET_PARTNER_BY_ID,
    CREATE_PARTNER,
    UPDATE_PARTNER,
    DELETE_PARTNER,
    CHECK_DEPENDENCIES
};