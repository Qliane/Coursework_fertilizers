const { body, param, validationResult } = require('express-validator');

// Валидатор ID склада
const validateStorageId = [
    param('id').isInt({ min: 1 }).withMessage('ID склада должен быть положительным числом').toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

// Валидатор создания/обновления склада
const validateStorage = [
    body('fullName')
        .trim()
        .notEmpty().withMessage('Название склада обязательно')
        .isLength({ max: 256 }).withMessage('Название не более 256 символов'),
    body('address')
        .trim()
        .notEmpty().withMessage('Адрес обязателен')
        .isLength({ max: 512 }).withMessage('Адрес не более 512 символов'),
    body('phone')
        .optional()
        .isLength({ max: 32 }).withMessage('Телефон не более 32 символов'),
    body('capacity')
        .optional()
        .isInt({ min: 0 }).withMessage('Вместительность должна быть неотрицательным числом')
        .toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

// Валидатор обновления склада (все поля опциональны)
const validateStorageUpdate = [
    body('fullName')
        .optional()
        .trim()
        .notEmpty().withMessage('Название не может быть пустым')
        .isLength({ max: 256 }),
    body('address')
        .optional()
        .trim()
        .notEmpty().withMessage('Адрес не может быть пустым')
        .isLength({ max: 512 }),
    body('phone')
        .optional()
        .isLength({ max: 32 }),
    body('capacity')
        .optional()
        .isInt({ min: 0 }).withMessage('Вместительность должна быть неотрицательным числом')
        .toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

// Валидатор добавления работника
const validateAddEmployee = [
    param('id').isInt({ min: 1 }).toInt(),
    body('userId')
        .isInt({ min: 1 }).withMessage('ID пользователя обязателен и должен быть положительным числом')
        .toInt(),
    body('snils')
        .trim()
        .notEmpty().withMessage('СНИЛС обязателен')
        .isLength({ max: 64 }).withMessage('СНИЛС не более 64 символов'),
    body('inn')
        .trim()
        .notEmpty().withMessage('ИНН обязателен')
        .isLength({ min: 10, max: 12 }).withMessage('ИНН должен содержать 10 или 12 цифр'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

// Валидатор удаления работника
const validateRemoveEmployee = [
    param('id').isInt({ min: 1 }).toInt(),
    param('userId').isInt({ min: 1 }).toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateStorageId,
    validateStorage,
    validateStorageUpdate,
    validateAddEmployee,
    validateRemoveEmployee
};