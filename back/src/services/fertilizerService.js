const db = require('../config/database');
const fertilizerQueries = require('../db/queries/fertilizer-queries');

async function getAllFertilizers() {
    try {
        console.log('DEBUG: Getting all fertilizers');
        
        const result = await db.query(fertilizerQueries.GET_ALL_FERTILIZERS);
        
        return result.rows.map(row => ({
            id: row.id,
            name: row.name,
            weight: row.weight,
            containerId: row.containerid,
            containerName: row.containername
        }));
    } catch (error) {
        console.error('Ошибка в сервисе получения удобрений:', error);
        throw error;
    }
}

async function getFertilizerById(fertilizerId) {
    try {
        console.log('DEBUG: Getting fertilizer by ID:', fertilizerId);
        
        const result = await db.query(fertilizerQueries.GET_FERTILIZER_BY_ID, [fertilizerId]);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        const row = result.rows[0];
        
        return {
            id: row.id,
            name: row.name,
            weight: row.weight,
            containerId: row.containerid,
            containerName: row.containername
        };
    } catch (error) {
        console.error('Ошибка в сервисе получения удобрения по ID:', error);
        throw error;
    }
}

async function createFertilizer(fertilizerData) {
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('DEBUG: Creating fertilizer with data:', fertilizerData);
        
       
        const containerCheck = await client.query(
            'SELECT CO_ID FROM Container WHERE CO_ID = $1',
            [fertilizerData.containerId]
        );
        
        if (containerCheck.rows.length === 0) {
            throw new Error('Тара не найдена');
        }
        
       
        const nameCheck = await client.query(
            'SELECT FERTIL_ID FROM FERTILIZER WHERE TRIM(FERTIL_NAME) = TRIM($1)',
            [fertilizerData.name]
        );
        
        if (nameCheck.rows.length > 0) {
            throw new Error(`Удобрение с названием "${fertilizerData.name}" уже существует`);
        }
        
       
        const result = await client.query(
            `INSERT INTO FERTILIZER (FERTIL_NAME, FERTIL_WEIGHT, CO_ID) 
             VALUES ($1, $2, $3) 
             RETURNING FERTIL_ID`,
            [
                fertilizerData.name.trim(),
                fertilizerData.weight,
                fertilizerData.containerId
            ]
        );
        
        const fertilizerId = result.rows[0].fertil_id;
        
       
        const fertilizerResult = await client.query(fertilizerQueries.GET_FERTILIZER_BY_ID, [fertilizerId]);
        
        await client.query('COMMIT');
        
        const row = fertilizerResult.rows[0];
        
        return {
            id: row.id,
            name: row.name,
            weight: row.weight,
            containerId: row.containerid,
            containerName: row.containername
        };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка в сервисе создания удобрения:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function updateFertilizer(fertilizerId, updateData) {
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('DEBUG: Updating fertilizer:', { fertilizerId, updateData });
        
       
        const fertilizerCheck = await client.query(
            'SELECT FERTIL_ID FROM FERTILIZER WHERE FERTIL_ID = $1',
            [fertilizerId]
        );
        
        if (fertilizerCheck.rows.length === 0) {
            throw new Error('Удобрение не найдено');
        }
        
       
        if (updateData.containerId) {
            const containerCheck = await client.query(
                'SELECT CO_ID FROM Container WHERE CO_ID = $1',
                [updateData.containerId]
            );
            
            if (containerCheck.rows.length === 0) {
                throw new Error('Тара не найдена');
            }
        }
        
       
        if (updateData.name) {
            const nameCheck = await client.query(
                'SELECT FERTIL_ID FROM FERTILIZER WHERE TRIM(FERTIL_NAME) = TRIM($1) AND FERTIL_ID != $2',
                [updateData.name, fertilizerId]
            );
            
            if (nameCheck.rows.length > 0) {
                throw new Error(`Удобрение с названием "${updateData.name}" уже существует`);
            }
        }
        
       
        const updateFields = [];
        const updateParams = [];
        let paramIndex = 1;
        
        if (updateData.name !== undefined) {
            updateFields.push(`FERTIL_NAME = $${paramIndex}`);
            updateParams.push(updateData.name.trim());
            paramIndex++;
        }
        
        if (updateData.weight !== undefined) {
            updateFields.push(`FERTIL_WEIGHT = $${paramIndex}`);
            updateParams.push(updateData.weight);
            paramIndex++;
        }
        
        if (updateData.containerId !== undefined) {
            updateFields.push(`CO_ID = $${paramIndex}`);
            updateParams.push(updateData.containerId);
            paramIndex++;
        }
        
        if (updateFields.length === 0) {
            throw new Error('Нет данных для обновления');
        }
        
        updateParams.push(fertilizerId);
        
        const updateQuery = `
            UPDATE FERTILIZER 
            SET ${updateFields.join(', ')} 
            WHERE FERTIL_ID = $${paramIndex}
        `;
        
        await client.query(updateQuery, updateParams);
        
       
        const fertilizerResult = await client.query(fertilizerQueries.GET_FERTILIZER_BY_ID, [fertilizerId]);
        
        await client.query('COMMIT');
        
        const row = fertilizerResult.rows[0];
        
        return {
            id: row.id,
            name: row.name,
            weight: row.weight,
            containerId: row.containerid,
            containerName: row.containername
        };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка в сервисе обновления удобрения:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function deleteFertilizer(fertilizerId) {
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');
        
        console.log('DEBUG: Deleting fertilizer:', fertilizerId);
        
       
        const fertilizerCheck = await client.query(
            'SELECT FERTIL_ID FROM FERTILIZER WHERE FERTIL_ID = $1',
            [fertilizerId]
        );
        
        if (fertilizerCheck.rows.length === 0) {
            throw new Error('Удобрение не найдено');
        }
        
       
        const usageCheck = await client.query(
            'SELECT FLIST_ITEM_ID FROM FLIST_ITEM WHERE FERTIL_ID = $1 LIMIT 1',
            [fertilizerId]
        );
        
        if (usageCheck.rows.length > 0) {
            throw new Error('Невозможно удалить удобрение, так как оно используется в ордерах или накладных');
        }
        
       
        await client.query(
            'DELETE FROM FERTILIZER WHERE FERTIL_ID = $1',
            [fertilizerId]
        );
        
        await client.query('COMMIT');
        
        return { success: true };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка в сервисе удаления удобрения:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    getAllFertilizers,
    getFertilizerById,
    createFertilizer,
    updateFertilizer,
    deleteFertilizer
};