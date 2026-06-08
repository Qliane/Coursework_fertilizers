const authService = require('../services/authService');
const { validationResult } = require('express-validator');

async function login(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;
        
        const result = await authService.login(username, password);
        
        if (!result) {
            return res.status(401).json({ error: 'Неверные учетные данные' });
        }

        res.json(result);
    } catch (error) {
        console.error('Ошибка при аутентификации:', error);
        res.status(500).json({ error: 'Ошибка сервера при аутентификации' });
    }
}

async function logout(req, res) {
    try {
        res.json({ message: 'Выход выполнен успешно' });
    } catch (error) {
        console.error('Ошибка при выходе:', error);
        res.status(500).json({ error: 'Ошибка сервера при выходе' });
    }
}

async function getCurrentUser(req, res) {
    try {
        const user = await authService.getUserById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json(user);
    } catch (error) {
        console.error('Ошибка при получении информации о пользователе:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

module.exports = { login, logout, getCurrentUser };