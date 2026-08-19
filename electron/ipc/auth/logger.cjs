// ============================================================
// electron/ipc/auth/logger.cjs - LOGGING
// ============================================================

const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

function log(...args) {
  if (DEBUG) console.log('[🔐 auth]', ...args);
}

function error(...args) {
  console.error('[❌ auth]', ...args);
}

module.exports = { log, error, DEBUG };