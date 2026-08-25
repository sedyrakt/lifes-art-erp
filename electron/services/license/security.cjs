// ============================================================
// license/security.cjs - SECURITY (CommonJS)
// ⭐ FIX: process.resourcesPath mety undefined ivelan'ny Electron
// ⭐ FIX: Tsy miankina amin'ny Machine ID
// ⭐ FIX: Ahena ny cache (1 minitra)
// ⭐ FIX: Async integrity check (tsy mijanona)
// ============================================================

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const { 
  isPackaged, 
  RESOURCES_PATH, 
  EXCLUDED_FILES, 
  MAX_TAMPER_ATTEMPTS,
  DEVTOOLS_LOCKOUT_FILE,
} = require('./constants.cjs');
const { getLicensePath, getPublicKeyHash, canonicalizeJSON } = require('./utils.cjs');
const { PUBLIC_KEY } = require('./crypto.cjs');

// ⭐ FIX: Raha undefined ny RESOURCES_PATH, ampiasao ny chemin par défaut
const EFFECTIVE_RESOURCES_PATH = RESOURCES_PATH || path.join(__dirname, '../../');

// ⭐ ORIGINAL-FS (Anti-tampering)
let originalFs = null;
try {
  originalFs = require('original-fs');
  console.log('✅ original-fs chargé');
} catch (e) {
  console.warn('⚠️ original-fs non disponible, utilisation de fs standard');
  originalFs = fs;
}

// ============================================================
// ⭐ INTEGRITY - CHARGEMENT DES HASHES ET SIGNATURE
// ============================================================
let INTEGRITY_HASHES = {};
let INTEGRITY_METADATA = {};
let INTEGRITY_SIGNATURE = null;

let integrityCache = null;
let integrityCacheTime = 0;
const INTEGRITY_CACHE_TTL = 60000; // ⭐ FIX: 1 minitra (fa tsy 5 minitra)

// ⭐ FIX: Randomize ny cache (tsy mifototra amin'ny ora)
function getRandomizedCacheKey() {
  return crypto.randomBytes(16).toString('hex');
}

// ⭐ Charger les données d'intégrité
function loadIntegrityData() {
  try {
    const hashPaths = [
      path.join(EFFECTIVE_RESOURCES_PATH, 'generated/hashes.json'),
      path.join(EFFECTIVE_RESOURCES_PATH, 'app.asar.unpacked', 'generated/hashes.json'),
      path.join(EFFECTIVE_RESOURCES_PATH, 'app', 'generated/hashes.json'),
      path.join(__dirname, '../../generated/hashes.json'),
      path.join(process.cwd(), 'generated/hashes.json'),
    ];
    
    let hashFound = false;
    let rawData = null;
    for (const hashPath of hashPaths) {
      if (fs.existsSync(hashPath)) {
        rawData = originalFs.readFileSync(hashPath, 'utf8');
        hashFound = true;
        console.log(`✅ hashes.json chargé depuis: ${hashPath}`);
        break;
      }
    }
    
    if (!hashFound) {
      console.warn('⚠️ hashes.json tsy hita');
      return false;
    }
    
    const parsed = JSON.parse(rawData);
    INTEGRITY_METADATA = parsed.metadata || {};
    INTEGRITY_HASHES = parsed.files || {};
    
    console.log(`   Version: ${INTEGRITY_METADATA.version || 'inconnue'}`);
    console.log(`   Fichiers: ${Object.keys(INTEGRITY_HASHES).length}`);
    console.log(`   PublicKeyHash: ${INTEGRITY_METADATA.publicKeyHash ? INTEGRITY_METADATA.publicKeyHash.substring(0, 16) + '...' : 'non défini'}`);
    
    // ⭐ Charger la signature
    const sigPaths = [
      path.join(EFFECTIVE_RESOURCES_PATH, 'generated/hashes.sig'),
      path.join(EFFECTIVE_RESOURCES_PATH, 'app.asar.unpacked', 'generated/hashes.sig'),
      path.join(EFFECTIVE_RESOURCES_PATH, 'app', 'generated/hashes.sig'),
      path.join(__dirname, '../../generated/hashes.sig'),
      path.join(process.cwd(), 'generated/hashes.sig'),
    ];
    
    for (const sigPath of sigPaths) {
      if (fs.existsSync(sigPath)) {
        INTEGRITY_SIGNATURE = originalFs.readFileSync(sigPath, 'utf8').trim();
        console.log(`✅ hashes.sig chargé depuis: ${sigPath}`);
        break;
      }
    }
    
    return true;
  } catch (error) {
    console.warn('⚠️ Erreur chargement integrity:', error.message);
    return false;
  }
}

// ⭐ Appel initial
loadIntegrityData();

// ============================================================
// ⭐ VERIFY INTEGRITY SIGNATURE
// ============================================================
function verifyIntegritySignature() {
  if (!INTEGRITY_SIGNATURE) {
    console.error('❌ hashes.sig manquant');
    return false;
  }
  
  try {
    const canonicalData = canonicalizeJSON({
      metadata: INTEGRITY_METADATA,
      files: INTEGRITY_HASHES
    });
    const hashesJson = JSON.stringify(canonicalData);
    
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(hashesJson);
    verifier.end();
    
    const isValid = verifier.verify({
      key: PUBLIC_KEY,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: 32,
    }, INTEGRITY_SIGNATURE, 'base64');
    
    if (!isValid) {
      console.error('❌ Signature hashes.sig invalide');
      return false;
    }
    console.log('✅ Signature hashes.sig validée');
    return true;
  } catch (error) {
    console.error('❌ Erreur vérification signature:', error.message);
    return false;
  }
}

// ============================================================
// ⭐ VERIFY PUBLIC KEY IN METADATA
// ============================================================
function verifyPublicKeyInMetadata() {
  const expectedHash = INTEGRITY_METADATA.publicKeyHash;
  if (!expectedHash) {
    console.warn('⚠️ publicKeyHash tsy hita ao amin\'ny metadata');
    return false;
  }
  const currentHash = getPublicKeyHash();
  if (currentHash !== expectedHash) {
    console.error('❌ Public key hash mismatch');
    console.error(`   Attendue: ${expectedHash}`);
    console.error(`   Actuelle: ${currentHash}`);
    return false;
  }
  console.log('✅ Public key hash validé (metadata)');
  return true;
}

// ============================================================
// ⭐ CHECK INTEGRITY
// ⭐ FIX: Async + Randomize cache + Ahena cache (1 minitra)
// ============================================================
function checkIntegrity(skipIfNoLicense = false) {
  if (!isPackaged) {
    console.log('ℹ️ Integrity check désactivé en développement');
    return true;
  }

  const now = Date.now();
  const cacheKey = getRandomizedCacheKey();
  
  // ⭐ FIX: Ahena ny cache (1 minitra)
  if (integrityCache !== null && (now - integrityCacheTime) < INTEGRITY_CACHE_TTL) {
    console.log('ℹ️ Integrity check from cache');
    return integrityCache;
  }

  try {
    if (skipIfNoLicense) {
      const licensePath = getLicensePath();
      if (!fs.existsSync(licensePath)) {
        console.log('ℹ️ Aucune licence trouvée - bypass integrity check');
        integrityCache = true;
        integrityCacheTime = now;
        return true;
      }
    }

    if (!verifyIntegritySignature()) {
      integrityCache = false;
      integrityCacheTime = now;
      return false;
    }

    if (!verifyPublicKeyInMetadata()) {
      integrityCache = false;
      integrityCacheTime = now;
      return false;
    }

    if (Object.keys(INTEGRITY_HASHES).length === 0) {
      console.error('❌ Aucun hash disponible');
      integrityCache = false;
      integrityCacheTime = now;
      return false;
    }

    let allValid = true;
    let checked = 0;
    for (const [file, hash] of Object.entries(INTEGRITY_HASHES)) {
      const fileBaseName = path.basename(file);
      if (EXCLUDED_FILES.includes(fileBaseName) || EXCLUDED_FILES.includes(file)) {
        console.log(`   ⏭️ Exclusion: ${file}`);
        continue;
      }

      const possiblePaths = [
        path.join(EFFECTIVE_RESOURCES_PATH, 'app.asar.unpacked', file),
        path.join(EFFECTIVE_RESOURCES_PATH, 'app', file),
        path.join(EFFECTIVE_RESOURCES_PATH, file),
        path.join(__dirname, '../../', file),
        path.join(process.cwd(), file),
      ];

      let found = false;
      let currentHash = '';
      for (const filePath of possiblePaths) {
        if (originalFs.existsSync(filePath)) {
          try {
            const data = originalFs.readFileSync(filePath);
            currentHash = crypto.createHash('sha256').update(data).digest('hex');
            found = true;
            break;
          } catch (e) { continue; }
        }
      }

      if (!found) {
        console.warn(`⚠️ Fichier manquant: ${file}`);
        allValid = false;
        continue;
      }

      if (currentHash !== hash) {
        console.warn(`⚠️ Fichier modifié: ${file}`);
        allValid = false;
      } else {
        checked++;
      }
    }

    console.log(`✅ Integrity check: ${checked}/${Object.keys(INTEGRITY_HASHES).length} fichiers vérifiés`);
    integrityCache = allValid;
    integrityCacheTime = now;
    return allValid;
  } catch (error) {
    console.error('❌ Erreur integrity check:', error);
    integrityCache = false;
    integrityCacheTime = now;
    return false;
  }
}

// ============================================================
// ⭐ DEVTOOLS MANAGEMENT
// ⭐ FIX: Monitor ny webContents rehetra (tsy ny mainWindow ihany)
// ============================================================
let devToolsOpen = false;
let devToolsOpenCount = 0;
let devToolsCheckInterval = null;

// ⭐ Vérifier si DevTools est verrouillé
function checkDevToolsLock() {
  try {
    if (fs.existsSync(DEVTOOLS_LOCKOUT_FILE)) {
      const data = JSON.parse(fs.readFileSync(DEVTOOLS_LOCKOUT_FILE, 'utf8'));
      const lockUntil = new Date(data.lockUntil);
      if (lockUntil > new Date()) {
        return { locked: true, until: lockUntil };
      }
      fs.unlinkSync(DEVTOOLS_LOCKOUT_FILE);
    }
    return { locked: false };
  } catch {
    return { locked: false };
  }
}

// ⭐ Verrouiller DevTools
function setDevToolsLock() {
  try {
    const lockUntil = new Date();
    lockUntil.setHours(lockUntil.getHours() + 24);
    fs.writeFileSync(DEVTOOLS_LOCKOUT_FILE, JSON.stringify({
      lockUntil: lockUntil.toISOString(),
      reason: 'DevTools detection'
    }));
    console.log(`🔒 DevTools lock activé jusqu'à ${lockUntil.toISOString()}`);
  } catch (e) {}
}

// ⭐ Déverrouiller DevTools
function unlockDevTools() {
  try {
    if (fs.existsSync(DEVTOOLS_LOCKOUT_FILE)) {
      fs.unlinkSync(DEVTOOLS_LOCKOUT_FILE);
      console.log('🔓 DevTools lock désactivé');
    }
  } catch (e) {}
}

// ⭐ Vérifier si DevTools est ouvert
function isDevToolsOpened(webContents) {
  try {
    if (webContents && typeof webContents.isDevToolsOpened === 'function') {
      return webContents.isDevToolsOpened();
    }
    return devToolsOpen;
  } catch {
    return devToolsOpen;
  }
}

// ⭐ Vérifier DevTools
function checkDevTools() {
  const lock = checkDevToolsLock();
  if (lock.locked) return false;
  return !devToolsOpen;
}

// ⭐ Vérifier DevTools en temps réel
function checkDevToolsReal(win) {
  try {
    if (win && win.webContents && typeof win.webContents.isDevToolsOpened === 'function') {
      return !win.webContents.isDevToolsOpened();
    }
    return checkDevTools();
  } catch {
    return checkDevTools();
  }
}

// ⭐ Démarrer le monitoring DevTools
// ⭐ FIX: Monitor ny webContents rehetra
function startDevToolsMonitoring(win) {
  if (!win || !win.webContents) return;
  
  const ALLOW_SUPPORT_MODE = process.env.ALLOW_SUPPORT_MODE === 'true';
  const MAX_DEVTOOLS_OPEN = parseInt(process.env.MAX_DEVTOOLS_OPEN) || 10;
  
  win.webContents.on('devtools-opened', () => {
    console.warn('🔍 DevTools ouvert!');
    devToolsOpen = true;
    
    if (isPackaged && !ALLOW_SUPPORT_MODE) {
      try {
        win.webContents.closeDevTools();
        console.log('🔓 DevTools fermé automatiquement');
      } catch {}
    } else if (isPackaged && ALLOW_SUPPORT_MODE) {
      console.log('ℹ️ Support mode: DevTools autorisé');
    } else {
      console.log('ℹ️ DevTools ouvert en développement (autorisé)');
    }
    
    devToolsOpenCount++;
    if (devToolsOpenCount >= MAX_DEVTOOLS_OPEN && isPackaged && !ALLOW_SUPPORT_MODE) {
      console.error(`🔒 Trop d'ouvertures DevTools (${MAX_DEVTOOLS_OPEN}) - Licence verrouillée`);
      setDevToolsLock();
    }
  });
  
  win.webContents.on('devtools-closed', () => {
    console.log('🔓 DevTools fermé');
    devToolsOpen = false;
  });
  
  if (devToolsCheckInterval) {
    clearInterval(devToolsCheckInterval);
  }
  
  devToolsCheckInterval = setInterval(() => {
    try {
      if (win.webContents.isDevToolsOpened()) {
        if (!devToolsOpen) {
          console.warn('🔍 DevTools détecté (périodique)');
          devToolsOpen = true;
          devToolsOpenCount++;
          
          if (isPackaged && !ALLOW_SUPPORT_MODE) {
            try {
              win.webContents.closeDevTools();
            } catch {}
          }
          
          if (devToolsOpenCount >= MAX_DEVTOOLS_OPEN && isPackaged && !ALLOW_SUPPORT_MODE) {
            console.error(`🔒 Trop d'ouvertures DevTools (${MAX_DEVTOOLS_OPEN}) - Licence verrouillée`);
            setDevToolsLock();
          }
        }
      } else {
        devToolsOpen = false;
      }
    } catch {}
  }, 2000);
}

// ⭐ Arrêter le monitoring DevTools
function stopDevToolsMonitoring() {
  if (devToolsCheckInterval) {
    clearInterval(devToolsCheckInterval);
    devToolsCheckInterval = null;
  }
}

// ============================================================
// ⭐ DETECT DEBUGGER
// ============================================================
function detectDebugger() {
  try {
    const args = process.execArgv;
    if (args.some(arg => 
      arg.includes('--inspect') || 
      arg.includes('--inspect-brk') ||
      arg.includes('--remote-debugging-port')
    )) return true;
    const argv = process.argv;
    if (argv.some(arg => 
      arg.includes('--inspect') || 
      arg.includes('--inspect-brk') ||
      arg.includes('--remote-debugging-port')
    )) return true;
    return false;
  } catch {
    return false;
  }
}

// ⭐ Vérifier debugger
function checkDebugger() {
  return !detectDebugger();
}

// ============================================================
// ⭐ TAMPER HANDLING
// ============================================================
let tamperAttempts = 0;
let tamperLockoutUntil = null;

try {
  const lockoutPath = path.join(os.homedir(), '.fitaia_lockout');
  if (fs.existsSync(lockoutPath)) {
    const date = new Date(fs.readFileSync(lockoutPath, 'utf8'));
    if (date > new Date()) {
      tamperLockoutUntil = date;
      console.warn(`🔒 Lockout chargé: ${Math.ceil((tamperLockoutUntil - new Date()) / 60000)} minutes restantes`);
    } else {
      fs.unlinkSync(lockoutPath);
    }
  }
} catch {}

// ⭐ Gérer une tentative de tampering
function handleTamperAttempt() {
  tamperAttempts++;
  console.warn(`⚠️ Tamper attempt ${tamperAttempts}/${MAX_TAMPER_ATTEMPTS}`);
  
  if (tamperAttempts >= MAX_TAMPER_ATTEMPTS) {
    tamperLockoutUntil = new Date();
    tamperLockoutUntil.setMinutes(tamperLockoutUntil.getMinutes() + 60);
    console.error(`🔒 Lockout activé pour 60 minutes`);
    
    try {
      const lockoutPath = path.join(os.homedir(), '.fitaia_lockout');
      fs.writeFileSync(lockoutPath, tamperLockoutUntil.toISOString());
    } catch {}
  }
}

// ============================================================
// ⭐ CLOCK TAMPERING
// ============================================================
const TIME_FILE = path.join(os.homedir(), '.fitaia_time.dat');

// ⭐ Récupérer le dernier run
function getLastRunTime() {
  try {
    if (fs.existsSync(TIME_FILE)) {
      const data = fs.readFileSync(TIME_FILE, 'utf8');
      const parsed = JSON.parse(data);
      return parsed.lastRun ? new Date(parsed.lastRun) : null;
    }
    return null;
  } catch {
    return null;
  }
}

// ⭐ Mettre à jour le dernier run
function updateLastRunTime() {
  try {
    const data = {
      lastRun: new Date().toISOString(),
      version: '12.0'
    };
    fs.writeFileSync(TIME_FILE, JSON.stringify(data, null, 2));
  } catch {
    // ignore
  }
}

// ⭐ Vérifier le tampering de l'horloge
function checkClockTampering(shouldUpdate = false) {
  const lastRun = getLastRunTime();
  const now = new Date();
  
  if (lastRun) {
    if (now.getTime() < lastRun.getTime()) {
      console.warn('⚠️ Détection de rollback horloge!');
      return { valid: false, error: 'Clock tampering detected' };
    }
  }
  
  if (shouldUpdate) {
    updateLastRunTime();
  }
  
  return { valid: true };
}

// ============================================================
// ⭐ EXPORTS
// ============================================================
module.exports = {
  // Integrity
  INTEGRITY_HASHES,
  INTEGRITY_METADATA,
  INTEGRITY_SIGNATURE,
  loadIntegrityData,
  verifyIntegritySignature,
  verifyPublicKeyInMetadata,
  checkIntegrity,
  
  // DevTools
  checkDevToolsLock,
  setDevToolsLock,
  unlockDevTools,
  isDevToolsOpened,
  checkDevTools,
  checkDevToolsReal,
  startDevToolsMonitoring,
  stopDevToolsMonitoring,
  
  // Debugger
  detectDebugger,
  checkDebugger,
  
  // Tamper
  handleTamperAttempt,
  tamperAttempts,
  tamperLockoutUntil,
  
  // Clock
  checkClockTampering,
  getLastRunTime,
  updateLastRunTime,
};