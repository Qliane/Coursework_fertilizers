// SQL запросы для работы со складом

// Упрощенная версия для истории (сначала проверим, что данные есть)
const GET_STOCK_HISTORY_BY_STORAGE = `
    SELECT 
        o.ORDER_CREATED_AT as date,
        f.FERTIL_ID as fertilizerId,
        TRIM(f.FERTIL_NAME) as fertilizerName,
        'INCOME' as operationType,
        fi.FLIST_ITEM_FACT_COUNT as quantity,
        'ORDER' as documentType,
        o.ORDER_ID as documentId,
        o.STOR_ID as storageId,
        TRIM(s.STOR_FULLNAME) as storageName
    FROM FLIST_ITEM fi
    INNER JOIN FERTILIZER f ON fi.FERTIL_ID = f.FERTIL_ID
    INNER JOIN "ORDER" o ON fi.FLIST_ID = o.FLIST_ID
    INNER JOIN STORAGE s ON o.STOR_ID = s.STOR_ID
    WHERE o.ORDER_REALIZED_AT IS NOT NULL
        AND o.STOR_ID = $1
        AND ($2::DATE IS NULL OR o.ORDER_CREATED_AT >= $2)
        AND ($3::DATE IS NULL OR o.ORDER_CREATED_AT <= $3)
        AND ($4::INT IS NULL OR f.FERTIL_ID = $4)
    ORDER BY o.ORDER_CREATED_AT DESC
    LIMIT 100;
`;

// Упрощенная версия для всех складов
const GET_STOCK_HISTORY_ALL = `
    SELECT 
        o.ORDER_CREATED_AT as date,
        f.FERTIL_ID as fertilizerId,
        TRIM(f.FERTIL_NAME) as fertilizerName,
        'INCOME' as operationType,
        fi.FLIST_ITEM_FACT_COUNT as quantity,
        'ORDER' as documentType,
        o.ORDER_ID as documentId,
        o.STOR_ID as storageId,
        TRIM(s.STOR_FULLNAME) as storageName
    FROM FLIST_ITEM fi
    INNER JOIN FERTILIZER f ON fi.FERTIL_ID = f.FERTIL_ID
    INNER JOIN "ORDER" o ON fi.FLIST_ID = o.FLIST_ID
    INNER JOIN STORAGE s ON o.STOR_ID = s.STOR_ID
    WHERE o.ORDER_REALIZED_AT IS NOT NULL
        AND ($1::INT IS NULL OR o.STOR_ID = $1)
        AND ($2::DATE IS NULL OR o.ORDER_CREATED_AT >= $2)
        AND ($3::DATE IS NULL OR o.ORDER_CREATED_AT <= $3)
        AND ($4::INT IS NULL OR f.FERTIL_ID = $4)
    ORDER BY o.ORDER_CREATED_AT DESC
    LIMIT 100;
`;

module.exports = {
    GET_STOCK_HISTORY_BY_STORAGE,
    GET_STOCK_HISTORY_ALL
};