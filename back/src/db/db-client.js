const db = require('../config/database');

class DBClient {
    static async executeQuery(query, params = []) {
        try {
            const result = await db.query(query, params);
            return result;
        } catch (error) {
            console.error('Ошибка выполнения SQL запроса:', error);
            throw error;
        }
    }

    static async executeTransaction(queries) {
        const client = await db.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const results = [];
            for (const query of queries) {
                const result = await client.query(query.text, query.params);
                results.push(result);
            }
            
            await client.query('COMMIT');
            return results;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = DBClient;