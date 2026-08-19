// ============================================================
// build-obfuscated.cjs - VERSION PRODUCTION STABLE & RECURSIVE
// ⭐ APETRAKAO AO AMIN'NY ROOT (tsy ao anaty electron/)
// ⭐ FANITSANA: Mandika sy manao OBFUSCATION daholo ny .cjs rehetra
//    ao anaty ipc, services, database, utils, ary license.
// ============================================================

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

console.log('═'.repeat(80));
console.log('🔒 OBFUSCATION DU MAIN PROCESS & MODULES - PRODUCTION STABLE');
console.log('═'.repeat(80));

const isProduction = process.env.NODE_ENV === 'production';
console.log(`📌 Mode: ${isProduction ? 'PRODUCTION' : 'DÉVELOPPEMENT'}`);

const distDir = path.join(__dirname, 'dist-electron');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('📁 Dossier dist-electron créé');
}

const getObfuscationConfig = (isPreload = false) => ({
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.25,
  deadCodeInjection: false,
  debugProtection: false,
  disableConsoleOutput: isProduction,
  identifierNamesGenerator: 'hexadecimal',
  numbersToExpressions: true,
  renameGlobals: false,
  renameProperties: false,
  selfDefending: false,
  splitStrings: true,
  splitStringsChunkLength: 8,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 1,
  unicodeEscapeSequence: false,
});

function obfuscateFile(filePath, outputPath, isPreload = false) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Fichier non trouvé: ${filePath}`);
    return false;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const config = getObfuscationConfig(isPreload);
    const obfuscated = JavaScriptObfuscator.obfuscate(content, config);
    
    const code = typeof obfuscated === 'string' 
      ? obfuscated 
      : (obfuscated.getObfuscatedCode ? obfuscated.getObfuscatedCode() : obfuscated.toString());
    
    const targetDir = path.dirname(outputPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, code);
    return true;
  } catch (error) {
    console.error(`❌ Erreur obfuscation ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

function obfuscateDirectoryRecursive(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      obfuscateDirectoryRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.cjs')) {
        const success = obfuscateFile(srcPath, destPath, false);
        if (success) {
          console.log(`   🔒 Obfusqué: ${path.relative(path.join(__dirname, 'electron'), srcPath)}`);
        }
      } else {
        fs.copyFileSync(srcPath, destPath);
        console.log(`   📄 Copié (non-.cjs): ${path.relative(path.join(__dirname, 'electron'), srcPath)}`);
      }
    }
  }
}

// ⭐ 1. Obfuscate main.cjs
const mainPath = path.join(__dirname, 'electron/main.cjs');
if (!fs.existsSync(mainPath)) {
  console.error('❌ main.cjs introuvable:', mainPath);
  process.exit(1);
}
obfuscateFile(mainPath, path.join(distDir, 'main.cjs'), false);
console.log('✅ main.cjs obfusqué');

// ⭐ 2. Obfuscate preload.cjs
const preloadPath = path.join(__dirname, 'electron/preload.cjs');
if (fs.existsSync(preloadPath)) {
  obfuscateFile(preloadPath, path.join(distDir, 'preload.cjs'), true);
  console.log('✅ preload.cjs obfusqué');
} else {
  console.log('⚠️ preload.cjs non trouvé, ignoré');
}

// ⭐ 3. Traiter et obfusquer récursivement les dossiers cibles
console.log('\n📂 Traitement et obfuscation des dossiers (ipc, services, database, utils, license)...');

// ⭐ VAOVAO: Nampiana ny 'license' mba ho voaobfusqué
const foldersToProcess = ['database', 'ipc', 'services', 'utils', 'license'];
for (const folder of foldersToProcess) {
  const srcFolder = path.join(__dirname, 'electron', folder);
  const destFolder = path.join(distDir, folder);
  
  if (fs.existsSync(srcFolder)) {
    console.log(`\n📁 Dossier: ${folder}/`);
    obfuscateDirectoryRecursive(srcFolder, destFolder);
    console.log(`   ✅ ${folder}/ traité avec succès`);
  } else {
    console.log(`   ⚠️ ${folder}/ non trouvé, ignoré`);
  }
}

// ⭐ 4. Copier les dossiers additionnels (keys, assets, config)
console.log('\n📂 Copie des ressources complémentaires...');
const additionalItems = [
  { src: path.join(__dirname, 'admin-tools/keys'), dest: path.join(distDir, 'keys') },
  { src: path.join(__dirname, 'electron/assets'), dest: path.join(distDir, 'assets') },
  { src: path.join(__dirname, 'electron/config'), dest: path.join(distDir, 'config') },
];

for (const item of additionalItems) {
  if (fs.existsSync(item.src)) {
    if (fs.existsSync(item.dest)) {
      fs.rmSync(item.dest, { recursive: true, force: true });
    }
    fs.cpSync(item.src, item.dest, { recursive: true });
    console.log(`   ✅ ${path.basename(item.src)} copié`);
  }
}

// ⭐ 5. Copier les fichiers JSON générés (hashes, manifest)
const generatedSrc = path.join(__dirname, 'electron/generated');
const generatedDest = path.join(distDir, 'generated');
if (fs.existsSync(generatedSrc)) {
  if (fs.existsSync(generatedDest)) {
    fs.rmSync(generatedDest, { recursive: true, force: true });
  }
  fs.cpSync(generatedSrc, generatedDest, { recursive: true });
  console.log('   ✅ generated/ copié');
}

// ⭐ 6. Copier les resources de sécurité
const resourcesSrc = path.join(__dirname, 'resources');
const resourcesDest = path.join(distDir, 'resources');
if (fs.existsSync(resourcesSrc)) {
  if (fs.existsSync(resourcesDest)) {
    fs.rmSync(resourcesDest, { recursive: true, force: true });
  }
  fs.cpSync(resourcesSrc, resourcesDest, { recursive: true });
  console.log('   ✅ resources/ copié');
}

// ⭐ 7. Vérifier que la public key est bien présente
const publicKeyPath = path.join(distDir, 'keys/public.pem');
if (fs.existsSync(publicKeyPath)) {
  console.log('   ✅ public.pem présent dans keys/');
} else {
  console.warn('   ⚠️ public.pem manquant dans keys/ - integrity check échouera');
}

console.log('\n' + '═'.repeat(80));
console.log('✅ OBFUSCATION TOTALE TERMINÉE');
console.log(`📁 Dossier: ${distDir}`);
console.log(`🔧 Mode: ${isProduction ? 'PRODUCTION' : 'DÉVELOPPEMENT'}`);
console.log('═'.repeat(80));