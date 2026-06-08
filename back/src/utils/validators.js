const { body, param, query } = require('express-validator');

// Валидаторы для аутентификации
const loginValidator = [
    body('username')
        .trim()
        .notEmpty().withMessage('Имя пользователя обязательно')
        .isLength({ min: 2, max: 16 }).withMessage('Имя пользователя должно быть от 2 до 16 символов'),
    
    body('password')
        .notEmpty().withMessage('Пароль обязателен')
        .isLength({ min: 1, max: 64 }).withMessage('Пароль должен быть от 1 до 64 символов')
];

// Валидаторы для удобрений
const fertilizerValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Название удобрения обязательно')
        .isLength({ min: 1, max: 256 }).withMessage('Название должно быть от 1 до 256 символов'),
    
    body('weight')
        .isInt({ min: 1 }).withMessage('Вес должен быть положительным числом'),
    
    body('containerId')
        .isInt({ min: 1 }).withMessage('ID тары должен быть положительным числом')
];

// Валидаторы для тары
const containerValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Название тары обязательно')
        .isLength({ min: 1, max: 128 }).withMessage('Название должно быть от 1 до 128 символов'),
    
    body('weight')
        .isFloat({ min: 0 }).withMessage('Вес должен быть положительным числом'),
    
    body('width')
        .isFloat({ min: 0 }).withMessage('Ширина должна быть положительным числом'),
    
    body('height')
        .isFloat({ min: 0 }).withMessage('Высота должна быть положительным числом')
];

// Валидатор для ID в параметрах
const idValidator = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID должен быть положительным числом')
];

module.exports = {
    loginValidator,
    fertilizerValidator,
    containerValidator,
    idValidator
};