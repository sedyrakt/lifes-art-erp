// ============================================================
// electron/ipc/users/logger.cjs - LOGGING
// ============================================================

const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

function log(...args) {
  if (DEBUG) console.log('[👥 users]', ...args);
}

function error(...args) {
  console.error('[❌ users]', ...args);
}

module.exports = { log, error, DEBUG };