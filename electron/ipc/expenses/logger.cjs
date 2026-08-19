// ============================================================
// electron/ipc/expenses/logger.cjs - LOGGING
// ============================================================

const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

function log(...args) {
  if (DEBUG) console.log('[💸 expenses]', ...args);
}

function error(...args) {
  console.error('[❌ expenses]', ...args);
}

module.exports = { log, error, DEBUG };