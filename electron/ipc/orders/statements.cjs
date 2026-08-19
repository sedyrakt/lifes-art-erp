'use strict';
const { getDb } = require('../../database/connection.cjs');
const { log, error } = require('../../database/utils.cjs');

let stmtGetById = null, stmtCreate = null, stmtUpdate = null, stmtDelete = null;
let stmtGetDetails = null, stmtGetWithProduct = null, stmtGetProducts = null;
let stmtGetByClient = null, stmtGetByStatus = null, stmtGetByDateRange = null;
let stmtGetStats = null, stmtGetTotal = null, stmtGetJournalieres = null;
let stmtUpdateStatus = null;
let stmtInsertDetail = null, stmtInsertMouvement = null, stmtInsertMouvementRestore = null;
let stmtUpdateStock = null, stmtRestoreStock = null, stmtCheckStock = null;
let stmtGetProduitForStatut = null, stmtUpdateStatutStock = null;
let stmtGetDetailsForRestore = null, stmtDeleteDetails = null;
let stmtMarkStockRestored = null;

function prepareStatements() {
  try {
    const db = getDb();
    if (!db) { error('❌ [orders.statements] DB indisponible'); return false; }
    log('📦 [orders.statements] Préparation...');

    // COMMANDES
    stmtGetById = db.prepare(`SELECT id, client_id, client_nom, total_ht, total_ttc, total, statut, date_commande, created_at, stock_restaure FROM commandes WHERE id = ?`);
    stmtCreate = db.prepare(`INSERT INTO commandes (client_id, client_nom, total_ht, total_ttc, total, statut) VALUES (?, ?, ?, ?, ?, ?)`);
    stmtUpdate = db.prepare(`UPDATE commandes SET client_id = ?, client_nom = ?, total_ht = ?, total_ttc = ?, total = ?, statut = ? WHERE id = ?`);
    stmtDelete = db.prepare(`DELETE FROM commandes WHERE id = ?`);

    // DETAILS
    stmtInsertDetail = db.prepare(`INSERT INTO details_commandes (commande_id, produit_id, quantite, prix_unitaire, total) VALUES (?, ?, ?, ?, ?)`);
    
    // ⭐ FIX: Nampidirina ny p.image AS produit_image
    stmtGetDetails = db.prepare(`SELECT d.id, d.produit_id, d.quantite, d.prix_unitaire, d.total, p.nom AS produit_nom, p.code AS produit_code, p.image AS produit_image FROM details_commandes d LEFT JOIN produits p ON p.id = d.produit_id WHERE d.commande_id = ? ORDER BY d.id ASC`);
    stmtGetWithProduct = stmtGetDetails;
    
    // ⭐ FIX: Nampidirina ny p.image AS produit_image ho an'ny products
    stmtGetProducts = db.prepare(`SELECT d.produit_id, p.nom AS produit_nom, p.code AS produit_code, d.quantite, d.prix_unitaire, d.total AS total_ligne, p.image AS produit_image FROM details_commandes d LEFT JOIN produits p ON p.id = d.produit_id WHERE d.commande_id = ? ORDER BY d.id ASC`);

    // FILTRES
    stmtGetByClient = db.prepare(`SELECT id, client_id, client_nom, total_ht, total_ttc, total, statut, date_commande FROM commandes WHERE client_nom LIKE ? ORDER BY id DESC LIMIT 200`);
    stmtGetByStatus = db.prepare(`SELECT id, client_id, client_nom, total_ht, total_ttc, total, statut, date_commande FROM commandes WHERE statut = ? ORDER BY id DESC LIMIT 200`);
    stmtGetByDateRange = db.prepare(`SELECT id, client_id, client_nom, total_ht, total_ttc, total, statut, date_commande FROM commandes WHERE date_commande >= ? AND date_commande < ? ORDER BY id DESC LIMIT 500`);

    // STATS
    stmtGetStats = db.prepare(`SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN statut = 'En attente' THEN 1 ELSE 0 END),0) AS en_attente, COALESCE(SUM(CASE WHEN statut = 'Confirmée' THEN 1 ELSE 0 END),0) AS confirmees, COALESCE(SUM(CASE WHEN statut = 'Livrée' THEN 1 ELSE 0 END),0) AS livrees, COALESCE(SUM(CASE WHEN statut = 'Annulée' THEN 1 ELSE 0 END),0) AS annulees, COALESCE(SUM(CASE WHEN statut != 'Annulée' THEN total_ttc ELSE 0 END),0) AS total_ca, COALESCE(SUM(CASE WHEN statut != 'Annulée' THEN total_ht ELSE 0 END),0) AS total_ht, COALESCE(SUM(CASE WHEN statut != 'Annulée' THEN 1 ELSE 0 END),0) AS total_commandes, COALESCE((SELECT SUM(d.quantite) FROM details_commandes d INNER JOIN commandes c2 ON c2.id = d.commande_id WHERE c2.statut != 'Annulée'),0) AS total_articles FROM commandes`);
    stmtGetTotal = db.prepare(`SELECT COALESCE(SUM(total_ht),0) AS total_ht, COALESCE(SUM(total_ttc),0) AS total_ttc FROM commandes WHERE id = ?`);
    stmtGetJournalieres = db.prepare(`SELECT substr(date_commande,1,10) AS jour, COUNT(*) AS nombre, COALESCE(SUM(total_ttc),0) AS total FROM commandes WHERE date_commande >= ? AND date_commande < ? GROUP BY substr(date_commande,1,10) ORDER BY jour DESC`);

    // STATUS
    stmtUpdateStatus = db.prepare(`UPDATE commandes SET statut = ? WHERE id = ?`);

    // STOCK
    stmtCheckStock = db.prepare(`SELECT id, nom, quantite_stock, quantite_minimale FROM produits WHERE id = ?`);
    stmtUpdateStock = db.prepare(`UPDATE produits SET quantite_stock = quantite_stock - ? WHERE id = ? AND quantite_stock >= ?`);
    stmtRestoreStock = db.prepare(`UPDATE produits SET quantite_stock = quantite_stock + ? WHERE id = ?`);

    // STOCK STATUS
    stmtGetProduitForStatut = db.prepare(`SELECT id, quantite_stock, quantite_minimale FROM produits WHERE id = ?`);
    stmtUpdateStatutStock = db.prepare(`UPDATE produits SET statut_stock = CASE WHEN quantite_stock <= 0 THEN 'rupture' WHEN quantite_stock <= quantite_minimale THEN 'alerte' ELSE 'disponible' END WHERE id = ?`);

    // MOUVEMENTS
    stmtInsertMouvement = db.prepare(`INSERT INTO mouvements_stock (produit_id, type_mouvement, quantite, ancien_stock, nouveau_stock, reference, observation, created_by) VALUES (?, 'SORTIE', ?, ?, ?, ?, ?, ?)`);
    stmtInsertMouvementRestore = db.prepare(`INSERT INTO mouvements_stock (produit_id, type_mouvement, quantite, ancien_stock, nouveau_stock, reference, observation, created_by) VALUES (?, 'ENTREE', ?, ?, ?, ?, ?, ?)`);

    // RESTORE
    stmtGetDetailsForRestore = db.prepare(`SELECT produit_id, quantite FROM details_commandes WHERE commande_id = ? ORDER BY id ASC`);
    stmtDeleteDetails = db.prepare(`DELETE FROM details_commandes WHERE commande_id = ?`);
    stmtMarkStockRestored = db.prepare(`UPDATE commandes SET stock_restaure = 1 WHERE id = ?`);

    log('✅ [orders.statements] Statements préparés');
    return true;
  } catch (err) { error('❌ [orders.statements] Erreur:', err.message); return false; }
}

function getStatements() {
  if (!stmtCreate) throw new Error('Statements non préparés.');
  return { stmtGetById, stmtCreate, stmtUpdate, stmtDelete, stmtGetDetails, stmtGetWithProduct, stmtGetProducts, stmtGetByClient, stmtGetByStatus, stmtGetByDateRange, stmtGetStats, stmtGetTotal, stmtGetJournalieres, stmtUpdateStatus, stmtInsertDetail, stmtInsertMouvement, stmtInsertMouvementRestore, stmtUpdateStock, stmtRestoreStock, stmtCheckStock, stmtGetProduitForStatut, stmtUpdateStatutStock, stmtGetDetailsForRestore, stmtDeleteDetails, stmtMarkStockRestored };
}

module.exports = { prepareStatements, getStatements };