const express = require('express');
const router = express.Router();
const updController = require('../controllers/updController');
const shipController = require('../controllers/shipController');
const { authenticate, requireRole } = require('../middleware/auth');
const updValidators = require('../utils/validators/upd-validators');
const { ROLES } = require('../utils/constants');
const billsRouter = require('./bills');

router.use(authenticate);

// GET /api/upd 
router.get('/', updValidators.validateUpdFilters, updController.getUpdList);

// GET /api/upd/:id 
router.get('/:id', updValidators.validateUpdId, updController.getUpdById);

// POST /api/upd 
router.post('/', updValidators.validateCreateUpd, updController.createUpd);

// PUT /api/upd/:id 
router.put('/:id', updValidators.validateUpdId, updValidators.validateUpdateUpd, updController.updateUpd);

// DELETE /api/upd/:id 
router.delete('/:id', updValidators.validateUpdId, updController.deleteUpd);

router.post('/:updId/ship',
    requireRole(ROLES.STOREKEEPER),
    updValidators.validateUpdIdParam, 
    shipController.shipUpd
);

router.use('/:updId/bills', billsRouter);

module.exports = router;