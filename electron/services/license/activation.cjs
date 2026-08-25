'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const { encryptData, decryptData, verifyRSASignature } = require('./crypto.cjs');
const { getLicensePath } = require('./utils.cjs');
const { PACKAGES, ACTIVATION_CODE_FORMAT, ACTIVATION_CODE_LENGTH } = require('./constants.cjs');

const DEBUG = process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';
function log(...args) { if (DEBUG) console.log(...args); }
function error(...args) { console.error(...args); }

const FITAIA_DIR = path.join(os.homedir(), '.fitaia');
const USED_ACTIVATIONS_PATH = path.join(FITAIA_DIR, 'used_activations.json');
const EXPIRED_ACTIVATIONS_PATH = path.join(FITAIA_DIR, 'expired_activations.json');

const PUBLIC_KEY_PATHS = [
  ...(process.resourcesPath ? [path.join(process.resourcesPath, 'keys/public.pem')] : []),
  ...(process.resourcesPath ? [path.join(process.resourcesPath, 'app.asar.unpacked', 'keys/public.pem')] : []),
  path.join(__dirname, '../../keys/public.pem'),
  path.join(__dirname, '../../../keys/public.pem'),
  path.join(process.cwd(), 'keys/public.pem'),
  path.join(process.cwd(), 'electron/keys/public.pem'),
  path.join(process.cwd(), 'admin-tools/keys/public.pem'),
];

let PUBLIC_KEY = '';
for (const pkPath of PUBLIC_KEY_PATHS) {
  try {
    if (fs.existsSync(pkPath)) {
      PUBLIC_KEY = fs.readFileSync(pkPath, 'utf8');
      log('✅ [activation] Public Key chargée depuis:', pkPath);
      break;
    }
  } catch (_) {}
}

if (!PUBLIC_KEY) {
  console.error('❌ [activation] Public key non trouvée');
}

function ensureFitaiaDir() {
  try {
    if (!fs.existsSync(FITAIA_DIR)) {
      fs.mkdirSync(FITAIA_DIR, { recursive: true });
    }
    return true;
  } catch (err) {
    error('❌ Impossible de créer .fitaia:', err.message);
    return false;
  }
}

function createCanonicalString(data) {
  if (!data || typeof data !== 'object') return '';
  const keys = Object.keys(data).filter((key) => key !== 'signature').sort();
  return keys.map((key) => `${key}=${String(data[key])}`).join('&');
}

// ⭐ FORMAT / VALIDATE
function normalizeActivationCode(rawCode) {
  if (rawCode === null || rawCode === undefined) return '';
  return String(rawCode).toUpperCase().replace(/\s+/g, '').trim();
}

function formatActivationCode(rawCode) {
  const cleaned = normalizeActivationCode(rawCode);
  if (!cleaned) return '';

  if (cleaned.length === ACTIVATION_CODE_LENGTH && ACTIVATION_CODE_FORMAT.test(cleaned)) {
    return cleaned;
  }

  const noDashes = cleaned.replace(/-/g, '');
  if (noDashes.startsWith('LA') && noDashes.length === 14) {
    const body = noDashes.substring(2);
    return ['LA', body.substring(0, 4), body.substring(4, 8), body.substring(8, 12)].join('-');
  }

  if (noDashes.length === 12) {
    return ['LA', noDashes.substring(0, 4), noDashes.substring(4, 8), noDashes.substring(8, 12)].join('-');
  }

  return cleaned;
}

function validateActivationCodeFormat(code) {
  if (!code) return false;
  const formatted = formatActivationCode(code);
  return ACTIVATION_CODE_FORMAT.test(formatted);
}

// ⭐ USED ACTIVATIONS
function getUsedActivations() {
  try {
    if (!fs.existsSync(USED_ACTIVATIONS_PATH)) return {};
    const raw = fs.readFileSync(USED_ACTIVATIONS_PATH, 'utf8');
    if (!raw.trim()) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    console.warn('⚠️ Erreur lecture used_activations.json:', err.message);
    return {};
  }
}

function saveUsedActivations(data) {
  try {
    ensureFitaiaDir();
    fs.writeFileSync(USED_ACTIVATIONS_PATH, JSON.stringify(data || {}, null, 2), 'utf8');
    return true;
  } catch (err) {
    error('❌ Erreur sauvegarde used_activations:', err.message);
    return false;
  }
}

function getExpiredActivations() {
  try {
    if (!fs.existsSync(EXPIRED_ACTIVATIONS_PATH)) return {};
    const raw = fs.readFileSync(EXPIRED_ACTIVATIONS_PATH, 'utf8');
    if (!raw.trim()) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    console.warn('⚠️ Erreur lecture expired_activations.json:', err.message);
    return {};
  }
}

function saveExpiredActivations(data) {
  try {
    ensureFitaiaDir();
    fs.writeFileSync(EXPIRED_ACTIVATIONS_PATH, JSON.stringify(data || {}, null, 2), 'utf8');
    return true;
  } catch (err) {
    error('❌ Erreur sauvegarde expired_activations:', err.message);
    return false;
  }
}

function markAsExpired(activationId, data = {}) {
  try {
    if (!activationId) return false;
    const expired = getExpiredActivations();
    expired[activationId] = { activationId, expiredAt: new Date().toISOString(), ...data };
    saveExpiredActivations(expired);
    return true;
  } catch (err) {
    console.warn('⚠️ Erreur markAsExpired:', err.message);
    return false;
  }
}

// ⭐ FIND SIGNED PAYLOAD
function findSignedPayload(code) {
  try {
    const formattedCode = formatActivationCode(code);
    if (!formattedCode) return null;

    const exportsDirs = [
      path.join(__dirname, '../../admin-tools/exports'),
      path.join(__dirname, '../../../admin-tools/exports'),
      path.join(process.cwd(), 'admin-tools/exports'),
    ];

    const uniqueDirs = [...new Set(exportsDirs)];

    for (const exportsDir of uniqueDirs) {
      try {
        if (!fs.existsSync(exportsDir)) continue;
        const files = fs.readdirSync(exportsDir).filter((file) => file.endsWith('.json'));
        for (const file of files) {
          try {
            const filePath = path.join(exportsDir, file);
            const raw = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(raw);
            if (!data || !Array.isArray(data.codes)) continue;

            for (const item of data.codes) {
              if (!item || !item.code) continue;
              const itemCode = formatActivationCode(item.code);
              if (itemCode === formattedCode) {
                log('✅ [activation] Code trouvé:', formattedCode, 'dans', file);
                return item;
              }
            }
          } catch (err) {
            console.warn('⚠️ Erreur lecture export:', file, err.message);
          }
        }
      } catch (_) {}
    }

    return null;
  } catch (err) {
    console.error('❌ findSignedPayload:', err.message);
    return null;
  }
}

// ⭐ VERIFY RSA SIGNATURE
function verifyPayloadSignature(payload, signature) {
  try {
    if (!payload || !signature) return false;
    return verifyRSASignature(payload, signature);
  } catch (err) {
    console.error('❌ RSA verification error:', err.message);
    return false;
  }
}

// ⭐ CHECK CODE USABLE - ⭐ FIX: Message d'erreur fohy sy mazava
function isCodeUsable(code) {
  try {
    const formatted = formatActivationCode(code);
    log('🔍 [activation] Code reçu:', code);
    log('🔍 [activation] Code formaté:', formatted);

    if (!validateActivationCodeFormat(formatted)) {
      return { usable: false, reason: 'Code invalide. Vérifiez le format ou contactez l\'administrateur.' };
    }

    const signedData = findSignedPayload(formatted);
    if (!signedData) return { usable: false, reason: 'Code invalide. Vérifiez votre code ou contactez l\'administrateur.' };

    if (!signedData.payload || typeof signedData.payload !== 'object') {
      return { usable: false, reason: 'Code invalide. Vérifiez votre code ou contactez l\'administrateur.' };
    }

    if (!signedData.signature) return { usable: false, reason: 'Code invalide. Vérifiez votre code ou contactez l\'administrateur.' };

    const signatureValid = verifyPayloadSignature(signedData.payload, signedData.signature);
    if (!signatureValid) return { usable: false, reason: 'Code invalide. Vérifiez votre code ou contactez l\'administrateur.' };

    const activationId = signedData.payload.activationId;
    if (!activationId) return { usable: false, reason: 'Code invalide. Contactez l\'administrateur.' };

    const usedActivations = getUsedActivations();
    if (usedActivations[activationId]) {
      return { usable: false, reason: 'Code déjà utilisé. Contactez l\'administrateur.', activationId };
    }

    const expirationDate = signedData.payload.expirationDate;
    if (!expirationDate) return { usable: false, reason: 'Code invalide. Contactez l\'administrateur.', activationId };

    const expirationTime = new Date(expirationDate).getTime();
    if (Number.isNaN(expirationTime)) return { usable: false, reason: 'Code invalide. Contactez l\'administrateur.', activationId };

    if (expirationTime <= Date.now()) {
      markAsExpired(activationId, {
        licenseKey: signedData.payload.licenseKey || null,
        packageType: signedData.payload.packageType || null,
        expirationDate,
      });
      return { usable: false, reason: 'Code expiré. Contactez l\'administrateur.', activationId };
    }

    const packageType = signedData.payload.packageType;
    if (!packageType) return { usable: false, reason: 'Code invalide. Contactez l\'administrateur.', activationId };
    if (!PACKAGES[packageType]) return { usable: false, reason: 'Code invalide. Contactez l\'administrateur.', activationId };

    return { usable: true, data: signedData };
  } catch (err) {
    error('❌ isCodeUsable:', err.message);
    return { usable: false, reason: 'Erreur lors de l\'activation. Réessayez ou contactez l\'administrateur.' };
  }
}

// ⭐ ACTIVATE WITH CODE
function activateWithCode(code) {
  try {
    const checkResult = isCodeUsable(code);
    if (!checkResult.usable) return { success: false, message: checkResult.reason };

    const signedData = checkResult.data;
    const payload = signedData.payload;
    const signature = signedData.signature;

    if (!payload.packageType || !PACKAGES[payload.packageType]) {
      return { success: false, message: 'Code invalide. Contactez l\'administrateur.' };
    }

    const licensePath = getLicensePath();
    const licenseDir = path.dirname(licensePath);
    if (!fs.existsSync(licenseDir)) fs.mkdirSync(licenseDir, { recursive: true });

    const now = new Date().toISOString();
    const licenseData = {
      ...payload,
      signature: signature,
      activatedAt: payload.activatedAt || now,
      version: 2,
    };

    const encrypted = encryptData(licenseData);
    if (!encrypted) return { success: false, message: 'Erreur lors de l\'activation. Réessayez ou contactez l\'administrateur.' };

    fs.writeFileSync(licensePath, encrypted, 'utf8');

    const usedActivations = getUsedActivations();
    usedActivations[payload.activationId] = {
      activatedAt: licenseData.activatedAt,
      licenseKey: payload.licenseKey || null,
      packageType: payload.packageType || null,
      expirationDate: payload.expirationDate || null,
    };
    if (!saveUsedActivations(usedActivations)) {
      console.warn('⚠️ Licence activée mais impossible de sauvegarder used_activations.json');
    }

    log('✅ Licence activée avec succès:', {
      licenseKey: payload.licenseKey,
      packageType: payload.packageType,
      activationId: payload.activationId,
      expirationDate: payload.expirationDate,
    });

    return {
      success: true,
      message: `Licence ${String(payload.packageType).toUpperCase()} activée avec succès`,
      data: {
        licenseKey: payload.licenseKey || null,
        packageType: payload.packageType || null,
        expirationDate: payload.expirationDate || null,
        activationId: payload.activationId || null,
      },
    };
  } catch (err) {
    error('❌ Erreur activation:', err.message);
    return { success: false, message: 'Erreur lors de l\'activation. Réessayez ou contactez l\'administrateur.' };
  }
}

// ⭐ VERIFY CODE
function verifyCode(code) {
  try {
    const formatted = formatActivationCode(code);
    if (!validateActivationCodeFormat(formatted)) {
      return { valid: false, message: 'Code invalide. Vérifiez le format ou contactez l\'administrateur.' };
    }

    const signedData = findSignedPayload(formatted);
    if (!signedData) return { valid: false, message: 'Code invalide. Vérifiez votre code ou contactez l\'administrateur.' };
    if (!signedData.payload) return { valid: false, message: 'Code invalide. Vérifiez votre code ou contactez l\'administrateur.' };
    if (!signedData.signature) return { valid: false, message: 'Code invalide. Vérifiez votre code ou contactez l\'administrateur.' };

    if (!verifyPayloadSignature(signedData.payload, signedData.signature)) {
      return { valid: false, message: 'Code invalide. Vérifiez votre code ou contactez l\'administrateur.' };
    }

    const packageType = signedData.payload.packageType;
    if (!PACKAGES[packageType]) return { valid: false, message: 'Code invalide. Contactez l\'administrateur.' };

    const activationId = signedData.payload.activationId;
    const usedActivations = getUsedActivations();
    if (activationId && usedActivations[activationId]) {
      return { valid: false, message: 'Code déjà utilisé. Contactez l\'administrateur.', activationId };
    }

    const expirationDate = signedData.payload.expirationDate;
    if (!expirationDate) return { valid: false, message: 'Code invalide. Contactez l\'administrateur.' };
    if (new Date(expirationDate).getTime() <= Date.now()) {
      return { valid: false, message: 'Code expiré. Contactez l\'administrateur.', activationId };
    }

    return {
      valid: true,
      code: formatted,
      packageType,
      activationId: activationId || null,
      expirationDate,
      licenseKey: signedData.payload.licenseKey || null,
    };
  } catch (err) {
    return { valid: false, message: 'Erreur lors de la vérification. Réessayez ou contactez l\'administrateur.' };
  }
}

// ⭐ GENERATE ACTIVATION CODE
function generateRandomSegment(length = 4) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += alphabet[bytes[i] % alphabet.length];
  }
  return result;
}

function generateActivationCode() {
  return ['LA', generateRandomSegment(4), generateRandomSegment(4), generateRandomSegment(4)].join('-');
}

// ⭐ LOAD LICENSE DATABASE
function loadLicensesDatabase() {
  try {
    const exportsDirs = [
      path.join(__dirname, '../../admin-tools/exports'),
      path.join(__dirname, '../../../admin-tools/exports'),
      path.join(process.cwd(), 'admin-tools/exports'),
    ];
    const result = [];
    for (const exportsDir of [...new Set(exportsDirs)]) {
      try {
        if (!fs.existsSync(exportsDir)) continue;
        const files = fs.readdirSync(exportsDir).filter((file) => file.endsWith('.json'));
        for (const file of files) {
          try {
            const data = JSON.parse(fs.readFileSync(path.join(exportsDir, file), 'utf8'));
            result.push({ file, data });
          } catch (_) {}
        }
      } catch (_) {}
    }
    return result;
  } catch (err) {
    error('❌ loadLicensesDatabase:', err.message);
    return [];
  }
}

// ⭐ EXPORTS
module.exports = {
  activateWithCode,
  isCodeUsable,
  verifyCode,
  formatActivationCode,
  validateActivationCodeFormat,
  normalizeActivationCode,
  generateActivationCode,
  generateActivationChecksum: generateActivationCode,
  generateChecksum: generateActivationCode,
  verifyRSASignature,
  verifyPayloadSignature,
  findSignedPayload,
  createCanonicalString,
  getUsedActivations,
  saveUsedActivations,
  getExpiredActivations,
  saveExpiredActivations,
  markAsExpired,
  loadLicensesDatabase,
  ACTIVATION_CODE_REGEX: ACTIVATION_CODE_FORMAT,
  ACTIVATION_CODE_LENGTH,
};