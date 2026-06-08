const { body, param, validationResult } = require('express-validator');

// Валидация параметров партнёра и ID водителя
const validateDriverParams = [
    param('partnerId').isInt({ min: 1 }).withMessage('ID партнёра должен быть положительным числом').toInt(),
    param('id').optional().isInt({ min: 1 }).withMessage('ID водителя (user_id) должен быть положительным числом').toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const validateCreateDriver = [
    param('partnerId').isInt({ min: 1 }).toInt(),
    body('userId')
        .isInt({ min: 1 }).withMessage('ID пользователя (водителя) обязателен и должен быть положительным числом')
        .toInt(),
    body('license')
        .trim()
        .notEmpty().withMessage('Номер водительского удостоверения обязателен')
        .isLength({ max: 32 }).withMessage('Номер удостоверения не более 32 символов'),
    body('categories')
        .optional()
        .isNumeric().withMessage('Категории должны быть числом (битовая маска)')
        .toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const validateUpdateDriver = [
    param('partnerId').isInt({ min: 1 }).toInt(),
    param('id').isInt({ min: 1 }).toInt(),
    body('license')
        .optional()
        .trim()
        .notEmpty().withMessage('Номер удостоверения не может быть пустым')
        .isLength({ max: 32 }),
    body('categories')
        .optional()
        .isNumeric().withMessage('Категории должны быть числом')
        .toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateDriverParams,
    validateCreateDriver,
    validateUpdateDriver
};