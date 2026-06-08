const { body, param, query, validationResult } = require('express-validator');

const validateUpdId = [
    param('id').isInt({ min: 1 }).withMessage('ID УПД должен быть положительным числом').toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const validateUpdIdParam = [
    param('updId').isInt({ min: 1 }).withMessage('ID УПД должен быть положительным числом').toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const validateCreateUpd = [
    body('conclDate')
        .isISO8601().withMessage('Дата заключения должна быть в формате YYYY-MM-DD')
        .toDate(),
    body('partnerId')
        .isInt({ min: 1 }).withMessage('ID партнёра должен быть положительным числом')
        .toInt(),
    body('storageId')
        .isInt({ min: 1 }).withMessage('ID склада должен быть положительным числом')
        .toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const validateUpdateUpd = [
    body('conclDate')
        .optional()
        .isISO8601().withMessage('Дата заключения должна быть в формате YYYY-MM-DD')
        .toDate(),
    body('partnerId')
        .optional()
        .isInt({ min: 1 }).withMessage('ID партнёра должен быть положительным числом')
        .toInt(),
    body('storageId')
        .optional()
        .isInt({ min: 1 }).withMessage('ID склада должен быть положительным числом')
        .toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const validateUpdFilters = [
    query('storageId').optional().isInt({ min: 1 }).toInt(),
    query('partnerId').optional().isInt({ min: 1 }).toInt(),
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601(),
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
    validateUpdId,
    validateCreateUpd,
    validateUpdateUpd,
    validateUpdFilters,
    validateUpdIdParam
};