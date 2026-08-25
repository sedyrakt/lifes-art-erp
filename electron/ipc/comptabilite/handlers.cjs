// electron/ipc/comptabilite/handlers.cjs
'use strict';

const { getDb } = require('../../database/connection.cjs');
const { log, error } = require('../../database/utils.cjs');

function registerComptabiliteHandlers(ipcMain) {
  if (!ipcMain) { error('❌ ipcMain null'); return false; }

  const channels = [
    'comptabilite:get-comptes',
    'comptabilite:get-compte-by-id',
    'comptabilite:create-compte',
    'comptabilite:update-compte',
    'comptabilite:delete-compte',
    'comptabilite:get-ecritures',
    'comptabilite:create-ecriture',
    'comptabilite:update-ecriture',
    'comptabilite:delete-ecriture',
    'comptabilite:get-journaux',
    'comptabilite:create-journal',
    'comptabilite:get-bilan',
    'comptabilite:get-grand-livre',
  ];

  for (const ch of channels) { try { ipcMain.removeHandler(ch); } catch (_) {} }

  // ============================================================
  // GET COMPTES
  // ============================================================
  ipcMain.handle('comptabilite:get-comptes', () => {
    try {
      const db = getDb();
      const rows = db.prepare('SELECT * FROM comptes ORDER BY numero ASC').all();
      return { success: true, data: rows };
    } catch (err) { return { success: false, error: err.message }; }
  });

  // ============================================================
  // GET COMPTE BY ID
  // ============================================================
  ipcMain.handle('comptabilite:get-compte-by-id', (event, id) => {
    try {
      const db = getDb();
      const compte = db.prepare('SELECT * FROM comptes WHERE id = ?').get(Number(id));
      if (!compte) return { success: false, error: 'Compte non trouvé' };
      return { success: true, data: compte };
    } catch (err) { return { success: false, error: err.message }; }
  });

  // ============================================================
  // CREATE COMPTE
  // ============================================================
  ipcMain.handle('comptabilite:create-compte', (event, data) => {
    try {
      const db = getDb();
      const { numero, nom, type, solde_initial = 0, description = '' } = data;
      if (!numero || !nom) return { success: false, error: 'Numéro et nom requis' };
      const existing = db.prepare('SELECT id FROM comptes WHERE numero = ?').get(numero);
      if (existing) return { success: false, error: 'Ce numéro de compte existe déjà' };
      const result = db.prepare('INSERT INTO comptes (numero, nom, type, solde_initial, description) VALUES (?, ?, ?, ?, ?)').run(numero, nom, type, solde_initial, description);
      return { success: true, data: { id: Number(result.lastInsertRowid) } };
    } catch (err) { return { success: false, error: err.message }; }
  });

  // ============================================================
  // UPDATE COMPTE
  // ============================================================
  ipcMain.handle('comptabilite:update-compte', (event, id, data) => {
    try {
      const db = getDb();
      const compteId = Number(id);
      const existing = db.prepare('SELECT * FROM comptes WHERE id = ?').get(compteId);
      if (!existing) return { success: false, error: 'Compte non trouvé' };

      const { numero, nom, type, solde_initial = 0, description = '' } = data;
      if (!numero || !nom) return { success: false, error: 'Numéro et nom requis' };

      // Vérifier si le numéro existe déjà pour un autre compte
      const duplicate = db.prepare('SELECT id FROM comptes WHERE numero = ? AND id != ?').get(numero, compteId);
      if (duplicate) return { success: false, error: 'Ce numéro de compte existe déjà' };

      const result = db.prepare(`
        UPDATE comptes 
        SET numero = ?, nom = ?, type = ?, solde_initial = ?, description = ?
        WHERE id = ?
      `).run(numero, nom, type, solde_initial, description, compteId);

      return { success: true, data: { id: compteId } };
    } catch (err) { return { success: false, error: err.message }; }
  });

  // ============================================================
  // DELETE COMPTE
  // ============================================================
  ipcMain.handle('comptabilite:delete-compte', (event, id) => {
    try {
      const db = getDb();
      const compteId = Number(id);
      const existing = db.prepare('SELECT * FROM comptes WHERE id = ?').get(compteId);
      if (!existing) return { success: false, error: 'Compte non trouvé' };

      // Supprimer les écritures liées
      db.prepare('DELETE FROM ecritures WHERE compte_id = ?').run(compteId);
      
      // Supprimer le compte
      db.prepare('DELETE FROM comptes WHERE id = ?').run(compteId);

      return { success: true, data: { id: compteId } };
    } catch (err) { return { success: false, error: err.message }; }
  });

  // ============================================================
  // GET ECRITURES
  // ============================================================
  ipcMain.handle('comptabilite:get-ecritures', (event, options = {}) => {
    try {
      const db = getDb();
      const { compteId = null, startDate = null, endDate = null } = options;
      let where = 'WHERE 1=1';
      const params = [];
      if (compteId) { where += ' AND compte_id = ?'; params.push(compteId); }
      if (startDate && endDate) { where += ' AND date(date_ecriture) BETWEEN date(?) AND date(?)'; params.push(startDate, endDate); }
      const rows = db.prepare(`SELECT * FROM ecritures ${where} ORDER BY date_ecriture DESC`).all(...params);
      return { success: true, data: rows };
    } catch (err) { return { success: false, error: err.message }; }
  });

  // ============================================================
  // CREATE ECRITURE
  // ============================================================
  ipcMain.handle('comptabilite:create-ecriture', (event, data) => {
    try {
      const db = getDb();
      const { compte_id, libelle, debit = 0, credit = 0, date_ecriture = null, reference = '' } = data;
      if (!compte_id || (!debit && !credit)) return { success: false, error: 'Compte et montant requis' };
      const result = db.prepare('INSERT INTO ecritures (compte_id, libelle, debit, credit, date_ecriture, reference) VALUES (?, ?, ?, ?, ?, ?)').run(compte_id, libelle, debit, credit, date_ecriture || new Date().toISOString(), reference);
      return { success: true, data: { id: Number(result.lastInsertRowid) } };
    } catch (err) { return { success: false, error: err.message }; }
  });

  // ============================================================
  // UPDATE ECRITURE
  // ============================================================
  ipcMain.handle('comptabilite:update-ecriture', (event, id, data) => {
    try {
      const db = getDb();
      const ecritureId = Number(id);
      const existing = db.prepare('SELECT * FROM ecritures WHERE id = ?').get(ecritureId);
      if (!existing) return { success: false, error: 'Écriture non trouvée' };

      const { compte_id, libelle, debit = 0, credit = 0, date_ecriture = null, reference = '' } = data;
      if (!compte_id || (!debit && !credit)) return { success: false, error: 'Compte et montant requis' };

      const result = db.prepare(`
        UPDATE ecritures 
        SET compte_id = ?, libelle = ?, debit = ?, credit = ?, date_ecriture = ?, reference = ?
        WHERE id = ?
      `).run(compte_id, libelle, debit, credit, date_ecriture, reference, ecritureId);

      return { success: true, data: { id: ecritureId } };
    } catch (err) { return { success: false, error: err.message }; }
  });

  // ============================================================
  // DELETE ECRITURE
  // ============================================================
  ipcMain.handle('comptabilite:delete-ecriture', (event, id) => {
    try {
      const db = getDb();
      const ecritureId = Number(id);
      const existing = db.prepare('SELECT * FROM ecritures WHERE id = ?').get(ecritureId);
      if (!existing) return { success: false, error: 'Écriture non trouvée' };

      db.prepare('DELETE FROM ecritures WHERE id = ?').run(ecritureId);
      return { success: true, data: { id: ecritureId } };
    } catch (err) { return { success: false, error: err.message }; }
  });

  // ============================================================
  // GET JOURNAUX
  // ============================================================
  ipcMain.handle('comptabilite:get-journaux', () => {
    try {
      const db = getDb();
      const rows = db.prepare('SELECT * FROM journaux ORDER BY nom ASC').all();
      return { success: true, data: rows };
    } catch (err) { return { success: false, error: err.message }; }
  });

  // ============================================================
  // CREATE JOURNAL
  // ============================================================
  ipcMain.handle('comptabilite:create-journal', (event, data) => {
    try {
      const db = getDb();
      const { code, nom, description = '' } = data;
      if (!code || !nom) return { success: false, error: 'Code et nom requis' };
      const result = db.prepare('INSERT INTO journaux (code, nom, description) VALUES (?, ?, ?)').run(code, nom, description);
      return { success: true, data: { id: Number(result.lastInsertRowid) } };
    } catch (err) { return { success: false, error: err.message }; }
  });

  // ============================================================
  // GET BILAN
  // ============================================================
  ipcMain.handle('comptabilite:get-bilan', () => {
    try {
      const db = getDb();
      const actif = db.prepare("SELECT COALESCE(SUM(solde_initial), 0) as total FROM comptes WHERE type = 'actif'").get();
      const passif = db.prepare("SELECT COALESCE(SUM(solde_initial), 0) as total FROM comptes WHERE type = 'passif'").get();
      const produits = db.prepare("SELECT COALESCE(SUM(solde_initial), 0) as total FROM comptes WHERE type = 'produit'").get();
      const charges = db.prepare("SELECT COALESCE(SUM(solde_initial), 0) as total FROM comptes WHERE type = 'charge'").get();
      return { success: true, data: { actif: actif.total, passif: passif.total, produits: produits.total, charges: charges.total } };
    } catch (err) { return { success: false, error: err.message }; }
  });

  // ============================================================
  // GET GRAND LIVRE
  // ============================================================
  ipcMain.handle('comptabilite:get-grand-livre', (event, compteId) => {
    try {
      const db = getDb();
      const compte = db.prepare('SELECT * FROM comptes WHERE id = ?').get(compteId);
      if (!compte) return { success: false, error: 'Compte non trouvé' };
      const ecritures = db.prepare('SELECT * FROM ecritures WHERE compte_id = ? ORDER BY date_ecriture ASC').all(compteId);
      return { success: true, data: { compte, ecritures } };
    } catch (err) { return { success: false, error: err.message }; }
  });

  log('✅ Comptabilité handlers enregistrés');
  return true;
}

module.exports = { registerComptabiliteHandlers };