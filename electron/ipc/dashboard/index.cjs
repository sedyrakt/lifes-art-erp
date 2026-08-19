// ============================================================
// electron/ipc/dashboard/index.cjs - 20M READY
// ⭐ CORRIGÉ: TSY MISY DESTRUCTURING INTSONY
// ============================================================

const { registerDashboardHandlers } = require('./handlers.cjs');
const dashboardStatements = require('./statements.cjs');

module.exports = {
  registerDashboardHandlers,
  ...dashboardStatements,
};