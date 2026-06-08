const { body, param, validationResult } = require('express-validator');

const validateUpdAndBillId = [
    param('updId').isInt({ min: 1 }).toInt(),
    param('billId').optional().isInt({ min: 1 }).toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const validateCreateBill = [
    param('updId').isInt({ min: 1 }).toInt(),
    body('driverId').isInt({ min: 1 }).withMessage('ID водителя обязателен').toInt(),
    body('vehicleIds').isArray({ min: 1 }).withMessage('Необходимо указать хотя бы одно ТС'),
    body('vehicleIds.*').isInt({ min: 1 }).toInt(),
    body('items').isArray({ min: 1 }).withMessage('Необходимо указать хотя бы одну позицию товара'),
    body('items.*.fertilizerId').isInt({ min: 1 }).toInt(),
    body('items.*.declaredCount').isInt({ min: 1 }).toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const validateUpdateBill = [
    param('updId').isInt({ min: 1 }).toInt(),
    param('billId').isInt({ min: 1 }).toInt(),
    body('driverId').optional().isInt({ min: 1 }).toInt(),
    body('vehicleIds').optional().isArray({ min: 1 }),
    body('vehicleIds.*').optional().isInt({ min: 1 }).toInt(),
    body('items').optional().isArray({ min: 1 }),
    body('items.*.fertilizerId').optional().isInt({ min: 1 }).toInt(),
    body('items.*.declaredCount').optional().isInt({ min: 1 }).toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const validateBillId = [
    param('billId').isInt({ min: 1 }).withMessage('ID накладной должен быть положительным числом').toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateUpdAndBillId,
    validateCreateBill,
    validateUpdateBill,
    validateBillId
};