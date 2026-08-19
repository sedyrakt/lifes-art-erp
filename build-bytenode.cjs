// build-final-bytecode.cjs
const bytenode = require('bytenode');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = path.join(__dirname, 'dist-electron');
const outputDir = path.join(__dirname, 'dist-final');

function walkSync(currentDir, callback) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const filepath = path.join(currentDir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) walkSync(filepath, callback);
    else callback(filepath);
  }
}

if (!fs.existsSync(srcDir)) {
  console.error('❌ Tsy mbola misy ny dist-electron! Alefaso aloha ny build-obfuscated.cjs');
  process.exit(1);
}

// Copy and Compile
walkSync(srcDir, (filepath) => {
  const relative = path.relative(srcDir, filepath);
  const destPath = path.join(outputDir, relative);

  if (filepath.endsWith('.cjs')) {
    const destJsc = destPath.replace(/\.cjs$/, '.jsc');
    const destLoader = destPath;

    console.log(`🔧 Compiling: ${relative}`);
    
    const cmd = `ELECTRON_RUN_AS_NODE=1 "${process.execPath}" -e "require('bytenode').compileFile({ filename: '${filepath}', output: '${destJsc}' })"`;
    execSync(cmd, { stdio: 'inherit' });

    // Mamorona loader .cjs mba hahafahan'ny Electron mamaky ny .jsc
    const loaderContent = `require('bytenode'); module.exports = require('./${path.basename(destJsc)}');`;
    fs.mkdirSync(path.dirname(destLoader), { recursive: true });
    fs.writeFileSync(destLoader, loaderContent);
    console.log(`   ✅ Loader generated: ${path.basename(destLoader)}`);
  } else {
    // Copy non-cjs files (json, pem, etc)
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(filepath, destPath);
  }
});

console.log('✅ Production dist-final prêt!');