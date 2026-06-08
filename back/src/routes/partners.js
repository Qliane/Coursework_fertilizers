const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { authenticate, requireRole } = require('../middleware/auth');
const partnerValidators = require('../utils/validators/partner-validators');
const { ROLES } = require('../utils/constants');

router.use(authenticate);

const vehiclesRouter = require('./vehicles');
const driversRouter = require('./drivers');

// GET /api/partners
router.get('/',
    requireRole(ROLES.DIRECTOR, ROLES.OFFICE_WORKER, ROLES.DRIVER, ROLES.STOREKEEPER, ROLES.TRUSTED_PERSON),
    partnerValidators.validatePartnerFilters,
    partnerController.getPartners
);

// GET /api/partners/:id
router.get('/:id',
    requireRole(ROLES.DIRECTOR, ROLES.OFFICE_WORKER),
    partnerValidators.validatePartnerId,
    partnerController.getPartnerById
);

// POST /api/partners
router.post('/',
    requireRole(ROLES.OFFICE_WORKER),
    partnerValidators.validateCreatePartner,
    partnerController.createPartner
);

// PUT /api/partners/:id
router.put('/:id',
    requireRole(ROLES.OFFICE_WORKER),
    partnerValidators.validatePartnerId,
    partnerValidators.validateUpdatePartner,
    partnerController.updatePartner
);

// DELETE /api/partners/:id
router.delete('/:id',
    requireRole(ROLES.OFFICE_WORKER),
    partnerValidators.validatePartnerId,
    partnerController.deletePartner
);

// Вложенные маршруты для водителей
router.use('/:partnerId/vehicles', vehiclesRouter);
router.use('/:partnerId/drivers', driversRouter);

module.exports = router;