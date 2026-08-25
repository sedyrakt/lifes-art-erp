// ============================================================
// electron/ipc/ventes/statements.cjs
// LIFE'S ART ERP - VENTES
// ⭐ COMPACT - NOFOIZINA NY LINE BREAKS
// ============================================================
'use strict';

const { getDb } = require('../../database/connection.cjs');
const { log, error } = require('./utils.cjs');

let stmtGetDevisById = null;
let stmtGetDevisDetails = null;
let stmtCreateDevis = null;
let stmtUpdateDevis = null;
let stmtDeleteDevis = null;
let stmtDeleteDevisDetails = null;
let stmtInsertDevisDetail = null;

let stmtGetFactureById = null;
let stmtGetFactureDetails = null;
let stmtCreateFacture = null;
let stmtUpdateFacture = null;
let stmtDeleteFacture = null;
let stmtDeleteFactureDetails = null;
let stmtInsertFactureDetail = null;

function prepareStatements() {
  try {
    const db = getDb();
    if (!db || !db.open) {
      error('❌ [ventes.statements] DB indisponible');
      return false;
    }

    log('🛒 [ventes.statements] Préparation...');

    // ==========================================================
    // DEVIS
    // ==========================================================

    stmtGetDevisById = db.prepare(`SELECT * FROM devis WHERE id = ?`);

    stmtGetDevisDetails = db.prepare(`
      SELECT d.*, p.nom AS produit_nom, p.code AS produit_code, p.image AS produit_image
      FROM details_devis d
      LEFT JOIN produits p ON p.id = d.produit_id
      WHERE d.devis_id = ?
      ORDER BY d.id ASC
    `);

    stmtCreateDevis = db.prepare(`
      INSERT INTO devis (client_id, client_nom, reference, total_ht, total_ttc, validite_jours, observation)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmtUpdateDevis = db.prepare(`
      UPDATE devis
      SET client_id = ?, client_nom = ?, reference = ?, total_ht = ?, total_ttc = ?, validite_jours = ?, observation = ?
      WHERE id = ?
    `);

    stmtDeleteDevis = db.prepare(`DELETE FROM devis WHERE id = ?`);
    stmtDeleteDevisDetails = db.prepare(`DELETE FROM details_devis WHERE devis_id = ?`);
    stmtInsertDevisDetail = db.prepare(`
      INSERT INTO details_devis (devis_id, produit_id, quantite, prix_unitaire, total)
      VALUES (?, ?, ?, ?, ?)
    `);

    // ==========================================================
    // FACTURES
    // ==========================================================

    stmtGetFactureById = db.prepare(`SELECT * FROM factures WHERE id = ?`);

    stmtGetFactureDetails = db.prepare(`
      SELECT d.*, p.nom AS produit_nom, p.code AS produit_code, p.image AS produit_image
      FROM details_factures d
      LEFT JOIN produits p ON p.id = d.produit_id
      WHERE d.facture_id = ?
      ORDER BY d.id ASC
    `);

    stmtCreateFacture = db.prepare(`
      INSERT INTO factures (client_id, client_nom, reference, total_ht, total_ttc, observation)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmtUpdateFacture = db.prepare(`
      UPDATE factures
      SET client_id = ?, client_nom = ?, reference = ?, total_ht = ?, total_ttc = ?, observation = ?
      WHERE id = ?
    `);

    stmtDeleteFacture = db.prepare(`DELETE FROM factures WHERE id = ?`);
    stmtDeleteFactureDetails = db.prepare(`DELETE FROM details_factures WHERE facture_id = ?`);
    stmtInsertFactureDetail = db.prepare(`
      INSERT INTO details_factures (facture_id, produit_id, quantite, prix_unitaire, total)
      VALUES (?, ?, ?, ?, ?)
    `);

    log('✅ [ventes.statements] Statements préparés');
    return true;
  } catch (err) {
    error('❌ [ventes.statements] Erreur:', err.message);

    stmtGetDevisById = null;
    stmtGetDevisDetails = null;
    stmtCreateDevis = null;
    stmtUpdateDevis = null;
    stmtDeleteDevis = null;
    stmtDeleteDevisDetails = null;
    stmtInsertDevisDetail = null;

    stmtGetFactureById = null;
    stmtGetFactureDetails = null;
    stmtCreateFacture = null;
    stmtUpdateFacture = null;
    stmtDeleteFacture = null;
    stmtDeleteFactureDetails = null;
    stmtInsertFactureDetail = null;

    return false;
  }
}

function getStatements() {
  if (
    !stmtGetDevisById || !stmtGetDevisDetails || !stmtCreateDevis || !stmtUpdateDevis ||
    !stmtDeleteDevis || !stmtDeleteDevisDetails || !stmtInsertDevisDetail ||
    !stmtGetFactureById || !stmtGetFactureDetails || !stmtCreateFacture || !stmtUpdateFacture ||
    !stmtDeleteFacture || !stmtDeleteFactureDetails || !stmtInsertFactureDetail
  ) {
    throw new Error('Statements VENTES non préparés.');
  }

  return {
    stmtGetDevisById,
    stmtGetDevisDetails,
    stmtCreateDevis,
    stmtUpdateDevis,
    stmtDeleteDevis,
    stmtDeleteDevisDetails,
    stmtInsertDevisDetail,
    stmtGetFactureById,
    stmtGetFactureDetails,
    stmtCreateFacture,
    stmtUpdateFacture,
    stmtDeleteFacture,
    stmtDeleteFactureDetails,
    stmtInsertFactureDetail,
  };
}

module.exports = {
  prepareStatements,
  getStatements,
};