// ============================================================
// electron/ipc/auth/validation.cjs - HELPERS DE VALIDATION
// ============================================================

const { log, error } = require('./logger.cjs');

function normalizeEmail(email) {
  if (!email) return '';
  return String(email).trim().toLowerCase();
}

function normalizeValue(value) {
  if (value instanceof Date) return value.toISOString();
  if (value === undefined) return null;
  if (value !== null && typeof value === 'object' && !Buffer.isBuffer(value)) {
    try {
      if (typeof value.toISOString === 'function') return value.toISOString();
      return value;
    } catch (_) { return null; }
  }
  return value;
}

function normalizeRow(row) {
  if (!row || typeof row !== 'object') return row;
  const normalized = {};
  for (const [key, value] of Object.entries(row)) {
    normalized[key] = normalizeValue(value);
  }
  return normalized;
}

function normalizeRows(rows) {
  if (!rows) return rows;
  if (Array.isArray(rows)) return rows.map(row => normalizeRow(row));
  return normalizeRow(rows);
}

module.exports = {
  normalizeEmail,
  normalizeValue,
  normalizeRow,
  normalizeRows,
};