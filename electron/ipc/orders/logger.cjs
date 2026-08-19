// ============================================================
// electron/ipc/orders/logger.cjs - LOGGING
// ============================================================

const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

function log(...args) {
  if (DEBUG) console.log('[📦 orders]', ...args);
}

function error(...args) {
  console.error('[❌ orders]', ...args);
}

module.exports = { log, error, DEBUG };