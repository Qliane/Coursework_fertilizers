const express = require('express');
const router = express.Router({ mergeParams: true });
const vehicleController = require('../controllers/vehicleController');
const { authenticate, requireRole } = require('../middleware/auth');
const vehicleValidators = require('../utils/validators/vehicle-validators');
const { ROLES } = require('../utils/constants');

router.use(authenticate);

// GET
router.get('/',
    requireRole(ROLES.STOREKEEPER, ROLES.OFFICE_WORKER, ROLES.TRUSTED_PERSON, ROLES.DIRECTOR),
    vehicleValidators.validateVehicleParams,
    vehicleController.getVehicles
);

// GET /:id 
router.get('/:id',
    requireRole(ROLES.OFFICE_WORKER, ROLES.TRUSTED_PERSON),
    vehicleValidators.validateVehicleParams,
    vehicleController.getVehicleById
);

// POST 
router.post('/',
    requireRole(ROLES.OFFICE_WORKER),
    vehicleValidators.validateCreateVehicle,
    vehicleController.createVehicle
);

// PUT 
router.put('/:id',
    requireRole(ROLES.OFFICE_WORKER),
    vehicleValidators.validateUpdateVehicle,
    vehicleController.updateVehicle
);

// DELETE 
router.delete('/:id',
    requireRole(ROLES.OFFICE_WORKER),
    vehicleValidators.validateVehicleParams,
    vehicleController.deleteVehicle
);

module.exports = router;