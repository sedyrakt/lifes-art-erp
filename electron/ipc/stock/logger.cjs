// ============================================================
// electron/ipc/stock/logger.cjs
// ============================================================
const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

function log(...args) { if (DEBUG) console.log('[📦 stock]', ...args); }
function error(...args) { console.error('[❌ stock]', ...args); }

module.exports = { log, error, DEBUG };