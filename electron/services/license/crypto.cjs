// ============================================================
// electron/services/license/crypto.cjs - SECURITY (CommonJS)
// ⭐ FIX: AES Key derive avy amin'ny Public Key (tsy static)
// ⭐ FIX: Tsy miankina amin'ny EMBEDDED_SECRET
// ============================================================

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { PUBLIC_KEY_PATHS } = require('./constants.cjs');
const { createCanonicalString } = require('./utils.cjs');

const DEBUG = process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';
function log(...args) { if (DEBUG) console.log(...args); }
function error(...args) { console.error(...args); }

// ============================================================
// ⭐ PUBLIC KEY CHARGEMENT
// ============================================================

let PUBLIC_KEY = '';
let PUBLIC_KEY_FOUND = false;

const RESOURCES_PATH = (process.resourcesPath) ? process.resourcesPath : path.join(__dirname, '../../');

const extendedPaths = [
  ...PUBLIC_KEY_PATHS,
  path.join(__dirname, '../../keys/public.pem'),
  path.join(process.cwd(), 'keys/public.pem'),
  path.join(process.cwd(), 'electron/keys/public.pem'),
  path.join(process.cwd(), 'admin-tools/keys/public.pem'),
  path.join(RESOURCES_PATH, 'app.asar.unpacked/keys/public.pem'),
  path.join(RESOURCES_PATH, 'keys/public.pem'),
];

const uniquePaths = [...new Set(extendedPaths)];

for (const pkPath of uniquePaths) {
  try {
    if (fs.existsSync(pkPath)) {
      PUBLIC_KEY = fs.readFileSync(pkPath, 'utf8');
      PUBLIC_KEY_FOUND = true;
      console.log(`✅ Public Key chargée depuis: ${pkPath}`);
      break;
    }
  } catch (_) {}
}

if (!PUBLIC_KEY_FOUND) {
  console.error('❌ Public key not found');
  console.error('   Chemins testés:');
  uniquePaths.forEach(p => console.error(`   - ${p}`));
}

// ============================================================
// ⭐ APP_BUILD_ID (derive avy amin'ny Public Key)
// ============================================================

const APP_BUILD_ID = process.env.APP_BUILD_ID ||
  crypto.createHash('sha256').update(PUBLIC_KEY || 'FITAIA_ERP_2026_SECURE').digest('hex').substring(0, 16);

// ============================================================
// ⭐ AES KEY DERIVE (FIX: Tsy static)
// ============================================================

function getDerivedAESKey() {
  try {
    const secret = PUBLIC_KEY || 'FITAIA_ERP_2026_SECURE';
    const salt = Buffer.from('FITAIA-SALT-2025', 'utf8');
    return crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha256');
  } catch (error) {
    console.error('❌ AES_KEY FAILED:', error.message);
    throw error;
  }
}

const AES_KEY = getDerivedAESKey();

// ============================================================
// ⭐ ENCRYPT DATA (AES-256-GCM)
// ============================================================

function encryptData(data) {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', AES_KEY, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();
    return iv.toString('base64') + ':' + authTag.toString('base64') + ':' + encrypted;
  } catch (error) {
    console.error('❌ Erreur encryption:', error);
    return null;
  }
}

// ============================================================
// ⭐ DECRYPT DATA (AES-256-GCM)
// ============================================================

function decryptData(encrypted) {
  try {
    if (typeof encrypted !== 'string') return null;
    if (encrypted.length > 50000) return null;
    const parts = encrypted.split(':');
    if (parts.length !== 3) return null;
    const iv = Buffer.from(parts[0], 'base64');
    const authTag = Buffer.from(parts[1], 'base64');
    const cipherText = parts[2];
    const decipher = crypto.createDecipheriv('aes-256-gcm', AES_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(cipherText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (e) {
    console.warn('⚠️ Erreur decrypt:', e.message);
    return null;
  }
}

// ============================================================
// ⭐ VERIFY RSA SIGNATURE (PSS)
// ============================================================

function verifyRSASignature(payload, signature) {
  if (!signature) {
    console.error('❌ Signature manquante');
    return false;
  }
  if (!PUBLIC_KEY_FOUND || !PUBLIC_KEY) {
    console.error('❌ Public key non disponible pour la vérification');
    return false;
  }

  log('🔍 [DEBUG] Received payload:', payload);
  log('🔍 [DEBUG] Received signature:', signature);

  const canonicalString = createCanonicalString(payload);
  log('🔍 [DEBUG] Canonical String from client:', canonicalString);

  try {
    const verifier = crypto.createVerify('SHA256');
    verifier.update(canonicalString);
    verifier.end();

    const isValid = verifier.verify({
      key: PUBLIC_KEY,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: 32,
    }, signature, 'base64');

    if (!isValid) {
      console.error('❌ Signature RSA invalide');
    } else {
      log('✅ Signature RSA valide');
    }
    return isValid;
  } catch (error) {
    console.error('❌ Erreur verification signature:', error.message);
    return false;
  }
}

// ============================================================
// ⭐ EXPORTS
// ============================================================

module.exports = {
  AES_KEY,
  PUBLIC_KEY,
  PUBLIC_KEY_FOUND,
  APP_BUILD_ID,
  encryptData,
  decryptData,
  verifyRSASignature,
  getDerivedAESKey,
};