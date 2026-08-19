// ============================================================
// electron/ipc/reports/logger.cjs - LOGGING
// ============================================================

const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

function log(...args) {
  if (DEBUG) console.log('[📊 reports]', ...args);
}

function error(...args) {
  console.error('[❌ reports]', ...args);
}

module.exports = { log, error, DEBUG };