// src/controllers/reportController.js
const reportService = require('../services/reportService');
const { validationResult } = require('express-validator');
const { ROLES } = require('../utils/constants');

async function getCurrentStockReport(req, res) {
  try {
    const format = req.query.format || 'json';
    const userId = req.user.id;
    const userRoleId = req.user.roleId;
    let userStorageId = req.user.storageId;

    if (userRoleId === ROLES.OFFICE_WORKER && req.query.storageId) {
      userStorageId = parseInt(req.query.storageId);
    }
    const asOfDate = req.query.asOfDate ? new Date(req.query.asOfDate) : null;

    const data = await reportService.getCurrentStockData(userId, userRoleId, userStorageId, asOfDate);

    if (format === 'csv') {
      const csvData = data;
      console.log(data);
      const keys = ['fertilizername', 'containertype', 'quantity', 'weight', 'containerweight', 'totalweight'];
      const headers = ['Наименование', 'Тип тары', 'Количество (шт)', 'Вес ед.(кг)', 'Макс. тары(кг)', 'Общий вес(кг)'];
      let csv = reportService.convertToCSV(csvData, keys, headers);
      csv = '\uFEFF' + csv;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="current_stock.csv"');
      return res.send(csv);
    }

    if (format === 'pdf') {
      const pdfBuffer = await reportService.generateStockReportPDF(data, 'Текущее состояние склада', userStorageId, asOfDate);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="current_stock.pdf"');
      return res.send(pdfBuffer);
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Ошибка при генерации отчёта о текущем состоянии склада:', error);
    res.status(500).json({ error: error.message });
  }
}

async function getIncomingReport(req, res) {
  try {
    const format = req.query.format || 'json';
    const userId = req.user.id;
    const userRoleId = req.user.roleId;
    let userStorageId = req.user.storageId;

    let targetStorageId = null;
    if (userRoleId === ROLES.STOREKEEPER) {
      targetStorageId = userStorageId;
    } else if (userRoleId === ROLES.DIRECTOR || userRoleId === ROLES.OFFICE_WORKER) {
      if (req.query.storageId) {
        targetStorageId = parseInt(req.query.storageId);
      } else {
        targetStorageId = userStorageId;
      }
    } else {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }

    const filters = {
      storageId: targetStorageId,
      dateFrom: req.query.dateFrom || null,
      dateTo: req.query.dateTo || null,
      fertilizerId: req.query.fertilizerId ? parseInt(req.query.fertilizerId) : null
    };

    const data = await reportService.getIncomingData(userId, userRoleId, targetStorageId, filters);

    if (format === 'csv') {
      const keys = ['date', 'storageName', 'fertilizername', 'quantity', 'creatorName'];
      const headers = ['Дата', 'Склад', 'Удобрение', 'Количество (шт)', 'Создатель'];
      let csv = reportService.convertToCSV(data, keys, headers);
      csv = '\uFEFF' + csv;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="incoming_report.csv"');
      return res.send(csv);
    }

    if (format === 'pdf') {
      const pdfBuffer = await reportService.generateIncomingPDF(data, filters, userRoleId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="incoming_report.pdf"');
      return res.send(pdfBuffer);
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Ошибка при генерации отчёта о поставках:', error);
    res.status(500).json({ error: error.message });
  }
}

async function getOutgoingReport(req, res) {
  try {
    const format = req.query.format || 'json';
    const userId = req.user.id;
    const userRoleId = req.user.roleId;
    const userStorageId = req.user.storageId;
    const userPartnerId = req.query.partnerId;

    const filters = {
      storageId: req.query.storageId ? parseInt(req.query.storageId) : null,
      partnerId: req.query.partnerId ? parseInt(req.query.partnerId) : null,
      dateFrom: req.query.dateFrom || null,
      dateTo: req.query.dateTo || null,
      ebStatus: req.query.ebStatus ? parseInt(req.query.ebStatus) : null
    };

    const data = await reportService.getOutgoingData(userId, userRoleId, userStorageId, userPartnerId, filters);

    if (format === 'csv') {
      const keys = ['conclDate', 'shipDate', 'partnerName', 'storageName', 'driverName', 'ebStatus', 'vehicleInfo', 'itemsInfo'];
      const headers = ['Дата заключения', 'Дата отгрузки', 'Партнёр', 'Склад', 'Водитель', 'Статус ЭТрН', 'Транспорт', 'Товары'];
      let csv = reportService.convertToCSV(data, keys, headers);
      csv = '\uFEFF' + csv;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="outgoing_report.csv"');
      return res.send(csv);
    }

    if (format === 'pdf') {
      const pdfBuffer = await reportService.generateOutgoingPDF(data, filters);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="outgoing_report.pdf"');
      return res.send(pdfBuffer);
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Ошибка при генерации отчёта об отгрузках:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getCurrentStockReport,
  getIncomingReport,
  getOutgoingReport
};