// src/controllers/importExportController.js
const importExportService = require('../services/importExportService');

// ---------- Экспорт ----------
async function exportPartners(req, res) {
    try {
        const data = await importExportService.exportPartners(req.user.roleId);
        const csv = convertToCSV(data, ['partner_id', 'partner_inn', 'partner_fullname', 'partner_phone', 'partner_fact_address', 'partner_post_address', 'user_id']);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="partners.csv"');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function exportVehicles(req, res) {
    try {
        const data = await importExportService.exportVehicles(req.user.roleId);
        const csv = convertToCSV(data, ['vehicle_id', 'partner_id', 'vehicle_registration_mark', 'vehicle_type', 'vehicle_capacity']);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="vehicles.csv"');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function exportDrivers(req, res) {
    try {
        const data = await importExportService.exportDrivers(req.user.roleId);
        const csv = convertToCSV(data, ['user_id', 'partner_id', 'driver_license', 'driver_categories', 'user_name', 'user_secondname', 'user_patronymic']);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="drivers.csv"');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// ---------- Импорт (ожидаем multipart/form-data, поле 'file') ----------
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

async function importPartners(req, res) {
    try {
        const csvContent = req.file.buffer.toString('utf-8');
        const result = await importExportService.importPartners(csvContent, req.user.id, req.user.roleId);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function importVehicles(req, res) {
    try {
        const csvContent = req.file.buffer.toString('utf-8');
        const result = await importExportService.importVehicles(csvContent, req.user.id, req.user.roleId);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function importDrivers(req, res) {
    try {
        const csvContent = req.file.buffer.toString('utf-8');
        const result = await importExportService.importDrivers(csvContent, req.user.id, req.user.roleId);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

function convertToCSV(data, columns) {
    if (!data || data.length === 0) {
        return columns.join(',');
    }

    const header = columns.join(',');
    const rows = data.map(row => 
        columns.map(col => {
            let val = row[col];
            if (val === undefined || val === null) return '';
            if (Array.isArray(val)) {
                val = val.map(v => String(v).trim().replace(/"/g, '""')).join(',');
            }
            if (typeof val === 'object') {
                val = JSON.stringify(val);
            }
            val = String(val).trim();
            return `"${val.replace(/"/g, '""')}"`;
        }).join(',')
    );
    return [header, ...rows].join('\n');
}

module.exports = {
    exportPartners, exportVehicles, exportDrivers,
    importPartners, importVehicles, importDrivers,
    upload
};