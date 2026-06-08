const storageService = require('../services/storageService');

// ----- Склады -----
async function getAllStorages(req, res) {
    try {
        const userRoleId = req.user.roleId;
        const storages = await storageService.getAllStorages(userRoleId);
        res.json({ success: true, data: storages });
    } catch (error) {
        console.error('Ошибка получения складов:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function getStorageById(req, res) {
    try {
        const storageId = parseInt(req.params.id);
        const userRoleId = req.user.roleId;
        const storage = await storageService.getStorageById(storageId, userRoleId);
        if (!storage) {
            return res.status(404).json({ success: false, error: 'Склад не найден' });
        }
        res.json({ success: true, data: storage });
    } catch (error) {
        console.error('Ошибка получения склада:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function createStorage(req, res) {
    try {
        const userRoleId = req.user.roleId;
        const newStorage = await storageService.createStorage(req.body, userRoleId);
        res.status(201).json({ success: true, data: newStorage, message: 'Склад создан' });
    } catch (error) {
        console.error('Ошибка создания склада:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function updateStorage(req, res) {
    try {
        const storageId = parseInt(req.params.id);
        const userRoleId = req.user.roleId;
        const updated = await storageService.updateStorage(storageId, req.body, userRoleId);
        res.json({ success: true, data: updated, message: 'Склад обновлён' });
    } catch (error) {
        console.error('Ошибка обновления склада:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('не найден')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function deleteStorage(req, res) {
    try {
        const storageId = parseInt(req.params.id);
        const userRoleId = req.user.roleId;
        await storageService.deleteStorage(storageId, userRoleId);
        res.json({ success: true, message: 'Склад удалён' });
    } catch (error) {
        console.error('Ошибка удаления склада:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('не найден')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        if (error.message.includes('невозможно удалить')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

// ----- Работники склада -----
async function getEmployees(req, res) {
    try {
        const storageId = parseInt(req.params.id);
        const userRoleId = req.user.roleId;
        const employees = await storageService.getEmployeesByStorage(storageId, userRoleId);
        res.json({ success: true, data: employees });
    } catch (error) {
        console.error('Ошибка получения работников:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('не найден')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function addEmployee(req, res) {
    try {
        const storageId = parseInt(req.params.id);
        const userRoleId = req.user.roleId;
        const result = await storageService.addEmployee(storageId, req.body, userRoleId);
        res.status(201).json({ success: true, data: result, message: 'Работник назначен' });
    } catch (error) {
        console.error('Ошибка назначения работника:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('не найден')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        if (error.message.includes('уже работает') || error.message.includes('не может быть')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function removeEmployee(req, res) {
    try {
        const storageId = parseInt(req.params.id);
        const userId = parseInt(req.params.userId);
        const userRoleId = req.user.roleId;
        await storageService.removeEmployee(storageId, userId, userRoleId);
        res.json({ success: true, message: 'Работник уволен' });
    } catch (error) {
        console.error('Ошибка увольнения работника:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('не найден')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

module.exports = {
    getAllStorages,
    getStorageById,
    createStorage,
    updateStorage,
    deleteStorage,
    getEmployees,
    addEmployee,
    removeEmployee
};