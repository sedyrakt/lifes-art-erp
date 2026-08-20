// ============================================================
// build-bytenode.cjs - Compiler les fichiers .cjs en .jsc + Loader
// ============================================================

const bytenode = require('bytenode');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Mamorona ny dossiers
const srcDir = path.join(__dirname, 'dist-electron');
const outputDir = path.join(__dirname, 'dist-final');

// 2. Mamorona ilay dist-final raha tsy mbola misy
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 3. Jereo raha misy ilay dist-electron (Vao vita ny Obfuscate)
if (!fs.existsSync(srcDir)) {
    console.error('❌ Erreur: Tsy mbola misy ny dossier "dist-electron".');
    console.error('💡 Alefaso aloha ny: node build-obfuscated.cjs');
    process.exit(1);
}

// 4. Fandefasana ny dossier
function walkSync(currentDir, callback) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
        const filepath = path.join(currentDir, file);
        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            walkSync(filepath, callback);
        } else {
            callback(filepath);
        }
    }
}

console.log('==========================================');
console.log('🚀 Démarrage de la compilation Bytenode...');
console.log('==========================================');

let compiledCount = 0;
let copiedCount = 0;

walkSync(srcDir, (filepath) => {
    const relative = path.relative(srcDir, filepath);
    const destPath = path.join(outputDir, relative);

    // Raha .cjs dia compile ho .jsc ary mamorona loader .cjs
    if (filepath.endsWith('.cjs')) {
        const destJsc = destPath.replace(/\.cjs$/, '.jsc');
        const destLoader = destPath; // Ny .cjs loader no hatao eto

        console.log(`🔧 Compiling: ${relative}`);

        // ⭐ FANITSANA: Mampiasa cross-env mba hiasa amin'ny Windows sy Linux
        // ⭐ FANITSANA: Mamorona ilay dossier aloha vao manao compile
        fs.mkdirSync(path.dirname(destJsc), { recursive: true });

        // Mampiasa bytenode mivantana ao anaty Node mba tsy hiankina amin'ny shell
        try {
            bytenode.compileFile({
                filename: filepath,
                output: destJsc
            });
            
            // Mamorona loader .cjs izay miantso ilay .jsc
            const loaderContent = `require('bytenode'); module.exports = require('./${path.basename(destJsc)}');`;
            fs.mkdirSync(path.dirname(destLoader), { recursive: true });
            fs.writeFileSync(destLoader, loaderContent);

            compiledCount++;
            console.log(`   ✅ Compiled & Loader: ${path.basename(destLoader)}`);
        } catch (err) {
            console.error(`   ❌ Erreur compilation ${relative}:`, err.message);
            process.exit(1);
        }

    } else {
        // Raha tsy .cjs (tahaka ny .pem, .json, .png) dia kopiaina fotsiny
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(filepath, destPath);
        copiedCount++;
    }
});

console.log('==========================================');
console.log('✅ Compilation Bytenode terminée avec succès !');
console.log(`📦 Fichiers compilés (.jsc): ${compiledCount}`);
console.log(`📄 Fichiers copiés (assets): ${copiedCount}`);
console.log(`📁 Dossier final: ${outputDir}`);
console.log('==========================================');