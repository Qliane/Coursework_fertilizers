// Получение ЭТрН по ID накладной
const GET_ELECTRONIC_BILL_BY_BILL_ID = `
    SELECT 
        eb.ELECTRONIC_BILL_ID as id,
        eb.BILL_ID as billId,
        eb.ELECTRONIC_BILL_STATUS as status,
        b.UPD_ID as updId,
        u.PARTNER_ID as partnerId
    FROM ELECTRONIC_BILL eb
    INNER JOIN BILL b ON eb.BILL_ID = b.BILL_ID
    LEFT JOIN UPD u ON b.UPD_ID = u.UPD_ID
    WHERE eb.BILL_ID = $1
`;

// Обновление статуса ЭТрН
const UPDATE_ELECTRONIC_BILL_STATUS = `
    UPDATE ELECTRONIC_BILL
    SET ELECTRONIC_BILL_STATUS = $1
    WHERE BILL_ID = $2
    RETURNING ELECTRONIC_BILL_ID, BILL_ID, ELECTRONIC_BILL_STATUS
`;

// Проверка, что пользователь-партнёр связан с данным УПД
const CHECK_PARTNER_ACCESS = `
    SELECT 1 FROM PARTNER p
    INNER JOIN UPD u ON p.PARTNER_ID = u.PARTNER_ID
    WHERE p.USER_ID = $1 AND u.UPD_ID = $2
`;

module.exports = {
    GET_ELECTRONIC_BILL_BY_BILL_ID,
    UPDATE_ELECTRONIC_BILL_STATUS,
    CHECK_PARTNER_ACCESS
};