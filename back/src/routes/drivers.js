const express = require('express');
const router = express.Router({ mergeParams: true });
const driverController = require('../controllers/driverController');
const { authenticate, requireRole } = require('../middleware/auth');
const driverValidators = require('../utils/validators/driver-validators');
const { ROLES } = require('../utils/constants');

router.use(authenticate);


// GET /api/driver/upds?ebStatus=pending&dateFrom=2026-01-01&dateTo=2026-12-31
router.get('/upds', authenticate, requireRole(ROLES.DRIVER), driverController.getDriverUpds);


// GET /api/partners/:partnerId/drivers
router.get('/',
    requireRole(ROLES.STOREKEEPER, ROLES.OFFICE_WORKER, ROLES.DIRECTOR, ROLES.TRUSTED_PERSON),
    driverValidators.validateDriverParams,
    driverController.getDrivers
);

// GET /api/partners/:partnerId/drivers/:id
router.get('/:id',
    requireRole(ROLES.OFFICE_WORKER, ROLES.DIRECTOR),
    driverValidators.validateDriverParams,
    driverController.getDriverById
);

// POST /api/partners/:partnerId/drivers
router.post('/',
    requireRole(ROLES.OFFICE_WORKER),
    driverValidators.validateCreateDriver,
    driverController.createDriver
);

// PUT /api/partners/:partnerId/drivers/:id
router.put('/:id',
    requireRole(ROLES.OFFICE_WORKER),
    driverValidators.validateUpdateDriver,
    driverController.updateDriver
);

// DELETE /api/partners/:partnerId/drivers/:id
router.delete('/:id',
    requireRole(ROLES.OFFICE_WORKER),
    driverValidators.validateDriverParams,
    driverController.deleteDriver
);


module.exports = router;