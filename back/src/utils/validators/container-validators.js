const { body, param, validationResult } = require('express-validator');

// Валидатор для ID тары в параметрах
const validateContainerId = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID тары должен быть положительным числом')
        .toInt(),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }
        next();
    }
];

// Валидатор для создания тары
const validateCreateContainer = [
    body('name')
        .trim()
        .notEmpty().withMessage('Название тары обязательно')
        .isLength({ min: 1, max: 128 }).withMessage('Название должно быть от 1 до 128 символов'),
    
    body('weight')
        .isFloat({ min: 0 }).withMessage('Вес должен быть положительным числом')
        .toFloat(),
    
    body('width')
        .isFloat({ min: 0 }).withMessage('Ширина должна быть положительным числом')
        .toFloat(),
    
    body('height')
        .isFloat({ min: 0 }).withMessage('Высота должна быть положительным числом')
        .toFloat(),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }
        next();
    }
];

// Валидатор для обновления тары
const validateUpdateContainer = [
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('Название тары не может быть пустым')
        .isLength({ min: 1, max: 128 }).withMessage('Название должно быть от 1 до 128 символов'),
    
    body('weight')
        .optional()
        .isFloat({ min: 0 }).withMessage('Вес должен быть положительным числом')
        .toFloat(),
    
    body('width')
        .optional()
        .isFloat({ min: 0 }).withMessage('Ширина должна быть положительным числом')
        .toFloat(),
    
    body('height')
        .optional()
        .isFloat({ min: 0 }).withMessage('Высота должна быть положительным числом')
        .toFloat(),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }
        next();
    }
];

module.exports = {
    validateContainerId,
    validateCreateContainer,
    validateUpdateContainer
};