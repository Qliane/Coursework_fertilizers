const express = require('express');
const router = express.Router();
const electronicBillController = require('../controllers/electronicBillController');
const { authenticate } = require('../middleware/auth');
const { validateBillId } = require('../utils/validators/bill-validators');

router.use(authenticate);

// POST /api/bills/:billId/sign
router.post('/:billId/sign', validateBillId, electronicBillController.signElectronicBill);

// POST /api/bills/:billId/accept
router.post('/:billId/accept', validateBillId, electronicBillController.acceptElectronicBill);

module.exports = router;