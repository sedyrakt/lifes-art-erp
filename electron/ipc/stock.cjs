// ============================================================
// electron/ipc/stock.cjs
// ⭐ MODULE PRINCIPAL STOCK
// ============================================================

const {
  registerStockHandlers,
} = require('./stock/index.cjs');

module.exports = {
  registerStockHandlers,
};

console.log(
  '📦 [stock.cjs] Module principal chargé'
);