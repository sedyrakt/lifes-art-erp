// ============================================================
// vite.config.mjs
// ⭐ LIFE'S ART ERP PRO
// ⭐ Vite + React + Electron
// ⭐ Production Ready
// ⭐ FIX STATIC ASSETS / LOGO / IMAGES
// ⭐ FIX: isServe undefined
// ⭐ FIX: Electron production base path
// ⭐ FIX: public/images assets
// ============================================================

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
console.log(`⚡ Vite config: ${isProduction ? 'PRODUCTION' : 'DEVELOPPEMENT'}`);

// OBFUSCATOR (Production uniquement)
async function loadObfuscatorPlugin() {
  if (!isProduction) return null;
  try {
    const mod = await import('rollup-plugin-obfuscator');
    return mod.default({
      options: { rotateStringArray: true, stringArray: true, stringArrayEncoding: ['base64','rc4'], stringArrayThreshold: 0.8, stringArrayIndexShift: true, stringArrayIndexesType: ['hexadecimal-number'], controlFlowFlattening: true, controlFlowFlatteningThreshold: 0.75, deadCodeInjection: true, deadCodeInjectionThreshold: 0.4, selfDefending: true, debugProtection: true, debugProtectionInterval: 2000, disableConsoleOutput: true, compact: true, mangle: true, mangleProperties: { regex: '^_' }, transformObjectKeys: true, ignoreImports: false },
      exclude: ['node_modules/**/*', '**/*.d.ts']
    });
  } catch (error) { console.warn('⚠️ Obfuscator non disponible:', error?.message || error); return null; }
}
const obfuscatorPlugin = await loadObfuscatorPlugin();

// TERSER (Production uniquement)
const terserOptions = isProduction ? { compress: { drop_console: true, drop_debugger: true, pure_funcs: ['console.log','console.info','console.debug','console.warn','console.error'], passes: 3, unsafe: true, unsafe_arrows: true, unsafe_comps: true, unsafe_math: true, unsafe_methods: true, unsafe_proto: true, unsafe_regexp: true, unsafe_undefined: true }, mangle: { toplevel: true, reserved: ['__dirname','__filename','require','module','exports'] }, format: { comments: false, beautify: false } } : {};

// MANUAL CHUNKS
function manualChunks(id) {
  if (!id.includes('node_modules')) return;
  if (/react(-dom)?(-router)?/.test(id) && !/react-datepicker|react-hot-toast|recharts|chart\.js/.test(id)) return 'react-vendor';
  if (id.includes('lucide-react')) return 'icons';
  if (/recharts|chart\.js|d3-/.test(id)) return 'charts';
  if (/xlsx|exceljs/.test(id)) return 'excel';
  if (/jspdf|pdf-lib|pdfmake/.test(id)) return 'pdf';
  if (/sharp|canvas/.test(id)) return 'images';
  if (/sqlite3|better-sqlite3/.test(id)) return 'database';
  return 'vendor';
}

// VITE CONFIG
export default defineConfig(({ command }) => {
  const isServe = command === 'serve';
  const isBuild = command === 'build';
  const useObfuscator = isProduction && isBuild && Boolean(obfuscatorPlugin);
  console.log(`📦 Vite command: ${command}`);
  console.log(`🖥️ Electron mode: ${isServe ? 'DEVELOPPEMENT' : 'PRODUCTION'}`);
  console.log(`🖼️ Static assets base: ${isServe ? '/' : './'}`);
  if (isProduction && isBuild && !obfuscatorPlugin) console.warn('⚠️ Obfuscateur absent pour ce build');

  return {
    plugins: [react(), ...(useObfuscator ? [obfuscatorPlugin] : [])],
    base: isServe ? '/' : './',
    resolve: { extensions: ['.tsx','.ts','.jsx','.js','.mjs','.json'], alias: { '@': path.resolve(__dirname, './src') } },
    build: { outDir: 'dist', emptyOutDir: true, minify: isProduction ? 'terser' : false, sourcemap: false, terserOptions, chunkSizeWarningLimit: 1000, rollupOptions: { output: { manualChunks, entryFileNames: 'assets/[name]-[hash].js', chunkFileNames: 'assets/[name]-[hash].js', assetFileNames: 'assets/[name]-[hash].[ext]' } } },
    server: { port: 5173, strictPort: true, host: '0.0.0.0', hmr: { overlay: true } },
    preview: { port: 4173, strictPort: true },
    optimizeDeps: { include: ['react','react-dom','react-router-dom'] },
    publicDir: path.resolve(__dirname, 'public')
  };
});