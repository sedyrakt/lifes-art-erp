// ============================================================
// electron/ipc/orders/queries.cjs - 20M READY (PAGE/OFFSET)
// ⭐ FIX: Nampidirina ny Quantité (xN) ao amin'ny GROUP_CONCAT
// ============================================================
'use strict';
const { normalizeStatus } = require('./validation.cjs');

const ALLOWED_SORTS = new Set(['id', 'date_commande', 'total_ttc', 'client_nom', 'statut']);

function normalizeSort(sort = {}) {
  const field = ALLOWED_SORTS.has(sort?.field) ? sort.field : 'id';
  const direction = sort?.direction === 'ASC' ? 'ASC' : 'DESC';
  return { field, direction };
}

function normalizeLimit(limit, fallback = 8) {
  const n = Number(limit); if (!Number.isInteger(n) || n <= 0) return fallback;
  return Math.min(n, 200);
}

function normalizePage(page) { const n = Number(page); if (!Number.isFinite(n) || n < 1) return 1; return n; }

function buildOrdersFilters(options = {}) {
  const { search, statut, startDate, endDate, montantMin, montantMax, modePaiement } = options;
  let where = ' WHERE 1=1 '; const params = [];
  if (search && String(search).trim()) {
    const s = `%${String(search).trim()}%`;
    where += ` AND (c.client_nom LIKE ? OR EXISTS (SELECT 1 FROM details_commandes dc_search INNER JOIN produits p_search ON p_search.id = dc_search.produit_id WHERE dc_search.commande_id = c.id AND (p_search.nom LIKE ? OR p_search.code LIKE ?)))`;
    params.push(s, s, s);
  }
  if (statut && statut !== 'Tous') { where += ' AND c.statut = ? '; params.push(normalizeStatus(statut)); }
  if (startDate) { where += ' AND c.date_commande >= ? '; params.push(`${startDate} 00:00:00`); }
  if (endDate) { where += ' AND c.date_commande < ? '; params.push(`${endDate} 23:59:59`); }
  if (montantMin !== undefined && montantMin !== '' && Number.isFinite(Number(montantMin))) { where += ' AND c.total_ttc >= ? '; params.push(Number(montantMin)); }
  if (montantMax !== undefined && montantMax !== '' && Number.isFinite(Number(montantMax))) { where += ' AND c.total_ttc <= ? '; params.push(Number(montantMax)); }
  if (modePaiement && String(modePaiement).trim()) {
    where += ` AND EXISTS (SELECT 1 FROM paiements pa WHERE pa.commande_id = c.id AND pa.mode_paiement = ?)`;
    params.push(modePaiement);
  }
  return { where, params };
}

// ⭐ FIX MAJEUR: Nampidirina ny Quantité (xN) ao amin'ny GROUP_CONCAT
function buildOrdersQuery(options = {}) {
  const limit = normalizeLimit(options.limit, 8); 
  const page = normalizePage(options.page);
  const offset = (page - 1) * limit;
  const { where, params } = buildOrdersFilters(options);
  const sort = normalizeSort(options.sort);
  const query = `
    SELECT 
      c.id, 
      c.client_id, 
      c.client_nom, 
      c.total_ht, 
      c.total_ttc, 
      c.total, 
      c.statut, 
      c.date_commande, 
      c.created_at, 
      GROUP_CONCAT(p.nom || ' (x' || dc.quantite || ')', ', ') AS produits_noms 
    FROM commandes c 
    LEFT JOIN details_commandes dc ON dc.commande_id = c.id 
    LEFT JOIN produits p ON p.id = dc.produit_id 
    ${where} 
    GROUP BY c.id 
    ORDER BY c.${sort.field} ${sort.direction} 
    LIMIT ? OFFSET ?
  `;
  params.push(limit, offset);
  return { query, params, limit, page, offset };
}

function buildOrdersCountQuery(options = {}) {
  const { where, params } = buildOrdersFilters(options);
  return { query: `SELECT COUNT(*) AS total FROM commandes c ${where}`, params };
}

module.exports = { buildOrdersQuery, buildOrdersCountQuery };