// ============================================================
// database/config.cjs - CONSTANTS (CommonJS)
// ⭐ LIFE'S ART ERP PRO
// ⭐ Version nettoyée - Sans License
// ============================================================

const path = require('path');

// ============================================================
// ⭐ DEBUG MODE
// ============================================================

const DEBUG =
  !process.env.NODE_ENV ||
  process.env.NODE_ENV === 'development';

// ============================================================
// ⭐ IS PACKAGED
// ============================================================

const isPackaged =
  process.env.NODE_ENV === 'production' ||
  process.defaultApp === false;

// ============================================================
// ⭐ CONSTANTES GÉNÉRALES
// ============================================================

const SALT_ROUNDS =
  parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;

const BACKUP_DIR =
  process.env.DB_BACKUP_PATH ||
  path.join(__dirname, 'backups');

// ============================================================
// ⭐ CONSTANTES SQLITE / DATABASE
// ============================================================

const DB_JOURNAL_MODE =
  process.env.DB_JOURNAL_MODE || 'WAL';

const DB_SYNCHRONOUS =
  process.env.DB_SYNCHRONOUS || 'NORMAL';

const DB_CACHE_SIZE =
  parseInt(process.env.DB_CACHE_SIZE, 10) || 10000;

const DB_MMAP_SIZE =
  parseInt(process.env.DB_MMAP_SIZE, 10) || 268435456;

const DB_JOURNAL_SIZE_LIMIT =
  parseInt(process.env.DB_JOURNAL_SIZE_LIMIT, 10) || 10485760;

const DB_BUSY_TIMEOUT =
  parseInt(process.env.DB_BUSY_TIMEOUT, 10) || 30000;

// ============================================================
// ⭐ RETRY & SECURITY
// ============================================================

const MAX_RETRIES = 3;

const MAX_BUSY_RETRIES = 5;

const RETRY_DELAY_MS = 50;

// ============================================================
// ⭐ MOTS-CLÉS SQL INTERDITS
// ============================================================

const SQL_FORBIDDEN_KEYWORDS = [
  'DROP',
  'ALTER',
  'DELETE',
  'UPDATE',
  'INSERT',
  'TRUNCATE',
  'CREATE',
  'REPLACE',
  'RENAME',
  'ATTACH',
  'DETACH',
  'REINDEX',
  'VACUUM',
];

// ============================================================
// ⭐ FICHIERS EXCLUS
// ============================================================

const EXCLUDED_FILES = [];

// ============================================================
// ⭐ ALLOWED TABLES
// ============================================================

const ALLOWED_TABLES = new Set([
  'utilisateurs',
  'categories',
  'fournisseurs',
  'produits',
  'entrees_stock',
  'sorties_stock',
  'mouvements_stock',
  'commandes',
  'details_commandes',
  'clients',
  'employes',
  'depenses',
  'paiements',
  'sessions',
  'security_logs',
  'schema_migrations',
  'audit_logs',
  'settings',
]);

// ============================================================
// ⭐ EXPORTS
// ============================================================

module.exports = {
  DEBUG,
  isPackaged,
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
  SQL_FORBIDDEN_KEYWORDS,
  EXCLUDED_FILES,
  ALLOWED_TABLES,
};