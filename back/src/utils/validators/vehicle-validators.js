const { body, param, validationResult } = require('express-validator');

const validateVehicleParams = [
    param('partnerId').isInt({ min: 1 }).toInt(),
    param('id').optional().isInt({ min: 1 }).toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const validateCreateVehicle = [
    param('partnerId').isInt({ min: 1 }).toInt(),
    body('registrationMark')
        .trim()
        .notEmpty().withMessage('Регистрационный номер обязателен')
        .isLength({ max: 64 }).withMessage('Номер не более 64 символов'),
    body('type')
        .isIn(['T', 'R']).withMessage('Тип должен быть T (грузовик) или R (прицеп)'),
    body('capacity')
        .isFloat({ min: 0 }).withMessage('Грузоподъёмность должна быть неотрицательным числом')
        .toFloat(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const validateUpdateVehicle = [
    param('partnerId').isInt({ min: 1 }).toInt(),
    param('id').isInt({ min: 1 }).toInt(),
    body('registrationMark')
        .optional()
        .trim()
        .notEmpty().withMessage('Номер не может быть пустым')
        .isLength({ max: 64 }),
    body('type')
        .optional()
        .isIn(['T', 'R']).withMessage('Тип должен быть T или R'),
    body('capacity')
        .optional()
        .isFloat({ min: 0 }).withMessage('Грузоподъёмность должна быть неотрицательным числом')
        .toFloat(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateVehicleParams,
    validateCreateVehicle,
    validateUpdateVehicle
};