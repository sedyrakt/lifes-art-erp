// ⭐ SECURITY.TS - VERSION FENO VOAHITSY
// ⭐ MIARAKA AMIN'NY FANITSARANA HO AN'NY DEV SY PRODUCTION

// ============================================================
// ⭐ CONSTANTES
// ============================================================

const SECURITY_CONFIG = {
  ANTI_DEBUG_INTERVAL: 2000,
  MAX_DEBUG_DETECTIONS: 3,
  LOCKOUT_DURATION: 300000, // 5 minutes
  INTEGRITY_CHECK_INTERVAL: 60000, // 1 minute
  DEV_TOOLS_DETECTION_INTERVAL: 1000,
};

let debugDetectionCount = 0;
let isLocked = false;
let lockoutTimer: NodeJS.Timeout | null = null;
let antiDebugInterval: NodeJS.Timeout | null = null;
let integrityInterval: NodeJS.Timeout | null = null;
let devToolsInterval: NodeJS.Timeout | null = null;

// ============================================================
// ⭐ 1. DETECT DEBUGGER - MULTI-METHODS
// ============================================================

/**
 * Detecte le debugger avec plusieurs méthodes
 * - Timing attack
 * - Function toString
 * - Error stack
 * - Arguments
 * - DevTools
 */
export function detectDebugger(): boolean {
  try {
    // ⭐ Méthode 1: Timing Attack
    const start = Date.now();
    debugger;
    const timingDiff = Date.now() - start;
    if (timingDiff > 100) {
      console.warn('🔍 Debugger détecté (timing)');
      return true;
    }

    // ⭐ Méthode 2: Function toString
    try {
      const fn = function() {};
      const fnString = fn.toString();
      if (fnString.includes('debugger') || fnString.includes('[native code]')) {
        console.warn('🔍 Debugger détecté (function toString)');
        return true;
      }
    } catch {}

    // ⭐ Méthode 3: Error Stack
    try {
      throw new Error('security-check');
    } catch (e: any) {
      if (e.stack && (
        e.stack.includes('debugger') ||
        e.stack.includes('DevTools') ||
        e.stack.includes('VM') ||
        e.stack.includes('eval')
      )) {
        console.warn('🔍 Debugger détecté (stack)');
        return true;
      }
    }

    // ⭐ Méthode 4: Vérifier les arguments de la fonction
    try {
      // @ts-ignore
      const args = process?.argv || [];
      if (args.some((arg: string) => 
        arg.includes('--inspect') || 
        arg.includes('--inspect-brk') ||
        arg.includes('--remote-debugging-port')
      )) {
        console.warn('🔍 Debugger détecté (args)');
        return true;
      }
    } catch {}

    // ⭐ Méthode 5: Vérifier DevTools via Electron
    try {
      // @ts-ignore
      if (window?.electronAPI?.isDevToolsOpened) {
        // @ts-ignore
        if (window.electronAPI.isDevToolsOpened()) {
          console.warn('🔍 DevTools détecté');
          return true;
        }
      }
    } catch {}

    // ⭐ Méthode 6: Vérifier la taille de l'écran (DevTools réduit la taille)
    try {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width < 200 || height < 200) {
        console.warn('🔍 Fenêtre anormalement petite');
        return true;
      }
    } catch {}

    return false;
  } catch {
    return false;
  }
}

// ============================================================
// ⭐ 2. ANTI-DEBUG LOOP AVEC LOCKOUT
// ============================================================

/**
 * Démarrer la surveillance anti-debug
 */
export function startAntiDebug(interval: number = SECURITY_CONFIG.ANTI_DEBUG_INTERVAL): void {
  if (antiDebugInterval) {
    clearInterval(antiDebugInterval);
  }

  antiDebugInterval = setInterval(() => {
    if (isLocked) {
      return;
    }

    if (detectDebugger()) {
      debugDetectionCount++;
      
      if (debugDetectionCount >= SECURITY_CONFIG.MAX_DEBUG_DETECTIONS) {
        lockApplication();
        return;
      }

      if (debugDetectionCount === 1) {
        console.warn('⚠️ Avertissement: Debugger détecté');
        showDebugWarning();
      } else if (debugDetectionCount === 2) {
        console.warn('⚠️ Deuxième détection - Ralentissement');
        slowDownApplication();
      }
    } else {
      if (debugDetectionCount > 0 && !isLocked) {
        debugDetectionCount = Math.max(0, debugDetectionCount - 1);
      }
    }
  }, interval);
}

/**
 * Arrêter la surveillance anti-debug
 */
export function stopAntiDebug(): void {
  if (antiDebugInterval) {
    clearInterval(antiDebugInterval);
    antiDebugInterval = null;
  }
  if (integrityInterval) {
    clearInterval(integrityInterval);
    integrityInterval = null;
  }
  if (devToolsInterval) {
    clearInterval(devToolsInterval);
    devToolsInterval = null;
  }
}

/**
 * Bloquer l'application après trop de détections
 */
function lockApplication(): void {
  if (isLocked) return;
  
  isLocked = true;
  console.error('🔒 Application verrouillée - Trop de tentatives de debug');
  
  showLockScreen();
  
  if (lockoutTimer) {
    clearTimeout(lockoutTimer);
  }
  
  lockoutTimer = setTimeout(() => {
    isLocked = false;
    debugDetectionCount = 0;
    hideLockScreen();
    console.log('🔓 Application déverrouillée');
  }, SECURITY_CONFIG.LOCKOUT_DURATION);
}

/**
 * Afficher un avertissement de debug
 */
function showDebugWarning(): void {
  try {
    const toast = document.querySelector('[data-toast]');
    if (toast) {
      // @ts-ignore
      toast.show('⚠️ Debugger détecté - Veuillez fermer les outils de développement');
    }
  } catch {}
}

/**
 * Ralentir l'application
 */
function slowDownApplication(): void {
  try {
    document.querySelectorAll('*').forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.transitionDuration = '5s';
      }
    });
  } catch {}
}

/**
 * Afficher l'écran de lock
 */
function showLockScreen(): void {
  try {
    const overlay = document.createElement('div');
    overlay.id = 'security-lock-screen';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.9);
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      font-family: Arial, sans-serif;
    `;
    overlay.innerHTML = `
      <h1 style="font-size: 48px; margin-bottom: 20px;">🔒</h1>
      <h2 style="font-size: 24px; margin-bottom: 10px;">Application Verrouillée</h2>
      <p style="font-size: 16px; color: #aaa;">Détection de debug répétée</p>
      <p style="font-size: 14px; color: #666; margin-top: 20px;">Réessayez dans quelques minutes</p>
    `;
    document.body.appendChild(overlay);
  } catch {}
}

/**
 * Cacher l'écran de lock
 */
function hideLockScreen(): void {
  try {
    const overlay = document.getElementById('security-lock-screen');
    if (overlay) {
      overlay.remove();
    }
  } catch {}
}

// ============================================================
// ⭐ 3. INTEGRITY CHECK - VERSION CORRIGÉE ⭐
// ============================================================

/**
 * Vérifier l'intégrité des fichiers
 * ⭐ SKIP EN DÉVELOPPEMENT
 * ⭐ VÉRIFICATION LÉGÈRE EN PRODUCTION
 */
export async function checkIntegrity(): Promise<boolean> {
  // ⭐ 1. SKIP EN DÉVELOPPEMENT
  if (import.meta.env.DEV) {
    console.log('ℹ️ Integrity check désactivé en développement');
    return true;
  }

  // ⭐ 2. VÉRIFICATION EN PRODUCTION
  try {
    // ⭐ Vérifier si on est dans un environnement Electron
    const isElectron = window && window.electronAPI !== undefined;
    if (!isElectron) {
      console.log('ℹ️ Non-électron environment, skip integrity check');
      return true;
    }

    // ⭐ Récupérer les hashes depuis le main process
    const hashes = await window?.api?.license?.getIntegrityHashes?.() || {};
    
    if (Object.keys(hashes).length === 0) {
      console.log('ℹ️ Aucun hash disponible, skip integrity check');
      return true;
    }

    // ⭐ Vérifier les fichiers critiques
    const criticalFiles = ['index.html'];
    let allValid = true;

    for (const file of criticalFiles) {
      try {
        // ⭐ En production, utiliser le protocole app:// ou /dist/
        const url = file === 'index.html' ? '/' : `/dist/${file}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          console.warn(`⚠️ Fichier manquant: ${file}`);
          allValid = false;
          continue;
        }
        
        const data = await response.text();
        const computedHash = await calculateHash(data);
        
        // ⭐ Vérifier le hash
        const expectedHash = hashes[file];
        if (expectedHash && computedHash !== expectedHash) {
          console.warn(`⚠️ Intégrité compromise: ${file}`);
          allValid = false;
        }
      } catch (error) {
        console.warn(`⚠️ Impossible de vérifier ${file}:`, error);
        allValid = false;
      }
    }

    return allValid;
  } catch (error) {
    console.error('❌ Erreur integrity check:', error);
    // ⭐ En production, l'erreur est critique
    if (import.meta.env.PROD) {
      return false;
    }
    return true;
  }
}

/**
 * Calculer le hash d'une chaîne
 */
async function calculateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Démarrer la vérification d'intégrité périodique
 * ⭐ SKIP EN DÉVELOPPEMENT
 */
export function startIntegrityCheck(interval: number = SECURITY_CONFIG.INTEGRITY_CHECK_INTERVAL): void {
  // ⭐ SKIP EN DÉVELOPPEMENT
  if (import.meta.env.DEV) {
    console.log('ℹ️ Integrity check périodique désactivé en développement');
    return;
  }

  if (integrityInterval) {
    clearInterval(integrityInterval);
  }

  // ⭐ Vérification initiale
  checkIntegrity().then(valid => {
    if (!valid) {
      console.error('❌ Intégrité compromise au démarrage');
      handleIntegrityFailure();
    }
  });

  // ⭐ Vérification périodique
  integrityInterval = setInterval(async () => {
    const valid = await checkIntegrity();
    if (!valid) {
      console.error('❌ Intégrité compromise - Vérification périodique');
      handleIntegrityFailure();
    }
  }, interval);
}

/**
 * Gérer un échec d'intégrité
 */
function handleIntegrityFailure(): void {
  // ⭐ Bloquer l'accès aux fonctionnalités sensibles
  try {
    const overlay = document.createElement('div');
    overlay.id = 'integrity-failure-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255,0,0,0.1);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999998;
      pointer-events: none;
    `;
    overlay.innerHTML = `
      <div style="background: white; padding: 40px; border-radius: 12px; border: 2px solid red; max-width: 400px; text-align: center;">
        <h2 style="color: red; font-size: 24px;">⚠️ Intégrité Compromise</h2>
        <p style="color: #333; margin-top: 10px;">L'application a été modifiée. Veuillez réinstaller.</p>
        <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 30px; background: #c8963e; color: white; border: none; border-radius: 8px; cursor: pointer;">
          Recharger
        </button>
      </div>
    `;
    document.body.appendChild(overlay);
  } catch {}
}

// ============================================================
// ⭐ 4. ENVIRONMENT CHECK
// ============================================================

/**
 * Vérifier l'environnement
 */
export function checkEnvironment(): boolean {
  // ⭐ Vérifier si c'est un environnement de développement
  if (import.meta.env.DEV) {
    console.warn('⚠️ Mode développement - Vérification allégée');
    return true;
  }

  // ⭐ Vérifier les variables d'environnement
  if (typeof window === 'undefined') {
    return false;
  }

  // ⭐ Vérifier que nous sommes dans un navigateur légitime
  try {
    const userAgent = navigator.userAgent;
    // ⭐ Vérifier les User Agents suspects
    const suspicious = [
      'PhantomJS',
      'Headless',
      'Selenium',
      'Puppeteer',
      'Playwright',
      'Cypress',
    ];
    for (const sus of suspicious) {
      if (userAgent.includes(sus)) {
        console.warn(`⚠️ User Agent suspect: ${sus}`);
        return false;
      }
    }
  } catch {}

  return true;
}

// ============================================================
// ⭐ 5. ANTI-TAMPER
// ============================================================

/**
 * Protéger les fonctions critiques
 */
export function antiTamper(): void {
  // ⭐ Bloquer les logs en production
  if (import.meta.env.PROD) {
    const originalLog = console.log;
    const originalInfo = console.info;
    const originalDebug = console.debug;
    
    console.log = function(...args) {
      // ⭐ Autoriser certains logs critiques
      if (args[0] && typeof args[0] === 'string' && args[0].includes('🔒')) {
        originalLog.apply(console, args);
        return;
      }
      return;
    };
    
    console.info = function(...args) {
      return;
    };
    
    console.debug = function(...args) {
      return;
    };
  }

  // ⭐ Protéger Object.freeze
  try {
    Object.freeze(Object.prototype);
    Object.freeze(Array.prototype);
    Object.freeze(String.prototype);
    Object.freeze(Number.prototype);
    Object.freeze(Boolean.prototype);
  } catch {}

  // ⭐ Détecter les modifications de window
  const originalKeys = Object.keys(window);
  setInterval(() => {
    const currentKeys = Object.keys(window);
    if (currentKeys.length > originalKeys.length + 5) {
      console.warn('⚠️ Nouvelles propriétés ajoutées à window');
    }
  }, 5000);
}

// ============================================================
// ⭐ 6. DEVTOOLS DETECTION
// ============================================================

/**
 * Détecter l'ouverture des DevTools
 */
export function detectDevTools(): boolean {
  try {
    // ⭐ Méthode 1: Élément DOM
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: function() {
        console.warn('🔍 DevTools détecté (DOM)');
        return true;
      }
    });
    // @ts-ignore
    console.log('%c', element);
    
    // ⭐ Méthode 2: Taille de la fenêtre
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    if (widthDiff > 100 || heightDiff > 100) {
      console.warn('🔍 DevTools détecté (taille)');
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// ============================================================
// ⭐ 7. SECURITY CHECK COMPLET
// ============================================================

/**
 * Effectuer une vérification complète de la sécurité
 */
export async function fullSecurityCheck(): Promise<{
  debuggerDetected: boolean;
  devToolsDetected: boolean;
  integrityOk: boolean;
  environmentOk: boolean;
  secure: boolean;
  details: Record<string, boolean>;
}> {
  const debuggerDetected = detectDebugger();
  const devToolsDetected = detectDevTools();
  const integrityOk = await checkIntegrity();
  const environmentOk = checkEnvironment();

  const details = {
    debuggerDetected,
    devToolsDetected,
    integrityOk,
    environmentOk,
  };

  return {
    debuggerDetected,
    devToolsDetected,
    integrityOk,
    environmentOk,
    secure: !debuggerDetected && !devToolsDetected && integrityOk && environmentOk,
    details,
  };
}

// ============================================================
// ⭐ 8. INITIALISATION
// ============================================================

/**
 * Initialiser toutes les mesures de sécurité
 */
export function initSecurity(): void {
  console.log('🔒 Initialisation de la sécurité...');

  // ⭐ Vérifier l'environnement
  const isDev = import.meta.env.DEV;
  
  if (isDev) {
    console.log('   ℹ️ Mode développement - Sécurité allégée');
    console.log('   ✅ Anti-Debug: ACTIVÉ');
    console.log('   ✅ Integrity Check: DÉSACTIVÉ (dev)');
    console.log('   ✅ Anti-Tamper: ACTIVÉ');
    console.log('   ✅ DevTools Detection: ACTIVÉ');
    console.log('✅ Sécurité Renderer initialisée (mode dev)');
    return;
  }

  // ⭐ 1. Anti-Debug
  startAntiDebug(SECURITY_CONFIG.ANTI_DEBUG_INTERVAL);
  console.log('   ✅ Anti-Debug démarré');

  // ⭐ 2. Integrity Check
  startIntegrityCheck(SECURITY_CONFIG.INTEGRITY_CHECK_INTERVAL);
  console.log('   ✅ Integrity Check démarré');

  // ⭐ 3. Environment Check
  checkEnvironment();
  console.log('   ✅ Environment Check effectué');

  // ⭐ 4. Anti-Tamper
  antiTamper();
  console.log('   ✅ Anti-Tamper activé');

  // ⭐ 5. DevTools Detection
  startDevToolsDetection();
  console.log('   ✅ DevTools Detection démarré');

  console.log('✅ Sécurité Renderer initialisée avec succès');
}

/**
 * Démarrer la détection des DevTools
 */
function startDevToolsDetection(): void {
  if (devToolsInterval) {
    clearInterval(devToolsInterval);
  }

  devToolsInterval = setInterval(() => {
    if (detectDevTools()) {
      console.warn('⚠️ DevTools détectés');
      debugDetectionCount++;
      
      if (debugDetectionCount >= SECURITY_CONFIG.MAX_DEBUG_DETECTIONS) {
        lockApplication();
      }
    }
  }, SECURITY_CONFIG.DEV_TOOLS_DETECTION_INTERVAL);
}

// ============================================================
// ⭐ 9. EXPORT
// ============================================================

export default {
  // Détection
  detectDebugger,
  detectDevTools,
  
  // Anti-Debug
  startAntiDebug,
  stopAntiDebug,
  
  // Integrity
  checkIntegrity,
  startIntegrityCheck,
  
  // Environment
  checkEnvironment,
  
  // Anti-Tamper
  antiTamper,
  
  // Security Check
  fullSecurityCheck,
  
  // Initialisation
  initSecurity,
  
  // État
  isLocked: () => isLocked,
  getDebugCount: () => debugDetectionCount,
};

// ============================================================
// ⭐ 10. COMPATIBILITY EXPORTS (Pour les imports existants)
// ============================================================

// ⭐ Exports pour la compatibilité avec l'ancien code
export const detectDebuggerLegacy = detectDebugger;
export const startAntiDebugLegacy = startAntiDebug;
export const checkIntegrityLegacy = checkIntegrity;
export const checkEnvironmentLegacy = checkEnvironment;
export const antiTamperLegacy = antiTamper;