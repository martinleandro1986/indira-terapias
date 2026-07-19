/**
 * Indira Terapias - API simple desde Google Sheets.
 *
 * 1) Crear una planilla con pestañas: Terapias, Formaciones, Eventos.
 * 2) Extensiones > Apps Script y pegar este archivo.
 * 3) Implementar > Nueva implementación > Aplicación web.
 * 4) Ejecutar como: vos. Acceso: Cualquiera.
 * 5) Copiar la URL /exec en js/cms-config.js -> endpoint.
 */

const SHEETS = {
  therapies: 'Terapias',
  trainings: 'Formaciones',
  events: 'Eventos'
};

function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const payload = {};

  Object.entries(SHEETS).forEach(([key, sheetName]) => {
    const sheet = ss.getSheetByName(sheetName);
    payload[key] = sheet ? sheetToObjects_(sheet) : [];
  });

  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheetToObjects_(sheet) {
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  const headers = values.shift().map((header) => normalizeHeader_(header));
  return values
    .filter((row) => row.some((cell) => String(cell).trim() !== ''))
    .map((row) => headers.reduce((obj, header, index) => {
      if (header) obj[header] = row[index] || '';
      return obj;
    }, {}));
}

function normalizeHeader_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
