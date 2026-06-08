
const GET_UPD_LIST = `
    SELECT 
        u.UPD_ID as id,
        u.UPD_CONCL_DATE as conclDate,
        u.UPD_SHIP_DATE as shipDate,
        u.PARTNER_ID as partnerId,
        p.PARTNER_FULLNAME as partnerName,
        u.STOR_ID as storageId,
        s.STOR_FULLNAME as storageName,
        u.USER_ID as creatorId,
        TRIM(creator.USER_NAME) || ' ' || TRIM(creator.USER_SECONDNAME) as creatorName,
        (SELECT COUNT(*) FROM BILL WHERE UPD_ID = u.UPD_ID) as billCount
    FROM UPD u
    LEFT JOIN PARTNER p ON u.PARTNER_ID = p.PARTNER_ID
    LEFT JOIN STORAGE s ON u.STOR_ID = s.STOR_ID
    LEFT JOIN "USER" creator ON u.USER_ID = creator.USER_ID
`;

const COUNT_UPD = `
    SELECT COUNT(*) as count
    FROM UPD u
`;

const GET_UPD_BY_ID = `
    SELECT 
        u.UPD_ID as id,
        u.UPD_CONCL_DATE as conclDate,
        u.UPD_SHIP_DATE as shipDate,
        u.PARTNER_ID as partnerId,
        p.PARTNER_FULLNAME as partnerName,
        u.STOR_ID as storageId,
        s.STOR_FULLNAME as storageName,
        u.USER_ID as creatorId,
        TRIM(creator.USER_NAME) || ' ' || TRIM(creator.USER_SECONDNAME) as creatorName,
        (SELECT COUNT(*) FROM BILL WHERE UPD_ID = u.UPD_ID) as billCount
    FROM UPD u
    LEFT JOIN PARTNER p ON u.PARTNER_ID = p.PARTNER_ID
    LEFT JOIN STORAGE s ON u.STOR_ID = s.STOR_ID
    LEFT JOIN "USER" creator ON u.USER_ID = creator.USER_ID
    WHERE u.UPD_ID = $1
`;

// ---------- Создание УПД ----------
const CREATE_UPD = `
    INSERT INTO UPD (UPD_CONCL_DATE, PARTNER_ID, STOR_ID, USER_ID)
    VALUES ($1, $2, $3, $4)
    RETURNING UPD_ID
`;

// ---------- Обновление УПД ----------
const UPDATE_UPD = `
    UPDATE UPD
    SET UPD_CONCL_DATE = COALESCE($1, UPD_CONCL_DATE),
        PARTNER_ID = COALESCE($2, PARTNER_ID),
        STOR_ID = COALESCE($3, STOR_ID)
    WHERE UPD_ID = $4
    RETURNING UPD_ID
`;

// ---------- Удаление УПД ----------
const DELETE_UPD = `
    DELETE FROM UPD WHERE UPD_ID = $1
`;

// ---------- Проверка возможности редактирования/удаления ----------
// Если дата отгрузки заполнена, либо есть связанные накладные (BILL)
const CHECK_UPD_EDITABLE = `
    SELECT 
        UPD_SHIP_DATE as shipDate,
        (SELECT COUNT(*) FROM BILL WHERE UPD_ID = $1) as billCount
    FROM UPD
    WHERE UPD_ID = $1
`;

// ---------- Получение партнёра по ID пользователя (для роли PARTNER) ----------
const GET_PARTNER_BY_USER_ID = `
    SELECT PARTNER_ID FROM PARTNER WHERE USER_ID = $1
`;

module.exports = {
    GET_UPD_LIST,
    COUNT_UPD,
    GET_UPD_BY_ID,
    CREATE_UPD,
    UPDATE_UPD,
    DELETE_UPD,
    CHECK_UPD_EDITABLE,
    GET_PARTNER_BY_USER_ID
};