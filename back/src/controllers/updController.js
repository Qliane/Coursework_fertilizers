const updService = require('../services/updService');

async function getUpdList(req, res) {
    try {
        const userId = req.user.id;
        const userRoleId = req.user.roleId;
        const userStorageId = req.user.storageId;

        const filters = {
            storageId: req.query.storageId ? parseInt(req.query.storageId) : null,
            partnerId: req.query.partnerId ? parseInt(req.query.partnerId) : null,
            dateFrom: req.query.dateFrom || null,
            dateTo: req.query.dateTo || null,
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 20
        };

        const result = await updService.getUpdList(userId, userRoleId, userStorageId, filters);
        res.json({
            success: true,
            data: result.updList,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages
            }
        });
    } catch (error) {
        console.error('Ошибка получения списка УПД:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function getUpdById(req, res) {
    try {
        const updId = parseInt(req.params.id);
        const userId = req.user.id;
        const userRoleId = req.user.roleId;
        const userStorageId = req.user.storageId;
        const upd = await updService.getUpdById(updId, userId, userRoleId, userStorageId);
        if (!upd) {
            return res.status(404).json({ success: false, error: 'УПД не найден или нет доступа' });
        }
        res.json({ success: true, data: upd });
    } catch (error) {
        console.error('Ошибка получения УПД:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function createUpd(req, res) {
    try {
        const userId = req.user.id;
        const userRoleId = req.user.roleId;
        const newUpd = await updService.createUpd(req.body, userId, userRoleId);
        res.status(201).json({ success: true, data: newUpd, message: 'УПД создан' });
    } catch (error) {
        console.error('Ошибка создания УПД:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('не найден')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function updateUpd(req, res) {
    try {
        const updId = parseInt(req.params.id);
        const userId = req.user.id;
        const userRoleId = req.user.roleId;
        const userStorageId = req.user.storageId;
        const updated = await updService.updateUpd(updId, req.body, userId, userRoleId, userStorageId);
        res.json({ success: true, data: updated, message: 'УПД обновлён' });
    } catch (error) {
        console.error('Ошибка обновления УПД:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('не найден') || error.message.includes('нельзя')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function deleteUpd(req, res) {
    try {
        const updId = parseInt(req.params.id);
        const userId = req.user.id;
        const userRoleId = req.user.roleId;
        const userStorageId = req.user.storageId;
        await updService.deleteUpd(updId, userId, userRoleId, userStorageId);
        res.json({ success: true, message: 'УПД удалён' });
    } catch (error) {
        console.error('Ошибка удаления УПД:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('не найден') || error.message.includes('нельзя')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

module.exports = {
    getUpdList,
    getUpdById,
    createUpd,
    updateUpd,
    deleteUpd
};