const driverService = require('../services/driverService');

async function getDrivers(req, res) {
    try {
        const partnerId = parseInt(req.params.partnerId);
        const userRoleId = req.user.roleId;
        const drivers = await driverService.getDriversByPartner(partnerId, userRoleId);
        res.json({ success: true, data: drivers });
    } catch (error) {
        console.error('Ошибка при получении списка водителей:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function getDriverById(req, res) {
    try {
        const partnerId = parseInt(req.params.partnerId);
        const driverUserId = parseInt(req.params.id);
        const userRoleId = req.user.roleId;
        const driver = await driverService.getDriverById(partnerId, driverUserId, userRoleId);
        if (!driver) {
            return res.status(404).json({ success: false, error: 'Водитель не найден' });
        }
        res.json({ success: true, data: driver });
    } catch (error) {
        console.error('Ошибка при получении водителя:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function createDriver(req, res) {
    try {
        const partnerId = parseInt(req.params.partnerId);
        const userRoleId = req.user.roleId;
        const newDriver = await driverService.createDriver(partnerId, req.body, userRoleId);
        res.status(201).json({ success: true, data: newDriver, message: 'Водитель добавлен' });
    } catch (error) {
        console.error('Ошибка при создании водителя:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('не найден') || error.message.includes('уже связан')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function updateDriver(req, res) {
    try {
        const partnerId = parseInt(req.params.partnerId);
        const driverUserId = parseInt(req.params.id);
        const userRoleId = req.user.roleId;
        const updated = await driverService.updateDriver(partnerId, driverUserId, req.body, userRoleId);
        res.json({ success: true, data: updated, message: 'Водитель обновлён' });
    } catch (error) {
        console.error('Ошибка при обновлении водителя:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('не найден')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function deleteDriver(req, res) {
    try {
        const partnerId = parseInt(req.params.partnerId);
        const driverUserId = parseInt(req.params.id);
        const userRoleId = req.user.roleId;
        await driverService.deleteDriver(partnerId, driverUserId, userRoleId);
        res.json({ success: true, message: 'Водитель удалён' });
    } catch (error) {
        console.error('Ошибка при удалении водителя:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('не найден')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        if (error.message.includes('Невозможно удалить')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function getDriverUpds(req, res) {
    try {
        const driverUserId = req.user.id;
        const { ebStatus, dateFrom, dateTo } = req.query;
        
        let ebStatusFilter = null;
        if (ebStatus) {
            const statusMap = {
                'pending': 0,     
                'transferred': 1, 
                'accepted': 3     
            };
            ebStatusFilter = statusMap[ebStatus];
            if (ebStatusFilter === undefined) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Недопустимое значение ebStatus. Допустимо: pending, transferred, accepted' 
                });
            }
        }

        const result = await driverService.getUpdsForDriver(
            driverUserId, 
            ebStatusFilter, 
            dateFrom, 
            dateTo
        );
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Ошибка получения УПД для водителя:', error);
        if (error.message === 'Водитель не зарегистрирован в системе') {
            return res.status(404).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

module.exports = {
    getDrivers,
    getDriverById,
    createDriver,
    updateDriver,
    deleteDriver,
    getDriverUpds
};