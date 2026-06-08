// Получение списка ТС по партнёру
const GET_VEHICLES_BY_PARTNER = `
    SELECT 
        VEHICLE_ID as id,
        PARTNER_ID as partnerId,
        TRIM(VEHICLE_REGISTRATION_MARK) as registrationMark,
        VEHICLE_TYPE as type,
        VEHICLE_CAPACITY as capacity
    FROM VEHICLE
    WHERE PARTNER_ID = $1
    ORDER BY VEHICLE_ID
`;

// Получение ТС по ID и партнёру
const GET_VEHICLE_BY_ID = `
    SELECT 
        VEHICLE_ID as id,
        PARTNER_ID as partnerId,
        TRIM(VEHICLE_REGISTRATION_MARK) as registrationMark,
        VEHICLE_TYPE as type,
        VEHICLE_CAPACITY as capacity
    FROM VEHICLE
    WHERE VEHICLE_ID = $1 AND PARTNER_ID = $2
`;

// Создание ТС
const CREATE_VEHICLE = `
    INSERT INTO VEHICLE (PARTNER_ID, VEHICLE_REGISTRATION_MARK, VEHICLE_TYPE, VEHICLE_CAPACITY)
    VALUES ($1, $2, $3, $4)
    RETURNING VEHICLE_ID
`;

// Обновление ТС
const UPDATE_VEHICLE = `
    UPDATE VEHICLE
    SET VEHICLE_REGISTRATION_MARK = COALESCE($1, VEHICLE_REGISTRATION_MARK),
        VEHICLE_TYPE = COALESCE($2, VEHICLE_TYPE),
        VEHICLE_CAPACITY = COALESCE($3, VEHICLE_CAPACITY)
    WHERE VEHICLE_ID = $4 AND PARTNER_ID = $5
    RETURNING VEHICLE_ID
`;

// Удаление ТС
const DELETE_VEHICLE = `
    DELETE FROM VEHICLE
    WHERE VEHICLE_ID = $1 AND PARTNER_ID = $2
`;

// Проверка, используется ли ТС в накладных (tn_link_vehicle)
const CHECK_VEHICLE_IN_BILL = `
    SELECT COUNT(*) as count
    FROM tn_link_vehicle
    WHERE VEHICLE_ID = $1
`;

module.exports = {
    GET_VEHICLES_BY_PARTNER,
    GET_VEHICLE_BY_ID,
    CREATE_VEHICLE,
    UPDATE_VEHICLE,
    DELETE_VEHICLE,
    CHECK_VEHICLE_IN_BILL
};