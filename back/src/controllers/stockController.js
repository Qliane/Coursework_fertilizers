const stockService = require('../services/stockService');

async function getCurrentStock(req, res) {
    try {
        const userId = req.user.id;
        const userRoleId = req.user.roleId;
        let userStorageId = req.user.storageId;

        if (userRoleId === 3 && req.query.storageId) {
            userStorageId = parseInt(req.query.storageId);
        }

        const asOfDate = req.query.asOfDate ? new Date(req.query.asOfDate) : null;

        const stockData = await stockService.getCurrentStock(userId, userRoleId, userStorageId, asOfDate);
        res.json(stockData);
    } catch (error) {
        console.error('Ошибка при получении состояния склада:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getStockHistory(req, res) {
    try {
        const userId = req.user.id;
        const userRoleId = req.user.roleId;
        const storageId = req.user.storageId;

        const {
            startDate,
            endDate,
            fertilizerId,
            storageId: queryStorageId
        } = req.query;

        let targetStorageId = storageId;
        if (userRoleId === 2 && queryStorageId) {
            targetStorageId = parseInt(queryStorageId);
        }

        const filters = {
            startDate: startDate || null,
            endDate: endDate || null,
            fertilizerId: fertilizerId ? parseInt(fertilizerId) : null,
            storageId: targetStorageId
        };

        const historyData = await stockService.getStockHistory(userId, userRoleId, filters);

        res.json(historyData);
    } catch (error) {
        console.error('Ошибка при получении истории склада:', error);
        res.status(500).json({
            error: 'Ошибка сервера при получении истории склада',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

module.exports = {
    getCurrentStock,
    getStockHistory
};