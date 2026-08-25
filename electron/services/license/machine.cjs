// ============================================================
// machine.cjs - Hardware Info (OPTIONNEL)
// ⭐ FANITSARA: TSY ilaina intsony ho an'ny License
// ============================================================

const crypto = require('crypto');
const os = require('os');
const { execSync } = require('child_process');

function getHardwareInfo() {
  try {
    const hostname = os.hostname();
    const platform = os.platform();
    const cpus = os.cpus();
    const cpuModel = cpus.length > 0 ? cpus[0].model : 'unknown';
    const cpuCores = cpus.length;
    const totalMem = os.totalmem();

    return {
      hostname,
      platform,
      cpuModel,
      cpuCores,
      totalMem,
      arch: os.arch(),
      release: os.release(),
    };
  } catch (err) {
    console.error('❌ Erreur getHardwareInfo:', err.message);
    return null;
  }
}

function getMachineId() {
  try {
    const info = getHardwareInfo();
    const raw = `${info.hostname}|${info.platform}|${info.cpuModel}|${info.cpuCores}|${info.totalMem}`;
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    return hash.substring(0, 32).toUpperCase();
  } catch (err) {
    return 'UNKNOWN_HARDWARE';
  }
}

function verifyMachineBinding(storedMachineId) {
  const current = getMachineId();
  return storedMachineId === current;
}

module.exports = {
  getMachineId,
  getHardwareInfo,
  verifyMachineBinding,
};