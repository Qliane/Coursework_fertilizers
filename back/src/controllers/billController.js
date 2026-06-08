const billService = require('../services/billService');

async function getBills(req, res) {
    try {
        const updId = parseInt(req.params.updId);
        const userId = req.user.id;
        const userRoleId = req.user.roleId;
        const userStorageId = req.user.storageId;
        const bills = await billService.getBillsByUpd(updId, userId, userRoleId, userStorageId);
        res.json({ success: true, data: bills });
    } catch (error) {
        console.error('Ошибка получения списка накладных:', error);
        if (error.message.includes('Недостаточно прав') || error.message.includes('Нет доступа')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('не найден')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function getBillById(req, res) {
    try {
        const updId = parseInt(req.params.updId);
        const billId = parseInt(req.params.billId);
        const userId = req.user.id;
        const userRoleId = req.user.roleId;
        const userStorageId = req.user.storageId;
        const bill = await billService.getBillById(updId, billId, userId, userRoleId, userStorageId);
        if (!bill) {
            return res.status(404).json({ success: false, error: 'Накладная не найдена' });
        }
        res.json({ success: true, data: bill });
    } catch (error) {
        console.error('Ошибка получения накладной:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function createBill(req, res) {
    try {
        const updId = parseInt(req.params.updId);
        const userId = req.user.id;
        const userRoleId = req.user.roleId;
        const userStorageId = req.user.storageId;
        const newBill = await billService.createBill(updId, req.body, userId, userRoleId, userStorageId);
        res.status(201).json({ success: true, data: newBill, message: 'Транспортная накладная создана' });
    } catch (error) {
        console.error('Ошибка создания накладной:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('не найден') || error.message.includes('не принадлежит') || error.message.includes('отгружен')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function updateBill(req, res) {
    try {
        const updId = parseInt(req.params.updId);
        const billId = parseInt(req.params.billId);
        const userId = req.user.id;
        const userRoleId = req.user.roleId;
        const userStorageId = req.user.storageId;
        const updated = await billService.updateBill(updId, billId, req.body, userId, userRoleId, userStorageId);
        res.json({ success: true, data: updated, message: 'Накладная обновлена' });
    } catch (error) {
        console.error('Ошибка обновления накладной:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('не найдена') || error.message.includes('не принадлежит') || error.message.includes('отгрузки')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function deleteBill(req, res) {
    try {
        const updId = parseInt(req.params.updId);
        const billId = parseInt(req.params.billId);
        const userId = req.user.id;
        const userRoleId = req.user.roleId;
        const userStorageId = req.user.storageId;
        await billService.deleteBill(updId, billId, userId, userRoleId, userStorageId);
        res.json({ success: true, message: 'Накладная удалена' });
    } catch (error) {
        console.error('Ошибка удаления накладной:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('не найдена') || error.message.includes('отгрузки')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

module.exports = {
    getBills,
    getBillById,
    createBill,
    updateBill,
    deleteBill
};