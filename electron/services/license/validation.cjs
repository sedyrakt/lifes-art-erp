'use strict';

const fs = require('fs');
const { GRACE_PERIOD_DAYS } = require('./constants.cjs');
const { getLicensePath } = require('./utils.cjs');
const { decryptData, verifyRSASignature } = require('./crypto.cjs');

function checkExpiration(expirationDate, packageType = null, activatedAt = null) {
  if (!expirationDate) {
    return { valid: false, status: 'invalid', daysRemaining: 0 };
  }

  const now = new Date();
  const isTest = (packageType === 'test');

  if (isTest && activatedAt) {
    const activationTime = new Date(activatedAt);
    const elapsedMinutes = (now.getTime() - activationTime.getTime()) / (1000 * 60);
    const minutesRemaining = Math.ceil(30 - elapsedMinutes);

    if (minutesRemaining > 0) {
      return {
        valid: true,
        status: 'active',
        daysRemaining: 0,
        minutesRemaining,
        isTest: true,
      };
    } else {
      return {
        valid: false,
        status: 'expired',
        daysRemaining: 0,
        isTest: true,
        minutesRemaining: 0,
      };
    }
  }

  const expDate = new Date(expirationDate);
  const graceEnd = getGracePeriodEnd(expirationDate);

  if (packageType === 'centralized' && expirationDate) {
    try {
      if (expDate.getFullYear() >= 2099) {
        return { valid: true, status: 'lifetime', daysRemaining: 9999, isLifetime: true };
      }
    } catch (_) {}
  }

  if (now > graceEnd) {
    return { valid: false, status: 'expired', daysRemaining: 0 };
  }

  if (now > expDate) {
    const daysRemaining = Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { valid: true, status: 'grace', daysRemaining };
  }

  const daysRemaining = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return { valid: true, status: 'active', daysRemaining };
}

function getGracePeriodEnd(expirationDate) {
  if (!expirationDate) return null;
  const exp = new Date(expirationDate);
  const grace = new Date(exp);
  grace.setDate(grace.getDate() + GRACE_PERIOD_DAYS);
  return grace;
}

// ⭐ FANITSARA: Mifanaraka amin'ny Generator - TSY misy isLifetime/isTest
function checkSignature(licenseData) {
  if (!licenseData) return false;
  if (!licenseData.signature) return false;

  const payload = {
    licenseId: licenseData.licenseId || '',
    activationId: licenseData.activationId || '',
    licenseKey: licenseData.licenseKey || '',
    packageType: licenseData.packageType || 'basic',
    expirationDate: licenseData.expirationDate || new Date().toISOString(),
    issuedAt: licenseData.issuedAt || new Date().toISOString(),
    maxUsers: licenseData.maxUsers ?? 1,
    maxProducts: licenseData.maxProducts ?? -1,
    maxClients: licenseData.maxClients ?? -1,
  };
  return verifyRSASignature(payload, licenseData.signature);
}

function checkLicenseStatus() {
  try {
    const filePath = getLicensePath();
    if (!fs.existsSync(filePath)) {
      return { success: true, exists: false, message: 'Aucune licence trouvée' };
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    const decrypted = decryptData(data);
    if (!decrypted) {
      return { success: false, error: 'Données corrompues' };
    }

    const license = decrypted;
    if (!license.signature) {
      return { success: true, exists: true, isValid: false, message: 'Signature RSA manquante' };
    }

    if (!checkSignature(license)) {
      return { success: true, exists: true, isValid: false, message: 'Signature RSA invalide' };
    }

    const activatedAt = license.activatedAt || license.issuedAt || null;
    const expiration = checkExpiration(license.expirationDate, license.packageType, activatedAt);

    let isValid = expiration.valid;
    let message = 'Licence valide';
    let daysRemaining = expiration.daysRemaining;
    let minutesRemaining = expiration.minutesRemaining;

    if (!isValid) {
      message = 'Licence expirée';
    } else if (expiration.isTest) {
      message = `🧪 TEST: ${minutesRemaining} min restantes`;
    } else if (expiration.status === 'grace') {
      message = `⚠️ Grace period: ${daysRemaining} jours restants`;
    } else if (expiration.status === 'lifetime') {
      message = '✅ Licence illimitée (Lifetime)';
    } else if (daysRemaining <= 7) {
      message = `⚠️ Licence expire dans ${daysRemaining} jours`;
    }

    return {
      success: true,
      exists: true,
      path: filePath,
      isValid: isValid,
      status: expiration.status,
      message: message,
      daysRemaining: daysRemaining,
      minutesRemaining: minutesRemaining,
      isTest: expiration.isTest || false,
      isLifetime: expiration.isLifetime || false,
      packageType: license.packageType || null,
      licenseKey: license.licenseKey || null,
      activationId: license.activationId || null,
      signature: license.signature || null,
      expirationDate: license.expirationDate || null,
    };
  } catch (error) {
    console.error('❌ Erreur checkLicenseStatus:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  checkExpiration,
  getGracePeriodEnd,
  checkSignature,
  checkLicenseStatus,
};