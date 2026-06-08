const express = require('express');
const router = express.Router();

// Импорт маршрутов
const authRoutes = require('./auth');
const stockRoutes = require('./stock');
const debugRoutes = require('./debug');
const orderRoutes = require('./orders');
const fertilizerRoutes = require('./fertilizers');
const containerRoutes = require('./containers');
const partnerRoutes = require('./partners');
const storageRoutes = require('./storages');
const updRoutes = require('./upd');
const electronicBillRoutes = require('./electronic-bills');
const importExportRoutes = require('./importExport');
const userRoutes = require('./users');
const driverRoutes = require('./drivers');
const reportRoutes = require('./reports');

// Маршруты
router.use('/auth', authRoutes);
router.use('/debug', debugRoutes);
router.use('/stock', stockRoutes);
router.use('/orders', orderRoutes);
router.use('/fertilizers', fertilizerRoutes);
router.use('/containers', containerRoutes);
router.use('/partners', partnerRoutes);
router.use('/storages', storageRoutes);
router.use('/upd', updRoutes);
router.use('/bills', electronicBillRoutes);
router.use('/import-export', importExportRoutes);
router.use('/users', userRoutes);
router.use('/driver', driverRoutes);
router.use('/reports', reportRoutes);

module.exports = router;