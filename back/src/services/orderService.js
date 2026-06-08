const db = require('../config/database');
const orderQueries = require('../db/queries/order-queries');
const { ROLES } = require('../utils/constants');

async function getOrders(userId, userRoleId, userStorageId, filters = {}) {
    try {
        console.log('DEBUG: Getting orders with filters:', { userId, userRoleId, userStorageId, filters });


        let mainQueryParams = [];
        let countQueryParams = [];


        let baseQuery = '';
        let countBaseQuery = '';

        switch (userRoleId) {
            case ROLES.STOREKEEPER:
                baseQuery = `
                    SELECT 
                        o.ORDER_ID as id,
                        o.ORDER_CREATED_AT as createdAt,
                        o.ORDER_REALIZED_AT as realizedAt,
                        s.STOR_ID as storageId,
                        TRIM(s.STOR_FULLNAME) as storageName,
                        u.USER_ID as creatorId,
                        TRIM(u.USER_NAME) || ' ' || TRIM(u.USER_SECONDNAME) as creatorName,
                        fl.FLIST_ID as listId
                    FROM "ORDER" o
                    INNER JOIN STORAGE s ON o.STOR_ID = s.STOR_ID
                    INNER JOIN "USER" u ON o.USER_ID = u.USER_ID
                    INNER JOIN FLIST fl ON o.FLIST_ID = fl.FLIST_ID
                    WHERE o.STOR_ID = $1
                `;
                countBaseQuery = `
                    SELECT COUNT(*) as count
                    FROM "ORDER" o
                    WHERE o.STOR_ID = $1
                `;
                mainQueryParams.push(userStorageId);
                countQueryParams.push(userStorageId);
                break;

            case ROLES.DIRECTOR:
                baseQuery = `
                    SELECT 
                        o.ORDER_ID as id,
                        o.ORDER_CREATED_AT as createdAt,
                        o.ORDER_REALIZED_AT as realizedAt,
                        s.STOR_ID as storageId,
                        TRIM(s.STOR_FULLNAME) as storageName,
                        u.USER_ID as creatorId,
                        TRIM(u.USER_NAME) || ' ' || TRIM(u.USER_SECONDNAME) as creatorName,
                        fl.FLIST_ID as listId
                    FROM "ORDER" o
                    INNER JOIN STORAGE s ON o.STOR_ID = s.STOR_ID
                    INNER JOIN "USER" u ON o.USER_ID = u.USER_ID
                    INNER JOIN FLIST fl ON o.FLIST_ID = fl.FLIST_ID
                `;
                countBaseQuery = `
                    SELECT COUNT(*) as count
                    FROM "ORDER" o
                `;
                break;

            case ROLES.OFFICE_WORKER:
                baseQuery = `
                    SELECT 
                        o.ORDER_ID as id,
                        o.ORDER_CREATED_AT as createdAt,
                        o.ORDER_REALIZED_AT as realizedAt,
                        s.STOR_ID as storageId,
                        TRIM(s.STOR_FULLNAME) as storageName,
                        u.USER_ID as creatorId,
                        TRIM(u.USER_NAME) || ' ' || TRIM(u.USER_SECONDNAME) as creatorName,
                        fl.FLIST_ID as listId
                    FROM "ORDER" o
                    INNER JOIN STORAGE s ON o.STOR_ID = s.STOR_ID
                    INNER JOIN "USER" u ON o.USER_ID = u.USER_ID
                    INNER JOIN FLIST fl ON o.FLIST_ID = fl.FLIST_ID
                    WHERE o.USER_ID = $1
                `;
                countBaseQuery = `
                    SELECT COUNT(*) as count
                    FROM "ORDER" o
                    WHERE o.USER_ID = $1
                `;
                mainQueryParams.push(userId);
                countQueryParams.push(userId);
                break;

            default:
                return {
                    orders: [],
                    total: 0,
                    page: filters.page,
                    limit: filters.limit,
                    totalPages: 0
                };
        }


        const filterConditions = [];


        if (filters.storageId) {
            if (userRoleId === ROLES.STOREKEEPER) {

                if (filters.storageId !== userStorageId) {
                    return {
                        orders: [],
                        total: 0,
                        page: filters.page,
                        limit: filters.limit,
                        totalPages: 0
                    };
                }

            } else {

                filterConditions.push(`o.STOR_ID = $${mainQueryParams.length + 1}`);
                mainQueryParams.push(filters.storageId);
                countQueryParams.push(filters.storageId);
            }
        }


        if (userRoleId === ROLES.DIRECTOR && filters.creatorId) {
            filterConditions.push(`o.USER_ID = $${mainQueryParams.length + 1}`);
            mainQueryParams.push(filters.creatorId);
            countQueryParams.push(filters.creatorId);
        }


        if (filters.status === 'pending') {
            filterConditions.push(`o.ORDER_REALIZED_AT IS NULL`);
        } else if (filters.status === 'completed') {
            filterConditions.push(`o.ORDER_REALIZED_AT IS NOT NULL`);
        }



        if (filters.startDate) {
            filterConditions.push(`o.ORDER_CREATED_AT >= $${mainQueryParams.length + 1}`);
            mainQueryParams.push(filters.startDate);
            countQueryParams.push(filters.startDate);
        }


        if (filters.endDate) {
            filterConditions.push(`o.ORDER_CREATED_AT <= $${mainQueryParams.length + 1}`);
            mainQueryParams.push(filters.endDate);
            countQueryParams.push(filters.endDate);
        }


        if (filters.search && filters.search.trim() !== '') {
            const searchTerm = `%${filters.search.trim()}%`;

            const fertilizerExists = `EXISTS (
                SELECT 1 FROM FLIST_ITEM fi2
                INNER JOIN FERTILIZER f2 ON fi2.FERTIL_ID = f2.FERTIL_ID
                WHERE fi2.FLIST_ID = fl.FLIST_ID AND TRIM(f2.FERTIL_NAME) ILIKE $${mainQueryParams.length + 1}
            )`;
            const searchCondition = `(
                TRIM(s.STOR_FULLNAME) ILIKE $${mainQueryParams.length + 1} OR
                TRIM(u.USER_NAME) || ' ' || TRIM(u.USER_SECONDNAME) ILIKE $${mainQueryParams.length + 1} OR
                ${fertilizerExists}
            )`;
            filterConditions.push(searchCondition);
            mainQueryParams.push(searchTerm);
            countQueryParams.push(searchTerm);
        }


        let mainQuery = baseQuery;
        if (filterConditions.length > 0) {
            const whereClause = mainQuery.includes('WHERE')
                ? ` AND ${filterConditions.join(' AND ')}`
                : ` WHERE ${filterConditions.join(' AND ')}`;
            mainQuery += whereClause;
        }

        let countQuery = countBaseQuery;
        if (filterConditions.length > 0) {
            const whereClause = countQuery.includes('WHERE')
                ? ` AND ${filterConditions.join(' AND ')}`
                : ` WHERE ${filterConditions.join(' AND ')}`;
            countQuery += whereClause;
        }


        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 20;
        const offset = (page - 1) * limit;

        mainQuery += ` ORDER BY o.ORDER_CREATED_AT DESC`;
        mainQuery += ` LIMIT $${mainQueryParams.length + 1}`;
        mainQueryParams.push(limit);
        mainQuery += ` OFFSET $${mainQueryParams.length + 1}`;
        mainQueryParams.push(offset);

        console.log('DEBUG: Final main query:', mainQuery);
        console.log('DEBUG: Main query params:', mainQueryParams);
        console.log('DEBUG: Final count query:', countQuery);
        console.log('DEBUG: Count query params:', countQueryParams);


        const [ordersResult, countResult] = await Promise.all([
            db.query(mainQuery, mainQueryParams),
            db.query(countQuery, countQueryParams)
        ]);


        const ordersWithDetails = await Promise.all(
            ordersResult.rows.map(async (order) => {
                const fertilizers = await getOrderFertilizers(order.listid);
                return {
                    id: order.id,
                    createdAt: order.createdat,
                    realizedAt: order.realizedat,
                    storageId: order.storageid,
                    storageName: order.storagename,
                    creatorId: order.creatorid,
                    creatorName: order.creatorname,
                    fertilizers: fertilizers.map(fert => ({
                        id: fert.id,
                        name: fert.name,
                        declaredCount: fert.declaredcount,
                        factCount: fert.factcount
                    }))
                };
            })
        );

        const total = parseInt(countResult.rows[0].count);

        return {
            orders: ordersWithDetails,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Ошибка в сервисе получения ордеров:', error);
        throw error;
    }
}

async function getOrderById(orderId, userId, userRoleId, userStorageId) {
    try {
        console.log('DEBUG: Getting order by ID:', { orderId, userId, userRoleId, userStorageId });

        let query;
        let queryParams = [orderId];


        switch (userRoleId) {
            case ROLES.STOREKEEPER:
                query = orderQueries.GET_ORDER_BY_ID_STORAGE;
                queryParams.push(userStorageId);
                break;

            case ROLES.DIRECTOR:
                query = orderQueries.GET_ORDER_BY_ID_ALL;
                break;

            case ROLES.OFFICE_WORKER:
                query = orderQueries.GET_ORDER_BY_ID_CREATOR;
                queryParams.push(userId);
                break;

            default:
                return null;
        }

        console.log('DEBUG: Order query:', query);
        console.log('DEBUG: Order query params:', queryParams);

        const result = await db.query(query, queryParams);

        if (result.rows.length === 0) {
            return null;
        }

        const order = result.rows[0];


        const fertilizers = await getOrderFertilizers(order.listid);

        return {
            id: order.id,
            createdAt: order.createdat,
            realizedAt: order.realizedat,
            storageId: order.storageid,
            storageName: order.storagename,
            creatorId: order.creatorid,
            creatorName: order.creatorname,
            fertilizers: fertilizers.map(fert => ({
                id: fert.id,
                name: fert.name,
                declaredCount: fert.declaredcount,
                factCount: fert.factcount
            }))
        };
    } catch (error) {
        console.error('Ошибка в сервисе получения ордера по ID:', error);
        throw error;
    }
}

async function createOrder(orderData, userId, userRoleId) {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        console.log('DEBUG: Creating order with data:', orderData);


        if (![ROLES.OFFICE_WORKER].includes(userRoleId)) {
            throw new Error('Недостаточно прав для создания ордера');
        }


        const items = orderData.fertilizers.map(fert => ({
            fertilizer_id: fert.fertilizerId,
            declared_count: fert.declaredCount
        }));
        const itemsJson = JSON.stringify(items);


        const callResult = await client.query(
            'CALL create_order_with_items($1, $2, $3, NULL)',
            [orderData.storageId, userId, itemsJson]
        );
        const orderId = callResult.rows[0]?.p_order_id;









        const orderInfo = await client.query(orderQueries.GET_ORDER_BY_ID_ALL, [orderId]);
        const fertilizers = await getOrderFertilizersWithClient(client, orderInfo.rows[0]?.flist_id);

        await client.query('COMMIT');

        return {
            id: orderId,
            createdAt: orderInfo.rows[0]?.order_created_at || new Date().toISOString().split('T')[0],
            realizedAt: null,
            storageId: orderData.storageId,
            storageName: orderInfo.rows[0]?.storagename || '',
            creatorId: userId,
            creatorName: orderInfo.rows[0]?.creatorname || '',
            fertilizers: fertilizers.map(fert => ({
                id: fert.id,
                name: fert.name,
                declaredCount: fert.declaredcount,
                factCount: null
            }))
        };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка в сервисе создания ордера (вызов хранимой процедуры):', error);
        throw error;
    } finally {
        client.release();
    }
}

async function receiveOrder(orderId, factCounts, userId, userRoleId, userStorageId) {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        console.log('DEBUG: Receiving order:', { orderId, factCounts, userId, userRoleId, userStorageId });


        const orderCheckQuery = userRoleId === ROLES.DIRECTOR
            ? 'SELECT * FROM "ORDER" WHERE ORDER_ID = $1'
            : 'SELECT * FROM "ORDER" WHERE ORDER_ID = $1 AND STOR_ID = $2';

        const orderCheckParams = userRoleId === ROLES.DIRECTOR
            ? [orderId]
            : [orderId, userStorageId];

        const orderCheckResult = await client.query(orderCheckQuery, orderCheckParams);

        if (orderCheckResult.rows.length === 0) {
            throw new Error('Ордер не найден или у вас нет прав для его проведения');
        }

        const order = orderCheckResult.rows[0];


        if (order.order_realized_at) {
            throw new Error('Ордер уже проведен');
        }


        if (![ROLES.STOREKEEPER, ROLES.DIRECTOR].includes(userRoleId)) {
            throw new Error('Недостаточно прав для проведения приёмки');
        }


        await client.query(
            'UPDATE "ORDER" SET ORDER_REALIZED_AT = CURRENT_DATE WHERE ORDER_ID = $1',
            [orderId]
        );


        if (factCounts && Array.isArray(factCounts) && factCounts.length > 0) {

            for (const item of factCounts) {
                await client.query(
                    `UPDATE FLIST_ITEM 
                     SET FLIST_ITEM_FACT_COUNT = $1 
                     WHERE FLIST_ID = $2 AND FERTIL_ID = $3`,
                    [item.factCount, order.flist_id, item.fertilizerId]
                );
            }
        } else {

            await client.query(
                `UPDATE FLIST_ITEM 
                 SET FLIST_ITEM_FACT_COUNT = FLIST_ITEM_DECL_COUNT 
                 WHERE FLIST_ID = $1`,
                [order.flist_id]
            );
        }


        const updatedOrderResult = await client.query(
            orderQueries.GET_ORDER_BY_ID_ALL,
            [orderId]
        );


        const fertilizers = await getOrderFertilizersWithClient(client, order.flist_id);

        await client.query('COMMIT');

        return {
            id: orderId,
            createdAt: order.order_created_at,
            realizedAt: new Date().toISOString().split('T')[0],
            storageId: order.stor_id,
            storageName: updatedOrderResult.rows[0]?.storagename || '',
            creatorId: order.user_id,
            creatorName: updatedOrderResult.rows[0]?.creatorname || '',
            fertilizers: fertilizers.map(fert => ({
                id: fert.id,
                name: fert.name,
                declaredCount: fert.declaredcount,
                factCount: fert.factcount
            }))
        };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка в сервисе проведения приёмки:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function updateOrder(orderId, updateData, userId, userRoleId) {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        console.log('DEBUG: Updating order:', { orderId, updateData, userId, userRoleId });


        const orderCheckResult = await client.query(
            'SELECT * FROM "ORDER" WHERE ORDER_ID = $1',
            [orderId]
        );

        if (orderCheckResult.rows.length === 0) {
            throw new Error('Ордер не найден');
        }

        const order = orderCheckResult.rows[0];


        if (order.order_realized_at) {
            throw new Error('Невозможно редактировать проведенный ордер');
        }


        if (userRoleId !== ROLES.DIRECTOR && order.user_id !== userId) {
            throw new Error('Недостаточно прав для редактирования этого ордера');
        }


        if (updateData.storageId && updateData.storageId !== order.stor_id) {
            await client.query(
                'UPDATE "ORDER" SET STOR_ID = $1 WHERE ORDER_ID = $2',
                [updateData.storageId, orderId]
            );
        }


        if (updateData.fertilizers && Array.isArray(updateData.fertilizers)) {

            await client.query(
                'DELETE FROM FLIST_ITEM WHERE FLIST_ID = $1',
                [order.flist_id]
            );


            for (const fertilizer of updateData.fertilizers) {
                await client.query(
                    `INSERT INTO FLIST_ITEM (FLIST_ID, FERTIL_ID, FLIST_ITEM_DECL_COUNT) 
                     VALUES ($1, $2, $3)`,
                    [order.flist_id, fertilizer.fertilizerId, fertilizer.declaredCount]
                );
            }
        }


        const updatedOrderResult = await client.query(
            orderQueries.GET_ORDER_BY_ID_ALL,
            [orderId]
        );


        const fertilizers = await getOrderFertilizersWithClient(client, order.flist_id);

        await client.query('COMMIT');

        return {
            id: orderId,
            createdAt: order.order_created_at,
            realizedAt: order.order_realized_at,
            storageId: updateData.storageId || order.stor_id,
            storageName: updatedOrderResult.rows[0]?.storagename || '',
            creatorId: order.user_id,
            creatorName: updatedOrderResult.rows[0]?.creatorname || '',
            fertilizers: fertilizers.map(fert => ({
                id: fert.id,
                name: fert.name,
                declaredCount: fert.declaredcount,
                factCount: fert.factcount
            }))
        };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка в сервисе обновления ордера:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function deleteOrder(orderId, userId, userRoleId) {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        console.log('DEBUG: Deleting order:', { orderId, userId, userRoleId });


        const orderCheckResult = await client.query(
            'SELECT * FROM "ORDER" WHERE ORDER_ID = $1',
            [orderId]
        );

        if (orderCheckResult.rows.length === 0) {
            throw new Error('Ордер не найден');
        }

        const order = orderCheckResult.rows[0];


        if (order.order_realized_at) {
            throw new Error('Невозможно удалить проведенный ордер');
        }


        if (userRoleId !== ROLES.DIRECTOR && order.user_id !== userId) {
            throw new Error('Недостаточно прав для удаления этого ордера');
        }


        await client.query(
            'DELETE FROM FLIST_ITEM WHERE FLIST_ID = $1',
            [order.flist_id]
        );


        await client.query(
            'DELETE FROM FLIST WHERE FLIST_ID = $1',
            [order.flist_id]
        );


        await client.query(
            'DELETE FROM "ORDER" WHERE ORDER_ID = $1',
            [orderId]
        );

        await client.query('COMMIT');

        return { success: true };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка в сервисе удаления ордера:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Вспомогательные функции
async function getOrderFertilizers(flistId) {
    try {
        const result = await db.query(orderQueries.GET_ORDER_FERTILIZERS, [flistId]);
        return result.rows;
    } catch (error) {
        console.error('Ошибка при получении удобрений ордера:', error);
        return [];
    }
}

async function getOrderFertilizersWithClient(client, flistId) {
    try {
        const result = await client.query(orderQueries.GET_ORDER_FERTILIZERS, [flistId]);
        return result.rows;
    } catch (error) {
        console.error('Ошибка при получении удобрений ордера (with client):', error);
        return [];
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