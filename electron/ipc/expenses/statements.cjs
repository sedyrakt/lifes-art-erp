// ============================================================
// electron/ipc/expenses/statements.cjs - CORRIGÉ
// ⭐ FIX: prepareStatements mamerina boolean
// ⭐ FIX: Jereo raha misokatra ny db
// ============================================================
'use strict';

const { getDb } = require('../../database/connection.cjs');
const { error } = require('../../database/utils.cjs');

const statementCache = new Map();

function getStatement(db, sql) {
  if (!statementCache.has(sql)) statementCache.set(sql, db.prepare(sql));
  return statementCache.get(sql);
}

function getTableColumns(db, tableName) {
  try {
    const stmt = db.prepare(`PRAGMA table_info(${tableName})`);
    return new Set(stmt.all().map(c => c.name));
  } catch (_) { return new Set(); }
}

function addColumnIfNotExists(db, tableName, columnDef) {
  const colName = columnDef.split(' ')[0];
  const cols = getTableColumns(db, tableName);
  if (!cols.has(colName)) {
    try {
      db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnDef}`);
      return true;
    } catch (err) {
      error(`❌ Erreur migration ${tableName}.${colName}:`, err.message);
      return false;
    }
  }
  return false;
}

function ensureTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS depenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categorie TEXT NOT NULL,
      description TEXT,
      montant REAL NOT NULL,
      date_depense TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  addColumnIfNotExists(db, 'depenses', 'mode_paiement TEXT DEFAULT "Espèces"');
  addColumnIfNotExists(db, 'depenses', 'reference TEXT');
  addColumnIfNotExists(db, 'depenses', 'observation TEXT');
  addColumnIfNotExists(db, 'depenses', 'fournisseur_id INTEGER');
  addColumnIfNotExists(db, 'depenses', 'fournisseur_nom TEXT');
  db.exec(`CREATE INDEX IF NOT EXISTS idx_depenses_date ON depenses(date_depense)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_depenses_categorie ON depenses(categorie)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_depenses_mode ON depenses(mode_paiement)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_depenses_fournisseur ON depenses(fournisseur_id)`);
}

function prepareStatements() {
  const db = getDb();
  if (!db || !db.open) {
    error('❌ [expenses:statements] DB indisponible');
    return false;
  }
  try {
    ensureTables(db);
    // Atao cache ny statements rehefa mila azy
    if (!statementCache.has('SELECT * FROM depenses WHERE id = ?')) {
      getStmtGetById(db);
      getStmtGetByPeriod(db);
      getStmtGetByCategory(db);
      getStmtGetByMode(db);
      getStmtGetSummaryWithDates(db);
      getStmtGetSummary(db);
      getStmtGetTopCategoriesWithDates(db);
      getStmtGetTopCategories(db);
      getStmtGetStats(db);
      getStmtDeleteById(db);
      getStmtGetByIdForBulk(db);
    }
    return true;
  } catch (err) {
    error('❌ [expenses:statements] Erreur préparation:', err.message);
    return false;
  }
}

function getStmtGetById(db) { return getStatement(db, 'SELECT * FROM depenses WHERE id = ?'); }
function getStmtGetByPeriod(db) {
  return getStatement(db, 'SELECT * FROM depenses WHERE date_depense BETWEEN ? AND ? ORDER BY date_depense');
}
function getStmtGetByCategory(db) {
  return getStatement(db, 'SELECT * FROM depenses WHERE categorie = ? ORDER BY date_depense DESC');
}
function getStmtGetByMode(db) {
  return getStatement(db, 'SELECT * FROM depenses WHERE mode_paiement = ? ORDER BY date_depense DESC');
}
function getStmtGetSummaryWithDates(db) {
  return getStatement(db, `
    SELECT COUNT(*) AS total_count, SUM(montant) AS total_amount, AVG(montant) AS average_amount,
           MAX(montant) AS max_amount, MIN(montant) AS min_amount, COUNT(DISTINCT categorie) AS categories_count
    FROM depenses WHERE date_depense BETWEEN ? AND ?
  `);
}
function getStmtGetSummary(db) {
  return getStatement(db, `
    SELECT COUNT(*) AS total_count, SUM(montant) AS total_amount, AVG(montant) AS average_amount,
           MAX(montant) AS max_amount, MIN(montant) AS min_amount, COUNT(DISTINCT categorie) AS categories_count
    FROM depenses
  `);
}
function getStmtGetTopCategoriesWithDates(db) {
  return getStatement(db, `
    SELECT categorie, COUNT(*) AS count, SUM(montant) AS total
    FROM depenses WHERE date_depense BETWEEN ? AND ?
    GROUP BY categorie ORDER BY total DESC LIMIT 5
  `);
}
function getStmtGetTopCategories(db) {
  return getStatement(db, `
    SELECT categorie, COUNT(*) AS count, SUM(montant) AS total
    FROM depenses GROUP BY categorie ORDER BY total DESC LIMIT 5
  `);
}
function getStmtGetStats(db) {
  return getStatement(db, `
    SELECT COALESCE(SUM(montant), 0) AS total, COUNT(*) AS nb, COALESCE(AVG(montant), 0) AS moyenne,
           COALESCE(MAX(montant), 0) AS plusGrande, COALESCE(MIN(montant), 0) AS plusPetite,
           COUNT(DISTINCT fournisseur_id) AS nbFournisseurs,
           COALESCE(SUM(CASE WHEN strftime('%Y-%m', date_depense) = strftime('%Y-%m', 'now') THEN montant ELSE 0 END), 0) AS mois_en_cours,
           COALESCE(SUM(CASE WHEN strftime('%Y-%m', date_depense) = strftime('%Y-%m', 'now', '-1 month') THEN montant ELSE 0 END), 0) AS mois_dernier
    FROM depenses
  `);
}
function getStmtDeleteById(db) { return getStatement(db, 'DELETE FROM depenses WHERE id = ?'); }
function getStmtGetByIdForBulk(db) { return getStatement(db, 'SELECT id, categorie, montant FROM depenses WHERE id = ?'); }
function getStmtInsertExpense(db, fields, placeholders) {
  const sql = `INSERT INTO depenses (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
  return getStatement(db, sql);
}
function getStmtUpdateExpense(db, setFields) {
  const sql = `UPDATE depenses SET ${setFields.join(', ')} WHERE id = ?`;
  return getStatement(db, sql);
}

module.exports = {
  prepareStatements,
  getStmtGetById,
  getStmtGetByPeriod,
  getStmtGetByCategory,
  getStmtGetByMode,
  getStmtGetSummaryWithDates,
  getStmtGetSummary,
  getStmtGetTopCategoriesWithDates,
  getStmtGetTopCategories,
  getStmtGetStats,
  getStmtDeleteById,
  getStmtGetByIdForBulk,
  getStmtInsertExpense,
  getStmtUpdateExpense,
  getStatement,
};