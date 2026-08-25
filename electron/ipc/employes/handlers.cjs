// ============================================================
// electron/ipc/employes.handlers.cjs
// ⭐ FIX: Ampiana handler getTotalSalairesPayes
// ⭐ FIX: Mamerina `true` mba tsy hiteraka ilay "function returned false"
// ============================================================

'use strict';

const { getDb } = require('../../database/connection.cjs');
const { BrowserWindow } = require('electron');
const { log, error } = require('./logger.cjs');
const { logAudit } = require('./audit.cjs');
const { VALID_STATUSES, STATUS_LABELS, normalizeStatus, validateEmploye } = require('./validation.cjs');
const { buildEmployesQuery, buildEmployesCountQuery } = require('./queries.cjs');
const { prepareStatements, getStatements } = require('./statements.cjs');

function emitEmployesChanged(data) {
  const windows = BrowserWindow.getAllWindows();
  if (!windows.length) return;
  windows.forEach(win => {
    if (!win.isDestroyed()) {
      try { win.webContents.send('employes:changed', data); } catch (err) { error('❌ emitEmployesChanged:', err.message); }
    }
  });
}

function registerEmployesHandlers(ipcMain) {
  log('👷 [employes.handlers] ENREGISTREMENT');
  if (!ipcMain) { error('❌ ipcMain null'); return false; }

  const channels = [
    'employes:get-all', 'employes:get-by-id', 'employes:create', 'employes:update',
    'employes:delete', 'employes:get-by-departement', 'employes:get-by-status',
    'employes:get-stats', 'employes:search', 'employes:bulk-delete',
    'employes:update-status', 'employes:bulk-update-status',
    'employes:get-paiement-counts-batch',
    'employes:get-total-salaires-payes', // ⭐ FIX: Nampiana
  ];
  for (const ch of channels) { try { ipcMain.removeHandler(ch); } catch (_) {} }

  const prepared = prepareStatements();
  if (!prepared) { error('❌ [employes.handlers] prepareStatements() a échoué'); return false; }
  const statements = getStatements();

  ipcMain.handle('employes:get-all', async (event, options = {}) => {
    try {
      const db = getDb(); if (!db) return { success: false, error: 'DB non disponible' };
      const { query, params } = buildEmployesQuery(options);
      const data = db.prepare(query).all(params);
      let total = 0, totalPages = 1;
      const { query: countQuery, params: countParams } = buildEmployesCountQuery(options);
      const countResult = db.prepare(countQuery).get(countParams);
      total = Number(countResult?.total || 0);
      const limit = options.limit || 50;
      totalPages = Math.ceil(total / limit);
      return { success: true, data, pagination: { total, totalPages, limit, page: options.page || 1 } };
    } catch (err) { error('❌ [employes:get-all]', err.message); return { success: false, error: err.message }; }
  });

  ipcMain.handle('employes:get-by-id', async (event, id) => {
    try {
      const data = statements.stmtGetById.get(Number(id));
      if (!data) return { success: false, error: 'Employé non trouvé' };
      data.status_label = STATUS_LABELS[data.status] || data.status;
      return { success: true, data };
    } catch (err) { return { success: false, error: err.message }; }
  });

  ipcMain.handle('employes:create', async (event, data, userId = null) => {
    try {
      const validation = validateEmploye(data);
      if (!validation.valid) return { success: false, error: validation.errors.join(', ') };
      const { nom, prenom, email, telephone, poste, departement, date_embauche, salaire, image, status } = validation.data;
      const existing = statements.stmtCheckEmail.get(email);
      if (existing) return { success: false, error: 'Cet email est déjà utilisé' };
      const result = statements.stmtCreate.run(nom, prenom, email, telephone, poste, departement, date_embauche, salaire, image, status);
      const id = Number(result.lastInsertRowid);
      const auditUser = userId || event.sender?.user?.id || null;
      if (auditUser) logAudit('create', id, `${prenom} ${nom}`, auditUser, `Poste: ${poste}`);
      emitEmployesChanged({ type: 'create', id });
      const newEmploye = statements.stmtGetById.get(id);
      if (!newEmploye) return { success: false, error: 'Erreur interne' };
      return { success: true, data: newEmploye };
    } catch (err) { return { success: false, error: err.message }; }
  });

  ipcMain.handle('employes:update', async (event, id, data, userId = null) => {
    try {
      const validation = validateEmploye(data);
      if (!validation.valid) return { success: false, error: validation.errors.join(', ') };
      const { nom, prenom, email, telephone, poste, departement, date_embauche, salaire, image, status } = validation.data;
      const existing = statements.stmtCheckEmailExcept.get(email, id);
      if (existing) return { success: false, error: 'Cet email est déjà utilisé' };
      statements.stmtUpdate.run(nom, prenom, email, telephone, poste, departement, date_embauche, salaire, image, status, id);
      const auditUser = userId || event.sender?.user?.id || null;
      if (auditUser) logAudit('update', id, `${prenom} ${nom}`, auditUser, 'Mise à jour');
      emitEmployesChanged({ type: 'update', id });
      const updated = statements.stmtGetById.get(id);
      return { success: true, data: updated };
    } catch (err) { return { success: false, error: err.message }; }
  });

  ipcMain.handle('employes:delete', async (event, id, userId = null) => {
    try {
      const existing = statements.stmtGetById.get(Number(id));
      if (!existing) return { success: false, error: 'Employé non trouvé' };
      const count = statements.stmtPaymentCount.get(id);
      statements.stmtSoftDelete.run('licencie', id);
      const auditUser = userId || event.sender?.user?.id || null;
      if (auditUser) logAudit('delete', id, `${existing.prenom} ${existing.nom}`, auditUser, count?.total > 0 ? `${count.total} paiements associés` : 'Soft delete');
      emitEmployesChanged({ type: 'delete', id });
      return { success: true, data: { id, status: 'licencie', message: count?.total > 0 ? `${count.total} paiements associés` : 'Marqué licencié' } };
    } catch (err) { return { success: false, error: err.message }; }
  });

  ipcMain.handle('employes:bulk-delete', async (event, ids, userId = null) => {
    try {
      const db = getDb();
      const safeIds = ids.slice(0, 50);
      const transaction = db.transaction(() => {
        const stmt = db.prepare('UPDATE employes SET status = ? WHERE id = ?');
        for (const id of safeIds) {
          const existing = statements.stmtGetById.get(id);
          if (existing) {
            stmt.run('licencie', id);
            const auditUser = userId || event.sender?.user?.id || null;
            if (auditUser) logAudit('bulk_delete', id, `${existing.prenom} ${existing.nom}`, auditUser, 'Suppression groupée');
          }
        }
      });
      transaction();
      emitEmployesChanged({ type: 'bulk_delete', ids: safeIds });
      return { success: true, deleted: safeIds.length };
    } catch (err) { return { success: false, error: err.message }; }
  });

  ipcMain.handle('employes:get-by-departement', async (event, departement) => {
    try {
      const data = statements.stmtGetByDepartement.all(departement, 'actif');
      return { success: true, data };
    } catch (err) { return { success: false, error: err.message }; }
  });

  ipcMain.handle('employes:get-by-status', async (event, status) => {
    try {
      const normalized = normalizeStatus(status);
      if (!VALID_STATUSES.includes(normalized)) return { success: false, error: 'Status invalide' };
      const data = statements.stmtGetByStatus.all(normalized);
      return { success: true, data };
    } catch (err) { return { success: false, error: err.message }; }
  });

  ipcMain.handle('employes:get-stats', async () => {
    try {
      if (!statements.stmtStats) return { success: false, error: 'Statements non initialisés' };
      const stats = statements.stmtStats.get();
      return { success: true, data: { total: Number(stats?.total || 0), actifs: Number(stats?.actifs || 0), en_conge: Number(stats?.en_conge || 0), inactifs: Number(stats?.inactifs || 0), licencies: Number(stats?.licencies || 0), total_salaires: Number(stats?.total_salaires || 0), salaire_moyen: Number(stats?.salaire_moyen || 0), departements: Number(stats?.departements || 0) } };
    } catch (err) { return { success: false, error: err.message }; }
  });

  ipcMain.handle('employes:search', async (event, searchTerm) => {
    try {
      const s = `%${String(searchTerm).trim()}%`;
      const data = statements.stmtSearch.all(s, s, s);
      return { success: true, data };
    } catch (err) { return { success: false, error: err.message }; }
  });

  ipcMain.handle('employes:update-status', async (event, id, status, userId = null) => {
    try {
      const normalized = normalizeStatus(status);
      if (!VALID_STATUSES.includes(normalized)) return { success: false, error: 'Status invalide' };
      const existing = statements.stmtGetById.get(id);
      if (!existing) return { success: false, error: 'Employé non trouvé' };
      statements.stmtUpdateStatus.run(normalized, id);
      const auditUser = userId || event.sender?.user?.id || null;
      if (auditUser) logAudit('status_change', id, `${existing.prenom} ${existing.nom}`, auditUser, `Nouveau statut: ${normalized}`);
      emitEmployesChanged({ type: 'update_status', id, status: normalized });
      return { success: true, data: { id, status: normalized } };
    } catch (err) { return { success: false, error: err.message }; }
  });

  ipcMain.handle('employes:bulk-update-status', async (event, ids, newStatus, userId = null) => {
    try {
      const db = getDb();
      const safeIds = ids.slice(0, 50);
      const normalized = normalizeStatus(newStatus);
      if (!VALID_STATUSES.includes(normalized)) return { success: false, error: 'Status invalide' };
      const placeholders = safeIds.map(() => '?').join(',');
      const stmt = db.prepare(`UPDATE employes SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`);
      const result = stmt.run(normalized, ...safeIds);
      const auditUser = userId || event.sender?.user?.id || null;
      safeIds.forEach(id => {
        const emp = statements.stmtGetById.get(id);
        if (emp && auditUser) logAudit('bulk_update_status', id, `${emp.prenom} ${emp.nom}`, auditUser, `Nouveau statut: ${normalized}`);
      });
      emitEmployesChanged({ type: 'bulk_update_status', ids: safeIds, status: normalized });
      return { success: true, changes: result.changes };
    } catch (err) { return { success: false, error: err.message }; }
  });

  ipcMain.handle('employes:get-paiement-counts-batch', async (event, ids) => {
    try {
      const safeIds = ids.slice(0, 50);
      if (!safeIds.length) return { success: true, data: [] };
      const placeholders = safeIds.map(() => '?').join(',');
      const stmt = getDb().prepare(`SELECT employe_id, COUNT(*) AS count FROM paiements_employes WHERE employe_id IN (${placeholders}) GROUP BY employe_id`);
      const rows = stmt.all(...safeIds);
      return { success: true, data: rows };
    } catch (err) { return { success: false, error: err.message }; }
  });

  // ⭐ FIX: Handler ho an'ny salaires PAYÉS
  ipcMain.handle('employes:get-total-salaires-payes', async (event, annee) => {
    try {
      const db = getDb();
      if (!db) return { success: false, error: 'DB non disponible' };
      
      let query = `SELECT COALESCE(SUM(montant), 0) as total FROM paiements_employes`;
      const params = [];
      if (annee) {
        query += ` WHERE strftime('%Y', date_paiement) = ?`;
        params.push(String(annee));
      }
      
      const stmt = db.prepare(query);
      const result = stmt.get(...params);
      return { success: true, data: result?.total || 0 };
    } catch (err) { return { success: false, error: err.message }; }
  });

  log('✅ [employes.handlers] Enregistrés');
  return true; // ⭐ FIX: Mamerina true
}

module.exports = { registerEmployesHandlers, emitEmployesChanged };