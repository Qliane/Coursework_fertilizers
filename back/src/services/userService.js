// src/services/userService.js
const db = require('../config/database');

async function getAllUsers(filters = {}) {
    let query = `
        SELECT 
            u.USER_ID as id,
            TRIM(u.USER_NAME) as name,
            TRIM(u.USER_SECONDNAME) as surname,
            TRIM(u.USER_PATRONYMIC) as patronymic,
            u.ROLE_ID as roleId,
            TRIM(r.ROLE_NAME) as roleName
        FROM "USER" u
        JOIN ROLE r ON u.ROLE_ID = r.ROLE_ID
        WHERE 1=1
    `;
    const params = [];

   
    if (filters.roleId) {
        let roleIds = filters.roleId;
       
        if (typeof roleIds === 'string' && roleIds.includes(',')) {
            roleIds = roleIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        } else if (typeof roleIds === 'string') {
            roleIds = [parseInt(roleIds)];
        } else if (Array.isArray(roleIds)) {
            roleIds = roleIds.map(id => parseInt(id));
        } else {
            roleIds = [parseInt(roleIds)];
        }
        
        if (roleIds.length > 0) {
            const placeholders = roleIds.map((_, idx) => `$${params.length + idx + 1}`).join(',');
            query += ` AND u.ROLE_ID IN (${placeholders})`;
            params.push(...roleIds);
        }
    }

   
    if (filters.search) {
        query += ` AND (TRIM(u.USER_NAME) ILIKE $${params.length + 1} 
                    OR TRIM(u.USER_SECONDNAME) ILIKE $${params.length + 1})`;
        params.push(`%${filters.search}%`);
    }

    query += ` ORDER BY u.USER_SECONDNAME, u.USER_NAME`;
    const result = await db.query(query, params);
    return result.rows;
}

async function getUserById(userId) {
    const query = `
        SELECT 
            u.USER_ID as id,
            TRIM(u.USER_NAME) as name,
            TRIM(u.USER_SECONDNAME) as surname,
            TRIM(u.USER_PATRONYMIC) as patronymic,
            u.ROLE_ID as roleId,
            TRIM(r.ROLE_NAME) as roleName
        FROM "USER" u
        JOIN ROLE r ON u.ROLE_ID = r.ROLE_ID
        WHERE u.USER_ID = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0] || null;
}

async function createUser(userData) {
    const { name, surname, patronymic, password, roleId } = userData;
   
    const check = await db.query('SELECT USER_ID FROM "USER" WHERE TRIM(USER_NAME) = TRIM($1)', [name]);
    if (check.rows.length > 0) {
        throw new Error('Пользователь с таким именем уже существует');
    }
    const result = await db.query(
        `INSERT INTO "USER" (USER_NAME, USER_SECONDNAME, USER_PATRONYMIC, USER_PASSWORD, ROLE_ID)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING USER_ID`,
        [name.trim(), surname.trim(), patronymic?.trim() || null, password, roleId]
    );
    const newId = result.rows[0].user_id;
    return getUserById(newId);
}

async function updateUser(userId, updateData) {
    const { name, surname, patronymic, password, roleId } = updateData;
    const fields = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) {
        if (name) {
            const check = await db.query(
                'SELECT USER_ID FROM "USER" WHERE TRIM(USER_NAME) = TRIM($1) AND USER_ID != $2',
                [name, userId]
            );
            if (check.rows.length > 0) {
                throw new Error('Пользователь с таким именем уже существует');
            }
        }
        fields.push(`USER_NAME = $${paramIndex++}`);
        params.push(name?.trim() || null);
    }
    if (surname !== undefined) {
        fields.push(`USER_SECONDNAME = $${paramIndex++}`);
        params.push(surname?.trim() || null);
    }
    if (patronymic !== undefined) {
        fields.push(`USER_PATRONYMIC = $${paramIndex++}`);
        params.push(patronymic?.trim() || null);
    }
    if (password !== undefined && password !== '') {
        fields.push(`USER_PASSWORD = $${paramIndex++}`);
        params.push(password);
    }
    if (roleId !== undefined) {
        fields.push(`ROLE_ID = $${paramIndex++}`);
        params.push(roleId);
    }

    if (fields.length === 0) {
        throw new Error('Нет данных для обновления');
    }

    params.push(userId);
    const query = `UPDATE "USER" SET ${fields.join(', ')} WHERE USER_ID = $${paramIndex}`;
    await db.query(query, params);
    return getUserById(userId);
}

async function deleteUser(userId) {
    const checks = await db.query(`
        SELECT 
            (SELECT COUNT(*) FROM EMPLOYER WHERE USER_ID = $1) as employerCount,
            (SELECT COUNT(*) FROM DRIVER WHERE USER_ID = $1) as driverCount,
            (SELECT COUNT(*) FROM PARTNER WHERE USER_ID = $1) as partnerCount,
            (SELECT COUNT(*) FROM "ORDER" WHERE USER_ID = $1) as orderCount,
            (SELECT COUNT(*) FROM UPD WHERE USER_ID = $1) as updCount,
            (SELECT COUNT(*) FROM BILL WHERE USER_ID = $1 OR EMP_USER_ID = $1) as billCount
    `, [userId]);

    const counts = checks.rows[0];
    if (counts.employercount > 0 || counts.drivercount > 0 || counts.partnercount > 0 ||
        counts.ordercount > 0 || counts.updcount > 0 || counts.billcount > 0) {
        throw new Error('Невозможно удалить пользователя – он связан с другими записями');
    }

    await db.query('DELETE FROM "USER" WHERE USER_ID = $1', [userId]);
    return { success: true };
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};