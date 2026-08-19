// ============================================================
// electron/ipc/orders/index.cjs - Entry point
// ============================================================

const { registerOrdersHandlers } = require('./handlers.cjs');
const { ORDER_STATUS, VALID_STATUSES } = require('./validation.cjs');

module.exports = {
  registerOrdersHandlers,
  ORDER_STATUS,
  VALID_STATUSES,
};