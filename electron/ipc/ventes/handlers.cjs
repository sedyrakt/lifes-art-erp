// ============================================================
// electron/ipc/ventes/handlers.cjs
// LIFE'S ART ERP - VENTES
// ⭐ CRUD COMPLET DEVIS + FACTURES
// ⭐ FIX: id / produit_id normalization
// ⭐ FIX: Mamorona Reference ho azy (DEV-XXXX / FAC-XXXX)
// ⭐ COMPACT: Nofoizina ny "saut de ligne" (line breaks)
// ============================================================
'use strict';

const { getDb } = require('../../database/connection.cjs');
const { log, error, emitVentesChanged } = require('./utils.cjs');
const { prepareStatements, getStatements } = require('./statements.cjs');

function normalizeId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizeProductDetail(detail = {}) {
  const produit_id = normalizeId(detail.produit_id ?? detail.id);
  const quantite = Number(detail.quantite);
  const prix_unitaire = Number(detail.prix_unitaire) || 0;

  if (!produit_id || !Number.isFinite(quantite) || quantite <= 0) return null;

  const total = Number.isFinite(Number(detail.total)) ? Number(detail.total) : quantite * prix_unitaire;

  return { produit_id, quantite, prix_unitaire, total };
}

function normalizeDetails(details) {
  if (!Array.isArray(details)) return [];
  return details.map(normalizeProductDetail).filter(Boolean);
}

function generateReference(db, table, prefix) {
  const countResult = db.prepare(`SELECT COUNT(*) as total FROM ${table}`).get();
  const nextNumber = (countResult?.total || 0) + 1;
  return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
}

function registerVentesHandlers(ipcMain) {
  if (!ipcMain) { error('❌ ipcMain null'); return false; }

  const channels = [
    'ventes:get-devis', 'ventes:get-devis-by-id', 'ventes:create-devis',
    'ventes:update-devis', 'ventes:delete-devis', 'ventes:get-devis-details',
    'ventes:get-factures', 'ventes:get-facture-by-id', 'ventes:create-facture',
    'ventes:update-facture', 'ventes:delete-facture', 'ventes:get-facture-details',
    'ventes:convert-devis-to-facture'
  ];

  for (const channel of channels) {
    try { ipcMain.removeHandler(channel); } catch (_) {}
  }

  if (!prepareStatements()) {
    error('❌ Impossible de préparer les statements VENTES');
    return false;
  }

  // ============================================================
  // GET DEVIS
  // ============================================================
  ipcMain.handle('ventes:get-devis', async (_event, options = {}) => {
    try {
      const db = getDb();
      const { search = '', statut = '', clientId = null } = options || {};

      let where = 'WHERE 1=1';
      const params = [];

      if (search && String(search).trim()) {
        where += ' AND (reference LIKE ? OR client_nom LIKE ?)';
        const value = `%${String(search).trim()}%`;
        params.push(value, value);
      }
      if (statut) { where += ' AND statut = ?'; params.push(statut); }
      const normalizedClientId = normalizeId(clientId);
      if (normalizedClientId) { where += ' AND client_id = ?'; params.push(normalizedClientId); }

      const rows = db.prepare(`SELECT * FROM devis ${where} ORDER BY date_devis DESC, id DESC`).all(...params);

      return { success: true, data: rows };
    } catch (err) {
      error('❌ get-devis:', err.message);
      return { success: false, error: err.message };
    }
  });

  // ============================================================
  // GET DEVIS BY ID
  // ============================================================
  ipcMain.handle('ventes:get-devis-by-id', async (_event, id) => {
    try {
      const db = getDb();
      const devisId = normalizeId(id);
      if (!devisId) return { success: false, error: 'ID devis invalide' };

      const devis = db.prepare('SELECT * FROM devis WHERE id = ?').get(devisId);
      if (!devis) return { success: false, error: 'Devis non trouvé' };

      return { success: true, data: devis };
    } catch (err) {
      error('❌ get-devis-by-id:', err.message);
      return { success: false, error: err.message };
    }
  });

  // ============================================================
  // CREATE DEVIS
  // ============================================================
  ipcMain.handle('ventes:create-devis', async (_event, data = {}) => {
    try {
      const db = getDb();
      const { client_id = null, client_nom = '', reference = '', total_ht = 0, total_ttc = 0, validite_jours = 30, observation = '', details = [] } = data || {};

      if (!String(client_nom).trim()) return { success: false, error: 'Nom du client requis' };

      const normalizedDetails = normalizeDetails(details);
      if (normalizedDetails.length === 0) return { success: false, error: 'Au moins un produit est requis' };

      let finalReference = String(reference || '').trim();
      if (!finalReference) finalReference = generateReference(db, 'devis', 'DEV');

      const stmts = getStatements();
      const transaction = db.transaction(() => {
        const result = stmts.stmtCreateDevis.run(
          normalizeId(client_id), String(client_nom).trim(), finalReference,
          Number(total_ht) || 0, Number(total_ttc) || 0, Number(validite_jours) || 30, String(observation || '').trim()
        );

        const devisId = Number(result.lastInsertRowid);
        let inserted = 0;

        for (const detail of normalizedDetails) {
          stmts.stmtInsertDevisDetail.run(devisId, detail.produit_id, detail.quantite, detail.prix_unitaire, detail.total);
          inserted++;
        }

        if (inserted === 0) throw new Error('Aucun détail produit enregistré');

        return { id: devisId, reference: finalReference, detailsCount: inserted };
      });

      const result = transaction();
      emitVentesChanged({ type: 'devis_created', id: result.id });
      log(`✅ Devis créé #${result.id} - Ref: ${finalReference} - ${result.detailsCount} produit(s)`);

      return { success: true, data: result };
    } catch (err) {
      error('❌ create-devis:', err.message);
      return { success: false, error: err.message };
    }
  });

  // ============================================================
  // GET DEVIS DETAILS
  // ============================================================
  ipcMain.handle('ventes:get-devis-details', async (_event, devisId) => {
    try {
      const db = getDb();
      const id = normalizeId(devisId);
      if (!id) return { success: false, error: 'ID devis invalide' };

      const stmts = getStatements();
      const devis = stmts.stmtGetDevisById.get(id);
      if (!devis) return { success: false, error: 'Devis non trouvé' };

      const details = stmts.stmtGetDevisDetails.all(id);
      return { success: true, data: { devis, details } };
    } catch (err) {
      error('❌ get-devis-details:', err.message);
      return { success: false, error: err.message };
    }
  });

  // ============================================================
  // GET FACTURES
  // ============================================================
  ipcMain.handle('ventes:get-factures', async (_event, options = {}) => {
    try {
      const db = getDb();
      const { search = '', statut = '', clientId = null } = options || {};

      let where = 'WHERE 1=1';
      const params = [];

      if (search && String(search).trim()) {
        where += ' AND (reference LIKE ? OR client_nom LIKE ?)';
        const value = `%${String(search).trim()}%`;
        params.push(value, value);
      }
      if (statut) { where += ' AND statut = ?'; params.push(statut); }
      const normalizedClientId = normalizeId(clientId);
      if (normalizedClientId) { where += ' AND client_id = ?'; params.push(normalizedClientId); }

      const rows = db.prepare(`SELECT * FROM factures ${where} ORDER BY date_facture DESC, id DESC`).all(...params);

      return { success: true, data: rows };
    } catch (err) {
      error('❌ get-factures:', err.message);
      return { success: false, error: err.message };
    }
  });

  // ============================================================
  // CREATE FACTURE
  // ============================================================
  ipcMain.handle('ventes:create-facture', async (_event, data = {}) => {
    try {
      const db = getDb();
      const { client_id = null, client_nom = '', reference = '', total_ht = 0, total_ttc = 0, observation = '', details = [] } = data || {};

      if (!String(client_nom).trim()) return { success: false, error: 'Nom du client requis' };

      const normalizedDetails = normalizeDetails(details);
      if (normalizedDetails.length === 0) return { success: false, error: 'Au moins un produit est requis' };

      let finalReference = String(reference || '').trim();
      if (!finalReference) finalReference = generateReference(db, 'factures', 'FAC');

      const stmts = getStatements();
      const transaction = db.transaction(() => {
        const result = stmts.stmtCreateFacture.run(
          normalizeId(client_id), String(client_nom).trim(), finalReference,
          Number(total_ht) || 0, Number(total_ttc) || 0, String(observation || '').trim()
        );

        const factureId = Number(result.lastInsertRowid);
        let inserted = 0;

        for (const detail of normalizedDetails) {
          stmts.stmtInsertFactureDetail.run(factureId, detail.produit_id, detail.quantite, detail.prix_unitaire, detail.total);
          inserted++;
        }

        for (const detail of normalizedDetails) {
          db.prepare('UPDATE produits SET quantite_stock = quantite_stock - ? WHERE id = ?').run(detail.quantite, detail.produit_id);
        }

        return { id: factureId, reference: finalReference, detailsCount: inserted };
      });

      const result = transaction();
      emitVentesChanged({ type: 'facture_created', id: result.id });
      log(`✅ Facture créée #${result.id} - Ref: ${finalReference} - ${result.detailsCount} produit(s)`);

      return { success: true, data: result };
    } catch (err) {
      error('❌ create-facture:', err.message);
      return { success: false, error: err.message };
    }
  });

  // ============================================================
  // GET FACTURE DETAILS
  // ============================================================
  ipcMain.handle('ventes:get-facture-details', async (_event, factureId) => {
    try {
      const id = normalizeId(factureId);
      if (!id) return { success: false, error: 'ID facture invalide' };

      const stmts = getStatements();
      const facture = stmts.stmtGetFactureById.get(id);
      if (!facture) return { success: false, error: 'Facture non trouvée' };

      const details = stmts.stmtGetFactureDetails.all(id);
      return { success: true, data: { facture, details } };
    } catch (err) {
      error('❌ get-facture-details:', err.message);
      return { success: false, error: err.message };
    }
  });

  // ============================================================
  // CONVERT DEVIS -> FACTURE
  // ============================================================
  ipcMain.handle('ventes:convert-devis-to-facture', async (_event, devisId) => {
    try {
      const db = getDb();
      const id = normalizeId(devisId);
      if (!id) return { success: false, error: 'ID devis invalide' };

      const stmts = getStatements();
      const devis = stmts.stmtGetDevisById.get(id);
      if (!devis) return { success: false, error: 'Devis non trouvé' };
      if (devis.statut === 'Converti') return { success: false, error: 'Ce devis a déjà été converti' };

      const details = stmts.stmtGetDevisDetails.all(id);
      if (!Array.isArray(details) || details.length === 0) return { success: false, error: 'Impossible de convertir : aucun produit dans ce devis' };

      const transaction = db.transaction(() => {
        const reference = devis.reference ? `FAC-${devis.reference}` : `FAC-${devis.id}`;
        const result = stmts.stmtCreateFacture.run(
          devis.client_id, devis.client_nom, reference,
          devis.total_ht, devis.total_ttc, devis.observation
        );

        const factureId = Number(result.lastInsertRowid);
        let inserted = 0;

        for (const detail of details) {
          const normalized = normalizeProductDetail(detail);
          if (!normalized) continue;
          stmts.stmtInsertFactureDetail.run(factureId, normalized.produit_id, normalized.quantite, normalized.prix_unitaire, normalized.total);
          inserted++;
        }

        if (inserted === 0) throw new Error('Aucun produit valide dans le devis');

        for (const detail of details) {
          const normalized = normalizeProductDetail(detail);
          if (!normalized) continue;
          db.prepare('UPDATE produits SET quantite_stock = quantite_stock - ? WHERE id = ?').run(normalized.quantite, normalized.produit_id);
        }

        db.prepare('UPDATE devis SET statut = ? WHERE id = ?').run('Converti', id);

        return { factureId, devisId: id, detailsCount: inserted };
      });

      const result = transaction();
      emitVentesChanged({ type: 'devis_converted', id, factureId: result.factureId });
      emitVentesChanged({ type: 'facture_created', id: result.factureId });
      log(`✅ Devis #${id} converti en facture #${result.factureId}`);

      return { success: true, data: result };
    } catch (err) {
      error('❌ convert-devis-to-facture:', err.message);
      return { success: false, error: err.message };
    }
  });

  // ============================================================
  // DELETE DEVIS
  // ============================================================
  ipcMain.handle('ventes:delete-devis', async (_event, id) => {
    try {
      const db = getDb();
      const devisId = normalizeId(id);
      if (!devisId) return { success: false, error: 'ID devis invalide' };

      const transaction = db.transaction(() => {
        db.prepare('DELETE FROM details_devis WHERE devis_id = ?').run(devisId);
        const result = db.prepare('DELETE FROM devis WHERE id = ?').run(devisId);
        if (result.changes === 0) throw new Error('Devis non trouvé');
      });

      transaction();
      emitVentesChanged({ type: 'devis_deleted', id: devisId });

      return { success: true };
    } catch (err) {
      error('❌ delete-devis:', err.message);
      return { success: false, error: err.message };
    }
  });

  // ============================================================
  // DELETE FACTURE
  // ============================================================
  ipcMain.handle('ventes:delete-facture', async (_event, id) => {
    try {
      const db = getDb();
      const factureId = normalizeId(id);
      if (!factureId) return { success: false, error: 'ID facture invalide' };

      const transaction = db.transaction(() => {
        db.prepare('DELETE FROM details_factures WHERE facture_id = ?').run(factureId);
        const result = db.prepare('DELETE FROM factures WHERE id = ?').run(factureId);
        if (result.changes === 0) throw new Error('Facture non trouvée');
      });

      transaction();
      emitVentesChanged({ type: 'facture_deleted', id: factureId });

      return { success: true };
    } catch (err) {
      error('❌ delete-facture:', err.message);
      return { success: false, error: err.message };
    }
  });

  // ============================================================
  // UPDATE DEVIS
  // ============================================================
  ipcMain.handle('ventes:update-devis', async (_event, id, data = {}) => {
    try {
      const db = getDb();
      const devisId = normalizeId(id);
      if (!devisId) return { success: false, error: 'ID devis invalide' };

      const existing = db.prepare('SELECT * FROM devis WHERE id = ?').get(devisId);
      if (!existing) return { success: false, error: 'Devis non trouvé' };

      const { client_id = null, client_nom = '', reference = '', total_ht = 0, total_ttc = 0, validite_jours = 30, observation = '', details = [] } = data || {};

      if (!String(client_nom).trim()) return { success: false, error: 'Nom du client requis' };

      let finalReference = String(reference || '').trim();
      if (!finalReference) finalReference = existing.reference;

      const normalizedDetails = normalizeDetails(details);
      const stmts = getStatements();

      const transaction = db.transaction(() => {
        stmts.stmtUpdateDevis.run(
          normalizeId(client_id), String(client_nom).trim(), finalReference,
          Number(total_ht) || 0, Number(total_ttc) || 0, Number(validite_jours) || 30, String(observation || '').trim(), devisId
        );
        stmts.stmtDeleteDevisDetails.run(devisId);

        for (const detail of normalizedDetails) {
          stmts.stmtInsertDevisDetail.run(devisId, detail.produit_id, detail.quantite, detail.prix_unitaire, detail.total);
        }

        return { id: devisId, reference: finalReference, detailsCount: normalizedDetails.length };
      });

      const result = transaction();
      emitVentesChanged({ type: 'devis_updated', id: devisId });

      return { success: true, data: result };
    } catch (err) {
      error('❌ update-devis:', err.message);
      return { success: false, error: err.message };
    }
  });

  // ============================================================
  // UPDATE FACTURE
  // ============================================================
  ipcMain.handle('ventes:update-facture', async (_event, id, data = {}) => {
    try {
      const db = getDb();
      const factureId = normalizeId(id);
      if (!factureId) return { success: false, error: 'ID facture invalide' };

      const existing = db.prepare('SELECT * FROM factures WHERE id = ?').get(factureId);
      if (!existing) return { success: false, error: 'Facture non trouvée' };

      const { client_id = null, client_nom = '', reference = '', total_ht = 0, total_ttc = 0, observation = '', details = [] } = data || {};

      if (!String(client_nom).trim()) return { success: false, error: 'Nom du client requis' };

      let finalReference = String(reference || '').trim();
      if (!finalReference) finalReference = existing.reference;

      const normalizedDetails = normalizeDetails(details);
      const stmts = getStatements();

      const transaction = db.transaction(() => {
        stmts.stmtUpdateFacture.run(
          normalizeId(client_id), String(client_nom).trim(), finalReference,
          Number(total_ht) || 0, Number(total_ttc) || 0, String(observation || '').trim(), factureId
        );
        stmts.stmtDeleteFactureDetails.run(factureId);

        for (const detail of normalizedDetails) {
          stmts.stmtInsertFactureDetail.run(factureId, detail.produit_id, detail.quantite, detail.prix_unitaire, detail.total);
        }

        return { id: factureId, reference: finalReference, detailsCount: normalizedDetails.length };
      });

      const result = transaction();
      emitVentesChanged({ type: 'facture_updated', id: factureId });

      return { success: true, data: result };
    } catch (err) {
      error('❌ update-facture:', err.message);
      return { success: false, error: err.message };
    }
  });

  log('✅ Ventes handlers enregistrés');
  return true;
}

module.exports = { registerVentesHandlers };