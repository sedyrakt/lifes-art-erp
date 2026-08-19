// ============================================================
// electron/ipc/auth/statements.cjs - CORRIGÉ
// ⭐ prepareStatements() retourne maintenant true/false
// ============================================================

const { getDb } = require('../../database/connection.cjs');
const { log, error } = require('./logger.cjs');

let stmtGetUserByEmail = null;
let stmtGetUserById = null;
let stmtGetUserByIdWithStatus = null;
let stmtGetSession = null;
let stmtInsertSession = null;
let stmtDeleteSession = null;
let stmtDeleteSessionsByUser = null;
let stmtDeleteExpiredSessions = null;
let stmtGetSessionsByUser = null;
let stmtUpdateUserLastLogin = null;
let stmtUpdateUserPassword = null;
let stmtUpdateUser2FA = null;
let stmtUpdateUser2FADisable = null;

function prepareStatements() {
  const db = getDb();
  if (!db) {
    error('❌ [auth:statements] La base de données est indisponible');
    return false;
  }

  try {
    // Vérifier que la table utilisateurs existe
    const tableCheck = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='utilisateurs'"
    ).get();
    if (!tableCheck) {
      error('❌ [auth:statements] La table utilisateurs n\'existe pas');
      return false;
    }

    // Vérifier que la table sessions existe
    const sessionCheck = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'"
    ).get();
    if (!sessionCheck) {
      error('❌ [auth:statements] La table sessions n\'existe pas');
      return false;
    }

    // Préparer les statements
    stmtGetUserByEmail = db.prepare(
      "SELECT * FROM utilisateurs WHERE email = ? AND status = 'actif'"
    );
    stmtGetUserById = db.prepare(
      "SELECT id, email, firstName, lastName, role, companyName, phone, image, created_at, twoFactorEnabled, status FROM utilisateurs WHERE id = ?"
    );
    stmtGetUserByIdWithStatus = db.prepare(
      "SELECT * FROM utilisateurs WHERE id = ? AND status = 'actif'"
    );
    stmtGetSession = db.prepare('SELECT * FROM sessions WHERE token = ?');
    stmtInsertSession = db.prepare(
      'INSERT INTO sessions (token, userId, expiresAt) VALUES (?, ?, ?)'
    );
    stmtDeleteSession = db.prepare('DELETE FROM sessions WHERE token = ?');
    stmtDeleteSessionsByUser = db.prepare('DELETE FROM sessions WHERE userId = ?');
    stmtDeleteExpiredSessions = db.prepare(
      "DELETE FROM sessions WHERE expiresAt < datetime('now')"
    );
    stmtGetSessionsByUser = db.prepare(
      "SELECT * FROM sessions WHERE userId = ? AND expiresAt > datetime('now') ORDER BY createdAt DESC"
    );
    stmtUpdateUserLastLogin = db.prepare(
      "UPDATE utilisateurs SET loginAttempts = 0, lockedUntil = NULL, lastLogin = datetime('now') WHERE id = ?"
    );
    stmtUpdateUserPassword = db.prepare(
      "UPDATE utilisateurs SET password = ?, updated_at = datetime('now') WHERE id = ?"
    );
    stmtUpdateUser2FA = db.prepare(
      'UPDATE utilisateurs SET twoFactorSecret = ?, twoFactorEnabled = 1 WHERE id = ?'
    );
    stmtUpdateUser2FADisable = db.prepare(
      'UPDATE utilisateurs SET twoFactorSecret = NULL, twoFactorEnabled = 0 WHERE id = ?'
    );

    log('✅ [auth:statements] Tous les statements préparés avec succès');
    return true;
  } catch (err) {
    error('❌ [auth:statements] Erreur lors de la préparation:', err.message);
    return false;
  }
}

// Exports des getters
module.exports = {
  prepareStatements,
  get stmtGetUserByEmail() { return stmtGetUserByEmail; },
  get stmtGetUserById() { return stmtGetUserById; },
  get stmtGetUserByIdWithStatus() { return stmtGetUserByIdWithStatus; },
  get stmtGetSession() { return stmtGetSession; },
  get stmtInsertSession() { return stmtInsertSession; },
  get stmtDeleteSession() { return stmtDeleteSession; },
  get stmtDeleteSessionsByUser() { return stmtDeleteSessionsByUser; },
  get stmtDeleteExpiredSessions() { return stmtDeleteExpiredSessions; },
  get stmtGetSessionsByUser() { return stmtGetSessionsByUser; },
  get stmtUpdateUserLastLogin() { return stmtUpdateUserLastLogin; },
  get stmtUpdateUserPassword() { return stmtUpdateUserPassword; },
  get stmtUpdateUser2FA() { return stmtUpdateUser2FA; },
  get stmtUpdateUser2FADisable() { return stmtUpdateUser2FADisable; },
};