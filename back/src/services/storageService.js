const db = require('../config/database');
const storageQueries = require('../db/queries/storage-queries');
const { ROLES } = require('../utils/constants');

// ---------- Склады ----------
async function getAllStorages(userRoleId) {
    const result = await db.query(storageQueries.GET_ALL_STORAGES);
    return result.rows;
}

async function getStorageById(storageId, userRoleId) {
    if (userRoleId !== ROLES.OFFICE_WORKER) {
        throw new Error('Недостаточно прав для просмотра склада');
    }
    const result = await db.query(storageQueries.GET_STORAGE_BY_ID, [storageId]);
    return result.rows[0] || null;
}

async function createStorage(storageData, userRoleId) {
    if (userRoleId !== ROLES.OFFICE_WORKER) {
        throw new Error('Недостаточно прав для создания склада');
    }
    const result = await db.query(storageQueries.CREATE_STORAGE, [
        storageData.fullName,
        storageData.address,
        storageData.phone || null,
        storageData.capacity || null
    ]);
    const newId = result.rows[0].stor_id;
    return await getStorageById(newId, userRoleId);
}

async function updateStorage(storageId, updateData, userRoleId) {
    if (userRoleId !== ROLES.OFFICE_WORKER) {
        throw new Error('Недостаточно прав для обновления склада');
    }
    const existing = await getStorageById(storageId, userRoleId);
    if (!existing) {
        throw new Error('Склад не найден');
    }
    await db.query(storageQueries.UPDATE_STORAGE, [
        updateData.fullName || null,
        updateData.address || null,
        updateData.phone || null,
        updateData.capacity || null,
        storageId
    ]);
    return await getStorageById(storageId, userRoleId);
}

async function deleteStorage(storageId, userRoleId) {
    if (userRoleId !== ROLES.OFFICE_WORKER) {
        throw new Error('Недостаточно прав для удаления склада');
    }
    const existing = await getStorageById(storageId, userRoleId);
    if (!existing) {
        throw new Error('Склад не найден');
    }
   
    const deps = await db.query(storageQueries.CHECK_STORAGE_DEPENDENCIES, [storageId]);
    const { ordercount, employeecount } = deps.rows[0];
    if (ordercount > 0) {
        throw new Error('Невозможно удалить склад, так как существуют связанные ордера');
    }
    if (employeecount > 0) {
        throw new Error('Невозможно удалить склад, так как на нём работают сотрудники. Сначала увольте всех работников.');
    }
    await db.query(storageQueries.DELETE_STORAGE, [storageId]);
    return { success: true };
}

// ---------- Работники склада ----------
async function getEmployeesByStorage(storageId, userRoleId) {
    if (userRoleId !== ROLES.OFFICE_WORKER) {
        throw new Error('Недостаточно прав для просмотра работников склада');
    }
    const storage = await getStorageById(storageId, userRoleId);
    if (!storage) {
        throw new Error('Склад не найден');
    }
    const result = await db.query(storageQueries.GET_EMPLOYEES_BY_STORAGE, [storageId]);
    return result.rows;
}

async function addEmployee(storageId, employeeData, userRoleId) {
    if (userRoleId !== ROLES.OFFICE_WORKER) {
        throw new Error('Недостаточно прав для назначения работника');
    }
    const { userId, snils, inn } = employeeData;

    const existing = await db.query(storageQueries.CHECK_EMPLOYEE_EXISTS_ANYWHERE, [userId]);
    if (existing.rows.length > 0) {
        throw new Error('Пользователь уже работает на другом складе. Сначала увольте его оттуда.');
    }
    const storage = await getStorageById(storageId, userRoleId);
    if (!storage) {
        throw new Error('Склад не найден');
    }

   
    const userRoleRes = await db.query(storageQueries.CHECK_USER_ROLE_FOR_EMPLOYEE, [userId]);
    if (userRoleRes.rows.length === 0) {
        throw new Error('Пользователь не найден');
    }
    const userRole = userRoleRes.rows[0].role_id;
    if (!storageQueries.ALLOWED_EMPLOYEE_ROLES.includes(userRole)) {
        throw new Error('Пользователь не может быть работником склада (необходима роль кладовщика или директора)');
    }

   
    await db.query(storageQueries.ADD_EMPLOYEE, [userId, storageId, snils, inn]);
    return { userId, storageId, snils, inn };
}

async function removeEmployee(storageId, userId, userRoleId) {
    if (userRoleId !== ROLES.OFFICE_WORKER) {
        throw new Error('Недостаточно прав для увольнения работника');
    }
    const storage = await getStorageById(storageId, userRoleId);
    if (!storage) {
        throw new Error('Склад не найден');
    }
   
    const employees = await getEmployeesByStorage(storageId, userRoleId);
    const exists = employees.some(emp => emp.userid === userId);
    if (!exists) {
        throw new Error('Работник не найден на данном складе');
    }
    await db.query(storageQueries.REMOVE_EMPLOYEE, [storageId, userId]);
    return { success: true };
}

module.exports = {
    getAllStorages,
    getStorageById,
    createStorage,
    updateStorage,
    deleteStorage,
    getEmployeesByStorage,
    addEmployee,
    removeEmployee
};