// ============================================================
// electron/ipc/dashboard/logger.cjs - LOGGING (10/10)
// ============================================================

const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

function log(...args) {
  if (DEBUG) console.log('[📊 dashboard]', ...args);
}

function error(...args) {
  console.error('[❌ dashboard]', ...args);
}

module.exports = { log, error, DEBUG };