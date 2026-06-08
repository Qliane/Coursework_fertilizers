const { body, param, validationResult } = require('express-validator');

// Валидатор для ID удобрения в параметрах
const validateFertilizerId = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID удобрения должен быть положительным числом')
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

// Валидатор для создания удобрения
const validateCreateFertilizer = [
    body('name')
        .trim()
        .notEmpty().withMessage('Название удобрения обязательно')
        .isLength({ min: 1, max: 256 }).withMessage('Название должно быть от 1 до 256 символов'),
    
    body('weight')
        .isInt({ min: 1 }).withMessage('Вес должен быть положительным числом')
        .toInt(),
    
    body('containerId')
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

// Валидатор для обновления удобрения
const validateUpdateFertilizer = [
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('Название удобрения не может быть пустым')
        .isLength({ min: 1, max: 256 }).withMessage('Название должно быть от 1 до 256 символов'),
    
    body('weight')
        .optional()
        .isInt({ min: 1 }).withMessage('Вес должен быть положительным числом')
        .toInt(),
    
    body('containerId')
        .optional()
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

module.exports = {
    validateFertilizerId,
    validateCreateFertilizer,
    validateUpdateFertilizer
};