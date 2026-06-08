const partnerService = require('../services/partnerService');

async function getPartners(req, res) {
    try {
        const userRoleId = req.user.roleId;
        const filters = {
            search: req.query.search,
            inn: req.query.inn,
            fullName: req.query.fullName,
            page: req.query.page,
            limit: req.query.limit
        };

        const result = await partnerService.getPartners(userRoleId, filters);
        res.json({
            success: true,
            data: result.partners,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages
            }
        });
    } catch (error) {
        console.error('Ошибка при получении списка партнёров:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка сервера при получении списка партнёров'
        });
    }
}

async function getPartnerById(req, res) {
    try {
        const partnerId = parseInt(req.params.id);
        const partner = await partnerService.getPartnerById(partnerId);
        if (!partner) {
            return res.status(404).json({ success: false, error: 'Партнёр не найден' });
        }
        res.json({ success: true, data: partner });
    } catch (error) {
        console.error('Ошибка при получении партнёра:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function createPartner(req, res) {
    try {
        const userRoleId = req.user.roleId;
        const newPartner = await partnerService.createPartner(req.body, userRoleId);
        res.status(201).json({ success: true, data: newPartner, message: 'Партнёр и пользователь успешно созданы' });
    } catch (error) {
        console.error('Ошибка при создании партнёра:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('уже существует')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера при создании партнёра' });
    }
}

async function updatePartner(req, res) {
    try {
        const partnerId = parseInt(req.params.id);
        const userRoleId = req.user.roleId;
        const updated = await partnerService.updatePartner(partnerId, req.body, null, userRoleId);
        res.json({ success: true, data: updated, message: 'Партнёр обновлён' });
    } catch (error) {
        console.error('Ошибка при обновлении партнёра:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('не найден')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера при обновлении партнёра' });
    }
}

async function deletePartner(req, res) {
    try {
        const partnerId = parseInt(req.params.id);
        const userRoleId = req.user.roleId;
        await partnerService.deletePartner(partnerId, userRoleId);
        res.json({ success: true, message: 'Партнёр успешно удалён' });
    } catch (error) {
        console.error('Ошибка при удалении партнёра:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('не найден')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        if (error.message.includes('связанные записи')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера при удалении партнёра' });
    }
}

module.exports = {
    getPartners,
    getPartnerById,
    createPartner,
    updatePartner,
    deletePartner
};