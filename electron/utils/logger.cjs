// ============================================================
// electron/utils/logger.cjs - VERSION SYNCHRONOUS ULTRA FLUIDE
// ⭐ MIARAKA AMIN'NY FANITSARA REHETRA
// ⭐ FANATSARANA: Tsy mampiasa async/await intsony
// ⭐ FANATSARANA: logSecurityEvent dia mampiasa runQuery (sync)
// ⭐ FANATSARANA: Queue ho an'ny performance, flush sync
// ⭐ FANITSARA VAOVAO: Nampiana normalizeParam ho an'ny params
// ⭐ FANITSARA VAOVAO: Fanamarinana table security_logs
// ============================================================

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { runQuery } = require('../database/queries.cjs');
const { normalizeParam } = require('../database/utils.cjs');
const { getDb } = require('../database/connection.cjs');

// ============================================================
// CONSTANTES
// ============================================================
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_FILE = process.env.LOG_FILE || './logs/app.log';
const LOG_DIR = path.dirname(LOG_FILE);
const LOG_QUEUE_SIZE = parseInt(process.env.LOG_QUEUE_SIZE) || 100;

// ============================================================
// CREER DOSSIER LOGS
// ============================================================
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ============================================================
// LEVELS
// ============================================================
const LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CURRENT_LEVEL = LEVELS[LOG_LEVEL] || LEVELS.info;

// ============================================================
// ⭐ LOG QUEUE (ho an'ny performance)
// ============================================================
let logQueue = [];
let isWriting = false;

const flushLogQueue = () => {
  if (isWriting || logQueue.length === 0) return;

  isWriting = true;
  const queue = logQueue.slice();
  logQueue = [];

  try {
    const content = queue.join('');
    fs.appendFileSync(LOG_FILE, content);
  } catch (_) {
    // ignore
  } finally {
    isWriting = false;
    if (logQueue.length > 0) {
      setImmediate(flushLogQueue);
    }
  }
};

const logToFile = (level, message, data = null) => {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data || undefined,
    };
    const logLine = JSON.stringify(logEntry) + '\n';
    logQueue.push(logLine);

    if (logQueue.length >= LOG_QUEUE_SIZE) {
      flushLogQueue();
    } else {
      setImmediate(flushLogQueue);
    }
  } catch (_) {}
};

// ============================================================
// LOGGER PRINCIPAL
// ============================================================
const shouldLog = (level) => LEVELS[level] >= CURRENT_LEVEL;

const log = (level, message, data = null) => {
  if (!shouldLog(level)) return;

  const timestamp = new Date().toISOString();
  const logFn = console[level] || console.log;
  logFn(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data || '');
  logToFile(level, message, data);
};

// ============================================================
// ⭐ SECURITY LOG - SYNCHRONOUS (INSERT DATABASE)
// ============================================================
const logSecurityEvent = (email, action, ip, userAgent, status = 1, details = '') => {
  try {
    const safeIp = typeof ip === 'string' ? ip : (ip?.toString?.() || '127.0.0.1');
    const safeUserAgent = typeof userAgent === 'string' ? userAgent : (userAgent?.toString?.() || 'Electron');
    const safeEmail = typeof email === 'string' ? email : 'anonymous';
    const safeDetails = typeof details === 'string' ? details : JSON.stringify(details || '');

    // ⭐ FANITSARA VAOVAO: Hamarino raha misy ny table security_logs
    const db = getDb();
    const checkStmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = 'security_logs'");
    const tableExists = checkStmt.get();
    if (!tableExists) {
      console.warn('⚠️ Table security_logs nExiste pas, log ignoré');
      return;
    }

    // ⭐ FANITSARA VAOVAO: Mampiasa normalizeParam ho an'ny params
    runQuery(
      `INSERT INTO security_logs (email, action, ip, userAgent, status, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        normalizeParam(safeEmail, 0),
        normalizeParam(action, 1),
        normalizeParam(safeIp, 2),
        normalizeParam(safeUserAgent, 3),
        normalizeParam(status, 4),
        normalizeParam(safeDetails, 5)
      ]
    );

    // Log dans le fichier aussi
    log('info', `[SECURITY] ${action} - ${safeEmail} - ${safeDetails}`, { ip: safeIp, status });
  } catch (err) {
    console.warn('⚠️ Erreur logSecurityEvent:', err.message);
    log('error', `[SECURITY] Erreur log: ${err.message}`, { email, action });
  }
};

// ============================================================
// ⭐ EXPORTS
// ============================================================
module.exports = {
  log,
  logSecurityEvent,
  logToFile,
  flushLogQueue,
  LEVELS,
  LOG_LEVEL,
  LOG_FILE,
};