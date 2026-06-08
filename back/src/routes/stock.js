const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { authenticate, requireRole } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');

router.use(authenticate);

// GET /api/stock/current
router.get('/current', stockController.getCurrentStock);

// GET /api/stock/history
router.get('/history', stockController.getStockHistory);

module.exports = router;