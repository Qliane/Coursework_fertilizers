const db = require('../config/database');
const stockQueries = require('../db/queries/stock-queries');
const { ROLES } = require('../utils/constants');

async function getCurrentStock(userId, userRoleId, userStorageId, asOfDate = null) {
    if (![ROLES.STOREKEEPER, ROLES.DIRECTOR].includes(userRoleId)) return [];
    if (!userStorageId) return [];

    console.log("ADSDFSDFSDF", userStorageId, asOfDate)

    const result = await db.query(
        'SELECT * FROM get_current_stock($1, $2)',
        [userStorageId, asOfDate || null]
    );
    return result.rows;
}

async function getStockHistory(userId, userRoleId, filters = {}) {
    try {
        console.log('DEBUG: getStockHistory called with:', { userId, userRoleId, filters });
        
        let historyQuery;
        let queryParams = [];

       
        if (userRoleId == ROLES.STOREKEEPER && filters.storageId) {
            historyQuery = stockQueries.GET_STOCK_HISTORY_BY_STORAGE;
            queryParams = [
                filters.storageId,
                filters.startDate || null,
                filters.endDate || null,
                filters.fertilizerId || null
            ];
        } else if (userRoleId == ROLES.DIRECTOR) {
            historyQuery = stockQueries.GET_STOCK_HISTORY_ALL;
            queryParams = [
                filters.storageId || null,
                filters.startDate || null,
                filters.endDate || null,
                filters.fertilizerId || null
            ];
        } else {
            console.log('DEBUG: No access for role:', userRoleId);
            return [];
        }

        console.log('DEBUG: Executing history query:', historyQuery);
        console.log('DEBUG: Query params:', queryParams);

        const result = await db.query(historyQuery, queryParams);
        
        console.log('DEBUG: History query result rows count:', result.rows.length);
        
        return result.rows.map(row => ({
            date: row.date,
            fertilizerId: row.fertilizerid,
            fertilizerName: row.fertilizername,
            operationType: row.operationtype,
            quantity: parseInt(row.quantity),
            documentType: row.documenttype,
            documentId: row.documentid,
            storageId: row.storageid,
            storageName: row.storagename
        }));
    } catch (error) {
        console.error('Ошибка в сервисе получения истории склада:', error);
        throw error;
    }
}

module.exports = {
    getCurrentStock,
    getStockHistory
};