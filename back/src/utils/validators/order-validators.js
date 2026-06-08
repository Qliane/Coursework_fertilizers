const { body, param, query, validationResult } = require('express-validator');

// Валидатор для ID ордера в параметрах
const validateOrderId = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID ордера должен быть положительным числом')
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

// Валидатор для создания ордера
const validateCreateOrder = [
    body('storageId')
        .isInt({ min: 1 }).withMessage('ID склада должен быть положительным числом')
        .toInt(),
    
    body('fertilizers')
        .isArray({ min: 1 }).withMessage('Необходимо указать хотя бы одно удобрение'),
    
    body('fertilizers.*.fertilizerId')
        .isInt({ min: 1 }).withMessage('ID удобрения должен быть положительным числом')
        .toInt(),
    
    body('fertilizers.*.declaredCount')
        .isInt({ min: 1 }).withMessage('Заявленное количество должно быть положительным числом')
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

// Валидатор для обновления ордера
const validateUpdateOrder = [
    body('storageId')
        .optional()
        .isInt({ min: 1 }).withMessage('ID склада должен быть положительным числом')
        .toInt(),
    
    body('fertilizers')
        .optional()
        .isArray({ min: 1 }).withMessage('Если указаны удобрения, должно быть хотя бы одно'),
    
    body('fertilizers.*.fertilizerId')
        .if(body('fertilizers').exists())
        .isInt({ min: 1 }).withMessage('ID удобрения должен быть положительным числом')
        .toInt(),
    
    body('fertilizers.*.declaredCount')
        .if(body('fertilizers').exists())
        .isInt({ min: 1 }).withMessage('Заявленное количество должно быть положительным числом')
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

// Валидатор для проведения приёмки
const validateReceiveOrder = [
    body()
        .optional()
        .isArray().withMessage('Тело запроса должно быть массивом или пустым'),
    
    body('*.fertilizerId')
        .if(body().isArray())
        .isInt({ min: 1 }).withMessage('ID удобрения должен быть положительным числом')
        .toInt(),
    
    body('*.factCount')
        .if(body().isArray())
        .isInt({ min: 0 }).withMessage('Фактическое количество должно быть неотрицательным числом')
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

// Валидатор для фильтров списка ордеров
const validateOrderFilters = [
    query('status')
        .optional()
        .isIn(['pending', 'completed', 'all']).withMessage('Статус должен быть "pending" или "completed"'),
    
    query('storageId')
        .optional()
        .isInt({ min: 1 }).withMessage('ID склада должен быть положительным числом')
        .toInt(),
    
    query('creatorId')
        .optional()
        .isInt({ min: 1 }).withMessage('ID создателя должен быть положительным числом')
        .toInt(),
    
    query('startDate')
        .optional()
        .isISO8601().withMessage('Дата начала должна быть в формате ISO 8601 (YYYY-MM-DD)'),
    
    query('endDate')
        .optional()
        .isISO8601().withMessage('Дата окончания должна быть в формате ISO 8601 (YYYY-MM-DD)'),
    
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Номер страницы должен быть положительным числом')
        .toInt()
        .default(1),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Лимит должен быть от 1 до 100')
        .toInt()
        .default(20),
    
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
    validateOrderId,
    validateCreateOrder,
    validateUpdateOrder,
    validateReceiveOrder,
    validateOrderFilters
};