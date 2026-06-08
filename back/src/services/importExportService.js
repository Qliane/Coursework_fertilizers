// src/services/importExportService.js
const db = require('../config/database');
const { ROLES } = require('../utils/constants');
const { parse } = require('csv-parse/sync');

// ---------- Экспорт ----------
async function exportPartners(userRoleId) {
    if (userRoleId !== ROLES.OFFICE_WORKER) throw new Error('Недостаточно прав');
    const res = await db.query(`
        SELECT PARTNER_ID, PARTNER_INN, PARTNER_FULLNAME, PARTNER_PHONE, PARTNER_FACT_ADDRESS, PARTNER_POST_ADDRESS, USER_ID
        FROM PARTNER ORDER BY PARTNER_ID
    `);
    return res.rows;
}

async function exportVehicles(userRoleId) {
    if (userRoleId !== ROLES.OFFICE_WORKER) throw new Error('Недостаточно прав');
    const res = await db.query(`
        SELECT VEHICLE_ID, PARTNER_ID, VEHICLE_REGISTRATION_MARK, VEHICLE_TYPE, VEHICLE_CAPACITY
        FROM VEHICLE ORDER BY PARTNER_ID, VEHICLE_ID
    `);
    return res.rows;
}

async function exportDrivers(userRoleId) {
    if (userRoleId !== ROLES.OFFICE_WORKER) throw new Error('Недостаточно прав');
    const res = await db.query(`
        SELECT d.USER_ID, d.PARTNER_ID, d.DRIVER_LICENSE, d.DRIVER_CATEGORIES,
               u.USER_NAME, u.USER_SECONDNAME, u.USER_PATRONYMIC
        FROM DRIVER d
        JOIN "USER" u ON d.USER_ID = u.USER_ID
        ORDER BY d.PARTNER_ID, d.USER_ID
    `);
    return res.rows;
}

// ---------- Импорт (CSV -> база) ----------
async function importPartners(csvContent, userId, userRoleId) {
    if (userRoleId !== ROLES.OFFICE_WORKER) throw new Error('Недостаточно прав');
    const records = parse(csvContent, { columns: true, skip_empty_lines: true });
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        for (const row of records) {
           
            const { partner_inn, partner_fullname, partner_phone, partner_fact_address, partner_post_address, user_id } = row;
            if (!partner_inn || !partner_fullname || !partner_post_address) {
                throw new Error(`Недостаточно данных для строки: ${JSON.stringify(row)}`);
            }
           
            const check = await client.query('SELECT PARTNER_ID FROM PARTNER WHERE PARTNER_INN = $1', [partner_inn]);
            if (check.rows.length > 0) {
                console.warn(`Партнёр с ИНН ${partner_inn} уже существует, пропускаем`);
                continue;
            }
            await client.query(`
                INSERT INTO PARTNER (PARTNER_INN, PARTNER_FULLNAME, PARTNER_PHONE, PARTNER_FACT_ADDRESS, PARTNER_POST_ADDRESS, USER_ID)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [partner_inn, partner_fullname, partner_phone || null, partner_fact_address || null, partner_post_address, user_id || null]);
        }
        await client.query('COMMIT');
        return { success: true, message: 'Импорт партнёров завершён' };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function importVehicles(csvContent, userId, userRoleId) {
    if (userRoleId !== ROLES.OFFICE_WORKER) throw new Error('Недостаточно прав');
    const records = parse(csvContent, { columns: true, skip_empty_lines: true });
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        for (const row of records) {
            const { partner_id, registration_mark, type, capacity } = row;
            if (!partner_id || !registration_mark || !type || capacity === undefined) {
                throw new Error(`Недостаточно данных для ТС: ${JSON.stringify(row)}`);
            }
           
            const partnerCheck = await client.query('SELECT PARTNER_ID FROM PARTNER WHERE PARTNER_ID = $1', [partner_id]);
            if (partnerCheck.rows.length === 0) {
                throw new Error(`Партнёр с ID ${partner_id} не найден`);
            }
            await client.query(`
                INSERT INTO VEHICLE (PARTNER_ID, VEHICLE_REGISTRATION_MARK, VEHICLE_TYPE, VEHICLE_CAPACITY)
                VALUES ($1, $2, $3, $4)
            `, [partner_id, registration_mark, type, capacity]);
        }
        await client.query('COMMIT');
        return { success: true };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function importDrivers(csvContent, userId, userRoleId) {
    if (userRoleId !== ROLES.OFFICE_WORKER) throw new Error('Недостаточно прав');
    const records = parse(csvContent, { columns: true, skip_empty_lines: true });
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        for (const row of records) {
            const { user_id, partner_id, license, categories, name, surname, patronymic, password } = row;
            if (!user_id) {
               
                if (!name || !surname || !password) {
                    throw new Error(`Для создания водителя без user_id нужны name, surname, password`);
                }
                const newUser = await client.query(`
                    INSERT INTO "USER" (USER_NAME, USER_SECONDNAME, USER_PATRONYMIC, USER_PASSWORD, ROLE_ID)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING USER_ID
                `, [name, surname, patronymic || null, password, ROLES.DRIVER]);
                const newUserId = newUser.rows[0].user_id;
                await client.query(`
                    INSERT INTO DRIVER (USER_ID, PARTNER_ID, DRIVER_LICENSE, DRIVER_CATEGORIES)
                    VALUES ($1, $2, $3, $4)
                `, [newUserId, partner_id, license, categories || null]);
            } else {
               
                const userCheck = await client.query('SELECT ROLE_ID FROM "USER" WHERE USER_ID = $1', [user_id]);
                if (userCheck.rows.length === 0) throw new Error(`Пользователь ${user_id} не найден`);
                if (userCheck.rows[0].role_id !== ROLES.DRIVER) throw new Error(`Пользователь ${user_id} не является водителем`);
               
                const existing = await client.query('SELECT 1 FROM DRIVER WHERE USER_ID = $1', [user_id]);
                if (existing.rows.length === 0) {
                    await client.query(`
                        INSERT INTO DRIVER (USER_ID, PARTNER_ID, DRIVER_LICENSE, DRIVER_CATEGORIES)
                        VALUES ($1, $2, $3, $4)
                    `, [user_id, partner_id, license, categories || null]);
                } else {
                   
                    await client.query(`
                        UPDATE DRIVER SET PARTNER_ID = $2, DRIVER_LICENSE = $3, DRIVER_CATEGORIES = $4
                        WHERE USER_ID = $1
                    `, [user_id, partner_id, license, categories || null]);
                }
            }
        }
        await client.query('COMMIT');
        return { success: true };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    exportPartners, exportVehicles, exportDrivers,
    importPartners, importVehicles, importDrivers
};