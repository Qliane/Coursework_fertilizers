const electronicBillService = require('../services/electronicBillService');

async function signElectronicBill(req, res) {
    try {
        const billId = parseInt(req.params.billId);
        const userId = req.user.id;
        const userRoleId = req.user.roleId;
        const userPartnerId = req.user.partnerId;
        console.log(billId);
        const result = await electronicBillService.signElectronicBill(billId, userId, userRoleId, userPartnerId);
        res.json({ success: true, data: result, message: 'ЭТрН подписана' });
    } catch (error) {
        console.error('Ошибка подписания ЭТрН:', error);
        if (error.message.includes('Недостаточно прав') || error.message.includes('Нет доступа')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('не найдена') || error.message.includes('Невозможно')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function acceptElectronicBill(req, res) {
    try {
        const billId = parseInt(req.params.billId);
        const userRoleId = req.user.roleId;
        const result = await electronicBillService.acceptElectronicBill(billId, userRoleId);
        res.json({ success: true, data: result, message: 'ЭТрН принята' });
    } catch (error) {
        console.error('Ошибка принятия ЭТрН:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('не найдена') || error.message.includes('Невозможно')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

module.exports = {
    signElectronicBill,
    acceptElectronicBill
};