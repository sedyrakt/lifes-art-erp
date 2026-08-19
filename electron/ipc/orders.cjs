const {
  registerOrdersHandlers,
  ORDER_STATUS,
  VALID_STATUSES,
} = require('./orders/index.cjs');

module.exports = {
  registerOrdersHandlers,
  ORDER_STATUS,
  VALID_STATUSES,
};

console.log('📦 [orders.cjs] Module principal chargé (version modulaire)');