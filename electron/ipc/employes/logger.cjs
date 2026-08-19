// logger.cjs
const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

function log(...args) {
  if (DEBUG) console.log('[👷 employes]', ...args);
}

function error(...args) {
  console.error('[❌ employes]', ...args);
}

module.exports = { log, error, DEBUG };