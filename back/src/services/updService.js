const db = require('../config/database');
const updQueries = require('../db/queries/upd-queries');
const { ROLES } = require('../utils/constants');

// ---------- Вспомогательная: получение списка с фильтрацией ----------
async function getUpdList(userId, userRoleId, userStorageId, filters = {}) {
    let query = updQueries.GET_UPD_LIST;
    let countQuery = updQueries.COUNT_UPD;
    const conditions = [];
    const params = [];

   
    if (filters.storageId) {
        conditions.push(`u.STOR_ID = $${params.length + 1}`);
        params.push(filters.storageId);
    }
    if (filters.partnerId) {
        conditions.push(`u.PARTNER_ID = $${params.length + 1}`);
        params.push(filters.partnerId);
    }
    if (filters.dateFrom) {
        conditions.push(`u.UPD_CONCL_DATE >= $${params.length + 1}`);
        params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
        conditions.push(`u.UPD_CONCL_DATE <= $${params.length + 1}`);
        params.push(filters.dateTo);
    }

   
    switch (userRoleId) {
        case ROLES.STOREKEEPER:
            if (!userStorageId) {
                return { updList: [], total: 0, page: 1, limit: 20, totalPages: 0 };
            }
            conditions.push(`u.STOR_ID = $${params.length + 1}`);
            params.push(userStorageId);
            break;
        case ROLES.OFFICE_WORKER:
        case ROLES.DIRECTOR:
           
            break;
        case ROLES.TRUSTED_PERSON:
            const partnerRes = await db.query(updQueries.GET_PARTNER_BY_USER_ID, [userId]);
            if (partnerRes.rows.length === 0) {
                return { updList: [], total: 0, page: 1, limit: 20, totalPages: 0 };
            }
            const partnerId = partnerRes.rows[0].partner_id;
            conditions.push(`u.PARTNER_ID = $${params.length + 1}`);
            params.push(partnerId);
            break;
        default:
            return { updList: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    }

   
    if (conditions.length > 0) {
        const whereClause = ` WHERE ${conditions.join(' AND ')}`;
        query += whereClause;
        countQuery += whereClause;
    }

   
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const offset = (page - 1) * limit;
    query += ` ORDER BY u.UPD_ID DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    const [dataResult, countResult] = await Promise.all([
        db.query(query, [...params, limit, offset]),
        db.query(countQuery, params)
    ]);

    const total = parseInt(countResult.rows[0].count);
    return {
        updList: dataResult.rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
}

// ---------- Получение одного УПД с проверкой прав ----------
async function getUpdById(updId, userId, userRoleId, userStorageId) {
    const result = await db.query(updQueries.GET_UPD_BY_ID, [updId]);
    if (result.rows.length === 0) return null;
    const upd = result.rows[0];

   
    switch (userRoleId) {
        case ROLES.STOREKEEPER:
            if (upd.storageid !== userStorageId) return null;
            break;
        case ROLES.TRUSTED_PERSON:
            const partnerRes = await db.query(updQueries.GET_PARTNER_BY_USER_ID, [userId]);
            if (partnerRes.rows.length === 0 || upd.partnerid !== partnerRes.rows[0].partner_id) return null;
            break;
        case ROLES.OFFICE_WORKER:
        case ROLES.DIRECTOR:
           
            break;
        default:
            return null;
    }
    return upd;
}

// ---------- Создание УПД ----------
async function createUpd(updData, userId, userRoleId) {
    if (userRoleId !== ROLES.OFFICE_WORKER) {
        throw new Error('Недостаточно прав для создания УПД');
    }
    const { conclDate, partnerId, storageId } = updData;

   
    const partnerCheck = await db.query('SELECT PARTNER_ID FROM PARTNER WHERE PARTNER_ID = $1', [partnerId]);
    if (partnerCheck.rows.length === 0) throw new Error('Партнёр не найден');

   
    const storageCheck = await db.query('SELECT STOR_ID FROM STORAGE WHERE STOR_ID = $1', [storageId]);
    if (storageCheck.rows.length === 0) throw new Error('Склад не найден');

    const result = await db.query(updQueries.CREATE_UPD, [conclDate, partnerId, storageId, userId]);
    const newId = result.rows[0].upd_id;
    return await getUpdById(newId, userId, userRoleId, null);
}

// ---------- Обновление УПД ----------
async function updateUpd(updId, updateData, userId, userRoleId, userStorageId) {
    if (userRoleId !== ROLES.OFFICE_WORKER) {
        throw new Error('Недостаточно прав для обновления УПД');
    }
    const existing = await getUpdById(updId, userId, userRoleId, userStorageId);
    if (!existing) throw new Error('УПД не найден или нет доступа');

   
    const editCheck = await db.query(updQueries.CHECK_UPD_EDITABLE, [updId]);
    const { shipdate, billcount } = editCheck.rows[0];
    if (shipdate) throw new Error('Нельзя редактировать УПД после отгрузки');
    if (billcount > 0) throw new Error('Нельзя редактировать УПД, по которому уже созданы транспортные накладные');

    const { conclDate, partnerId, storageId } = updateData;
   
    if (partnerId) {
        const partnerCheck = await db.query('SELECT PARTNER_ID FROM PARTNER WHERE PARTNER_ID = $1', [partnerId]);
        if (partnerCheck.rows.length === 0) throw new Error('Партнёр не найден');
    }
    if (storageId) {
        const storageCheck = await db.query('SELECT STOR_ID FROM STORAGE WHERE STOR_ID = $1', [storageId]);
        if (storageCheck.rows.length === 0) throw new Error('Склад не найден');
    }
    await db.query(updQueries.UPDATE_UPD, [conclDate || null, partnerId || null, storageId || null, updId]);
    return await getUpdById(updId, userId, userRoleId, userStorageId);
}

// ---------- Удаление УПД ----------
async function deleteUpd(updId, userId, userRoleId, userStorageId) {
    if (userRoleId !== ROLES.OFFICE_WORKER) {
        throw new Error('Недостаточно прав для удаления УПД');
    }
    const existing = await getUpdById(updId, userId, userRoleId, userStorageId);
    if (!existing) throw new Error('УПД не найден или нет доступа');

    const editCheck = await db.query(updQueries.CHECK_UPD_EDITABLE, [updId]);
    const { shipdate, billcount } = editCheck.rows[0];
    if (shipdate) throw new Error('Нельзя удалить УПД после отгрузки');
    if (billcount > 0) throw new Error('Нельзя удалить УПД, по которому уже созданы транспортные накладные');

    await db.query(updQueries.DELETE_UPD, [updId]);
    return { success: true };
}

module.exports = {
    getUpdList,
    getUpdById,
    createUpd,
    updateUpd,
    deleteUpd
};