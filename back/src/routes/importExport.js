// src/routes/importExport.js
const express = require('express');
const router = express.Router();
const importExportController = require('../controllers/importExportController');
const { authenticate, requireRole } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');

router.use(authenticate);
router.use(requireRole(ROLES.OFFICE_WORKER));

// Экспорт
router.get('/partners/export', importExportController.exportPartners);
router.get('/vehicles/export', importExportController.exportVehicles);
router.get('/drivers/export', importExportController.exportDrivers);

// Импорт (с загрузкой файла)
router.post('/partners/import', importExportController.upload.single('file'), importExportController.importPartners);
router.post('/vehicles/import', importExportController.upload.single('file'), importExportController.importVehicles);
router.post('/drivers/import', importExportController.upload.single('file'), importExportController.importDrivers);

module.exports = router;