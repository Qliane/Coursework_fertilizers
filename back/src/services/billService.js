const db = require('../config/database');
const billQueries = require('../db/queries/bill-queries');
const { ROLES } = require('../utils/constants');
const stockService = require('./stockService');


async function createFlistFromItems(client, items) {
    const flistRes = await client.query('INSERT INTO FLIST DEFAULT VALUES RETURNING FLIST_ID');
    const flistId = flistRes.rows[0].flist_id;
    for (const item of items) {
        await client.query(
            `INSERT INTO FLIST_ITEM (FLIST_ID, FERTIL_ID, FLIST_ITEM_DECL_COUNT)
             VALUES ($1, $2, $3)`,
            [flistId, item.fertilizerId, item.declaredCount]
        );
    }
    return flistId;
}

async function checkStockAvailability(updId, items, userId, userRoleId, userStorageId) {
    const stock = await stockService.getCurrentStock(userId, userRoleId, userStorageId);
    const stockMap = new Map();
    for (const s of stock) {
        console.log(s)
        stockMap.set(s.fertilizerid, s.quantity);
    }
    for (const item of items) {
        const available = stockMap.get(item.fertilizerId) || 0;
        if (item.declaredCount > available) {
            const fertRes = await db.query('SELECT FERTIL_NAME FROM FERTILIZER WHERE FERTIL_ID = $1', [item.fertilizerId]);
            const fertName = fertRes.rows[0]?.fertil_name || `ID ${item.fertilizerId}`;
            throw new Error(`Недостаточно удобрения "${fertName}" на складе. Заявлено: ${item.declaredCount}, доступно: ${available}`);
        }
    }
}

async function getBillsByUpd(updId, userId, userRoleId, userStorageId) {
    const updInfo = await db.query(billQueries.GET_UPD_INFO, [updId]);
    if (updInfo.rows.length === 0) throw new Error('УПД не найден');
    const upd = updInfo.rows[0];
    if (userRoleId === ROLES.STOREKEEPER && upd.stor_id !== userStorageId) {
        throw new Error('Нет доступа к накладным этого склада');
    }
    const result = await db.query(billQueries.GET_BILLS_BY_UPD, [updId]);
    const billsWithItems = await Promise.all(result.rows.map(async (bill) => {
        const items = await db.query(billQueries.GET_BILL_ITEMS, [bill.listid]);
        return { ...bill, items: items.rows };
    }));
    return billsWithItems;
}

async function getBillById(updId, billId, userId, userRoleId, userStorageId) {
    if (userRoleId !== ROLES.STOREKEEPER && userRoleId !== ROLES.DIRECTOR) {
        throw new Error('Недостаточно прав');
    }
    const updInfo = await db.query(billQueries.GET_UPD_INFO, [updId]);
    if (updInfo.rows.length === 0) throw new Error('УПД не найден');
    const upd = updInfo.rows[0];
    if (userRoleId === ROLES.STOREKEEPER && upd.stor_id !== userStorageId) {
        throw new Error('Нет доступа');
    }
    const result = await db.query(billQueries.GET_BILL_BY_ID, [billId, updId]);
    if (result.rows.length === 0) return null;
    const bill = result.rows[0];
    const items = await db.query(billQueries.GET_BILL_ITEMS, [bill.listid]);
    return { ...bill, items: items.rows };
}

async function createBill(updId, billData, userId, userRoleId, userStorageId) {
    if (userRoleId !== ROLES.STOREKEEPER) {
        throw new Error('Недостаточно прав для создания накладной. Требуется роль кладовщика.');
    }
    const { driverId, vehicleIds, items } = billData;
    if (!driverId || !vehicleIds?.length || !items?.length) {
        throw new Error('Необходимо указать водителя, транспортные средства и товары');
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        const updRes = await client.query(billQueries.GET_UPD_INFO, [updId]);
        if (updRes.rows.length === 0) throw new Error('УПД не найден');
        const upd = updRes.rows[0];
        if (upd.upd_ship_date) throw new Error('Нельзя создать накладную для уже отгруженного УПД');
        if (upd.stor_id !== userStorageId) throw new Error('Нет доступа к этому УПД (чужой склад)');

        const partnerRes = await client.query(billQueries.GET_PARTNER_ID_BY_UPD, [updId]);
        const partnerId = partnerRes.rows[0].partner_id;

        const driverCheck = await client.query(billQueries.CHECK_DRIVER_BELONGS_TO_PARTNER, [driverId, partnerId]);
        if (driverCheck.rows.length === 0) throw new Error('Водитель не принадлежит партнёру УПД');

        for (const vehId of vehicleIds) {
            const vehCheck = await client.query(billQueries.CHECK_VEHICLE_BELONGS_TO_PARTNER, [vehId, partnerId]);
            if (vehCheck.rows.length === 0) throw new Error(`ТС с ID=${vehId} не принадлежит партнёру`);
        }

        await checkStockAvailability(updId, items, userId, userRoleId, userStorageId);

        const flistId = await createFlistFromItems(client, items);

        const billRes = await client.query(billQueries.CREATE_BILL, [updId, driverId, userId, flistId]);
        const billId = billRes.rows[0].bill_id;

        for (const vehId of vehicleIds) {
            await client.query(billQueries.ADD_VEHICLE_LINK, [billId, vehId]);
        }

        await client.query('COMMIT');
        return await getBillById(updId, billId, userId, userRoleId, userStorageId);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка создания накладной:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function updateBill(updId, billId, updateData, userId, userRoleId, userStorageId) {
    if (userRoleId !== ROLES.STOREKEEPER) {
        throw new Error('Недостаточно прав для обновления накладной');
    }
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        const editCheck = await client.query(billQueries.CHECK_BILL_EDITABLE, [billId]);
        if (editCheck.rows.length === 0) throw new Error('Накладная не найдена');
        if (editCheck.rows[0].shipdate) throw new Error('Нельзя редактировать накладную после отгрузки');

        const existing = await getBillById(updId, billId, userId, userRoleId, userStorageId);
        if (!existing) throw new Error('Накладная не найдена или нет доступа');

        const { driverId, vehicleIds, items } = updateData;
        const partnerRes = await client.query(billQueries.GET_PARTNER_ID_BY_UPD, [updId]);
        const partnerId = partnerRes.rows[0].partner_id;

        if (driverId) {
            const driverCheck = await client.query(billQueries.CHECK_DRIVER_BELONGS_TO_PARTNER, [driverId, partnerId]);
            if (driverCheck.rows.length === 0) throw new Error('Новый водитель не принадлежит партнёру');
            await client.query('UPDATE BILL SET USER_ID = $1 WHERE BILL_ID = $2', [driverId, billId]);
        }

        if (vehicleIds && vehicleIds.length) {
            for (const vehId of vehicleIds) {
                const vehCheck = await client.query(billQueries.CHECK_VEHICLE_BELONGS_TO_PARTNER, [vehId, partnerId]);
                if (vehCheck.rows.length === 0) throw new Error(`ТС ${vehId} не принадлежит партнёру`);
            }
            await client.query(billQueries.DELETE_VEHICLE_LINKS, [billId]);
            for (const vehId of vehicleIds) {
                await client.query(billQueries.ADD_VEHICLE_LINK, [billId, vehId]);
            }
        }

        if (items && items.length) {
            const newFlistId = await createFlistFromItems(client, items);
            await client.query(billQueries.UPDATE_BILL_FLIST, [newFlistId, billId]);
        }

        await client.query('COMMIT');
        return await getBillById(updId, billId, userId, userRoleId, userStorageId);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка обновления накладной:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function deleteBill(updId, billId, userId, userRoleId, userStorageId) {
    if (userRoleId !== ROLES.STOREKEEPER) {
        throw new Error('Недостаточно прав для удаления накладной');
    }
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const existing = await getBillById(updId, billId, userId, userRoleId, userStorageId);
        if (!existing) throw new Error('Накладная не найдена или нет доступа');

        const editCheck = await client.query(billQueries.CHECK_BILL_EDITABLE, [billId]);
        if (editCheck.rows[0].shipdate) throw new Error('Нельзя удалить накладную после отгрузки');

        await client.query(billQueries.DELETE_VEHICLE_LINKS, [billId]);
        await client.query(billQueries.DELETE_BILL, [billId, updId]);
        if (existing.listid) {
            await client.query('DELETE FROM FLIST_ITEM WHERE FLIST_ID = $1', [existing.listid]);
            await client.query('DELETE FROM FLIST WHERE FLIST_ID = $1', [existing.listid]);
        }
        await client.query('COMMIT');
        return { success: true };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка удаления накладной:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    getBillsByUpd,
    getBillById,
    createBill,
    updateBill,
    deleteBill
};