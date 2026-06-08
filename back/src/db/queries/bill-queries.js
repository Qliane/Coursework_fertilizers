// ---------- Получение списка накладных по UPD_ID ----------
const GET_BILLS_BY_UPD = `
    SELECT 
        b.BILL_ID as id,
        b.UPD_ID as updId,
        b.USER_ID as driverId,
        TRIM(driver.USER_NAME) || ' ' || TRIM(driver.USER_SECONDNAME) as driverName,
        b.EMP_USER_ID as storekeeperId,
        TRIM(emp.USER_NAME) || ' ' || TRIM(emp.USER_SECONDNAME) as storekeeperName,
        b.FLIST_ID as listId,
        b.BILL_CREATED_AT as createdAt,
        (SELECT array_agg(VEHICLE_ID) FROM tn_link_vehicle WHERE BILL_ID = b.BILL_ID) as vehicleIds,
        eb.ELECTRONIC_BILL_STATUS as "electronicBillStatus"
    FROM BILL b
    LEFT JOIN "USER" driver ON b.USER_ID = driver.USER_ID
    LEFT JOIN "USER" emp ON b.EMP_USER_ID = emp.USER_ID
    LEFT JOIN ELECTRONIC_BILL eb ON b.BILL_ID = eb.BILL_ID
    WHERE b.UPD_ID = $1
    ORDER BY b.BILL_ID DESC
`;

// ---------- Получение одной накладной по ID и UPD_ID ----------
const GET_BILL_BY_ID = `
    SELECT 
        b.BILL_ID as id,
        b.UPD_ID as updId,
        b.USER_ID as driverId,
        TRIM(driver.USER_NAME) || ' ' || TRIM(driver.USER_SECONDNAME) as driverName,
        b.EMP_USER_ID as storekeeperId,
        b.FLIST_ID as listId,
        b.BILL_CREATED_AT as createdAt,
        (SELECT array_agg(VEHICLE_ID) FROM tn_link_vehicle WHERE BILL_ID = b.BILL_ID) as vehicleIds,
        eb.ELECTRONIC_BILL_STATUS as "electronicBillStatus"
    FROM BILL b
    LEFT JOIN "USER" driver ON b.USER_ID = driver.USER_ID
    LEFT JOIN ELECTRONIC_BILL eb ON b.BILL_ID = eb.BILL_ID
    WHERE b.BILL_ID = $1 AND b.UPD_ID = $2
`;

// ---------- Создание накладной ----------
const CREATE_BILL = `
    INSERT INTO BILL (UPD_ID, USER_ID, EMP_USER_ID, FLIST_ID, BILL_CREATED_AT)
    VALUES ($1, $2, $3, $4, CURRENT_DATE)
    RETURNING BILL_ID
`;

// ---------- Обновление накладной (только связь с ТС и FLIST можно обновить) ----------
// Для простоты обновляем FLIST_ID (через пересоздание FLIST_ITEM) и список ТС.
// Сначала удаляем старые связи с ТС, потом добавляем новые.
const DELETE_VEHICLE_LINKS = `
    DELETE FROM tn_link_vehicle WHERE BILL_ID = $1
`;

const ADD_VEHICLE_LINK = `
    INSERT INTO tn_link_vehicle (BILL_ID, VEHICLE_ID) VALUES ($1, $2)
`;

// Обновление FLIST_ID (в случае, если пересоздаём список товаров)
const UPDATE_BILL_FLIST = `
    UPDATE BILL SET FLIST_ID = $1 WHERE BILL_ID = $2
`;

// ---------- Удаление накладной ----------
const DELETE_BILL = `
    DELETE FROM BILL WHERE BILL_ID = $1 AND UPD_ID = $2
`;

// ---------- Проверки ----------
// Получить UPD_ID и STOR_ID, а также статус отгрузки
const GET_UPD_INFO = `
    SELECT UPD_ID, STOR_ID, UPD_SHIP_DATE FROM UPD WHERE UPD_ID = $1
`;

// Проверить, принадлежат ли водитель и ТС партнёру УПД
const GET_PARTNER_ID_BY_UPD = `
    SELECT PARTNER_ID FROM UPD WHERE UPD_ID = $1
`;

const CHECK_DRIVER_BELONGS_TO_PARTNER = `
    SELECT 1 FROM DRIVER WHERE USER_ID = $1 AND PARTNER_ID = $2
`;

const CHECK_VEHICLE_BELONGS_TO_PARTNER = `
    SELECT 1 FROM VEHICLE WHERE VEHICLE_ID = $1 AND PARTNER_ID = $2
`;

// Получить список товаров накладной (для GET /bills/:billId)
const GET_BILL_ITEMS = `
    SELECT 
        fi.FERTIL_ID as fertilizerId,
        f.FERTIL_NAME as fertilizerName,
        fi.FLIST_ITEM_DECL_COUNT as declaredCount,
        fi.FLIST_ITEM_FACT_COUNT as factCount
    FROM FLIST_ITEM fi
    INNER JOIN FERTILIZER f ON fi.FERTIL_ID = f.FERTIL_ID
    WHERE fi.FLIST_ID = $1
    ORDER BY f.FERTIL_NAME
`;

// Проверка возможности редактирования/удаления накладной (до отгрузки)
// Для BILL проверяем, что у связанного UPD нет даты отгрузки
const CHECK_BILL_EDITABLE = `
    SELECT u.UPD_SHIP_DATE as shipDate
    FROM BILL b
    INNER JOIN UPD u ON b.UPD_ID = u.UPD_ID
    WHERE b.BILL_ID = $1
`;

module.exports = {
    GET_BILLS_BY_UPD,
    GET_BILL_BY_ID,
    CREATE_BILL,
    DELETE_VEHICLE_LINKS,
    ADD_VEHICLE_LINK,
    UPDATE_BILL_FLIST,
    DELETE_BILL,
    GET_UPD_INFO,
    GET_PARTNER_ID_BY_UPD,
    CHECK_DRIVER_BELONGS_TO_PARTNER,
    CHECK_VEHICLE_BELONGS_TO_PARTNER,
    GET_BILL_ITEMS,
    CHECK_BILL_EDITABLE
};