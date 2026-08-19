// ============================================================
// electron/ipc/fournisseurs/logger.cjs - LOGGING
// ============================================================

const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

function log(...args) {
  if (DEBUG) console.log('[🏭 fournisseurs]', ...args);
}

function error(...args) {
  console.error('[❌ fournisseurs]', ...args);
}

module.exports = { log, error, DEBUG };