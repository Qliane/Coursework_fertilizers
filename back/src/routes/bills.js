const express = require('express');
const router = express.Router({ mergeParams: true });
const billController = require('../controllers/billController');
const { authenticate, requireRole } = require('../middleware/auth');
const billValidators = require('../utils/validators/bill-validators');
const { ROLES } = require('../utils/constants');

router.use(authenticate);
router.use(requireRole(ROLES.STOREKEEPER, ROLES.DIRECTOR, ROLES.TRUSTED_PERSON, ROLES.OFFICE_WORKER));

router.get('/', billController.getBills);
router.post('/', billValidators.validateCreateBill, billController.createBill);
router.get('/:billId', billValidators.validateUpdAndBillId, billController.getBillById);
router.put('/:billId', billValidators.validateUpdateBill, billController.updateBill);
router.delete('/:billId', billValidators.validateUpdAndBillId, billController.deleteBill);

module.exports = router;