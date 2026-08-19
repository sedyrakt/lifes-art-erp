// ============================================================
// electron/ipc/auth.cjs - ENTRY POINT HO AN'NY AUTH MODULE
// ⭐ Re-export ny registerAuthHandlers avy amin'ny handlers.cjs
// ============================================================
'use strict';

const { registerAuthHandlers } = require('./auth/handlers.cjs');

module.exports = {
  registerAuthHandlers,
};

console.log('🔐 [auth.cjs] Module auth chargé avec succès');