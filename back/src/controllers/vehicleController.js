const vehicleService = require('../services/vehicleService');

async function getVehicles(req, res) {
    try {
        const partnerId = parseInt(req.params.partnerId);
        const userId = req.user.id;
        const userRoleId = req.user.roleId;
        const userPartnerId = req.user.partnerId;
        const vehicles = await vehicleService.getVehiclesByPartner(partnerId, userId, userRoleId, userPartnerId);
        res.json({ success: true, data: vehicles });
    } catch (error) {
        console.error('Ошибка получения ТС:', error);
        if (error.message.includes('Недостаточно прав') || error.message.includes('Нет доступа')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function getVehicleById(req, res) {
    try {
        const partnerId = parseInt(req.params.partnerId);
        const vehicleId = parseInt(req.params.id);
        const userId = req.user.id;
        const userRoleId = req.user.roleId;
        const userPartnerId = req.user.partnerId;
        const vehicle = await vehicleService.getVehicleById(partnerId, vehicleId, userId, userRoleId, userPartnerId);
        if (!vehicle) {
            return res.status(404).json({ success: false, error: 'ТС не найдено' });
        }
        res.json({ success: true, data: vehicle });
    } catch (error) {
        console.error('Ошибка получения ТС:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function createVehicle(req, res) {
    try {
        const partnerId = parseInt(req.params.partnerId);
        const userRoleId = req.user.roleId;
        const newVehicle = await vehicleService.createVehicle(partnerId, req.body, userRoleId);
        res.status(201).json({ success: true, data: newVehicle, message: 'ТС добавлено' });
    } catch (error) {
        console.error('Ошибка создания ТС:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('Необходимо указать') || error.message.includes('Тип ТС')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function updateVehicle(req, res) {
    try {
        const partnerId = parseInt(req.params.partnerId);
        const vehicleId = parseInt(req.params.id);
        const userRoleId = req.user.roleId;
        const updated = await vehicleService.updateVehicle(partnerId, vehicleId, req.body, userRoleId);
        res.json({ success: true, data: updated, message: 'ТС обновлено' });
    } catch (error) {
        console.error('Ошибка обновления ТС:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('не найдено')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function deleteVehicle(req, res) {
    try {
        const partnerId = parseInt(req.params.partnerId);
        const vehicleId = parseInt(req.params.id);
        const userRoleId = req.user.roleId;
        await vehicleService.deleteVehicle(partnerId, vehicleId, userRoleId);
        res.json({ success: true, message: 'ТС удалено' });
    } catch (error) {
        console.error('Ошибка удаления ТС:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('не найдено')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        if (error.message.includes('используется')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

module.exports = {
    getVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle
};