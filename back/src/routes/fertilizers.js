const express = require('express');
const router = express.Router();
const fertilizerController = require('../controllers/fertilizerController');
const { authenticate, requireRole } = require('../middleware/auth');
const fertilizerValidators = require('../utils/validators/fertilizer-validators');
const { ROLES } = require('../utils/constants');

// Все маршруты требуют аутентификации
router.use(authenticate);

// GET /api/fertilizers
router.get('/', 
    requireRole(ROLES.STOREKEEPER, ROLES.DIRECTOR, ROLES.OFFICE_WORKER, ROLES.TRUSTED_PERSON),
    fertilizerController.getAllFertilizers
);

// GET /api/fertilizers/:id
router.get('/:id', 
    requireRole(ROLES.STOREKEEPER, ROLES.DIRECTOR, ROLES.OFFICE_WORKER),
    fertilizerValidators.validateFertilizerId,
    fertilizerController.getFertilizerById
);

// POST /api/fertilizers
router.post('/', 
    requireRole(ROLES.OFFICE_WORKER),
    fertilizerValidators.validateCreateFertilizer,
    fertilizerController.createFertilizer
);

// PUT /api/fertilizers/:id
router.put('/:id', 
    requireRole(ROLES.OFFICE_WORKER),
    fertilizerValidators.validateFertilizerId,
    fertilizerValidators.validateUpdateFertilizer,
    fertilizerController.updateFertilizer
);

// DELETE /api/fertilizers/:id
router.delete('/:id', 
    requireRole(ROLES.OFFICE_WORKER),
    fertilizerValidators.validateFertilizerId,
    fertilizerController.deleteFertilizer
);

module.exports = router;