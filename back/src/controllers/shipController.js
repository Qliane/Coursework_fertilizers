const shipService = require('../services/shipService');

async function shipUpd(req, res) {
    try {
        const updId = parseInt(req.params.updId);
        const userId = req.user.id;
        const userRoleId = req.user.roleId;
        const userStorageId = req.user.storageId;
        const result = await shipService.shipUpd(updId, userId, userRoleId, userStorageId);
        res.json({
            success: true,
            data: result,
            message: 'Отгрузка успешно выполнена'
        });
    } catch (error) {
        console.error('Ошибка при отгрузке:', error);
        if (error.message.includes('Недостаточно прав')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('не найден') || error.message.includes('Нельзя') || error.message.includes('Недостаточно')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера при отгрузке' });
    }
}

module.exports = {
    shipUpd
};