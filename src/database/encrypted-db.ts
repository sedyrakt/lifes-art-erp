// ⭐ ENCRYPTED DATABASE - VERSION FENO
// ⭐ MIARAKA AMIN'NY FANAMARINANA LICENCE

import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import os from 'os';

// ============================================================
// ⭐ CONSTANTES
// ============================================================

const SALT = Buffer.from('LIFE_ART_ERP_DB_SALT_2026_V2', 'utf8');
const ITERATIONS = 100000;
const KEY_LENGTH = 32;
const ALGORITHM = 'aes-256-gcm';

// ============================================================
// ⭐ DERIVE KEY
// ============================================================

export function deriveDatabaseKey(licenseKey: string): Buffer {
  return crypto.pbkdf2Sync(
    licenseKey,
    SALT,
    ITERATIONS,
    KEY_LENGTH,
    'sha256'
  );
}

export function deriveDatabaseKeyFromLicense(): Buffer | null {
  try {
    // ⭐ Maka ny licence key avy amin'ny fichier
    const licensePath = getLicensePath();
    if (!fs.existsSync(licensePath)) return null;
    
    const data = fs.readFileSync(licensePath, 'utf-8');
    const decrypted = decryptLicenseData(data);
    if (!decrypted || !decrypted.licenseKey) return null;
    
    return deriveDatabaseKey(decrypted.licenseKey);
  } catch (error) {
    console.error('❌ Erreur derive key:', error);
    return null;
  }
}

// ============================================================
// ⭐ FONCTIONS DE CHIFFREMENT
// ============================================================

export function encryptDatabaseData(data: string, key: Buffer): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();
    return iv.toString('base64') + ':' + authTag.toString('base64') + ':' + encrypted;
  } catch (error) {
    console.error('❌ Erreur encryption database:', error);
    throw error;
  }
}

export function decryptDatabaseData(encrypted: string, key: Buffer): string | null {
  try {
    const parts = encrypted.split(':');
    if (parts.length !== 3) return null;
    
    const iv = Buffer.from(parts[0], 'base64');
    const authTag = Buffer.from(parts[1], 'base64');
    const cipherText = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(cipherText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('❌ Erreur decryption database:', error);
    return null;
  }
}

// ============================================================
// ⭐ VERIFICATION DB KEY
// ============================================================

export function verifyDatabaseKey(dbPath: string, key: Buffer): boolean {
  try {
    // ⭐ Maka ny header an'ny database
    const header = fs.readFileSync(dbPath, { encoding: 'utf8' });
    if (!header || header.length === 0) return false;
    
    // ⭐ Essayer de decrypt ny header
    const decrypted = decryptDatabaseData(header.substring(0, 100), key);
    return decrypted !== null;
  } catch {
    return false;
  }
}

// ============================================================
// ⭐ SECURE DATABASE WRAPPER
// ============================================================

export class SecureDatabase {
  private key: Buffer | null = null;
  private dbPath: string;
  private isOpen: boolean = false;
  private db: any = null;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  async open(): Promise<boolean> {
    try {
      // ⭐ 1. Vérifier la licence
      const licenseValid = await this.checkLicense();
      if (!licenseValid) {
        console.error('❌ Licence invalide - Impossibile d\'ouvrir la DB');
        return false;
      }

      // ⭐ 2. Derive key
      this.key = deriveDatabaseKeyFromLicense();
      if (!this.key) {
        console.error('❌ Impossible de dériver la clé');
        return false;
      }

      // ⭐ 3. Vérifier la clé
      if (!verifyDatabaseKey(this.dbPath, this.key)) {
        console.error('❌ Clé DB invalide');
        return false;
      }

      // ⭐ 4. Ouvrir la DB
      // const sqlite3 = require('sqlite3');
      // this.db = new sqlite3.Database(this.dbPath);
      // this.db.exec(`PRAGMA key = '${this.key.toString('hex')}'`);
      
      this.isOpen = true;
      return true;
    } catch (error) {
      console.error('❌ Erreur ouverture DB:', error);
      return false;
    }
  }

  private async checkLicense(): Promise<boolean> {
    try {
      // ⭐ Mampiasa ny license service
      const result = await (window as any).api.license.checkStatus();
      return result.success && result.isValid;
    } catch {
      return false;
    }
  }

  getDatabase() {
    if (!this.isOpen || !this.db) {
      throw new Error('Database not open');
    }
    return this.db;
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isOpen = false;
    }
  }
}

// ============================================================
// ⭐ EXPORT
// ============================================================

export default {
  deriveDatabaseKey,
  deriveDatabaseKeyFromLicense,
  encryptDatabaseData,
  decryptDatabaseData,
  verifyDatabaseKey,
  SecureDatabase,
};