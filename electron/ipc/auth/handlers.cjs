// ============================================================
// electron/ipc/auth/handlers.cjs - COMPACT + RETURN TRUE
// ============================================================
require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const { getDb } = require('../../database/connection.cjs');
const { logSecurityEvent } = require('../../utils/logger.cjs');
const { log, error } = require('./logger.cjs');
const { normalizeEmail, normalizeRow, normalizeRows } = require('./validation.cjs');

const statementsModule = require('./statements.cjs');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) { error('❌ JWT_SECRET manquant dans .env'); throw new Error('❌ JWT_SECRET manquant dans .env'); }
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const SESSION_EXPIRY_HOURS = parseInt(process.env.SESSION_EXPIRY_HOURS) || 24;
const TWO_FACTOR_ENABLED = process.env.TWO_FACTOR_ENABLED !== 'false';
const TWO_FACTOR_WINDOW = parseInt(process.env.TWO_FACTOR_WINDOW) || 1;
const TWO_FACTOR_APP_NAME = process.env.TWO_FACTOR_APP_NAME || 'FITAIA';
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
const DUMMY_HASH = '$2b$12$5zXG5vD4qXcJ3n7dQyX1UO9YwX8rA2fB3cD5eF6gH7iJ8kL9mN0oP';

const cleanupExpiredSessions = () => {
  try {
    const result = statementsModule.stmtDeleteExpiredSessions.run();
    if (result.changes > 0) log(`✅ ${result.changes} sessions expirées supprimées`);
  } catch (err) { error('⚠️ Erreur cleanup sessions:', err.message); }
};

let cleanupInterval = null;
const startSessionCleanup = () => {
  if (cleanupInterval) clearInterval(cleanupInterval);
  cleanupInterval = setInterval(cleanupExpiredSessions, 3600000);
  log('🔄 Nettoyage des sessions programmé (toutes les heures)');
};

function withAuthDb(fn) {
  return (event, ...args) => {
    const db = getDb();
    if (!db || !db.open) { error('❌ [auth] Database connection is not open'); throw new Error('The database connection is not open'); }
    const prepared = statementsModule.prepareStatements();
    if (!prepared) throw new Error('[AUTH] prepareStatements() a échoué. Vérifiez le schéma.');
    return fn(event, ...args);
  };
}

function registerAuthHandlers(ipcMain) {
  log('🔐 =========================================='); log('🔐 [auth.handlers] ENREGISTREMENT HANDLERS AUTH'); log('🔐 ==========================================');

  if (!ipcMain) { error('❌ ipcMain est null/undefined!'); return false; }

  startSessionCleanup();

  const channels = ['auth:login','auth:logout','auth:verify-token','auth:hash-password','auth:verify-password','auth:change-password','auth:generate-2fa','auth:verify-2fa','auth:disable-2fa','auth:verify-2fa-login','auth:reset-password','auth:rehash-password','auth:get-sessions','auth:revoke-session','auth:revoke-all-sessions','auth:check-user-exists','auth:get-user'];
  for (const ch of channels) try { ipcMain.removeHandler(ch); } catch (_) {}

  ipcMain.handle('auth:login', withAuthDb(async (event, email, password, ip, userAgent) => {
    try {
      if (!statementsModule.stmtGetUserByEmail) throw new Error('Service de base de données non disponible');
      const normalizedEmail = normalizeEmail(email); const cleanPassword = password ? password.trim() : '';
      const safeIp = typeof ip === 'string' ? ip : '127.0.0.1'; const safeUserAgent = typeof userAgent === 'string' ? userAgent : 'Electron';
      log('🔍 [auth:login] Tentative de login pour:', normalizedEmail);
      const user = statementsModule.stmtGetUserByEmail.get(normalizedEmail);
      if (!user) { log('❌ [auth:login] Utilisateur non trouvé'); await bcrypt.compare(cleanPassword, DUMMY_HASH); await logSecurityEvent(normalizedEmail, 'login_failed', safeIp, safeUserAgent, 0, 'Utilisateur non trouvé'); throw new Error('Email ou mot de passe incorrect'); }
      let isValid = false; try { isValid = await bcrypt.compare(cleanPassword, user.password); } catch (err) { log(`   ❌ Erreur bcrypt.compare: ${err.message}`); }
      if (!isValid) { log('❌ [auth:login] Mot de passe incorrect'); await logSecurityEvent(normalizedEmail, 'login_failed', safeIp, safeUserAgent, 0, 'Mot de passe incorrect'); throw new Error('Email ou mot de passe incorrect'); }
      if (TWO_FACTOR_ENABLED && user.twoFactorEnabled === 1) { log('🔐 [auth:login] 2FA activé'); await logSecurityEvent(normalizedEmail, '2fa_required', safeIp, safeUserAgent, 1); return { success: true, need2FA: true, userId: user.id, message: 'Code 2FA requis' }; }
      statementsModule.stmtUpdateUserLastLogin.run(user.id);
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
      statementsModule.stmtInsertSession.run(token, user.id, expiresAt.toISOString());
      await logSecurityEvent(normalizedEmail, 'login_success', safeIp, safeUserAgent, 1);
      return { success: true, token: token, need2FA: false, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, companyName: user.companyName, phone: user.phone, image: user.image, created_at: user.created_at, twoFactorEnabled: user.twoFactorEnabled === 1 } };
    } catch (err) { error('❌ [auth:login] Erreur:', err.message); throw err; }
  }));

  ipcMain.handle('auth:logout', withAuthDb(async (event, token) => { try { if (!statementsModule.stmtDeleteSession) throw new Error('Service de base de données non disponible'); statementsModule.stmtDeleteSession.run(token); return { success: true }; } catch (err) { error('❌ [auth:logout] Erreur:', err.message); throw err; } }));
  ipcMain.handle('auth:verify-token', withAuthDb(async (event, token) => {
    try {
      if (!statementsModule.stmtGetSession || !statementsModule.stmtGetUserById) return { valid: false, message: 'Service de base de données non disponible' };
      cleanupExpiredSessions();
      const session = statementsModule.stmtGetSession.get(token);
      if (!session) return { valid: false, message: 'Session invalide' };
      if (new Date(session.expiresAt) < new Date()) { statementsModule.stmtDeleteSession.run(token); return { valid: false, message: 'Session expirée' }; }
      const decoded = jwt.verify(token, JWT_SECRET);
      if (!decoded.id || !decoded.email) { statementsModule.stmtDeleteSession.run(token); return { valid: false, message: 'Token invalide' }; }
      const user = statementsModule.stmtGetUserById.get(decoded.id);
      if (!user || user.status !== 'actif') { statementsModule.stmtDeleteSession.run(token); return { valid: false, message: 'Utilisateur invalide' }; }
      if (user.email !== decoded.email) { statementsModule.stmtDeleteSession.run(token); return { valid: false, message: 'Email mismatch' }; }
      return { valid: true, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, companyName: user.companyName, phone: user.phone, image: user.image, created_at: user.created_at, twoFactorEnabled: user.twoFactorEnabled === 1 } };
    } catch (err) { error('❌ [auth:verify-token] Erreur:', err.message); return { valid: false, message: 'Token invalide' }; }
  }));
  ipcMain.handle('auth:hash-password', withAuthDb(async (event, password) => { try { const cleanPassword = password ? password.trim() : ''; if (!cleanPassword) throw new Error('Le mot de passe est requis'); const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS); const hash = await bcrypt.hash(cleanPassword, salt); if (!hash || hash.length !== 60) throw new Error('Erreur lors du hashage'); return hash; } catch (err) { error('❌ [auth:hash-password] Erreur:', err.message); throw err; } }));
  ipcMain.handle('auth:verify-password', withAuthDb(async (event, password, hashedPassword) => { try { if (!hashedPassword || typeof hashedPassword !== 'string' || hashedPassword.length !== 60) return false; return await bcrypt.compare(password, hashedPassword); } catch (err) { error('❌ [auth:verify-password] Erreur:', err.message); return false; } }));
  ipcMain.handle('auth:change-password', withAuthDb(async (event, data) => {
    try {
      if (!statementsModule.stmtGetUserByIdWithStatus || !statementsModule.stmtUpdateUserPassword || !statementsModule.stmtDeleteSessionsByUser) throw new Error('Service de base de données non disponible');
      const userId = Number(data?.userId); const oldPassword = data?.oldPassword; const newPassword = data?.newPassword;
      if (isNaN(userId) || userId <= 0) throw new Error('ID utilisateur invalide');
      if (!oldPassword || typeof oldPassword !== 'string') throw new Error('Ancien mot de passe requis');
      if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) throw new Error('Nouveau mot de passe invalide (minimum 8 caractères)');
      const user = statementsModule.stmtGetUserByIdWithStatus.get(userId);
      if (!user) throw new Error('Utilisateur non trouvé');
      const isValid = await bcrypt.compare(oldPassword, user.password);
      if (!isValid) throw new Error('Ancien mot de passe incorrect');
      const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS); const hashedPassword = await bcrypt.hash(newPassword, salt); if (!hashedPassword) throw new Error('Erreur lors du hashage');
      statementsModule.stmtUpdateUserPassword.run(hashedPassword, userId);
      statementsModule.stmtDeleteSessionsByUser.run(userId);
      await logSecurityEvent(user.email, 'password_changed', '127.0.0.1', 'Electron', 1);
      return { success: true, message: 'Mot de passe changé avec succès' };
    } catch (err) { error('❌ [auth:change-password] Erreur:', err.message); throw err; }
  }));
  ipcMain.handle('auth:generate-2fa', withAuthDb(async (event, email) => { try { const normalizedEmail = normalizeEmail(email); const secret = speakeasy.generateSecret({ name: `${TWO_FACTOR_APP_NAME}:${normalizedEmail}`, length: 20 }); const qrCode = await QRCode.toDataURL(secret.otpauth_url); return { secret: secret.base32, qrCode, otpauthUrl: secret.otpauth_url }; } catch (err) { error('❌ [auth:generate-2fa] Erreur:', err.message); throw err; } }));
  ipcMain.handle('auth:verify-2fa', withAuthDb(async (event, userId, secret, token) => { try { const verified = speakeasy.totp.verify({ secret, encoding: 'base32', token, window: TWO_FACTOR_WINDOW }); if (verified) { if (!statementsModule.stmtUpdateUser2FA) throw new Error('Service de base de données non disponible'); statementsModule.stmtUpdateUser2FA.run(secret, userId); } return verified; } catch (err) { error('❌ [auth:verify-2fa] Erreur:', err.message); return false; } }));
  ipcMain.handle('auth:disable-2fa', withAuthDb(async (event, userId) => { try { if (!statementsModule.stmtUpdateUser2FADisable) throw new Error('Service de base de données non disponible'); statementsModule.stmtUpdateUser2FADisable.run(userId); return { success: true }; } catch (err) { error('❌ [auth:disable-2fa] Erreur:', err.message); throw err; } }));
  ipcMain.handle('auth:verify-2fa-login', withAuthDb(async (event, userId, token) => {
    try {
      if (!statementsModule.stmtGetUserById || !statementsModule.stmtGetUserByIdWithStatus || !statementsModule.stmtInsertSession) return false;
      const user = statementsModule.stmtGetUserById.get(userId);
      if (!user || !user.twoFactorSecret) return false;
      const verified = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token, window: TWO_FACTOR_WINDOW });
      if (verified) {
        const userData = statementsModule.stmtGetUserByIdWithStatus.get(userId); if (!userData) return false;
        const jwtToken = jwt.sign({ id: userData.id, email: userData.email, role: userData.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
        statementsModule.stmtInsertSession.run(jwtToken, userData.id, expiresAt.toISOString());
        return { success: true, token: jwtToken, user: { id: userData.id, email: userData.email, firstName: userData.firstName, lastName: userData.lastName, role: userData.role, companyName: userData.companyName, phone: userData.phone, image: userData.image, created_at: userData.created_at, twoFactorEnabled: userData.twoFactorEnabled === 1 } };
      }
      return false;
    } catch (err) { error('❌ [auth:verify-2fa-login] Erreur:', err.message); return false; }
  }));
  ipcMain.handle('auth:reset-password', withAuthDb(async (event, email, newPassword) => { try { if (!statementsModule.stmtGetUserByEmail || !statementsModule.stmtUpdateUserPassword || !statementsModule.stmtDeleteSessionsByUser) return { success: false, error: 'Service de base de données non disponible' }; const normalizedEmail = normalizeEmail(email); const user = statementsModule.stmtGetUserByEmail.get(normalizedEmail); if (!user) return { success: false, error: 'Utilisateur non trouvé' }; const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS); const hashedPassword = await bcrypt.hash(newPassword, salt); statementsModule.stmtUpdateUserPassword.run(hashedPassword, user.id); statementsModule.stmtDeleteSessionsByUser.run(user.id); await logSecurityEvent(normalizedEmail, 'password_reset', '127.0.0.1', 'Electron', 1); return { success: true, message: 'Mot de passe réinitialisé avec succès' }; } catch (err) { error('❌ [auth:reset-password] Erreur:', err.message); return { success: false, error: err.message }; } }));
  ipcMain.handle('auth:rehash-password', withAuthDb(async (event, email, newPassword) => { try { if (!statementsModule.stmtGetUserByEmail || !statementsModule.stmtUpdateUserPassword) return { success: false, error: 'Service de base de données non disponible' }; const user = statementsModule.stmtGetUserByEmail.get(email); if (!user) return { success: false, error: 'Utilisateur non trouvé' }; const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS); const hash = await bcrypt.hash(newPassword, salt); statementsModule.stmtUpdateUserPassword.run(hash, user.id); const testVerify = await bcrypt.compare(newPassword, hash); return { success: true, hash, verified: testVerify }; } catch (err) { error('❌ [auth:rehash] Erreur:', err.message); return { success: false, error: err.message }; } }));
  ipcMain.handle('auth:get-sessions', withAuthDb(async (event, userId) => { try { if (!statementsModule.stmtGetSessionsByUser) throw new Error('Service de base de données non disponible'); return statementsModule.stmtGetSessionsByUser.all(userId); } catch (err) { error('❌ [auth:get-sessions] Erreur:', err.message); throw err; } }));
  ipcMain.handle('auth:revoke-session', withAuthDb(async (event, token) => { try { if (!statementsModule.stmtDeleteSession) throw new Error('Service de base de données non disponible'); statementsModule.stmtDeleteSession.run(token); return { success: true }; } catch (err) { error('❌ [auth:revoke-session] Erreur:', err.message); throw err; } }));
  ipcMain.handle('auth:revoke-all-sessions', withAuthDb(async (event, userId) => { try { if (!statementsModule.stmtDeleteSessionsByUser) throw new Error('Service de base de données non disponible'); statementsModule.stmtDeleteSessionsByUser.run(userId); return { success: true }; } catch (err) { error('❌ [auth:revoke-all-sessions] Erreur:', err.message); throw err; } }));
  ipcMain.handle('auth:check-user-exists', withAuthDb(async (event, email) => { try { if (!statementsModule.stmtGetUserByEmail) return null; const normalizedEmail = normalizeEmail(email); return statementsModule.stmtGetUserByEmail.get(normalizedEmail) || null; } catch (err) { error('❌ [auth:check-user-exists] Erreur:', err.message); return null; } }));
  ipcMain.handle('auth:get-user', withAuthDb(async (event, userId) => { try { if (!statementsModule.stmtGetUserById) return null; return statementsModule.stmtGetUserById.get(userId); } catch (err) { error('❌ [auth:get-user] Erreur:', err.message); return null; } }));

  const registeredEvents = ipcMain.eventNames();
  log('📋 [auth.handlers] Vérification handlers:'); for (const ch of channels) log(`   - ${ch}: ${registeredEvents.includes(ch) ? '✅' : '❌'}`);
  log('🔐 =========================================='); log('✅ Auth handlers enregistrés avec succès (Fix password retrieval)'); log('🔐 ==========================================');
  return true; // ⭐ ZAVA-DEHIBE: Mamerina TRUE
}

module.exports = { registerAuthHandlers };