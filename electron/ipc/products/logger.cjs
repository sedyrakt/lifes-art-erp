// ============================================================
// electron/ipc/products/logger.cjs - LOGGING
// ============================================================

const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

function log(...args) {
  if (DEBUG) console.log('[📦 products]', ...args);
}

function error(...args) {
  console.error('[❌ products]', ...args);
}

module.exports = { log, error, DEBUG };