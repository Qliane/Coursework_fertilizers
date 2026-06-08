const db = require('../config/database');
const containerQueries = require('../db/queries/container-queries');

async function getAllContainers() {
    try {
        console.log('DEBUG: Getting all containers');
        
        const result = await db.query(containerQueries.GET_ALL_CONTAINERS);
        
        return result.rows.map(row => ({
            id: row.id,
            name: row.name,
            weight: parseFloat(row.weight),
            width: parseFloat(row.width),
            height: parseFloat(row.height)
        }));
    } catch (error) {
        console.error('Ошибка в сервисе получения тары:', error);
        throw error;
    }
}

async function getContainerById(containerId) {
    try {
        console.log('DEBUG: Getting container by ID:', containerId);
        
        const result = await db.query(containerQueries.GET_CONTAINER_BY_ID, [containerId]);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        const row = result.rows[0];
        
        return {
            id: row.id,
            name: row.name,
            weight: parseFloat(row.weight),
            width: parseFloat(row.width),
            height: parseFloat(row.height)
        };
    } catch (error) {
        console.error('Ошибка в сервисе получения тары по ID:', error);
        throw error;
    }
}

async function createContainer(containerData) {
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('DEBUG: Creating container with data:', containerData);
        
        const nameCheck = await client.query(
            'SELECT CO_ID FROM Container WHERE TRIM(CO_NAME) = TRIM($1)',
            [containerData.name]
        );
        
        if (nameCheck.rows.length > 0) {
            throw new Error(`Тара с названием "${containerData.name}" уже существует`);
        }
        
        const result = await client.query(
            `INSERT INTO Container (CO_NAME, CO_WEIGHT, CO_WIDTH, CO_HEIGHT) 
             VALUES ($1, $2, $3, $4) 
             RETURNING CO_ID`,
            [
                containerData.name.trim(),
                containerData.weight,
                containerData.width,
                containerData.height
            ]
        );
        
        const containerId = result.rows[0].co_id;
        
        const containerResult = await client.query(containerQueries.GET_CONTAINER_BY_ID, [containerId]);
        
        await client.query('COMMIT');
        
        const row = containerResult.rows[0];
        
        return {
            id: row.id,
            name: row.name,
            weight: parseFloat(row.weight),
            width: parseFloat(row.width),
            height: parseFloat(row.height)
        };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка в сервисе создания тары:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function updateContainer(containerId, updateData) {
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('DEBUG: Updating container:', { containerId, updateData });
        
        const containerCheck = await client.query(
            'SELECT CO_ID FROM Container WHERE CO_ID = $1',
            [containerId]
        );
        
        if (containerCheck.rows.length === 0) {
            throw new Error('Тара не найдена');
        }
        
        if (updateData.name) {
            const nameCheck = await client.query(
                'SELECT CO_ID FROM Container WHERE TRIM(CO_NAME) = TRIM($1) AND CO_ID != $2',
                [updateData.name, containerId]
            );
            
            if (nameCheck.rows.length > 0) {
                throw new Error(`Тара с названием "${updateData.name}" уже существует`);
            }
        }
        
        const updateFields = [];
        const updateParams = [];
        let paramIndex = 1;
        
        if (updateData.name !== undefined) {
            updateFields.push(`CO_NAME = $${paramIndex}`);
            updateParams.push(updateData.name.trim());
            paramIndex++;
        }
        
        if (updateData.weight !== undefined) {
            updateFields.push(`CO_WEIGHT = $${paramIndex}`);
            updateParams.push(updateData.weight);
            paramIndex++;
        }
        
        if (updateData.width !== undefined) {
            updateFields.push(`CO_WIDTH = $${paramIndex}`);
            updateParams.push(updateData.width);
            paramIndex++;
        }
        
        if (updateData.height !== undefined) {
            updateFields.push(`CO_HEIGHT = $${paramIndex}`);
            updateParams.push(updateData.height);
            paramIndex++;
        }
        
        if (updateFields.length === 0) {
            throw new Error('Нет данных для обновления');
        }
        
        updateParams.push(containerId);
        
        const updateQuery = `
            UPDATE Container 
            SET ${updateFields.join(', ')} 
            WHERE CO_ID = $${paramIndex}
        `;
        
        await client.query(updateQuery, updateParams);
        
        const containerResult = await client.query(containerQueries.GET_CONTAINER_BY_ID, [containerId]);
        
        await client.query('COMMIT');
        
        const row = containerResult.rows[0];
        
        return {
            id: row.id,
            name: row.name,
            weight: parseFloat(row.weight),
            width: parseFloat(row.width),
            height: parseFloat(row.height)
        };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка в сервисе обновления тары:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function deleteContainer(containerId) {
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('DEBUG: Deleting container:', containerId);
        
        const containerCheck = await client.query(
            'SELECT CO_ID FROM Container WHERE CO_ID = $1',
            [containerId]
        );
        
        if (containerCheck.rows.length === 0) {
            throw new Error('Тара не найдена');
        }
        
        const usageCheck = await client.query(
            'SELECT FERTIL_ID FROM FERTILIZER WHERE CO_ID = $1 LIMIT 1',
            [containerId]
        );
        
        if (usageCheck.rows.length > 0) {
            throw new Error('Невозможно удалить тару, так как она используется в удобрениях');
        }
        
        await client.query(
            'DELETE FROM Container WHERE CO_ID = $1',
            [containerId]
        );
        
        await client.query('COMMIT');
        
        return { success: true };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка в сервисе удаления тары:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    getAllContainers,
    getContainerById,
    createContainer,
    updateContainer,
    deleteContainer
};