// electron/ipc/ventes/queries.cjs
'use strict';

const ALLOWED_SORTS = new Set([
  'id',
  'reference',
  'date_devis',
  'date_facture',
  'total_ht',
  'total_ttc',
  'client_nom'
]);

function normalizeSort(sort = {}) {
  const field = ALLOWED_SORTS.has(sort?.field) ? sort.field : 'id';
  const direction = sort?.direction === 'ASC' ? 'ASC' : 'DESC';
  return { field, direction };
}

function normalizeLimit(limit, fallback = 20) {
  const n = Number(limit);
  if (!Number.isInteger(n) || n <= 0) return fallback;
  return Math.min(n, 200);
}

function normalizePage(page) {
  const n = Number(page);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function buildVentesFilters(table, options = {}) {
  const { search, statut, clientId } = options;
  let where = ' WHERE 1=1 ';
  const params = [];

  if (search && String(search).trim()) {
    const s = `%${String(search).trim()}%`;
    where += ` AND (${table}.reference LIKE ? OR ${table}.client_nom LIKE ?)`;
    params.push(s, s);
  }

  if (statut) {
    where += ` AND ${table}.statut = ?`;
    params.push(statut);
  }

  if (clientId) {
    where += ` AND ${table}.client_id = ?`;
    params.push(clientId);
  }

  return { where, params };
}

function buildDevisQuery(options = {}) {
  const limit = normalizeLimit(options.limit, 20);
  const page = normalizePage(options.page);
  const offset = (page - 1) * limit;
  const { where, params } = buildVentesFilters('devis', options);
  const sort = normalizeSort(options.sort);

  return {
    query: `
      SELECT *
      FROM devis
      ${where}
      ORDER BY ${sort.field} ${sort.direction}
      LIMIT ? OFFSET ?
    `,
    params: [...params, limit, offset],
    limit,
    page,
    offset
  };
}

function buildFacturesQuery(options = {}) {
  const limit = normalizeLimit(options.limit, 20);
  const page = normalizePage(options.page);
  const offset = (page - 1) * limit;
  const { where, params } = buildVentesFilters('factures', options);
  const sort = normalizeSort(options.sort);

  return {
    query: `
      SELECT *
      FROM factures
      ${where}
      ORDER BY ${sort.field} ${sort.direction}
      LIMIT ? OFFSET ?
    `,
    params: [...params, limit, offset],
    limit,
    page,
    offset
  };
}

module.exports = {
  buildDevisQuery,
  buildFacturesQuery,
  buildVentesFilters,
  normalizeSort,
  normalizeLimit,
  normalizePage
};