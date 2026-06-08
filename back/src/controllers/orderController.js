const orderService = require('../services/orderService');

async function getOrders(req, res) {
    try {
        
        const userId = req.user.id;
        const userRoleId = req.user.roleId;
        const userStorageId = req.user.storageId;
        
        const filters = {
            status: req.query.status,
            storageId: req.query.storageId ? parseInt(req.query.storageId) : null,
            startDate: req.query.startDate || null,
            endDate: req.query.endDate || null,
            creatorId: req.query.creatorId ? parseInt(req.query.creatorId) : null,
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 20
        };

        const orders = await orderService.getOrders(userId, userRoleId, userStorageId, filters);
        
        res.json({
            success: true,
            data: orders.orders,
            pagination: {
                page: orders.page,
                limit: orders.limit,
                total: orders.total,
                totalPages: orders.totalPages
            }
        });
    } catch (error) {
        console.error('Ошибка при получении списка ордеров:', error);
        res.status(500).json({ 
            success: false,
            error: 'Ошибка сервера при получении списка ордеров',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

async function getOrderById(req, res) {
    try {
        const orderId = parseInt(req.params.id);
        const userId = req.user.id;
        const userRoleId = req.user.roleId;
        const userStorageId = req.user.storageId;

        const order = await orderService.getOrderById(orderId, userId, userRoleId, userStorageId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Ордер не найден'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Ошибка при получении ордера:', error);
        res.status(500).json({ 
            success: false,
            error: 'Ошибка сервера при получении ордера',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

async function createOrder(req, res) {
    try {
        const userId = req.user.id;
        const userRoleId = req.user.roleId;
        
        const orderData = {
            storageId: req.body.storageId,
            fertilizers: req.body.fertilizers,
            createdBy: userId
        };

        const newOrder = await orderService.createOrder(orderData, userId, userRoleId);
        
        res.status(201).json({
            success: true,
            data: newOrder,
            message: 'Ордер успешно создан'
        });
    } catch (error) {
        console.error('Ошибка при создании ордера:', error);
        res.status(500).json({ 
            success: false,
            error: 'Ошибка сервера при создании ордера',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

async function receiveOrder(req, res) {
    try {
        const orderId = parseInt(req.params.id);
        const userId = req.user.id;
        const userRoleId = req.user.roleId;
        const userStorageId = req.user.storageId;
        
        const factCounts = req.body;

        const updatedOrder = await orderService.receiveOrder(orderId, factCounts, userId, userRoleId, userStorageId);
        
        res.json({
            success: true,
            data: updatedOrder,
            message: 'Приёмка успешно проведена'
        });
    } catch (error) {
        console.error('Ошибка при проведении приёмки:', error);
        
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({
                success: false,
                error: error.message
            });
        }
        
        if (error.message.includes('не найден') || error.message.includes('уже проведен')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: 'Ошибка сервера при проведении приёмки',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

async function updateOrder(req, res) {
    try {
        const orderId = parseInt(req.params.id);
        const userId = req.user.id;
        const userRoleId = req.user.roleId;
        
        const updateData = {
            storageId: req.body.storageId,
            fertilizers: req.body.fertilizers
        };

        const updatedOrder = await orderService.updateOrder(orderId, updateData, userId, userRoleId);
        
        res.json({
            success: true,
            data: updatedOrder,
            message: 'Ордер успешно обновлен'
        });
    } catch (error) {
        console.error('Ошибка при обновлении ордера:', error);
        
        if (error.message.includes('Недостаточно прав') || error.message.includes('уже проведен')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: 'Ошибка сервера при обновлении ордера',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

async function deleteOrder(req, res) {
    try {
        const orderId = parseInt(req.params.id);
        const userId = req.user.id;
        const userRoleId = req.user.roleId;

        await orderService.deleteOrder(orderId, userId, userRoleId);
        
        res.json({
            success: true,
            message: 'Ордер успешно удален'
        });
    } catch (error) {
        console.error('Ошибка при удалении ордера:', error);
        
        if (error.message.includes('Недостаточно прав') || error.message.includes('уже проведен')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: 'Ошибка сервера при удалении ордера',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

module.exports = {
    getOrders,
    getOrderById,
    createOrder,
    receiveOrder,
    updateOrder,
    deleteOrder
};