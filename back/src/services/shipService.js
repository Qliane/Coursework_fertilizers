const db = require('../config/database');
const shipQueries = require('../db/queries/ship-queries');
const stockService = require('./stockService');
const updService = require('./updService');
const { ROLES, EBILL_STATUSES } = require('../utils/constants');

async function shipUpd(updId, userId, userRoleId, userStorageId) {
   
    if (userRoleId !== ROLES.STOREKEEPER) {
        throw new Error('Недостаточно прав для отгрузки. Требуется роль кладовщика.');
    }

   
    const upd = await updService.getUpdById(updId, userId, userRoleId, userStorageId);
    if (!upd) throw new Error('УПД не найден или нет доступа');
    if (upd.shipDate) throw new Error('УПД уже отгружен');

   
    const billsResult = await db.query(shipQueries.GET_BILLS_FOR_SHIP, [updId]);
    const bills = billsResult.rows;
    if (bills.length === 0) throw new Error('Нельзя отгрузить УПД без транспортных накладных');

   
    const flistIds = bills.map(b => b.flistid);
    const allVehicleIds = [];
    for (const bill of bills) {
        if (bill.vehicleids && bill.vehicleids.length) {
            allVehicleIds.push(...bill.vehicleids);
        }
    }
    const uniqueVehicleIds = [...new Set(allVehicleIds)];

   
    const itemsResult = await db.query(shipQueries.GET_FLIST_ITEMS_WITH_WEIGHTS, [flistIds]);
    const items = itemsResult.rows;

   
    const totalDemand = new Map();
    for (const item of items) {
        const fertId = item.fertil_id;
        if (!totalDemand.has(fertId)) {
            totalDemand.set(fertId, {
                totalDeclared: 0,
                fertilizerWeight: parseFloat(item.fertilizerweight),
                containerWeight: parseFloat(item.containerweight)
            });
        }
        totalDemand.get(fertId).totalDeclared += parseInt(item.declaredcount);
    }

   
   
    const stock = await stockService.getCurrentStock(userId, userRoleId, upd.storageid);
   
    const stockMap = new Map();
    console.log("SSSSS", stock, "STID", upd);
    for (const s of stock) {
        stockMap.set(s.fertilizerid, s.quantity);
    }

    for (const [fertId, demand] of totalDemand.entries()) {
        const available = stockMap.get(fertId) || 0;
        if (demand.totalDeclared > available) {
           
            const fertItem = items.find(i => i.fertil_id === fertId);
            const fertName = fertItem ? fertItem.fertilname : fertId;
            throw new Error(`Недостаточно удобрения "${fertName}" на складе. Требуется: ${demand.totalDeclared}, доступно: ${available}`);
        }
    }

   
    if (uniqueVehicleIds.length > 0) {
        const capacityRes = await db.query(shipQueries.GET_TOTAL_CAPACITY, [uniqueVehicleIds]);
        const totalCapacity = parseFloat(capacityRes.rows[0].totalcapacity);
       
        let totalWeight = 0;
        for (const item of items) {
            const weightPerUnit = parseFloat(item.fertilizerweight) + parseFloat(item.containerweight);
            totalWeight += weightPerUnit * parseInt(item.declaredcount);
        }
        if (totalWeight > totalCapacity) {
            throw new Error(`Суммарный вес груза (${totalWeight} кг) превышает грузоподъёмность ТС (${totalCapacity} кг)`);
        }
    } else {
        throw new Error('Нет транспортных средств, привязанных к накладным');
    }

   
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

       
        await client.query(shipQueries.SET_UPD_SHIP_DATE, [updId]);

       
        const electronicBills = [];
        for (const bill of bills) {
            const ebResult = await client.query(shipQueries.CREATE_ELECTRONIC_BILL, [bill.billid, EBILL_STATUSES.DRAFT]);
            electronicBills.push({
                electronicBillId: ebResult.rows[0].electronic_bill_id,
                billId: bill.billid,
                status: EBILL_STATUSES.DRAFT
            });
        }

        await client.query('COMMIT');

       
        const updatedUpd = await updService.getUpdById(updId, userId, userRoleId, userStorageId);
        return {
            upd: updatedUpd,
            electronicBills
        };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка при отгрузке:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    shipUpd
};