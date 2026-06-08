// src/controllers/userController.js
const userService = require('../services/userService');

async function getUsers(req, res) {
    try {
        const { roleId, search } = req.query;
        const users = await userService.getAllUsers({ roleId, search });
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Ошибка получения пользователей:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function getUserById(req, res) {
    try {
        const userId = parseInt(req.params.id);
        const user = await userService.getUserById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'Пользователь не найден' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Ошибка получения пользователя:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function createUser(req, res) {
    try {
        const newUser = await userService.createUser(req.body);
        res.status(201).json({ success: true, data: newUser, message: 'Пользователь создан' });
    } catch (error) {
        console.error('Ошибка создания пользователя:', error);
        if (error.message.includes('уже существует')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function updateUser(req, res) {
    try {
        const userId = parseInt(req.params.id);
        const updated = await userService.updateUser(userId, req.body);
        res.json({ success: true, data: updated, message: 'Пользователь обновлён' });
    } catch (error) {
        console.error('Ошибка обновления пользователя:', error);
        if (error.message.includes('уже существует')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

async function deleteUser(req, res) {
    try {
        const userId = parseInt(req.params.id);
        await userService.deleteUser(userId);
        res.json({ success: true, message: 'Пользователь удалён' });
    } catch (error) {
        console.error('Ошибка удаления пользователя:', error);
        if (error.message.includes('Невозможно удалить')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};