// ============================================================
// electron/ipc/dashboard/utils.cjs - HELPERS & NORMALISATION (10/10)
// ============================================================

const { format, parseISO, isValid } = require('date-fns');

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

function aggregateByPeriod(rows, granularity) {
  const map = new Map();
  for (const row of rows) {
    if (!row.date) continue;
    try {
      const d = parseISO(row.date);
      if (!isValid(d)) continue;
      let key;
      switch (granularity) {
        case 'jour': key = format(d, 'yyyy-MM-dd'); break;
        case 'semaine': key = format(d, 'yyyy-ww'); break;
        case 'mois': key = format(d, 'yyyy-MM'); break;
        case 'annee': key = format(d, 'yyyy'); break;
        default: key = format(d, 'yyyy-MM-dd');
      }
      if (!map.has(key)) {
        map.set(key, { nb: 0, total: 0 });
      }
      const entry = map.get(key);
      entry.nb += row.nb_commandes || row.nb_entrees || row.nb_sorties || 0;
      entry.total += row.total_ventes || row.total_quantite || 0;
    } catch (_) { /* ignore */ }
  }
  return map;
}

function generateLabels(startDate, endDate, granularity) {
  const labels = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let current = new Date(start);
  
  while (current <= end) {
    let label;
    switch (granularity) {
      case 'jour': label = format(current, 'yyyy-MM-dd'); break;
      case 'semaine': label = format(current, 'yyyy-ww'); break;
      case 'mois': label = format(current, 'yyyy-MM'); break;
      case 'annee': label = format(current, 'yyyy'); break;
      default: label = format(current, 'yyyy-MM-dd');
    }
    labels.push(label);
    switch (granularity) {
      case 'jour': current.setDate(current.getDate() + 1); break;
      case 'semaine': current.setDate(current.getDate() + 7); break;
      case 'mois': current.setMonth(current.getMonth() + 1); break;
      case 'annee': current.setFullYear(current.getFullYear() + 1); break;
      default: current.setDate(current.getDate() + 1);
    }
  }
  return labels;
}

module.exports = {
  normalizeValue,
  normalizeRow,
  normalizeRows,
  aggregateByPeriod,
  generateLabels,
};