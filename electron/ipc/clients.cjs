// electron/ipc/clients.cjs - VERSION PRODUCTION ULTRA FLUIDE
// ⭐ MIARAKA AMIN'NY FANITSARA REHETRA
// ⭐ FANATSARANA: Mampiasa better-sqlite3 mivantana (synchronous)
// ⭐ FANATSARANA: Prepared statements ho an'ny requête miverimberina
// ⭐ FANATSARANA: Transaction ho an'ny bulk delete
// ⭐ FANATSARANA: Logs tsy misy afa-tsy amin'ny développement
// ⭐ FANATSARANA: Fanadiovana ny requête mba tsy hamerina mamorona statement
// ⭐ FANITSARA VAOVAO: Mampiasa db.cjs fa tsy connection.cjs
// ============================================================

// Re‑export des fonctions publiques depuis le dossier `clients/`
const { registerClientsHandlers, emitClientsChanged } = require('./clients/index.cjs');

module.exports = {
  registerClientsHandlers,
  emitClientsChanged,
};