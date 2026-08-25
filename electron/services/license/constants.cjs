'use strict';

const path = require('path');
const os = require('os');

// ============================================================
// PACKAGES
// ============================================================

const PACKAGES = {
  test: {
    id: 'test',
    name: 'Test (30 min)',
    prefix: 'TS',
    duration: 0,
    price: 0,
    maxUsers: 1,
    maxProducts: 5,
    maxClients: 3,
    isTest: true,
    isLifetime: false,
    defaultQuantity: 100,
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    prefix: 'BS',
    duration: 30,
    price: 50000,
    maxUsers: 1,
    maxProducts: 100,
    maxClients: 50,
    isTest: false,
    isLifetime: false,
    defaultQuantity: 100,
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    prefix: 'ST',
    duration: 60,
    price: 120000,
    maxUsers: 3,
    maxProducts: 500,
    maxClients: 200,
    isTest: false,
    isLifetime: false,
    defaultQuantity: 100,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    prefix: 'PR',
    duration: 365,
    price: 350000,
    maxUsers: 10,
    maxProducts: -1,
    maxClients: -1,
    isTest: false,
    isLifetime: false,
    defaultQuantity: 100,
  },
  national: {
    id: 'national',
    name: 'National',
    prefix: 'NA',
    duration: 730,
    price: 600000,
    maxUsers: 25,
    maxProducts: -1,
    maxClients: -1,
    isTest: false,
    isLifetime: false,
    defaultQuantity: 100,
  },
  centralized: {
    id: 'centralized',
    name: 'Centralized',
    prefix: 'CE',
    duration: -1,
    price: 1500000,
    maxUsers: -1,
    maxProducts: -1,
    maxClients: -1,
    isTest: false,
    isLifetime: true,
    defaultQuantity: 1,
  },
};

const VALID_PACKAGES = Object.keys(PACKAGES);
const GRACE_PERIOD_DAYS = 5;
const MAX_TAMPER_ATTEMPTS = 5;
const TAMPER_LOCKOUT_MINUTES = 60;
const MAX_RESET_ATTEMPTS = 5;
const RESET_LOCKOUT_MINUTES = 15;
const DEVTOOLS_LOCKOUT_FILE = path.join(os.homedir(), '.fitaia_devtools_lock');

const EXCLUDED_FILES = [
  'license.lic',
  '.fitaia_lockout',
  '.fitaia_time.dat',
  '.fitaia_machine_id',
  '.fitaia_reset_lock',
  '.fitaia_devtools_lock',
];

const APP_VERSION = process.env.npm_package_version || process.env.APP_VERSION || '1.0.0';

const isPackaged =
  process.env.NODE_ENV === 'production' ||
  (process.defaultApp !== undefined && !process.defaultApp && process.resourcesPath !== undefined);

const RESOURCES_PATH =
  isPackaged && process.resourcesPath
    ? process.resourcesPath
    : path.join(__dirname, '../../');

const PUBLIC_KEY_PATHS = [
  ...(process.resourcesPath
    ? [path.join(process.resourcesPath, 'keys/public.pem')]
    : []),
  ...(process.resourcesPath
    ? [path.join(process.resourcesPath, 'app.asar.unpacked', 'keys/public.pem')]
    : []),
  path.join(__dirname, '../../keys/public.pem'),
  path.join(__dirname, '../../../keys/public.pem'),
  path.join(process.cwd(), 'keys/public.pem'),
];

// ============================================================
// ⭐ OFFICIAL ACTIVATION CODE FORMAT
// ⭐ LA-XXXX-XXXX-XXXX
// ⭐ Example: LA-TSSE-VX2M-8C8Q
// ============================================================

const ACTIVATION_CODE_FORMAT = /^LA-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const ACTIVATION_CODE_PREFIX = 'LA';
const ACTIVATION_CODE_LENGTH = 17;

module.exports = {
  PACKAGES,
  VALID_PACKAGES,
  GRACE_PERIOD_DAYS,
  MAX_TAMPER_ATTEMPTS,
  TAMPER_LOCKOUT_MINUTES,
  MAX_RESET_ATTEMPTS,
  RESET_LOCKOUT_MINUTES,
  DEVTOOLS_LOCKOUT_FILE,
  EXCLUDED_FILES,
  APP_VERSION,
  isPackaged,
  PUBLIC_KEY_PATHS,
  RESOURCES_PATH,
  ACTIVATION_CODE_FORMAT,
  ACTIVATION_CODE_PREFIX,
  ACTIVATION_CODE_LENGTH,
};