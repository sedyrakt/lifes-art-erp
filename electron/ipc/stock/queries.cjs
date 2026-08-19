'use strict';

function safeLimit(limit, fallback = 8) {
  const value = Number(limit);
  if (!Number.isFinite(value) || value < 1) return fallback;
  return Math.min(Math.floor(value), 500);
}

function buildDateCondition(column, startDate, endDate, params) {
  const conditions = [];
  if (startDate) { conditions.push(`${column} >= ?`); params.push(startDate); }
  if (endDate) { conditions.push(`${column} < ?`); params.push(endDate); }
  return conditions;
}

function buildEntreesQuery(options = {}) {
  const { produitId, fournisseurId, startDate, endDate, search, limit = 8, lastId, sortBy = 'date_entree', sortOrder = 'DESC' } = options;
  const params = [];
  let dataQuery = `SELECT e.id, e.produit_id, e.quantite, e.prix_unitaire, e.reference, e.fournisseur_id, e.observation, e.date_entree, e.created_at, p.nom AS produit_nom, p.code AS produit_code, p.image AS produit_image, COALESCE(f.nom, 'Aucun fournisseur') AS fournisseur_nom FROM entrees_stock e LEFT JOIN produits p ON p.id = e.produit_id LEFT JOIN fournisseurs f ON f.id = e.fournisseur_id WHERE 1 = 1`;
  let statsQuery = `SELECT COUNT(*) AS total, COALESCE(SUM(e.quantite), 0) AS quantite_totale, COALESCE(SUM(e.prix_unitaire * e.quantite), 0) AS valeur_totale FROM entrees_stock e LEFT JOIN produits p ON p.id = e.produit_id LEFT JOIN fournisseurs f ON f.id = e.fournisseur_id WHERE 1 = 1`;
  const whereClauses = [];
  if (produitId) { whereClauses.push('e.produit_id = ?'); params.push(Number(produitId)); }
  if (fournisseurId) { whereClauses.push('e.fournisseur_id = ?'); params.push(Number(fournisseurId)); }
  const dateConditions = buildDateCondition('e.date_entree', startDate, endDate, params);
  if (dateConditions.length) whereClauses.push(`(${dateConditions.join(' AND ')})`);
  if (search) { const s = `%${String(search).trim()}%`; whereClauses.push(`(p.nom LIKE ? OR p.code LIKE ? OR e.reference LIKE ? OR f.nom LIKE ?)`); params.push(s, s, s, s); }
  if (whereClauses.length) { const where = ` AND ${whereClauses.join(' AND ')}`; dataQuery += where; statsQuery += where; }
  const dataParams = [...params], statsParams = [...params];
  const pageLimit = safeLimit(limit, 8);
  const validSortFields = ['id', 'date_entree', 'quantite', 'prix_unitaire'];
  const field = validSortFields.includes(sortBy) ? sortBy : 'date_entree';
  const dir = sortOrder === 'ASC' ? 'ASC' : 'DESC';
  if (lastId !== null && lastId !== undefined && !isNaN(lastId) && Number(lastId) > 0) { dataQuery += ` AND e.id < ?`; dataParams.push(Number(lastId)); }
  dataQuery += ` ORDER BY e.${field} ${dir}, e.id DESC LIMIT ?`; dataParams.push(pageLimit);
  return { dataQuery, statsQuery, dataParams, statsParams, limit: pageLimit };
}

function buildSortiesQuery(options = {}) {
  const { produitId, startDate, endDate, search, limit = 8, lastId, sortBy = 'date_sortie', sortOrder = 'DESC' } = options;
  const params = [];
  let dataQuery = `SELECT s.id, s.produit_id, s.quantite, s.prix_unitaire, s.reference, s.destination, s.observation, s.date_sortie, s.created_at, p.nom AS produit_nom, p.code AS produit_code, p.image AS produit_image FROM sorties_stock s LEFT JOIN produits p ON p.id = s.produit_id WHERE 1 = 1`;
  let statsQuery = `SELECT COUNT(*) AS total, COALESCE(SUM(s.quantite), 0) AS quantite_totale, COALESCE(SUM(s.prix_unitaire * s.quantite), 0) AS valeur_totale FROM sorties_stock s LEFT JOIN produits p ON p.id = s.produit_id WHERE 1 = 1`;
  const whereClauses = [];
  if (produitId) { whereClauses.push('s.produit_id = ?'); params.push(Number(produitId)); }
  const dateConditions = buildDateCondition('s.date_sortie', startDate, endDate, params);
  if (dateConditions.length) whereClauses.push(`(${dateConditions.join(' AND ')})`);
  if (search) { const s = `%${String(search).trim()}%`; whereClauses.push(`(p.nom LIKE ? OR p.code LIKE ? OR s.reference LIKE ? OR s.destination LIKE ?)`); params.push(s, s, s, s); }
  if (whereClauses.length) { const where = ` AND ${whereClauses.join(' AND ')}`; dataQuery += where; statsQuery += where; }
  const dataParams = [...params], statsParams = [...params];
  const pageLimit = safeLimit(limit, 8);
  const validSortFields = ['id', 'date_sortie', 'quantite', 'prix_unitaire'];
  const field = validSortFields.includes(sortBy) ? sortBy : 'date_sortie';
  const dir = sortOrder === 'ASC' ? 'ASC' : 'DESC';
  if (lastId !== null && lastId !== undefined && !isNaN(lastId) && Number(lastId) > 0) { dataQuery += ` AND s.id < ?`; dataParams.push(Number(lastId)); }
  dataQuery += ` ORDER BY s.${field} ${dir}, s.id DESC LIMIT ?`; dataParams.push(pageLimit);
  return { dataQuery, statsQuery, dataParams, statsParams, limit: pageLimit };
}

function buildMouvementsQuery(options = {}) {
  const { produitId, type, startDate, endDate, search, limit = 8, lastId, sortBy = 'date_mouvement', sortOrder = 'DESC' } = options;
  const params = [];
  let dataQuery = `SELECT m.id, m.produit_id, m.type_mouvement, m.quantite, m.ancien_stock, m.nouveau_stock, m.reference, m.observation, m.date_mouvement, m.created_at, p.nom AS produit_nom, p.code AS produit_code, p.image AS produit_image, p.prix_achat, p.prix_vente AS prix_unitaire, 'Système' AS created_by_nom FROM mouvements_stock m LEFT JOIN produits p ON p.id = m.produit_id WHERE 1 = 1`;
  let statsQuery = `SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN m.type_mouvement = 'ENTREE' THEN 1 ELSE 0 END), 0) AS entrees, COALESCE(SUM(CASE WHEN m.type_mouvement = 'SORTIE' THEN 1 ELSE 0 END), 0) AS sorties, COALESCE(SUM(CASE WHEN m.type_mouvement NOT IN ('ENTREE', 'SORTIE') THEN 1 ELSE 0 END), 0) AS ajustements, COALESCE(SUM(CASE WHEN m.type_mouvement = 'ENTREE' THEN m.quantite ELSE 0 END), 0) AS quantiteEntree, COALESCE(SUM(CASE WHEN m.type_mouvement = 'SORTIE' THEN m.quantite ELSE 0 END), 0) AS quantiteSortie FROM mouvements_stock m LEFT JOIN produits p ON p.id = m.produit_id WHERE 1 = 1`;
  const whereClauses = [];
  if (produitId) { whereClauses.push('m.produit_id = ?'); params.push(Number(produitId)); }
  if (type) { whereClauses.push('m.type_mouvement = ?'); params.push(String(type)); }
  const dateConditions = buildDateCondition('m.date_mouvement', startDate, endDate, params);
  if (dateConditions.length) whereClauses.push(`(${dateConditions.join(' AND ')})`);
  if (search) { const s = `%${String(search).trim()}%`; whereClauses.push(`(p.nom LIKE ? OR p.code LIKE ? OR m.reference LIKE ? OR m.observation LIKE ?)`); params.push(s, s, s, s); }
  if (whereClauses.length) { const where = ` AND ${whereClauses.join(' AND ')}`; dataQuery += where; statsQuery += where; }
  const dataParams = [...params], statsParams = [...params];
  const pageLimit = safeLimit(limit, 8);
  const validSortFields = ['id', 'date_mouvement', 'quantite'];
  const field = validSortFields.includes(sortBy) ? sortBy : 'date_mouvement';
  const dir = sortOrder === 'ASC' ? 'ASC' : 'DESC';
  if (lastId !== null && lastId !== undefined && !isNaN(lastId) && Number(lastId) > 0) { dataQuery += ` AND m.id < ?`; dataParams.push(Number(lastId)); }
  dataQuery += ` ORDER BY m.${field} ${dir}, m.id DESC LIMIT ?`; dataParams.push(pageLimit);
  // ⭐ Le console.log a été supprimé pour éviter les logs en production
  return { dataQuery, statsQuery, dataParams, statsParams, limit: pageLimit };
}

module.exports = { buildEntreesQuery, buildSortiesQuery, buildMouvementsQuery };