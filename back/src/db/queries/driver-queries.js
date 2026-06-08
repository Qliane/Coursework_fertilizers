// Получение списка водителей по партнёру
const GET_DRIVERS_BY_PARTNER = `
    SELECT 
        d.USER_ID as userId,
        d.PARTNER_ID as partnerId,
        d.DRIVER_LICENSE as license,
        d.DRIVER_CATEGORIES as categories,
        u.USER_NAME as name,
        u.USER_SECONDNAME as surname,
        u.USER_PATRONYMIC as patronymic,
        u.ROLE_ID as roleId,
        TRIM(r.ROLE_NAME) as roleName
    FROM DRIVER d
    INNER JOIN "USER" u ON d.USER_ID = u.USER_ID
    INNER JOIN ROLE r ON u.ROLE_ID = r.ROLE_ID
    WHERE d.PARTNER_ID = $1
    ORDER BY u.USER_SECONDNAME, u.USER_NAME
`;

// Получение конкретного водителя по ID партнёра и ID пользователя
const GET_DRIVER_BY_ID = `
    SELECT 
        d.USER_ID as userId,
        d.PARTNER_ID as partnerId,
        d.DRIVER_LICENSE as license,
        d.DRIVER_CATEGORIES as categories,
        u.USER_NAME as name,
        u.USER_SECONDNAME as surname,
        u.USER_PATRONYMIC as patronymic,
        u.ROLE_ID as roleId,
        TRIM(r.ROLE_NAME) as roleName
    FROM DRIVER d
    INNER JOIN "USER" u ON d.USER_ID = u.USER_ID
    INNER JOIN ROLE r ON u.ROLE_ID = r.ROLE_ID
    WHERE d.PARTNER_ID = $1 AND d.USER_ID = $2
`;

// Создание водителя
const CREATE_DRIVER = `
    INSERT INTO DRIVER (USER_ID, PARTNER_ID, DRIVER_LICENSE, DRIVER_CATEGORIES)
    VALUES ($1, $2, $3, $4)
    RETURNING USER_ID, PARTNER_ID
`;

// Обновление водителя
const UPDATE_DRIVER = `
    UPDATE DRIVER
    SET DRIVER_LICENSE = COALESCE($1, DRIVER_LICENSE),
        DRIVER_CATEGORIES = COALESCE($2, DRIVER_CATEGORIES)
    WHERE PARTNER_ID = $3 AND USER_ID = $4
    RETURNING USER_ID, PARTNER_ID
`;

// Удаление водителя
const DELETE_DRIVER = `
    DELETE FROM DRIVER
    WHERE PARTNER_ID = $1 AND USER_ID = $2
`;

// Проверка, используется ли водитель в накладных (BILL)
const CHECK_DRIVER_IN_BILL = `
    SELECT COUNT(*) as count
    FROM BILL
    WHERE USER_ID = $1
`;

module.exports = {
    GET_DRIVERS_BY_PARTNER,
    GET_DRIVER_BY_ID,
    CREATE_DRIVER,
    UPDATE_DRIVER,
    DELETE_DRIVER,
    CHECK_DRIVER_IN_BILL
};