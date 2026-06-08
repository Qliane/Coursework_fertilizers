const { body, param, query, validationResult } = require('express-validator');

const validatePartnerId = [
    param('id').isInt({ min: 1 }).withMessage('ID партнёра должен быть положительным числом').toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const validateCreatePartner = [
    // Данные партнёра
    body('inn')
        .trim()
        .notEmpty().withMessage('ИНН обязателен')
        .isLength({ min: 10, max: 12 }).withMessage('ИНН должен содержать 10 или 12 цифр'),
    body('fullName')
        .trim()
        .notEmpty().withMessage('Полное наименование обязательно')
        .isLength({ max: 256 }).withMessage('Наименование не более 256 символов'),
    body('phone')
        .optional()
        .isLength({ max: 16 }).withMessage('Телефон не более 16 символов'),
    body('factAddress')
        .optional()
        .isLength({ max: 256 }).withMessage('Адрес не более 256 символов'),
    body('postAddress')
        .trim()
        .notEmpty().withMessage('Юридический адрес обязателен')
        .isLength({ max: 256 }).withMessage('Адрес не более 256 символов'),
    
    // Опциональный ID существующего пользователя
    body('userId')
        .optional()
        .isInt({ min: 1 }).withMessage('ID пользователя должен быть положительным числом')
        .toInt(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const validateUpdatePartner = [
    body('inn')
        .optional()
        .trim()
        .isLength({ min: 10, max: 12 }).withMessage('ИНН должен содержать 10 или 12 цифр'),
    body('fullName')
        .optional()
        .trim()
        .isLength({ max: 256 }).withMessage('Наименование не более 256 символов'),
    body('phone')
        .optional()
        .isLength({ max: 16 }).withMessage('Телефон не более 16 символов'),
    body('factAddress')
        .optional()
        .isLength({ max: 256 }),
    body('postAddress')
        .optional()
        .trim()
        .isLength({ max: 256 }),
    body('userId')
        .optional()
        .isInt({ min: 1 }).withMessage('ID пользователя должен быть положительным числом')
        .toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const validatePartnerFilters = [
    query('search').optional().isString().trim(),
    query('inn').optional().isString().trim(),
    query('fullName').optional().isString().trim(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validatePartnerId,
    validateCreatePartner,
    validateUpdatePartner,
    validatePartnerFilters
};