// ============================================================
// database/config.cjs - CONSTANTS (CommonJS)
// ⭐ Version nettoyée (A-Z) - Suppression des dépendances images
// ============================================================

const path = require('path');

// ============================================================
// ⭐ DEBUG MODE
// ============================================================
const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

// ============================================================
// ⭐ IS PACKAGED (ZAVA-DEHIBE NAMPIADIANA)
// ============================================================
const isPackaged = process.env.NODE_ENV === 'production' || process.defaultApp === false;

// ============================================================
// ⭐ CONSTANTES GÉNÉRALES
// ============================================================
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
const BACKUP_DIR = process.env.DB_BACKUP_PATH || path.join(__dirname, 'backups');

// ============================================================
// ⭐ CONSTANTES SQLITE / DATABASE
// ============================================================
const DB_JOURNAL_MODE = process.env.DB_JOURNAL_MODE || 'WAL';
const DB_SYNCHRONOUS = process.env.DB_SYNCHRONOUS || 'NORMAL';
const DB_CACHE_SIZE = parseInt(process.env.DB_CACHE_SIZE) || 10000;
const DB_MMAP_SIZE = parseInt(process.env.DB_MMAP_SIZE) || 268435456;
const DB_JOURNAL_SIZE_LIMIT = parseInt(process.env.DB_JOURNAL_SIZE_LIMIT) || 10485760;
const DB_BUSY_TIMEOUT = parseInt(process.env.DB_BUSY_TIMEOUT) || 30000;

// ============================================================
// ⭐ RETRY & SECURITY
// ============================================================
const MAX_RETRIES = 3;
const MAX_BUSY_RETRIES = 5;
const RETRY_DELAY_MS = 50;
const GRACE_PERIOD_DAYS = parseInt(process.env.GRACE_PERIOD_DAYS) || 5;

// ⭐ MOTS-CLÉS SQL INTERDITS (ho an'ny filtrage)
const SQL_FORBIDDEN_KEYWORDS = [
  'DROP', 'ALTER', 'DELETE', 'UPDATE', 'INSERT',
  'TRUNCATE', 'CREATE', 'REPLACE', 'RENAME',
  'ATTACH', 'DETACH', 'REINDEX', 'VACUUM'
];

// ⭐ FICHIERS EXCLUS (ho an'ny integrity check)
const EXCLUDED_FILES = [
  'license.lic',
  '.fitaia_lockout',
  '.fitaia_time.dat',
  '.fitaia_machine_id',
  '.fitaia_reset_lock',
  '.fitaia_devtools_lock',
  'licenses.json',
];

// ⭐ ALLOWED TABLES
const ALLOWED_TABLES = new Set([
  'utilisateurs', 'categories', 'fournisseurs', 'produits',
  'entrees_stock', 'sorties_stock', 'mouvements_stock',
  'commandes', 'details_commandes', 'clients', 'employes',
  'depenses', 'paiements', 'sessions', 'security_logs', 'licences',
  'schema_migrations', 'audit_logs', 'settings'
]);

// ============================================================
// ⭐ EXPORTS (Madio sy tsy misy sary intsony)
// ============================================================
module.exports = {
  DEBUG,
  isPackaged, // ⭐ Nampiana
  SALT_ROUNDS,
  BACKUP_DIR,
  DB_JOURNAL_MODE,
  DB_SYNCHRONOUS,
  DB_CACHE_SIZE,
  DB_MMAP_SIZE,
  DB_JOURNAL_SIZE_LIMIT,
  DB_BUSY_TIMEOUT,
  MAX_RETRIES,
  MAX_BUSY_RETRIES,
  RETRY_DELAY_MS,
  GRACE_PERIOD_DAYS,
  SQL_FORBIDDEN_KEYWORDS,
  EXCLUDED_FILES,
  ALLOWED_TABLES,
};