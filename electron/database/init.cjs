// ============================================================
// electron/database/init.cjs - VERSION CORRIGÉE (Avec closeDatabase)
// ============================================================
const { getDb } = require('./connection.cjs');
const { log, error, createFolders } = require('./utils.cjs');

async function initDatabase() {
  try {
    log('🔄 Initialisation de la base de données...');
    const db = getDb();
    if (!db || !db.open) {
      throw new Error('Connexion à la base de données non disponible');
    }
    log('✅ Connexion à la base de données établie');

    const { ensureTables } = require('./tables.cjs');
    log('📦 Création/vérification des tables et index (avec migration)...');
    const success = ensureTables();
    if (!success) {
      throw new Error('Erreur lors de la création des tables/indexes');
    }
    log('✅ Tables et index créés/vérifiés avec succès');

    log('📁 Création des dossiers d\'upload...');
    createFolders();
    log('✅ Dossiers d\'upload créés');

    log('✅ Base de données initialisée avec succès');
    return { success: true, db };
  } catch (err) {
    error('❌ Erreur initDatabase:', err.message);
    if (err.stack) error('   Stack:', err.stack);
    throw err;
  }
}

// ⭐ VAOVAO: closeDatabase
function closeDatabase() {
  try {
    const db = getDb();
    if (db && db.open) {
      db.close();
      log('✅ Base de données fermée avec succès');
    }
  } catch (err) {
    error('❌ Erreur lors de la fermeture de la base de données:', err.message);
  }
}

module.exports = { initDatabase, closeDatabase };