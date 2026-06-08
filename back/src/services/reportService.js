// src/services/reportService.js
const db = require('../config/database');
const { ROLES, EBILL_STATUSES } = require('../utils/constants');
const PdfPrinter = require('pdfmake');
const path = require('path');

// Настройка шрифтов для pdfmake (используем Roboto из папки fonts)
const fonts = {
  Roboto: {
    normal: path.join(__dirname, '../fonts/Roboto-Regular.ttf'),
    bold: path.join(__dirname, '../fonts/Roboto-Bold.ttf'),
    italics: path.join(__dirname, '../fonts/Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, '../fonts/Roboto-BoldItalic.ttf')
  }
};
const printer = new PdfPrinter(fonts);

// ----- Вспомогательные функции -----
function convertToCSV(data, keys, headers) {
  if (!data || data.length === 0) {
    return (headers || keys || []).join(';');
  }
  const headerRow = (headers || keys).join(';');
  const rows = data.map(row =>
    keys.map(key => {
      let val = row[key];
      if (val === undefined || val === null) return '';
      if (typeof val === 'object') val = JSON.stringify(val);
      val = String(val).trim().replace(/"/g, '""');
     
      if (val.includes(';') || val.includes('"') || val.includes('\n')) {
        val = `"${val}"`;
      }
      return val;
    }).join(';')
  );
  return [headerRow, ...rows].join('\n');
}

async function getCurrentStockData(userId, userRoleId, userStorageId, asOfDate = null) {
    if (!userStorageId) return [];

    const result = await db.query(
        'SELECT * FROM get_current_stock($1, $2)',
        [userStorageId, asOfDate || null]
    );
    return result.rows;
}

async function generateStockReportPDF(data, title, storageId, asOfDate) {
  let storageName = '';
  if (storageId) {
    const storageRes = await db.query('SELECT TRIM(STOR_FULLNAME) as name FROM STORAGE WHERE STOR_ID = $1', [storageId]);
    if (storageRes.rows.length) storageName = storageRes.rows[0].name;
  }

  const now = new Date();
  const reportDate = now.toLocaleDateString('ru-RU');
  const asOfDateStr = (asOfDate ?? new Date()).toLocaleDateString('ru-RU');

  const totalQuantity = data.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0);
  const totalWeight = data.reduce((sum, row) => sum + (Number(row.totalweight) || 0), 0);

  const docDefinition = {
    pageOrientation: 'landscape',
    content: [
      { text: title, style: 'header', alignment: 'center', margin: [0, 0, 0, 10] },
      { text: `Склад: ${storageName || 'Не указан'}`, style: 'subheader', alignment: 'center', margin: [0, 0, 0, 5] },
      { text: `Дата формирования отчёта: ${reportDate}`, style: 'subheader', alignment: 'center', margin: [0, 0, 0, 5] },
      { text: `Состояние на дату: ${asOfDateStr}`, style: 'subheader', alignment: 'center', margin: [0, 0, 0, 20] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Наименование', style: 'tableHeader' },
              { text: 'Тара', style: 'tableHeader' },
              { text: 'Кол-во (шт)', style: 'tableHeader' },
              { text: 'Вес ед.(кг)', style: 'tableHeader' },
              { text: 'Макс. тары(кг)', style: 'tableHeader' },
              { text: 'Общий вес(кг)', style: 'tableHeader' }
            ],
            ...data.map(row => [
              row.fertilizername || '',
              row.containertype || '',
              row.quantity || 0,
              row.weight || 0,
              row.containerweight || 0,
              row.totalweight || 0
            ])
          ]
        },
        layout: 'lightHorizontalLines'
      },
      { text: '\nИтоги:', style: 'subheader', margin: [0, 20, 0, 5] },
      { text: `Общее количество удобрений (мешков/штук): ${totalQuantity}`, margin: [0, 0, 0, 5] },
      { text: `Общий вес груза (с тарой): ${Number(totalWeight).toFixed(2)} кг`, margin: [0, 0, 0, 10] }
    ],
    styles: {
      header: { fontSize: 18, bold: true },
      subheader: { fontSize: 12 },
      tableHeader: { bold: true, fillColor: '#eeeeee' }
    },
    defaultStyle: { font: 'Roboto' }
  };

  return new Promise((resolve, reject) => {
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];
    pdfDoc.on('data', chunk => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', reject);
    pdfDoc.end();
  });
}

// ----- Отчёт о поставках (приход) -----
async function getIncomingData(userId, userRoleId, userStorageId, filters) {
  let query = `
    SELECT
      o.ORDER_CREATED_AT as "date",
      o.STOR_ID as "storageId",
      TRIM(s.STOR_FULLNAME) as "storageName",
      f.FERTIL_ID as "fertilizerId",
      TRIM(f.FERTIL_NAME) as "fertilizerName",
      fi.FLIST_ITEM_FACT_COUNT as "quantity",
      o.ORDER_ID as "documentId",
      TRIM(u.USER_NAME) || ' ' || TRIM(u.USER_SECONDNAME) as "creatorName"
    FROM FLIST_ITEM fi
    INNER JOIN "ORDER" o ON fi.FLIST_ID = o.FLIST_ID
    INNER JOIN STORAGE s ON o.STOR_ID = s.STOR_ID
    INNER JOIN FERTILIZER f ON fi.FERTIL_ID = f.FERTIL_ID
    INNER JOIN "USER" u ON o.USER_ID = u.USER_ID
    WHERE o.ORDER_REALIZED_AT IS NOT NULL
  `;
  const conditions = [];
  const params = [];

 
  if (userRoleId === ROLES.STOREKEEPER) {
    if (!userStorageId) return [];
    conditions.push(`o.STOR_ID = $${params.length + 1}`);
    params.push(userStorageId);
  }

  if (filters.storageId) {
    conditions.push(`o.STOR_ID = $${params.length + 1}`);
    params.push(filters.storageId);
  }
  if (filters.dateFrom) {
    conditions.push(`o.ORDER_CREATED_AT >= $${params.length + 1}`);
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    conditions.push(`o.ORDER_CREATED_AT <= $${params.length + 1}`);
    params.push(filters.dateTo);
  }
  if (filters.fertilizerId) {
    conditions.push(`f.FERTIL_ID = $${params.length + 1}`);
    params.push(filters.fertilizerId);
  }

  if (conditions.length) {
    query += ' AND ' + conditions.join(' AND ');
  }
  query += ' ORDER BY o.ORDER_CREATED_AT DESC';

  const result = await db.query(query, params);
  return result.rows;
}

async function generateIncomingPDF(data, filters, userRoleId) {
  const title = `Отчёт о поставках (${filters.dateFrom ? filters.dateFrom + " - " : 'по'} ${filters.dateTo || new Date().toLocaleDateString()})`;
  const now = new Date();
  const reportDate = now.toLocaleDateString('ru-RU');
  const reportTime = now.toLocaleTimeString('ru-RU');

 
  let storageText = '';
  if (filters.storageId) {
    const storageRes = await db.query('SELECT TRIM(STOR_FULLNAME) as name FROM STORAGE WHERE STOR_ID = $1', [filters.storageId]);
    if (storageRes.rows.length) storageText = `Склад: ${storageRes.rows[0].name}`;
  } else if (userRoleId === 1 && filters.storageId === null) {
   
   
  } else {
    storageText = 'Склад: все';
  }

  const docDefinition = {
    content: [
      { text: title, style: 'header', alignment: 'center', margin: [0, 0, 0, 10] },
      { text: storageText, style: 'subheader', alignment: 'center', margin: [0, 0, 0, 5] },
      { text: `Дата формирования: ${reportDate} ${reportTime}`, style: 'subheader', alignment: 'center', margin: [0, 0, 0, 20] },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Дата', style: 'tableHeader' },
              { text: 'Склад', style: 'tableHeader' },
              { text: 'Удобрение', style: 'tableHeader' },
              { text: 'Количество (шт)', style: 'tableHeader' },
              { text: 'Создатель', style: 'tableHeader' }
            ],
            ...data.map(row => [
              row.date.toISOString().split('T')[0],
              row.storageName,
              row.fertilizerName,
              row.quantity,
              row.creatorName
            ])
          ]
        },
        layout: 'lightHorizontalLines'
      }
    ],
    styles: {
      header: { fontSize: 18, bold: true },
      subheader: { fontSize: 12 },
      tableHeader: { bold: true, fillColor: '#eeeeee' }
    },
    defaultStyle: { font: 'Roboto' }
  };
  return new Promise((resolve, reject) => {
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];
    pdfDoc.on('data', chunk => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', reject);
    pdfDoc.end();
  });
}

// ----- Отчёт об отгрузках -----
async function getOutgoingData(userId, userRoleId, userStorageId, userPartnerId, filters) {
  let query = `
    SELECT DISTINCT
      u.UPD_ID as "updId",
      u.UPD_CONCL_DATE as "conclDate",
      u.UPD_SHIP_DATE as "shipDate",
      p.PARTNER_FULLNAME as "partnerName",
      s.STOR_FULLNAME as "storageName",
      b.BILL_ID as "billId",
      TRIM(driver.USER_NAME) || ' ' || TRIM(driver.USER_SECONDNAME) as "driverName",
      eb.ELECTRONIC_BILL_STATUS as "ebStatus",
      (SELECT string_agg(TRIM(v.VEHICLE_REGISTRATION_MARK), ', ') FROM tn_link_vehicle tlv JOIN VEHICLE v ON tlv.VEHICLE_ID = v.VEHICLE_ID WHERE tlv.BILL_ID = b.BILL_ID) as "vehicleInfo",
      (SELECT string_agg(TRIM(f.FERTIL_NAME) || ' (' || fi.FLIST_ITEM_DECL_COUNT || ' шт)', '; ')
       FROM FLIST_ITEM fi JOIN FERTILIZER f ON fi.FERTIL_ID = f.FERTIL_ID WHERE fi.FLIST_ID = b.FLIST_ID) as "itemsInfo"
    FROM UPD u
    JOIN PARTNER p ON u.PARTNER_ID = p.PARTNER_ID
    JOIN STORAGE s ON u.STOR_ID = s.STOR_ID
    JOIN BILL b ON u.UPD_ID = b.UPD_ID
    LEFT JOIN "USER" driver ON b.USER_ID = driver.USER_ID
    LEFT JOIN ELECTRONIC_BILL eb ON b.BILL_ID = eb.BILL_ID
    WHERE eb.ELECTRONIC_BILL_STATUS IS NOT NULL
      AND eb.ELECTRONIC_BILL_STATUS != 0
  `;
  const conditions = [];
  const params = [];

 
  if (userRoleId === ROLES.STOREKEEPER) {
    if (!userStorageId) return [];
    conditions.push(`u.STOR_ID = $${params.length + 1}`);
    params.push(userStorageId);
  } else if (userRoleId === ROLES.TRUSTED_PERSON) {
    conditions.push(`u.PARTNER_ID = $${params.length + 1}`);
    params.push(userPartnerId);
  } else if (userRoleId !== ROLES.DIRECTOR && userRoleId !== ROLES.OFFICE_WORKER) {
    return [];
  }

  if (filters.storageId) {
    conditions.push(`u.STOR_ID = $${params.length + 1}`);
    params.push(filters.storageId);
  }
  if (filters.partnerId) {
    conditions.push(`u.PARTNER_ID = $${params.length + 1}`);
    params.push(filters.partnerId);
  }
  if (filters.dateFrom) {
    conditions.push(`u.UPD_CONCL_DATE >= $${params.length + 1}`);
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    conditions.push(`u.UPD_CONCL_DATE <= $${params.length + 1}`);
    params.push(filters.dateTo);
  }
  if (filters.ebStatus !== undefined && filters.ebStatus !== null) {
    conditions.push(`eb.ELECTRONIC_BILL_STATUS = $${params.length + 1}`);
    params.push(filters.ebStatus);
  }

  if (conditions.length) {
    query += ' AND ' + conditions.join(' AND ');
  }
  query += ' ORDER BY u.UPD_CONCL_DATE DESC';

  const result = await db.query(query, params);

 
  const statusMap = {
    [EBILL_STATUSES.DRAFT]: 'Черновик',
    [EBILL_STATUSES.SIGNED_BY_STORAGE]: 'Подписан директором',
    [EBILL_STATUSES.SIGNED_BY_PARTNER]: 'Подписан партнером',
    [EBILL_STATUSES.COMPLETED]: 'Завершен'
  };

  return result.rows.map(row => ({
    ...row,
    ebStatus: row.ebStatus !== null ? (statusMap[row.ebStatus] || row.ebStatus) : '—'
  }));
}

async function generateOutgoingPDF(data, filters) {
  const title = `Отчёт об отгрузках (${filters.dateFrom ? filters.dateFrom + " - " : 'по'} ${filters.dateTo || new Date().toLocaleDateString()})`;
  const now = new Date();
  const reportDate = now.toLocaleDateString('ru-RU');
  const reportTime = now.toLocaleTimeString('ru-RU');

  const docDefinition = {
    pageOrientation: 'landscape',
    content: [
      { text: title, style: 'header', alignment: 'center', margin: [0, 0, 0, 10] },
      { text: `Дата формирования: ${reportDate} ${reportTime}`, style: 'subheader', alignment: 'center', margin: [0, 0, 0, 20] },
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', '*', '*', 'auto', '*', '*'],
          body: [
            [
              { text: 'Дата заключения', style: 'tableHeader' },
              { text: 'Дата отгрузки', style: 'tableHeader' },
              { text: 'Партнёр', style: 'tableHeader' },
              { text: 'Склад', style: 'tableHeader' },
              { text: 'Водитель', style: 'tableHeader' },
              { text: 'Статус ЭТрН', style: 'tableHeader' },
              { text: 'ТС / Товары', style: 'tableHeader' }
            ],
            ...data.map(row => [
              row.conclDate?.toISOString().split('T')[0] || '',
              row.shipDate?.toISOString().split('T')[0] || '',
              row.partnerName,
              row.storageName,
              row.driverName,
              row.ebStatus !== undefined ? row.ebStatus : '—',
              (row.vehicleInfo || '') + '\n' + (row.itemsInfo || '')
            ])
          ]
        },
        layout: 'lightHorizontalLines'
      }
    ],
    styles: {
      header: { fontSize: 18, bold: true },
      subheader: { fontSize: 12 },
      tableHeader: { bold: true, fillColor: '#eeeeee' }
    },
    defaultStyle: { font: 'Roboto' }
  };
  return new Promise((resolve, reject) => {
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];
    pdfDoc.on('data', chunk => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', reject);
    pdfDoc.end();
  });
}

module.exports = {
  convertToCSV,
  getCurrentStockData,
  generateStockReportPDF,
  getIncomingData,
  generateIncomingPDF,
  getOutgoingData,
  generateOutgoingPDF
};