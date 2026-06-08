const db = require('../config/database');
const jwt = require('jsonwebtoken');
const authQueries = require('../db/queries/auth-queries');

async function login(username, password) {
    try {
        console.log('DEBUG: Attempting login for user:', username);
        
        const result = await db.query(authQueries.LOGIN, [username.trim(), password]);
        
        console.log('DEBUG: Login query result:', result.rows);

        if (result.rows.length === 0) {
            console.log('DEBUG: No user found or wrong password');
            return null;
        }

        const user = result.rows[0];
        
        console.log('DEBUG: User from DB:', user);
        console.log('DEBUG: User roleId:', user.roleid);
        console.log('DEBUG: User storageId:', user.storageid);

        const token = jwt.sign(
            {
                userId: user.id,
                roleId: user.roleid,       
                storageId: user.storageid, 
                roleName: user.rolename
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
        );

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                surname: user.surname,
                patronymic: user.patronymic,
                roleId: user.roleid,
                roleName: user.rolename,
                storageId: user.storageid,
                storageName: user.storagename
            }
        };
    } catch (error) {
        console.error('Ошибка в сервисе аутентификации:', error);
        throw error;
    }
}

async function getUserById(userId) {
    try {
        const result = await db.query(authQueries.GET_USER_BY_ID, [userId]);
        if (result.rows.length === 0) return null;

        const user = result.rows[0];

        let partnerId = null;
        if (user.roleid === 4) {
            const partnerRes = await db.query(authQueries.GET_PARTNER_ID_BY_USER, [userId]);
            if (partnerRes.rows.length > 0) {
                partnerId = partnerRes.rows[0].partner_id;
            }
        }

        return {
            id: user.id,
            name: user.name,
            surname: user.surname,
            patronymic: user.patronymic,
            roleId: user.roleid,
            roleName: user.rolename,
            storageId: user.storageid,
            storageName: user.storagename,
            partnerId: partnerId
        };
    } catch (error) {
        console.error('Ошибка при получении пользователя по ID:', error);
        throw error;
    }
}

module.exports = { login, getUserById };