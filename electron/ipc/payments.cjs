// ============================================================
// electron/ipc/payments.cjs - CORRIGÉ (WITH LIVE DB)
// ⭐ FIX: Nampidirina ny (event, ...args) ao amin'ny withLiveDb mba hanasaraka ny event
// ⭐ FIX: Mampiasa getDb() isaky ny handler, tsy miankina amin'ny cache
// ⭐ FIX: Mamerina `true` mba tsy hiteraka ilay "function returned false"
// ============================================================

const { getDb } = require('../database/connection.cjs');

const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
function log(...args) { if (DEBUG) console.log('[📦 payments]', ...args); }
function error(...args) { console.error('[❌ payments]', ...args); }

function withLiveDb(fn) {
  return (event, ...args) => {
    const db = getDb();
    if (!db || !db.open) {
      error('❌ [payments] Database connection is not open');
      return { success: false, error: 'Database connection is not open' };
    }
    return fn(db, ...args);
  };
}

function logAudit(db, action, paymentId, employeName, userId, details = '') {
  try {
    const stmt = db.prepare(`INSERT INTO audit_logs (action, entity, entity_id, entity_name, user_id, details, created_at) VALUES (?, 'paiement', ?, ?, ?, ?, datetime('now'))`);
    stmt.run(action, paymentId, employeName, userId, details);
  } catch (_) { /* ignore */ }
}

function columnExists(db, tableName, columnName) {
  try {
    const stmt = db.prepare(`PRAGMA table_info(${tableName})`);
    const columns = stmt.all();
    return columns.some(c => c.name === columnName);
  } catch (e) { return false; }
}

function buildPaymentsQuery(options = {}) {
  const { limit, offset, page, search, employeId, mois, annee, sort } = options;
  let query = `SELECT p.*, e.nom as employe_nom, e.prenom as employe_prenom, e.poste as employe_poste, e.salaire as salaire_base FROM paiements_employes p LEFT JOIN employes e ON p.employe_id = e.id WHERE 1=1`;
  const params = [];
  if (search && search.trim() !== '') { query += ` AND (e.nom LIKE ? OR e.prenom LIKE ? OR p.reference LIKE ?)`; const s = `%${search.trim()}%`; params.push(s, s, s); }
  if (employeId && !isNaN(parseInt(employeId))) { query += ` AND p.employe_id = ?`; params.push(parseInt(employeId)); }
  if (mois && !isNaN(parseInt(mois))) { query += ` AND p.mois = ?`; params.push(parseInt(mois)); }
  if (annee && !isNaN(parseInt(annee))) { query += ` AND p.annee = ?`; params.push(parseInt(annee)); }
  let sortField = 'p.date_paiement'; let sortDir = 'DESC';
  if (sort && sort.field) { const allowedSorts = ['p.date_paiement','p.montant','p.mois','p.annee']; if (allowedSorts.includes(sort.field)) { sortField = sort.field; sortDir = sort.direction === 'ASC' ? 'ASC' : 'DESC'; } }
  query += ` ORDER BY ${sortField} ${sortDir}`;
  let safeLimit = Math.min(Math.max(1, parseInt(limit) || 10), 100); let safeOffset = 0;
  if (page) { safeOffset = (Math.max(parseInt(page), 1) - 1) * safeLimit; } else if (offset !== undefined) { safeOffset = Math.max(0, parseInt(offset) || 0); }
  query += ` LIMIT ? OFFSET ?`; params.push(safeLimit, safeOffset);
  return { query, params };
}

function buildPaymentsCountQuery(options = {}) {
  const { search, employeId, mois, annee } = options;
  let query = `SELECT COUNT(*) as total FROM paiements_employes p LEFT JOIN employes e ON p.employe_id = e.id WHERE 1=1`;
  const params = [];
  if (search && search.trim() !== '') { query += ` AND (e.nom LIKE ? OR e.prenom LIKE ? OR p.reference LIKE ?)`; const s = `%${search.trim()}%`; params.push(s, s, s); }
  if (employeId && !isNaN(parseInt(employeId))) { query += ` AND p.employe_id = ?`; params.push(parseInt(employeId)); }
  if (mois && !isNaN(parseInt(mois))) { query += ` AND p.mois = ?`; params.push(parseInt(mois)); }
  if (annee && !isNaN(parseInt(annee))) { query += ` AND p.annee = ?`; params.push(parseInt(annee)); }
  return { query, params };
}

const registerPaymentsHandlers = (ipcMain) => {
  log('💳 ==========================================');
  log('💳 [payments.cjs] ENREGISTREMENT HANDLERS PAYMENTS');
  log('💳 ==========================================');

  if (!ipcMain) { error('❌ [payments.cjs] ipcMain est null/undefined!'); return false; }

  const channels = ['payments:get-all','payments:get-by-id','payments:create','payments:update','payments:delete','payments:get-by-employe','payments:get-by-period','payments:get-historique','payments:get-salaire-mensuel','payments:get-stats','payments:count-by-employe','payments:get-employe-stats'];
  for (const ch of channels) { try { ipcMain.removeHandler(ch); } catch (_) {} }

  ipcMain.handle('payments:get-all', withLiveDb((db, options = {}) => {
    try {
      const { query, params } = buildPaymentsQuery(options);
      const data = db.prepare(query).all(params);
      const { query: countQuery, params: countParams } = buildPaymentsCountQuery(options);
      const countResult = db.prepare(countQuery).get(countParams);
      return { success: true, data, pagination: { total: countResult?.total || 0, limit: options.limit || 10, offset: options.offset || 0 } };
    } catch (err) { error('❌ [payments:get-all] Erreur:', err.message); return { success: false, error: err.message }; }
  }));

  ipcMain.handle('payments:get-by-id', withLiveDb((db, id) => {
    try {
      if (!id || isNaN(id) || parseInt(id) <= 0) return { success: false, error: 'ID de paiement invalide' };
      const stmt = db.prepare(`SELECT p.*, e.nom as employe_nom, e.poste as employe_poste, e.salaire as salaire_base FROM paiements_employes p LEFT JOIN employes e ON p.employe_id = e.id WHERE p.id = ?`);
      const data = stmt.get(parseInt(id)); if (!data) return { success: false, error: 'Paiement non trouvé' };
      return { success: true, data };
    } catch (err) { error('❌ [payments:get-by-id] Erreur:', err.message); return { success: false, error: err.message }; }
  }));

  ipcMain.handle('payments:create', withLiveDb((db, data) => {
    try {
      const { employe_id, mois, annee, montant, mode_paiement, reference, observation } = data;
      if (!employe_id || !mois || !annee || !montant) return { success: false, error: 'Données manquantes' };
      let sql = 'INSERT INTO paiements_employes (employe_id, mois, annee, montant'; let placeholders = 'VALUES (?, ?, ?, ?'; const params = [employe_id, mois, annee, montant];
      const hasModePaiement = columnExists(db, 'paiements_employes', 'mode_paiement'); const hasReference = columnExists(db, 'paiements_employes', 'reference'); const hasObservation = columnExists(db, 'paiements_employes', 'observation');
      if (hasModePaiement) { sql += ', mode_paiement'; placeholders += ', ?'; params.push(mode_paiement || 'Espèces'); }
      if (hasReference) { sql += ', reference'; placeholders += ', ?'; params.push(reference || ''); }
      if (hasObservation) { sql += ', observation'; placeholders += ', ?'; params.push(observation || ''); }
      sql += ') ' + placeholders + ')';
      const stmt = db.prepare(sql); const result = stmt.run(...params); const paymentId = Number(result.lastInsertRowid);
      logAudit(db, 'create', paymentId, `Employé ${employe_id}`, null, `Montant: ${montant} - ${mois}/${annee}`);
      return { success: true, data: { id: paymentId } };
    } catch (err) { error('❌ [payments:create] Erreur:', err.message); return { success: false, error: err.message }; }
  }));

  ipcMain.handle('payments:update', withLiveDb((db, id, data) => {
    try {
      const paymentId = parseInt(id); if (!paymentId || isNaN(paymentId) || paymentId <= 0) return { success: false, error: 'ID de paiement invalide' };
      const { employe_id, mois, annee, montant, mode_paiement, reference, observation } = data;
      const checkStmt = db.prepare('SELECT id FROM paiements_employes WHERE id = ?'); const existing = checkStmt.get(paymentId); if (!existing) return { success: false, error: 'Paiement non trouvé' };
      let sql = 'UPDATE paiements_employes SET employe_id = ?, mois = ?, annee = ?, montant = ?'; const params = [employe_id, mois, annee, montant];
      const hasModePaiement = columnExists(db, 'paiements_employes', 'mode_paiement'); const hasReference = columnExists(db, 'paiements_employes', 'reference'); const hasObservation = columnExists(db, 'paiements_employes', 'observation');
      if (hasModePaiement) { sql += ', mode_paiement = ?'; params.push(mode_paiement || 'Espèces'); }
      if (hasReference) { sql += ', reference = ?'; params.push(reference || ''); }
      if (hasObservation) { sql += ', observation = ?'; params.push(observation || ''); }
      sql += ' WHERE id = ?'; params.push(paymentId);
      const stmt = db.prepare(sql); stmt.run(...params);
      logAudit(db, 'update', paymentId, `Employé ${employe_id}`, null, `Montant: ${montant} - ${mois}/${annee}`);
      return { success: true };
    } catch (err) { error('❌ [payments:update] Erreur:', err.message); return { success: false, error: err.message }; }
  }));

  ipcMain.handle('payments:delete', withLiveDb((db, id) => {
    try {
      const paymentId = parseInt(id); if (!paymentId || isNaN(paymentId) || paymentId <= 0) return { success: false, error: 'ID de paiement invalide' };
      const checkStmt = db.prepare('SELECT id FROM paiements_employes WHERE id = ?'); const existing = checkStmt.get(paymentId); if (!existing) return { success: false, error: 'Paiement non trouvé' };
      const stmt = db.prepare('DELETE FROM paiements_employes WHERE id = ?'); stmt.run(paymentId);
      logAudit(db, 'delete', paymentId, 'Inconnu', null, `ID: ${paymentId}`);
      return { success: true };
    } catch (err) { error('❌ [payments:delete] Erreur:', err.message); return { success: false, error: err.message }; }
  }));

  ipcMain.handle('payments:get-by-employe', withLiveDb((db, employeId) => {
    try {
      if (!employeId || isNaN(employeId) || parseInt(employeId) <= 0) return { success: false, error: 'ID employé invalide' };
      const stmt = db.prepare(`SELECT p.*, e.nom as employe_nom, e.poste as employe_poste, e.salaire as salaire_base FROM paiements_employes p LEFT JOIN employes e ON p.employe_id = e.id WHERE p.employe_id = ? ORDER BY p.date_paiement DESC`);
      return { success: true, data: stmt.all(parseInt(employeId)) };
    } catch (err) { error('❌ [payments:get-by-employe]', err.message); return { success: false, error: err.message }; }
  }));
  ipcMain.handle('payments:get-by-period', withLiveDb((db, mois, annee) => {
    try {
      if (!mois || !annee) return { success: false, error: 'Mois et année requis' };
      const stmt = db.prepare(`SELECT p.*, e.nom as employe_nom, e.poste as employe_poste, e.salaire as salaire_base FROM paiements_employes p LEFT JOIN employes e ON p.employe_id = e.id WHERE p.mois = ? AND p.annee = ? ORDER BY p.date_paiement DESC`);
      return { success: true, data: stmt.all(parseInt(mois), parseInt(annee)) };
    } catch (err) { error('❌ [payments:get-by-period]', err.message); return { success: false, error: err.message }; }
  }));
  ipcMain.handle('payments:get-historique', withLiveDb((db, employeId, mois, annee) => {
    try {
      if (!employeId || isNaN(employeId) || parseInt(employeId) <= 0) return { success: false, error: 'ID employé requis' };
      const empId = parseInt(employeId); let stmt;
      if (mois && annee) { stmt = db.prepare(`SELECT p.*, e.nom as employe_nom, e.poste as employe_poste, e.salaire as salaire_base FROM paiements_employes p LEFT JOIN employes e ON p.employe_id = e.id WHERE p.employe_id = ? AND p.mois = ? AND p.annee = ? ORDER BY p.annee DESC, p.mois DESC`); return { success: true, data: stmt.all(empId, parseInt(mois), parseInt(annee)) }; }
      else if (mois) { stmt = db.prepare(`SELECT p.*, e.nom as employe_nom, e.poste as employe_poste, e.salaire as salaire_base FROM paiements_employes p LEFT JOIN employes e ON p.employe_id = e.id WHERE p.employe_id = ? AND p.mois = ? ORDER BY p.annee DESC, p.mois DESC`); return { success: true, data: stmt.all(empId, parseInt(mois)) }; }
      else if (annee) { stmt = db.prepare(`SELECT p.*, e.nom as employe_nom, e.poste as employe_poste, e.salaire as salaire_base FROM paiements_employes p LEFT JOIN employes e ON p.employe_id = e.id WHERE p.employe_id = ? AND p.annee = ? ORDER BY p.annee DESC, p.mois DESC`); return { success: true, data: stmt.all(empId, parseInt(annee)) }; }
      else { stmt = db.prepare(`SELECT p.*, e.nom as employe_nom, e.poste as employe_poste, e.salaire as salaire_base FROM paiements_employes p LEFT JOIN employes e ON p.employe_id = e.id WHERE p.employe_id = ? ORDER BY p.annee DESC, p.mois DESC`); return { success: true, data: stmt.all(empId) }; }
    } catch (err) { error('❌ [payments:get-historique]', err.message); return { success: false, error: err.message }; }
  }));
  ipcMain.handle('payments:get-salaire-mensuel', withLiveDb((db, employeId, mois, annee) => {
    try {
      if (!employeId || !mois || !annee) return { success: false, error: 'Données manquantes' };
      const stmt = db.prepare(`SELECT SUM(montant) as total FROM paiements_employes WHERE employe_id = ? AND mois = ? AND annee = ?`);
      const result = stmt.get(parseInt(employeId), parseInt(mois), parseInt(annee));
      return { success: true, data: result?.total || 0 };
    } catch (err) { error('❌ [payments:get-salaire-mensuel]', err.message); return { success: false, error: err.message }; }
  }));
  ipcMain.handle('payments:get-stats', withLiveDb((db) => {
    try {
      const stmt = db.prepare(`SELECT COUNT(*) as total_paiements, SUM(montant) as total_montant, AVG(montant) as moyenne, MAX(montant) as max_montant, MIN(montant) as min_montant, COUNT(DISTINCT employe_id) as employes FROM paiements_employes`);
      return { success: true, data: stmt.get() };
    } catch (err) { error('❌ [payments:get-stats]', err.message); return { success: false, error: err.message }; }
  }));
  ipcMain.handle('payments:count-by-employe', withLiveDb((db, employeId) => {
    try {
      if (!employeId || isNaN(employeId) || parseInt(employeId) <= 0) return { success: false, error: 'ID employé invalide' };
      const stmt = db.prepare('SELECT COUNT(*) as count FROM paiements_employes WHERE employe_id = ?'); const result = stmt.get(parseInt(employeId));
      return { success: true, data: result?.count || 0 };
    } catch (err) { error('❌ [payments:count-by-employe]', err.message); return { success: false, error: err.message }; }
  }));
  ipcMain.handle('payments:get-employe-stats', withLiveDb((db, employeId) => {
    try {
      if (!employeId || isNaN(employeId) || parseInt(employeId) <= 0) return { success: false, error: 'ID employé invalide' };
      const stmt = db.prepare('SELECT SUM(montant) as total FROM paiements_employes WHERE employe_id = ?'); const result = stmt.get(parseInt(employeId));
      return { success: true, data: { total: result?.total || 0 } };
    } catch (err) { error('❌ [payments:get-employe-stats]', err.message); return { success: false, error: err.message }; }
  }));

  log('✅ Payments handlers enregistrés (avec withLiveDb)');
  return true; // ⭐ FIX: Mamerina true
};

module.exports = { registerPaymentsHandlers };