// src/routes/reports.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, requireRole } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');

router.use(authenticate);

// Отчёт о текущем состоянии склада (доступно кладовщику, директору, работнику офиса)
router.get('/stock/current',
  requireRole(ROLES.STOREKEEPER, ROLES.DIRECTOR, ROLES.OFFICE_WORKER),
  reportController.getCurrentStockReport
);

// Отчёт о поставках (приход)
router.get('/incoming',
  requireRole(ROLES.STOREKEEPER, ROLES.DIRECTOR, ROLES.OFFICE_WORKER),
  reportController.getIncomingReport
);

// Отчёт об отгрузках
router.get('/outgoing',
  requireRole(ROLES.STOREKEEPER, ROLES.DIRECTOR, ROLES.OFFICE_WORKER, ROLES.TRUSTED_PERSON),
  reportController.getOutgoingReport
);

module.exports = router;