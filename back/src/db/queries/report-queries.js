// SQL запросы для отчетов

// Отчет по складу для конкретного склада
const GET_STOCK_REPORT_BY_STORAGE = `
    SELECT 
        TRIM(f.FERTIL_NAME) as fertilizerName,
        TRIM(c.CO_NAME) as containerType,
        c.CO_WEIGHT as containerWeight,
        f.FERTIL_WEIGHT as weight,
        COALESCE(SUM(
            CASE 
                WHEN o.ORDER_REALIZED_AT IS NOT NULL THEN fi.FLIST_ITEM_FACT_COUNT
                ELSE 0 
            END
        ), 0) - COALESCE(SUM(bi.FLIST_ITEM_FACT_COUNT), 0) as quantity
    FROM FERTILIZER f
    INNER JOIN Container c ON f.CO_ID = c.CO_ID
    LEFT JOIN FLIST_ITEM fi ON f.FERTIL_ID = fi.FERTIL_ID
    LEFT JOIN "ORDER" o ON fi.FLIST_ID = o.FLIST_ID AND o.STOR_ID = $1
    LEFT JOIN (
        SELECT fi2.FERTIL_ID, fi2.FLIST_ITEM_FACT_COUNT
        FROM FLIST_ITEM fi2
        INNER JOIN BILL b ON fi2.FLIST_ID = b.FLIST_ID
        INNER JOIN "ORDER" o2 ON b.UPD_ID = o2.ORDER_ID AND o2.STOR_ID = $1
    ) bi ON f.FERTIL_ID = bi.FERTIL_ID
    GROUP BY f.FERTIL_ID, f.FERTIL_NAME, c.CO_NAME, c.CO_WEIGHT, f.FERTIL_WEIGHT
    ORDER BY f.FERTIL_NAME;
`;

// Отчет по всем складам
const GET_STOCK_REPORT_ALL = `
    SELECT 
        TRIM(f.FERTIL_NAME) as fertilizerName,
        TRIM(c.CO_NAME) as containerType,
        c.CO_WEIGHT as containerWeight,
        f.FERTIL_WEIGHT as weight,
        COALESCE(SUM(
            CASE 
                WHEN o.ORDER_REALIZED_AT IS NOT NULL THEN fi.FLIST_ITEM_FACT_COUNT
                ELSE 0 
            END
        ), 0) - COALESCE(SUM(bi.FLIST_ITEM_FACT_COUNT), 0) as quantity
    FROM FERTILIZER f
    INNER JOIN Container c ON f.CO_ID = c.CO_ID
    LEFT JOIN FLIST_ITEM fi ON f.FERTIL_ID = fi.FERTIL_ID
    LEFT JOIN "ORDER" o ON fi.FLIST_ID = o.FLIST_ID
    LEFT JOIN (
        SELECT fi2.FERTIL_ID, fi2.FLIST_ITEM_FACT_COUNT
        FROM FLIST_ITEM fi2
        INNER JOIN BILL b ON fi2.FLIST_ID = b.FLIST_ID
        INNER JOIN "ORDER" o2 ON b.UPD_ID = o2.ORDER_ID
    ) bi ON f.FERTIL_ID = bi.FERTIL_ID
    GROUP BY f.FERTIL_ID, f.FERTIL_NAME, c.CO_NAME, c.CO_WEIGHT, f.FERTIL_WEIGHT
    ORDER BY f.FERTIL_NAME;
`;

module.exports = {
    GET_STOCK_REPORT_BY_STORAGE,
    GET_STOCK_REPORT_ALL
};