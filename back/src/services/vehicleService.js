const db = require('../config/database');
const vehicleQueries = require('../db/queries/vehicle-queries');
const { ROLES } = require('../utils/constants');

// ---------- Получение списка ТС по партнёру (с проверкой прав) ----------
async function getVehiclesByPartner(partnerId, userId, userRoleId, userPartnerId = null) {

    if (userRoleId === ROLES.OFFICE_WORKER || userRoleId == ROLES.STOREKEEPER || userRoleId == ROLES.DIRECTOR || userRoleId == ROLES.TRUSTED_PERSON) {

        const result = await db.query(vehicleQueries.GET_VEHICLES_BY_PARTNER, [partnerId]);
        return result.rows;
    } else if (userRoleId === ROLES.TRUSTED_PERSON) {

        if (!userPartnerId || userPartnerId !== partnerId) {
            throw new Error('Нет доступа к транспортным средствам другого партнёра');
        }
        const result = await db.query(vehicleQueries.GET_VEHICLES_BY_PARTNER, [partnerId]);
        return result.rows;
    } else {
        throw new Error('Недостаточно прав для просмотра транспортных средств');
    }
}

// ---------- Получение одного ТС ----------
async function getVehicleById(partnerId, vehicleId, userId, userRoleId, userPartnerId = null) {
    if (userRoleId === ROLES.OFFICE_WORKER) {
        const result = await db.query(vehicleQueries.GET_VEHICLE_BY_ID, [vehicleId, partnerId]);
        return result.rows[0] || null;
    } else if (userRoleId === ROLES.TRUSTED_PERSON) {
        if (!userPartnerId || userPartnerId !== partnerId) {
            throw new Error('Нет доступа к этому транспортному средству');
        }
        const result = await db.query(vehicleQueries.GET_VEHICLE_BY_ID, [vehicleId, partnerId]);
        return result.rows[0] || null;
    } else {
        throw new Error('Недостаточно прав');
    }
}

// ---------- Создание ТС (только работник офиса) ----------
async function createVehicle(partnerId, vehicleData, userRoleId) {
    if (userRoleId !== ROLES.OFFICE_WORKER) {
        throw new Error('Недостаточно прав для создания транспортного средства');
    }
    const { registrationMark, type, capacity } = vehicleData;
    if (!registrationMark || !type || capacity === undefined) {
        throw new Error('Необходимо указать регистрационный номер, тип и грузоподъёмность');
    }

    if (type !== 'T' && type !== 'R') {
        throw new Error('Тип ТС должен быть T (грузовик) или R (прицеп)');
    }
    const result = await db.query(vehicleQueries.CREATE_VEHICLE, [
        partnerId,
        registrationMark.trim(),
        type,
        capacity
    ]);
    const newId = result.rows[0].vehicle_id;
    return await getVehicleById(partnerId, newId, null, ROLES.OFFICE_WORKER);
}

// ---------- Обновление ТС (только работник офиса) ----------
async function updateVehicle(partnerId, vehicleId, updateData, userRoleId) {
    if (userRoleId !== ROLES.OFFICE_WORKER) {
        throw new Error('Недостаточно прав для обновления транспортного средства');
    }
    const existing = await getVehicleById(partnerId, vehicleId, null, ROLES.OFFICE_WORKER);
    if (!existing) throw new Error('Транспортное средство не найдено');
    const { registrationMark, type, capacity } = updateData;
    await db.query(vehicleQueries.UPDATE_VEHICLE, [
        registrationMark || null,
        type || null,
        capacity !== undefined ? capacity : null,
        vehicleId,
        partnerId
    ]);
    return await getVehicleById(partnerId, vehicleId, null, ROLES.OFFICE_WORKER);
}

// ---------- Удаление ТС (только работник офиса) ----------
async function deleteVehicle(partnerId, vehicleId, userRoleId) {
    if (userRoleId !== ROLES.OFFICE_WORKER) {
        throw new Error('Недостаточно прав для удаления транспортного средства');
    }
    const existing = await getVehicleById(partnerId, vehicleId, null, ROLES.OFFICE_WORKER);
    if (!existing) throw new Error('Транспортное средство не найдено');

    const usage = await db.query(vehicleQueries.CHECK_VEHICLE_IN_BILL, [vehicleId]);
    if (parseInt(usage.rows[0].count) > 0) {
        throw new Error('Невозможно удалить ТС, так как оно используется в транспортных накладных');
    }
    await db.query(vehicleQueries.DELETE_VEHICLE, [vehicleId, partnerId]);
    return { success: true };
}

module.exports = {
    getVehiclesByPartner,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle
};