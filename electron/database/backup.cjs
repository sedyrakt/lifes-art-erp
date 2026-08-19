// ============================================================
// database/backup.cjs - BACKUP (CommonJS) CORRIGÉ & ROBUSTE
// ============================================================

const fs = require('fs');
const path = require('path');
const { BACKUP_DIR } = require('./config.cjs');
const { log, warn, error } = require('./utils.cjs');
const { getDb, dbPath, closeDatabase, createConnection } = require('./connection.cjs');

// ============================================================
// BACKUP DATABASE
// ============================================================
const backupDatabase = async () => {
  try {
    const currentDb = getDb();
    if (!currentDb) throw new Error('Database non disponible');

    try {
      currentDb.exec("PRAGMA wal_checkpoint(FULL);");
    } catch (checkpointErr) {
      warn('⚠️ Erreur checkpoint:', checkpointErr.message);
    }

    const now = new Date();
    const datePath = path.join(BACKUP_DIR, `${now.getFullYear()}`, `${String(now.getMonth() + 1).padStart(2, '0')}`);
    if (!fs.existsSync(datePath)) {
      fs.mkdirSync(datePath, { recursive: true });
    }

    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(datePath, `stock_backup_${timestamp}.db`);

    if (typeof currentDb.backup === 'function') {
      currentDb.backup(backupPath);
    } else {
      closeDatabase();
      fs.copyFileSync(dbPath, backupPath);
      createConnection();
    }

    log(`✅ Backup créé: ${backupPath}`);
    return { success: true, path: backupPath };
  } catch (err) {
    error('❌ Erreur backup:', err.message);
    return { success: false, error: err.message };
  }
};

// ============================================================
// RESTORE DATABASE
// ============================================================
const restoreDatabase = (backupPath) => {
  try {
    if (!fs.existsSync(backupPath)) {
      return { success: false, error: 'Fichier backup non trouvé' };
    }

    if (fs.existsSync(dbPath)) {
      const preRestoreBackup = path.join(BACKUP_DIR, `before_restore_${Date.now()}.db`);
      fs.copyFileSync(dbPath, preRestoreBackup);
      log(`📦 Backup pré-restauration: ${preRestoreBackup}`);
    }

    closeDatabase();
    fs.copyFileSync(backupPath, dbPath);

    const newDb = createConnection();
    if (!newDb) {
      throw new Error('Impossible de rouvrir la base après restauration');
    }

    const integrityResult = newDb.pragma('integrity_check', { simple: true });
    const integrity = Array.isArray(integrityResult) ? integrityResult.join(',') : String(integrityResult);
    if (integrity !== 'ok' && !integrity.includes('ok')) {
      warn('⚠️ Restauration integrity_check =', integrity);
    } else {
      log('✅ Base restaurée (Integrity: OK)');
    }

    return { success: true };
  } catch (err) {
    error('❌ Erreur restore:', err.message);
    return { success: false, error: err.message };
  }
};

// ============================================================
// VACUUM & OPTIMIZE
// ============================================================
const vacuumDatabase = () => {
  try {
    const currentDb = getDb();
    if (!currentDb) throw new Error('Database non disponible');
    currentDb.exec('VACUUM;');
    log('✅ VACUUM exécuté');
    return { success: true };
  } catch (err) {
    error('❌ Erreur VACUUM:', err.message);
    return { success: false, error: err.message };
  }
};

const optimizeDatabase = () => {
  try {
    const currentDb = getDb();
    if (!currentDb) throw new Error('Database non disponible');
    currentDb.exec('ANALYZE;');
    currentDb.exec('PRAGMA optimize;');
    log('✅ Optimisation exécutée');
    return { success: true };
  } catch (err) {
    error('❌ Erreur optimize:', err.message);
    return { success: false, error: err.message };
  }
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  backupDatabase,
  restoreDatabase,
  vacuumDatabase,
  optimizeDatabase,
};