// Получение всех накладных для УПД с их транспортными средствами и товарами
const GET_BILLS_FOR_SHIP = `
    SELECT 
        b.BILL_ID as billId,
        b.FLIST_ID as flistId,
        array_agg(DISTINCT tv.VEHICLE_ID) as vehicleIds
    FROM BILL b
    LEFT JOIN tn_link_vehicle tv ON b.BILL_ID = tv.BILL_ID
    WHERE b.UPD_ID = $1
    GROUP BY b.BILL_ID, b.FLIST_ID
`;

// Получение товаров из FLIST_ITEM с весами удобрений и тары
const GET_FLIST_ITEMS_WITH_WEIGHTS = `
    SELECT 
        fi.FLIST_ID,
        fi.FERTIL_ID,
        fi.FLIST_ITEM_DECL_COUNT as declaredCount,
        f.FERTIL_WEIGHT as fertilizerWeight,
        f.fertil_name as fertilName,
        c.CO_WEIGHT as containerWeight
    FROM FLIST_ITEM fi
    INNER JOIN FERTILIZER f ON fi.FERTIL_ID = f.FERTIL_ID
    INNER JOIN Container c ON f.CO_ID = c.CO_ID
    WHERE fi.FLIST_ID = ANY($1::int[])
`;

// Получение суммарной грузоподъёмности для списка vehicleIds
const GET_TOTAL_CAPACITY = `
    SELECT COALESCE(SUM(VEHICLE_CAPACITY), 0) as totalCapacity
    FROM VEHICLE
    WHERE VEHICLE_ID = ANY($1::int[])
`;

// Создание ЭТрН для накладной
const CREATE_ELECTRONIC_BILL = `
    INSERT INTO ELECTRONIC_BILL (BILL_ID, ELECTRONIC_BILL_STATUS)
    VALUES ($1, $2)
    RETURNING ELECTRONIC_BILL_ID
`;

// Обновление даты отгрузки УПД
const SET_UPD_SHIP_DATE = `
    UPDATE UPD
    SET UPD_SHIP_DATE = CURRENT_DATE
    WHERE UPD_ID = $1
    RETURNING UPD_ID, UPD_SHIP_DATE
`;

module.exports = {
    GET_BILLS_FOR_SHIP,
    GET_FLIST_ITEMS_WITH_WEIGHTS,
    GET_TOTAL_CAPACITY,
    CREATE_ELECTRONIC_BILL,
    SET_UPD_SHIP_DATE
};