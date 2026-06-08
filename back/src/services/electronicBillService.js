const db = require('../config/database');
const ebQueries = require('../db/queries/electronic-bill-queries');
const { ROLES, EBILL_STATUSES } = require('../utils/constants');

async function signElectronicBill(billId, userId, userRoleId, userPartnerId = null) {
   
    const ebResult = await db.query(ebQueries.GET_ELECTRONIC_BILL_BY_BILL_ID, [billId]);
    if (ebResult.rows.length === 0) {
        throw new Error('Электронная транспортная накладная не найдена');
    }
    const eb = ebResult.rows[0];
    const currentStatus = eb.status;

   
    let newStatus = null;
    let requiredCurrentStatus = null;

    if (userRoleId === ROLES.DIRECTOR) {
       
        requiredCurrentStatus = EBILL_STATUSES.DRAFT;
        newStatus = EBILL_STATUSES.SIGNED_BY_STORAGE;
    } else if (userRoleId === ROLES.TRUSTED_PERSON) {
       
        requiredCurrentStatus = EBILL_STATUSES.SIGNED_BY_STORAGE;
        newStatus = EBILL_STATUSES.SIGNED_BY_PARTNER;
       
        const accessCheck = await db.query(ebQueries.CHECK_PARTNER_ACCESS, [userId, eb.updid]);
        if (accessCheck.rows.length === 0) {
            throw new Error('Нет доступа: этот партнёр не связан с данной накладной');
        }
    } else {
        throw new Error('Недостаточно прав для подписания ЭТрН');
    }

   
    if (currentStatus !== requiredCurrentStatus) {
        throw new Error(`Невозможно подписать: текущий статус ${currentStatus}, требуется ${requiredCurrentStatus}`);
    }

   
    const updateResult = await db.query(ebQueries.UPDATE_ELECTRONIC_BILL_STATUS, [newStatus, billId]);
    if (updateResult.rows.length === 0) {
        throw new Error('Не удалось обновить статус ЭТрН');
    }

    return {
        electronicBillId: updateResult.rows[0].electronic_bill_id,
        billId: updateResult.rows[0].bill_id,
        status: updateResult.rows[0].electronic_bill_status
    };
}

// Опционально: отдельный метод для принятия (статус 2 → 3)
async function acceptElectronicBill(billId, userRoleId) {
    if (userRoleId !== ROLES.TRUSTED_PERSON) {
        throw new Error('Только партнёр может принять ЭТрН');
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

       
        const ebResult = await client.query(ebQueries.GET_ELECTRONIC_BILL_BY_BILL_ID, [billId]);
        if (ebResult.rows.length === 0) throw new Error('ЭТрН не найдена');
        const eb = ebResult.rows[0];
        if (eb.status !== EBILL_STATUSES.SIGNED_BY_PARTNER) {
            throw new Error(`Невозможно принять: текущий статус ${eb.status}, требуется ${EBILL_STATUSES.SIGNED_BY_PARTNER}`);
        }

       
        const billRes = await client.query(
            'SELECT FLIST_ID FROM BILL WHERE BILL_ID = $1',
            [billId]
        );
        if (billRes.rows.length === 0) throw new Error('Накладная не найдена');
        const flistId = billRes.rows[0].flist_id;

       
        await client.query(`
            UPDATE FLIST_ITEM
            SET FLIST_ITEM_FACT_COUNT = FLIST_ITEM_DECL_COUNT
            WHERE FLIST_ID = $1
        `, [flistId]);

       
        const updateResult = await client.query(ebQueries.UPDATE_ELECTRONIC_BILL_STATUS, [EBILL_STATUSES.COMPLETED, billId]);

        await client.query('COMMIT');

        return {
            electronicBillId: updateResult.rows[0].electronic_bill_id,
            billId: updateResult.rows[0].bill_id,
            status: updateResult.rows[0].electronic_bill_status
        };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка при принятии ЭТрН:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    signElectronicBill,
    acceptElectronicBill
};