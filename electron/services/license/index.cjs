// ============================================================
// electron/services/license/index.cjs - RE-EXPORT
// ⭐ CommonJS
// ⭐ FIX: Raha tsy misy machine/file/validation dia atao skip
// ============================================================

const constants = require('./constants.cjs');
const crypto = require('./crypto.cjs');
const activation = require('./activation.cjs');
const security = require('./security.cjs');

// ⭐ Utils (Misy)
let utils = {};
try {
  utils = require('./utils.cjs');
} catch (e) {
  console.warn('⚠️ license/utils.cjs tsy hita:', e.message);
}

// ⭐ Machine (OPTIONNEL - tsy ilaina)
let machine = {};
try {
  machine = require('./machine.cjs');
} catch (e) {
  console.warn('⚠️ license/machine.cjs tsy hita (azonao atao tsy misy):', e.message);
}

// ⭐ File (OPTIONNEL - tsy ilaina)
let file = {};
try {
  file = require('./file.cjs');
} catch (e) {
  console.warn('⚠️ license/file.cjs tsy hita (azonao atao tsy misy):', e.message);
}

// ⭐ Validation (OPTIONNEL - tsy ilaina)
let validation = {};
try {
  validation = require('./validation.cjs');
} catch (e) {
  console.warn('⚠️ license/validation.cjs tsy hita (azonao atao tsy misy):', e.message);
}

module.exports = {
  // Constants
  ...constants,
  // Utils
  ...utils,
  // Crypto
  ...crypto,
  // Machine
  ...machine,
  // Security
  ...security,
  // File
  ...file,
  // Validation
  ...validation,
  // Activation
  ...activation,
};

// ⭐ Export explicite des fonctions principales
module.exports.getPackages = () => constants.PACKAGES;
module.exports.activateWithCode = activation.activateWithCode;
module.exports.isCodeUsable = activation.isCodeUsable;
module.exports.verifyCode = activation.verifyCode;

console.log('✅ license/index.cjs - Tous les modules chargés (CommonJS)');