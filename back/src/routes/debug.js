const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// GET /api/debug/user
router.get('/user', authenticate, (req, res) => {
    res.json({
        message: 'Информация о пользователе из токена',
        user: req.user,
        headers: req.headers
    });
});

// GET /api/debug/db
router.get('/db', async (req, res) => {
    const db = require('../config/database');
    
    try {
        const users = await db.query('SELECT * FROM "USER"');
        const employees = await db.query('SELECT * FROM EMPLOYER');
        const roles = await db.query('SELECT * FROM ROLE');
        
        res.json({
            users: users.rows,
            employees: employees.rows,
            roles: roles.rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;