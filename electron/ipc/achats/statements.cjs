'use strict';

const { getDb } = require('../../database/connection.cjs');
const { log, error } = require('./utils.cjs');

let stmtGetById = null;
let stmtCreate = null;
let stmtUpdate = null;
let stmtDelete = null;
let stmtGetDetails = null;
let stmtInsertDetail = null;
let stmtDeleteDetails = null;
let stmtCheckProduit = null;
let stmtCountProduits = null;

function prepareStatements() {
  try {
    const db = getDb();

    if (!db || !db.open) {
      error('❌ [achats.statements] DB indisponible');
      return false;
    }

    log('🛒 [achats.statements] Préparation...');

    const achatsColumns = db.prepare(`PRAGMA table_info(achats)`).all();
    const achatsColumnNames = achatsColumns.map(c => c.name);
    log('📋 Colonnes achats:', achatsColumnNames.join(', '));

    const hasReference = achatsColumnNames.includes('reference');
    const hasFournisseurId = achatsColumnNames.includes('fournisseur_id');
    const hasDateAchat = achatsColumnNames.includes('date_achat');
    const hasTotalHt = achatsColumnNames.includes('total_ht');
    const hasTotalTtc = achatsColumnNames.includes('total_ttc');
    const hasDesignation = achatsColumnNames.includes('designation');
    const hasNombreProduits = achatsColumnNames.includes('nombre_produits');
    const hasStatut = achatsColumnNames.includes('statut');
    const hasObservation = achatsColumnNames.includes('observation');
    const hasUpdatedAt = achatsColumnNames.includes('updated_at');

    if (!hasFournisseurId || !hasDateAchat || !hasTotalHt || !hasTotalTtc) {
      error('❌ [achats.statements] Colonnes obligatoires manquantes dans achats');
      return false;
    }

    // GET BY ID
    stmtGetById = db.prepare(`
      SELECT
        a.id,
        ${hasReference ? 'a.reference,' : "'' AS reference,"}
        a.fournisseur_id,
        a.date_achat,
        a.total_ht,
        a.total_ttc,
        ${hasDesignation ? 'a.designation,' : "'' AS designation,"}
        ${hasNombreProduits ? 'a.nombre_produits,' : '0 AS nombre_produits,'}
        ${hasStatut ? 'a.statut,' : "'En attente' AS statut,"}
        ${hasObservation ? 'a.observation,' : "'' AS observation,"}
        a.created_at,
        ${hasUpdatedAt ? 'a.updated_at,' : 'a.created_at AS updated_at,'}
        COALESCE(f.nom, 'Aucun fournisseur') AS fournisseur_nom
      FROM achats a
      LEFT JOIN fournisseurs f ON f.id = a.fournisseur_id
      WHERE a.id = ?
    `);

    // CREATE
    const createColumns = [];
    const createPlaceholders = [];
    
    if (hasFournisseurId) { createColumns.push('fournisseur_id'); createPlaceholders.push('?'); }
    if (hasReference) { createColumns.push('reference'); createPlaceholders.push('?'); }
    if (hasDateAchat) { createColumns.push('date_achat'); createPlaceholders.push('?'); }
    if (hasTotalHt) { createColumns.push('total_ht'); createPlaceholders.push('?'); }
    if (hasTotalTtc) { createColumns.push('total_ttc'); createPlaceholders.push('?'); }
    if (hasDesignation) { createColumns.push('designation'); createPlaceholders.push('?'); }
    if (hasNombreProduits) { createColumns.push('nombre_produits'); createPlaceholders.push('?'); }
    if (hasStatut) { createColumns.push('statut'); createPlaceholders.push('?'); }
    if (hasObservation) { createColumns.push('observation'); createPlaceholders.push('?'); }

    stmtCreate = db.prepare(`
      INSERT INTO achats (${createColumns.join(', ')})
      VALUES (${createPlaceholders.join(', ')})
    `);

    // UPDATE - TSY MISY updated_at = datetime('now') Mba tsy hisy olana amin'ny parametres
    const updateSet = [];
    if (hasFournisseurId) updateSet.push('fournisseur_id = ?');
    if (hasReference) updateSet.push('reference = ?');
    if (hasDateAchat) updateSet.push('date_achat = ?');
    if (hasTotalHt) updateSet.push('total_ht = ?');
    if (hasTotalTtc) updateSet.push('total_ttc = ?');
    if (hasDesignation) updateSet.push('designation = ?');
    if (hasNombreProduits) updateSet.push('nombre_produits = ?');
    if (hasStatut) updateSet.push('statut = ?');
    if (hasObservation) updateSet.push('observation = ?');

    stmtUpdate = db.prepare(`
      UPDATE achats SET
        ${updateSet.join(', ')}
      WHERE id = ?
    `);

    // DELETE
    stmtDelete = db.prepare(`
      DELETE FROM achats WHERE id = ?
    `);

    // INSERT DETAIL
    stmtInsertDetail = db.prepare(`
      INSERT INTO details_achats (
        achat_id,
        produit_id,
        quantite,
        prix_unitaire,
        total
      )
      VALUES (?, ?, ?, ?, ?)
    `);

    // DELETE DETAILS
    stmtDeleteDetails = db.prepare(`
      DELETE FROM details_achats
      WHERE achat_id = ?
    `);

    // CHECK PRODUIT
    stmtCheckProduit = db.prepare(`
      SELECT
        id,
        nom,
        quantite_stock,
        prix_achat
      FROM produits
      WHERE id = ?
    `);

    // GET DETAILS
    stmtGetDetails = db.prepare(`
      SELECT
        d.id,
        d.achat_id,
        d.produit_id,
        d.quantite,
        d.prix_unitaire,
        d.total,
        p.nom AS produit_nom,
        p.code AS produit_code,
        p.image AS produit_image
      FROM details_achats d
      LEFT JOIN produits p ON p.id = d.produit_id
      WHERE d.achat_id = ?
      ORDER BY d.id ASC
    `);

    // COUNT PRODUITS
    stmtCountProduits = db.prepare(`
      SELECT COUNT(*) AS total
      FROM details_achats
      WHERE achat_id = ?
    `);

    log('✅ [achats.statements] Statements préparés');
    return true;

  } catch (err) {
    error('❌ [achats.statements] Erreur:', err.message);
    if (err.stack) error(err.stack);

    stmtGetById = null;
    stmtCreate = null;
    stmtUpdate = null;
    stmtDelete = null;
    stmtGetDetails = null;
    stmtInsertDetail = null;
    stmtDeleteDetails = null;
    stmtCheckProduit = null;
    stmtCountProduits = null;

    return false;
  }
}

function getStatements() {
  if (
    !stmtGetById ||
    !stmtCreate ||
    !stmtUpdate ||
    !stmtDelete ||
    !stmtGetDetails ||
    !stmtInsertDetail ||
    !stmtDeleteDetails ||
    !stmtCheckProduit
  ) {
    throw new Error('Statements ACHATS non préparés.');
  }

  return {
    stmtGetById,
    stmtCreate,
    stmtUpdate,
    stmtDelete,
    stmtGetDetails,
    stmtInsertDetail,
    stmtDeleteDetails,
    stmtCheckProduit,
    stmtCountProduits
  };
}

module.exports = {
  prepareStatements,
  getStatements
};