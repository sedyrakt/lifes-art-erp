// ============================================================
// build-scripts/generate-hashes.js - VERSION PRODUCTION FINALE (BYTENODE)
// ⭐ GÉNÉRATION DES HASHES POUR BUILD (SANS LICENSE)
// ⭐ VERSION + TIMESTAMP DANS LE MANIFEST
// ⭐ DUPLICATE PATH DETECTION
// ============================================================

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// ⭐ CONSTANTES
// ============================================================
const APP_VERSION = process.env.npm_package_version || process.env.APP_VERSION || '1.0.0';
const BUILD_TIMESTAMP = new Date().toISOString();

// ⭐ Directories à inclure dans le hash (Clean ho an'ny .jsc sy .cjs)
const INCLUDED_DIRS = [
  // ⭐ 1. Le build React
  { src: path.join(__dirname, '../dist'), dest: 'dist' },
  
  // ⭐ 2. Les fichiers Electron principaux
  { src: path.join(__dirname, '../dist-electron/main.jsc'), dest: 'electron/main.jsc' },
  { src: path.join(__dirname, '../dist-electron/main.cjs'), dest: 'electron/main.cjs' },
  { src: path.join(__dirname, '../dist-electron/preload.cjs'), dest: 'electron/preload.cjs' },
  
  // ⭐ 3. Le dossier IPC (tous les handlers)
  { src: path.join(__dirname, '../dist-electron/ipc'), dest: 'electron/ipc' },
  
  // ⭐ 4. Les utilitaires (security, logger, machineId)
  { src: path.join(__dirname, '../dist-electron/utils'), dest: 'electron/utils' },
  
  // ⭐ 5. La base de données (structure et tables)
  { src: path.join(__dirname, '../dist-electron/database/db.cjs'), dest: 'electron/database/db.cjs' },
  { src: path.join(__dirname, '../dist-electron/database/init.cjs'), dest: 'electron/database/init.cjs' },
  { src: path.join(__dirname, '../dist-electron/database/tables'), dest: 'electron/database/tables' },
  
  // ⭐ 6. Les migrations (si elles existent)
  { src: path.join(__dirname, '../dist-electron/database/migrations'), dest: 'electron/database/migrations' },
  
  // ⭐ 7. Package.json + lock
  { src: path.join(__dirname, '../package.json'), dest: 'package.json' },
  { src: path.join(__dirname, '../package-lock.json'), dest: 'package-lock.json' },
  
  // ⭐ 8. Configuration electron-builder
  { src: path.join(__dirname, '../electron-builder.yml'), dest: 'electron-builder.yml' },
  { src: path.join(__dirname, '../electron-builder.json'), dest: 'electron-builder.json' },
];

// ⭐ Directories à EXCLURE (ne pas hasher)
const EXCLUDED = [
  'node_modules',
  '.git',
  'backups',
  'logs',
  'uploads',
  'generated',
  '*.db',
  '*.db-shm',
  '*.db-wal',
  '*.log',
  '*.tmp',
  '*.map',
  '*.ts',
  '*.tsx',
  '*.js.map',
];

// ⭐ Dossier de sortie
const OUTPUT_DIR = path.join(__dirname, '../dist-electron/generated');
const OUTPUT_HASHES = path.join(OUTPUT_DIR, 'hashes.json');
const OUTPUT_MANIFEST = path.join(OUTPUT_DIR, 'manifest.json');

// ============================================================
// ⭐ FONCTIONS
// ============================================================

function shouldExclude(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  for (const pattern of EXCLUDED) {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      if (regex.test(normalized)) return true;
    } else {
      if (normalized.includes(pattern)) return true;
    }
  }
  return false;
}

function walkDir(dir, baseDir, hashes, manifest) {
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️ Dossier non trouvé: ${dir}`);
    return;
  }
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    const relativePath = path.join(baseDir, file).replace(/\\/g, '/');
    
    if (stat.isDirectory()) {
      if (shouldExclude(relativePath)) {
        console.log(`   ⏭️ Exclusion: ${relativePath}`);
        continue;
      }
      walkDir(fullPath, relativePath, hashes, manifest);
    } else {
      if (shouldExclude(relativePath)) {
        console.log(`   ⏭️ Exclusion: ${relativePath}`);
        continue;
      }
      
      if (hashes[relativePath]) {
        console.error(`   ❌ DUPLICATE PATH: ${relativePath}`);
        console.error(`      Hash existant: ${hashes[relativePath].substring(0, 16)}...`);
        console.error(`      Nouveau fichier: ${fullPath}`);
        process.exit(1);
      }
      
      const data = fs.readFileSync(fullPath);
      const hash = crypto.createHash('sha256').update(data).digest('hex');
      
      hashes[relativePath] = hash;
      manifest[relativePath] = {
        hash: hash,
        size: stat.size,
        version: APP_VERSION,
        generatedAt: BUILD_TIMESTAMP,
      };
      
      console.log(`   ✅ ${relativePath} -> ${hash.substring(0, 16)}...`);
    }
  }
}

// ============================================================
// ⭐ GÉNÉRATION PRINCIPALE
// ============================================================

function generateHashes() {
  console.log('═'.repeat(80));
  console.log('🔐 GÉNÉRATION DES HASHES POUR BUILD (SANS LICENSE)');
  console.log('═'.repeat(80));
  console.log(`   Version: ${APP_VERSION}`);
  console.log(`   Timestamp: ${BUILD_TIMESTAMP}`);
  console.log('');
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log('📁 Dossier generated/ créé');
  }
  
  const hashes = {};
  const manifest = {};
  let totalFiles = 0;
  let totalSize = 0;
  
  for (const entry of INCLUDED_DIRS) {
    const src = entry.src;
    const dest = entry.dest;
    
    if (fs.existsSync(src)) {
      const stat = fs.statSync(src);
      if (stat.isDirectory()) {
        console.log(`📂 Parcours: ${dest}/`);
        walkDir(src, dest, hashes, manifest);
      } else {
        console.log(`📄 Fichier: ${dest}`);
        const data = fs.readFileSync(src);
        const hash = crypto.createHash('sha256').update(data).digest('hex');
        
        if (hashes[dest]) {
          console.error(`   ❌ DUPLICATE PATH: ${dest}`);
          process.exit(1);
        }
        
        hashes[dest] = hash;
        manifest[dest] = {
          hash: hash,
          size: stat.size,
          version: APP_VERSION,
          generatedAt: BUILD_TIMESTAMP,
        };
        console.log(`   ✅ ${dest} -> ${hash.substring(0, 16)}...`);
      }
    } else {
      console.warn(`⚠️ Fichier/dossier non trouvé (Ignoré): ${src}`);
    }
  }
  
  totalFiles = Object.keys(hashes).length;
  totalSize = Object.values(manifest).reduce((sum, m) => sum + m.size, 0);
  
  console.log('\n📊 STATISTIQUES:');
  console.log(`   Fichiers hashed: ${totalFiles}`);
  console.log(`   Taille totale: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  
  fs.writeFileSync(OUTPUT_MANIFEST, JSON.stringify({
    version: APP_VERSION,
    generatedAt: BUILD_TIMESTAMP,
    totalFiles: totalFiles,
    totalSize: totalSize,
    files: manifest,
  }, null, 2));
  console.log(`\n✅ manifest.json sauvegardé: ${OUTPUT_MANIFEST}`);
  
  const sortedHashes = Object.keys(hashes).sort().reduce((obj, key) => {
    obj[key] = hashes[key];
    return obj;
  }, {});
  
  const hashesWithMetadata = {
    metadata: {
      version: APP_VERSION,
      generatedAt: BUILD_TIMESTAMP,
      totalFiles: totalFiles,
    },
    files: sortedHashes,
  };
  
  const hashesJson = JSON.stringify(hashesWithMetadata, null, 2);
  fs.writeFileSync(OUTPUT_HASHES, hashesJson);
  console.log(`✅ hashes.json sauvegardé: ${OUTPUT_HASHES}`);
  
  console.log('\n' + '═'.repeat(80));
  console.log('✅ GÉNÉRATION DES HASHES TERMINÉE AVEC SUCCÈS');
  console.log('═'.repeat(80));
}

generateHashes();