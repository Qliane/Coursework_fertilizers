const express = require('express');
const router = express.Router();
const containerController = require('../controllers/containerController');
const { authenticate, requireRole } = require('../middleware/auth');
const containerValidators = require('../utils/validators/container-validators');
const { ROLES } = require('../utils/constants');

router.use(authenticate);

// GET /api/containers
router.get('/', 
    requireRole(ROLES.STOREKEEPER, ROLES.DIRECTOR, ROLES.OFFICE_WORKER),
    containerController.getAllContainers
);

// GET /api/containers/:id
router.get('/:id', 
    requireRole(ROLES.STOREKEEPER, ROLES.DIRECTOR, ROLES.OFFICE_WORKER),
    containerValidators.validateContainerId,
    containerController.getContainerById
);

// POST /api/containers
router.post('/', 
    requireRole(ROLES.OFFICE_WORKER),
    containerValidators.validateCreateContainer,
    containerController.createContainer
);

// PUT /api/containers/:id
router.put('/:id', 
    requireRole(ROLES.OFFICE_WORKER),
    containerValidators.validateContainerId,
    containerValidators.validateUpdateContainer,
    containerController.updateContainer
);

// DELETE /api/containers/:id
router.delete('/:id', 
    requireRole(ROLES.OFFICE_WORKER),
    containerValidators.validateContainerId,
    containerController.deleteContainer
);

module.exports = router;