// SQL запросы для работы с ордерами

// Список ордеров для конкретного склада (кладовщик)
const GET_ORDERS_BY_STORAGE = `
    SELECT 
        o.ORDER_ID as id,
        o.ORDER_CREATED_AT as createdAt,
        o.ORDER_REALIZED_AT as realizedAt,
        s.STOR_ID as storageId,
        TRIM(s.STOR_FULLNAME) as storageName,
        u.USER_ID as creatorId,
        TRIM(u.USER_NAME) || ' ' || TRIM(u.USER_SECONDNAME) as creatorName,
        fl.FLIST_ID as listId
    FROM "ORDER" o
    INNER JOIN STORAGE s ON o.STOR_ID = s.STOR_ID
    INNER JOIN "USER" u ON o.USER_ID = u.USER_ID
    INNER JOIN FLIST fl ON o.FLIST_ID = fl.FLIST_ID
`;

// Счетчик ордеров для склада
const COUNT_ORDERS_BY_STORAGE = `
    SELECT COUNT(*) as count
    FROM "ORDER" o
    WHERE o.STOR_ID = $1
`;

// Список всех ордеров (директор)
const GET_ORDERS_ALL = `
    SELECT 
        o.ORDER_ID as id,
        o.ORDER_CREATED_AT as createdAt,
        o.ORDER_REALIZED_AT as realizedAt,
        s.STOR_ID as storageId,
        TRIM(s.STOR_FULLNAME) as storageName,
        u.USER_ID as creatorId,
        TRIM(u.USER_NAME) || ' ' || TRIM(u.USER_SECONDNAME) as creatorName,
        fl.FLIST_ID as listId
    FROM "ORDER" o
    INNER JOIN STORAGE s ON o.STOR_ID = s.STOR_ID
    INNER JOIN "USER" u ON o.USER_ID = u.USER_ID
    INNER JOIN FLIST fl ON o.FLIST_ID = fl.FLIST_ID
`;

// Счетчик всех ордеров
const COUNT_ORDERS_ALL = `
    SELECT COUNT(*) as count
    FROM "ORDER" o
`;

// Список ордеров по создателю (работник офиса)
const GET_ORDERS_BY_CREATOR = `
    SELECT 
        o.ORDER_ID as id,
        o.ORDER_CREATED_AT as createdAt,
        o.ORDER_REALIZED_AT as realizedAt,
        s.STOR_ID as storageId,
        TRIM(s.STOR_FULLNAME) as storageName,
        u.USER_ID as creatorId,
        TRIM(u.USER_NAME) || ' ' || TRIM(u.USER_SECONDNAME) as creatorName,
        fl.FLIST_ID as listId
    FROM "ORDER" o
    INNER JOIN STORAGE s ON o.STOR_ID = s.STOR_ID
    INNER JOIN "USER" u ON o.USER_ID = u.USER_ID
    INNER JOIN FLIST fl ON o.FLIST_ID = fl.FLIST_ID
    WHERE o.USER_ID = $1
`;

// Счетчик ордеров по создателю
const COUNT_ORDERS_BY_CREATOR = `
    SELECT COUNT(*) as count
    FROM "ORDER" o
    WHERE o.USER_ID = $1
`;

// Получение ордера по ID для склада
const GET_ORDER_BY_ID_STORAGE = `
    SELECT 
        o.ORDER_ID as id,
        o.ORDER_CREATED_AT as createdAt,
        o.ORDER_REALIZED_AT as realizedAt,
        s.STOR_ID as storageId,
        TRIM(s.STOR_FULLNAME) as storageName,
        u.USER_ID as creatorId,
        TRIM(u.USER_NAME) || ' ' || TRIM(u.USER_SECONDNAME) as creatorName,
        fl.FLIST_ID as listId
    FROM "ORDER" o
    INNER JOIN STORAGE s ON o.STOR_ID = s.STOR_ID
    INNER JOIN "USER" u ON o.USER_ID = u.USER_ID
    INNER JOIN FLIST fl ON o.FLIST_ID = fl.FLIST_ID
    WHERE o.ORDER_ID = $1 AND o.STOR_ID = $2
`;

// Получение ордера по ID (все)
const GET_ORDER_BY_ID_ALL = `
    SELECT 
        o.ORDER_ID as id,
        o.ORDER_CREATED_AT as createdAt,
        o.ORDER_REALIZED_AT as realizedAt,
        s.STOR_ID as storageId,
        TRIM(s.STOR_FULLNAME) as storageName,
        u.USER_ID as creatorId,
        TRIM(u.USER_NAME) || ' ' || TRIM(u.USER_SECONDNAME) as creatorName,
        fl.FLIST_ID as listId
    FROM "ORDER" o
    INNER JOIN STORAGE s ON o.STOR_ID = s.STOR_ID
    INNER JOIN "USER" u ON o.USER_ID = u.USER_ID
    INNER JOIN FLIST fl ON o.FLIST_ID = fl.FLIST_ID
    WHERE o.ORDER_ID = $1
`;

// Получение ордера по ID для создателя
const GET_ORDER_BY_ID_CREATOR = `
    SELECT 
        o.ORDER_ID as id,
        o.ORDER_CREATED_AT as createdAt,
        o.ORDER_REALIZED_AT as realizedAt,
        s.STOR_ID as storageId,
        TRIM(s.STOR_FULLNAME) as storageName,
        u.USER_ID as creatorId,
        TRIM(u.USER_NAME) || ' ' || TRIM(u.USER_SECONDNAME) as creatorName,
        fl.FLIST_ID as listId
    FROM "ORDER" o
    INNER JOIN STORAGE s ON o.STOR_ID = s.STOR_ID
    INNER JOIN "USER" u ON o.USER_ID = u.USER_ID
    INNER JOIN FLIST fl ON o.FLIST_ID = fl.FLIST_ID
    WHERE o.ORDER_ID = $1 AND o.USER_ID = $2
`;

// Получение удобрений ордера
const GET_ORDER_FERTILIZERS = `
    SELECT 
        fi.FERTIL_ID as id,
        TRIM(f.FERTIL_NAME) as name,
        fi.FLIST_ITEM_DECL_COUNT as declaredCount,
        fi.FLIST_ITEM_FACT_COUNT as factCount
    FROM FLIST_ITEM fi
    INNER JOIN FERTILIZER f ON fi.FERTIL_ID = f.FERTIL_ID
    WHERE fi.FLIST_ID = $1
    ORDER BY f.FERTIL_NAME;
`;

module.exports = {
    GET_ORDERS_BY_STORAGE,
    COUNT_ORDERS_BY_STORAGE,
    GET_ORDERS_ALL,
    COUNT_ORDERS_ALL,
    GET_ORDERS_BY_CREATOR,
    COUNT_ORDERS_BY_CREATOR,
    GET_ORDER_BY_ID_STORAGE,
    GET_ORDER_BY_ID_ALL,
    GET_ORDER_BY_ID_CREATOR,
    GET_ORDER_FERTILIZERS
};