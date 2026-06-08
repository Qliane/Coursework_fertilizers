const db = require('../config/database');
const partnerQueries = require('../db/queries/partner-queries');
const { ROLES } = require('../utils/constants');

async function getPartners(userRoleId, filters = {}) {
    try {
        let query = partnerQueries.GET_PARTNERS;
        let countQuery = partnerQueries.COUNT_PARTNERS;
        const conditions = [];
        const params = [];


        if (filters.search) {
            conditions.push(`(TRIM(p.PARTNER_FULLNAME) ILIKE $${params.length + 1} OR p.PARTNER_INN ILIKE $${params.length + 1})`);
            params.push(`%${filters.search}%`);
        }
        if (filters.inn) {
            conditions.push(`p.PARTNER_INN = $${params.length + 1}`);
            params.push(filters.inn);
        }
        if (filters.fullName) {
            conditions.push(`TRIM(p.PARTNER_FULLNAME) ILIKE $${params.length + 1}`);
            params.push(`%${filters.fullName}%`);
        }

        if (conditions.length > 0) {
            const whereClause = ` WHERE ${conditions.join(' AND ')}`;
            query += whereClause;
            countQuery += whereClause;
        }


        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 20;
        const offset = (page - 1) * limit;
        query += ` ORDER BY p.PARTNER_FULLNAME LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

        const [dataResult, countResult] = await Promise.all([
            db.query(query, [...params, limit, offset]),
            db.query(countQuery, params)
        ]);

        const total = parseInt(countResult.rows[0].count);
        return {
            partners: dataResult.rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Ошибка в сервисе получения партнёров:', error);
        throw error;
    }
}

async function getPartnerById(partnerId) {
    try {
        const result = await db.query(partnerQueries.GET_PARTNER_BY_ID, [partnerId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Ошибка в сервисе получения партнёра по ID:', error);
        throw error;
    }
}

async function createPartner(partnerData, userRoleId) {

    if (userRoleId !== ROLES.OFFICE_WORKER) {
        throw new Error('Недостаточно прав для создания партнёра');
    }

    const client = await db.pool.connect();


        let userId = partnerData.userId || null;
    const existingPartner = await client.query(
        'SELECT PARTNER_ID FROM PARTNER WHERE USER_ID = $1',
        [userId]
    );
    if (existingPartner.rows.length > 0) {
        throw new Error('Этот пользователь уже является доверенным лицом другого партнёра');
    }

    try {
        await client.query('BEGIN');


        if (userId) {
            const userCheck = await client.query(
                'SELECT USER_ID FROM "USER" WHERE USER_ID = $1',
                [userId]
            );
            if (userCheck.rows.length === 0) {
                throw new Error('Указанный пользователь не существует');
            }
        }


        const result = await client.query(
            `INSERT INTO PARTNER 
             (PARTNER_INN, PARTNER_FULLNAME, PARTNER_PHONE, PARTNER_FACT_ADDRESS, PARTNER_POST_ADDRESS, USER_ID)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING PARTNER_ID`,
            [
                partnerData.inn,
                partnerData.fullName,
                partnerData.phone || null,
                partnerData.factAddress || null,
                partnerData.postAddress,
                userId
            ]
        );

        const newPartnerId = result.rows[0].partner_id;
        await client.query('COMMIT');
        return await getPartnerById(newPartnerId);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка в сервисе создания партнёра:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function updatePartner(partnerId, updateData, userId, userRoleId) {

    if (userRoleId !== ROLES.OFFICE_WORKER) {
        throw new Error('Недостаточно прав для обновления партнёра');
    }

    if (updateData.userId) {

        const existingPartner = await client.query(
            'SELECT PARTNER_ID FROM PARTNER WHERE USER_ID = $1 AND PARTNER_ID != $2',
            [updateData.userId, partnerId]
        );
        if (existingPartner.rows.length > 0) {
            throw new Error('Этот пользователь уже является доверенным лицом другого партнёра');
        }
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');


        const existing = await client.query(partnerQueries.GET_PARTNER_BY_ID, [partnerId]);
        if (existing.rows.length === 0) {
            throw new Error('Партнёр не найден');
        }


        if (updateData.userId) {
            const userCheck = await client.query('SELECT USER_ID FROM "USER" WHERE USER_ID = $1', [updateData.userId]);
            if (userCheck.rows.length === 0) {
                throw new Error('Указанный пользователь не существует');
            }
        }

        await client.query(partnerQueries.UPDATE_PARTNER, [
            updateData.inn || null,
            updateData.fullName || null,
            updateData.phone || null,
            updateData.factAddress || null,
            updateData.postAddress || null,
            updateData.userId || null,
            partnerId
        ]);

        await client.query('COMMIT');
        return await getPartnerById(partnerId);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка в сервисе обновления партнёра:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function deletePartner(partnerId, userRoleId) {

    if (userRoleId !== ROLES.OFFICE_WORKER) {
        throw new Error('Недостаточно прав для удаления партнёра');
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');


        const existing = await client.query(partnerQueries.GET_PARTNER_BY_ID, [partnerId]);
        if (existing.rows.length === 0) {
            throw new Error('Партнёр не найден');
        }


        const deps = await client.query(partnerQueries.CHECK_DEPENDENCIES, [partnerId]);
        const { vehiclecount, drivercount, updcount } = deps.rows[0];
        if (vehiclecount > 0 || drivercount > 0 || updcount > 0) {
            throw new Error('Невозможно удалить партнёра, так как существуют связанные записи (транспорт, водители или документы)');
        }

        await client.query(partnerQueries.DELETE_PARTNER, [partnerId]);
        await client.query('COMMIT');
        return { success: true };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка в сервисе удаления партнёра:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    getPartners,
    getPartnerById,
    createPartner,
    updatePartner,
    deletePartner
};