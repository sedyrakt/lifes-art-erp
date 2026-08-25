// ============================================================
// services/revocation.service.cjs - VERSION PRODUCTION FINALE
// ⭐ REVOCATION LIST SERVICE
// ⭐ FIX: process.resourcesPath mety undefined ivelan'ny Electron
// ============================================================

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// ⭐ Importation ny canonical string avy ao amin'ny utils (mba hitoviany tanteraka)
const { createCanonicalString } = require('./license/utils.cjs');

console.log('🚫 Revocation Service chargé');

// ⭐ FIX: Raha undefined ny process.resourcesPath
const RESOURCES_PATH = (process.resourcesPath) ? process.resourcesPath : path.join(__dirname, '../');

// ============================================================
// ⭐ CHARGEMENT PUBLIC KEY (ho an'ny vérification signature)
// ============================================================
const PUBLIC_KEY_PATHS = [
  path.join(__dirname, '../keys/public.pem'),
  path.join(__dirname, '../../keys/public.pem'),
  path.join(process.cwd(), 'keys/public.pem'),
  path.join(process.cwd(), 'electron/keys/public.pem'),
  path.join(RESOURCES_PATH, 'keys/public.pem'),
];

let PUBLIC_KEY = '';
let PRIVATE_KEY = '';
let PUBLIC_KEY_FOUND = false;
let PRIVATE_KEY_FOUND = false;

// ⭐ Charger la clé publique
for (const pkPath of PUBLIC_KEY_PATHS) {
  try {
    if (fs.existsSync(pkPath)) {
      PUBLIC_KEY = fs.readFileSync(pkPath, 'utf8');
      PUBLIC_KEY_FOUND = true;
      console.log(`✅ Public Key chargée pour revocation depuis: ${pkPath}`);
      break;
    }
  } catch (e) {}
}

// ⭐ Charger la clé privée (ho an'ny signature)
const PRIVATE_KEY_PATHS = [
  path.join(__dirname, '../keys/private.pem'),
  path.join(__dirname, '../../admin-tools/keys/private.pem'),
  path.join(process.cwd(), 'admin-tools/keys/private.pem'),
  path.join(process.cwd(), 'keys/private.pem'),
];

for (const pkPath of PRIVATE_KEY_PATHS) {
  try {
    if (fs.existsSync(pkPath)) {
      PRIVATE_KEY = fs.readFileSync(pkPath, 'utf8');
      PRIVATE_KEY_FOUND = true;
      console.log(`✅ Private Key chargée pour revocation depuis: ${pkPath}`);
      break;
    }
  } catch (e) {}
}

// ============================================================
// ⭐ FONCTIONS DE SIGNATURE (MIARAKA AMIN'NY UTILS)
// ============================================================

function signRevocationList(data) {
  if (!PRIVATE_KEY_FOUND || !PRIVATE_KEY) {
    console.warn('⚠️ Private key non disponible, signature impossible');
    return null;
  }
  try {
    const sign = crypto.createSign('RSA-SHA256');
    // ⭐ Ampiasaina ny createCanonicalString dynamic
    const canonicalString = createCanonicalString(data);
    sign.update(canonicalString);
    sign.end();
    return sign.sign({
      key: PRIVATE_KEY,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: 32,
    }, 'base64');
  } catch (error) {
    console.error('❌ Erreur signature revocation list:', error.message);
    return null;
  }
}

function verifyRevocationListSignature(data, signature) {
  if (!PUBLIC_KEY_FOUND || !PUBLIC_KEY) {
    console.warn('⚠️ Public key non disponible, vérification signature impossible');
    return false;
  }
  if (!signature) {
    console.warn('⚠️ Signature manquante');
    return false;
  }
  try {
    const verifier = crypto.createVerify('RSA-SHA256');
    const canonicalString = createCanonicalString(data);
    verifier.update(canonicalString);
    verifier.end();
    return verifier.verify({
      key: PUBLIC_KEY,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: 32,
    }, signature, 'base64');
  } catch (error) {
    console.error('❌ Erreur vérification signature revocation list:', error.message);
    return false;
  }
}

// ============================================================
// ⭐ REVOCATION SERVICE
// ============================================================
class RevocationService {
  constructor() {
    this.revokedLicenses = new Set();
    this.revokedActivations = new Set();
    this.revocationPath = this.getRevocationPath();
    this.loadRevocationList();
  }
  
  getRevocationPath() {
    const isDev = process.env.NODE_ENV === 'development' || !process.resourcesPath;
    if (isDev) {
      return path.join(process.cwd(), 'revoked.json');
    }
    if (process.platform === 'win32') {
      const programData = process.env.PROGRAMDATA || 'C:/ProgramData';
      return path.join(programData, 'FITAIA', 'revoked.json');
    }
    return path.join(os.homedir(), '.fitaia', 'revoked.json');
  }
  
  loadRevocationList() {
    try {
      if (fs.existsSync(this.revocationPath)) {
        const raw = fs.readFileSync(this.revocationPath, 'utf8');
        const data = JSON.parse(raw);
        
        // ⭐ Vérifier la signature
        const signature = data.signature || null;
        const payload = {
          licenses: data.licenses || [],
          activations: data.activations || [],
          updatedAt: data.updatedAt || null,
        };
        
        if (signature) {
          if (verifyRevocationListSignature(payload, signature)) {
            this.revokedLicenses = new Set(payload.licenses);
            this.revokedActivations = new Set(payload.activations);
            console.log(`✅ Revocation list chargée (signature validée): ${this.revokedLicenses.size} licences, ${this.revokedActivations.size} activations`);
          } else {
            console.warn('⚠️ Revocation list signature invalide! Ignorée.');
            this.revokedLicenses = new Set();
            this.revokedActivations = new Set();
          }
        } else {
          // ⭐ Raha tsy misy signature (fichier taloha) dia mamorona signature vaovao
          console.warn('⚠️ Revocation list sans signature, tentative de réparation...');
          this.revokedLicenses = new Set(data.licenses || []);
          this.revokedActivations = new Set(data.activations || []);
          // ⭐ Manampy signature
          this.saveRevocationList();
        }
      } else {
        console.log('ℹ️ Aucune liste de révocation trouvée');
      }
    } catch (error) {
      console.warn('⚠️ Erreur chargement revocation list:', error.message);
    }
  }
  
  saveRevocationList() {
    try {
      const payload = {
        licenses: Array.from(this.revokedLicenses),
        activations: Array.from(this.revokedActivations),
        updatedAt: new Date().toISOString(),
      };
      
      // ⭐ Manampy signature
      const signature = signRevocationList(payload);
      const data = {
        ...payload,
        signature: signature,
      };
      
      const dir = path.dirname(this.revocationPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.revocationPath, JSON.stringify(data, null, 2));
      console.log(`✅ Revocation list sauvegardée (${this.revokedLicenses.size} licences, ${this.revokedActivations.size} activations)`);
    } catch (error) {
      console.error('❌ Erreur sauvegarde revocation list:', error.message);
    }
  }
  
  isRevoked(licenseKey, activationId = null) {
    if (this.revokedLicenses.has(licenseKey)) {
      console.warn(`🚫 Licence révoquée: ${licenseKey}`);
      return true;
    }
    if (activationId && this.revokedActivations.has(activationId)) {
      console.warn(`🚫 Activation révoquée: ${activationId}`);
      return true;
    }
    return false;
  }
  
  revokeLicense(licenseKey, reason = 'Révocation manuelle') {
    this.revokedLicenses.add(licenseKey);
    this.saveRevocationList();
    console.log(`🚫 Licence révoquée: ${licenseKey} (${reason})`);
    return true;
  }
  
  revokeActivation(activationId, reason = 'Révocation manuelle') {
    this.revokedActivations.add(activationId);
    this.saveRevocationList();
    console.log(`🚫 Activation révoquée: ${activationId} (${reason})`);
    return true;
  }
  
  unrevokeLicense(licenseKey) {
    this.revokedLicenses.delete(licenseKey);
    this.saveRevocationList();
    console.log(`✅ Licence restaurée: ${licenseKey}`);
    return true;
  }
  
  unrevokeActivation(activationId) {
    this.revokedActivations.delete(activationId);
    this.saveRevocationList();
    console.log(`✅ Activation restaurée: ${activationId}`);
    return true;
  }
  
  getStats() {
    return {
      totalRevokedLicenses: this.revokedLicenses.size,
      totalRevokedActivations: this.revokedActivations.size,
      lastUpdated: this.getLastUpdated(),
      path: this.revocationPath,
      hasSignature: true,
    };
  }
  
  getLastUpdated() {
    try {
      if (fs.existsSync(this.revocationPath)) {
        const data = JSON.parse(fs.readFileSync(this.revocationPath, 'utf8'));
        return data.updatedAt || null;
      }
    } catch {}
    return null;
  }
}

module.exports = new RevocationService();