// ============================================================
// src/pages/Parametres.tsx
// ⭐ PARAMETRES PAGE
// ⭐ Security tab removed (ParametresSecurity no longer needed)
// ⭐ FIX: NAMPIANA NY PARAMETRES LICENSE
// ⭐ DARK + LIGHT MODE
// ⭐ READABLE TYPOGRAPHY
// ⭐ ALL BORDER SYSTEM
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

import {
  Settings2,
  User,
  Info,
  LogOut,
  Database,
  RefreshCw,
  Crown,
} from 'lucide-react';

import ParametresGeneral from '../components/parametres/ParametresGeneral';
import ParametresProfile from '../components/parametres/ParametresProfile';
import ParametresSystemInfo from '../components/parametres/ParametresSystemInfo';
import ParametresBackup from '../components/parametres/ParametresBackup';
import ParametresLicense from '../components/parametres/ParametresLicense';

import SuccessModal from '../components/common/SuccessModal';
import ErrorModal from '../components/common/ErrorModal';

interface AppSettings {
  appName: string;
  companyName: string;
  language: string;
  currency: string;
  dateFormat: string;
  timeZone: string;
}

interface LicenseInfo {
  packageType: string | null;
  packageName: string;
  daysRemaining: number;
  minutesRemaining?: number | null;
  expirationDate: string | null;
  initialExpirationDate: string | null;
  isActive: boolean;
  isUnlimited: boolean;
  customerName: string;
  companyName: string;
  features: string[];
  licenseKey: string;
}

const Parametres: React.FC = () => {
  const { isDark } = useTheme();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'general' | 'profile' | 'system' | 'backup' | 'license'>('general');

  const [settings, setSettings] = useState<AppSettings>({
    appName: "Life's Art",
    companyName: '',
    language: 'fr',
    currency: 'Ar',
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Indian/Antananarivo',
  });

  const [systemInfo, setSystemInfo] = useState<any>({
    version: '3.0.0',
    electron: 'N/A',
    node: 'N/A',
    chrome: 'N/A',
    platform: navigator.platform,
    arch: 'N/A',
    memory: 'N/A',
    cpu: 'N/A',
  });

  // ⭐ FIX: State ho an'ny License
  const [licenseStatus, setLicenseStatus] = useState<string | null>(null);
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo>({
    packageType: null,
    packageName: 'Aucune licence',
    daysRemaining: 0,
    minutesRemaining: null,
    expirationDate: null,
    initialExpirationDate: null,
    isActive: false,
    isUnlimited: false,
    customerName: '',
    companyName: '',
    features: [],
    licenseKey: '',
  });

  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '', details: '', autoClose: 4000 });
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '', details: '', autoClose: 5000 });

  const showSuccess = (title: string, message: string, details?: string) => {
    setSuccessModal({ isOpen: true, title, message, details: details || '', autoClose: 4000 });
  };
  const showError = (title: string, message: string, details?: string) => {
    setErrorModal({ isOpen: true, title, message, details: details || '', autoClose: 5000 });
  };

  const loadSettings = useCallback(async () => {
    try {
      const result = await window.api.settings.getAll();
      if (result?.success && result.data) {
        let settingsObj: any = {};
        if (Array.isArray(result.data)) {
          result.data.forEach((item: any) => { settingsObj[item.key] = item.value; });
        } else {
          settingsObj = result.data;
        }
        setSettings(prev => ({
          ...prev,
          appName: settingsObj.appName || prev.appName,
          companyName: settingsObj.companyName || prev.companyName,
          language: settingsObj.language || prev.language,
          currency: settingsObj.currency || prev.currency,
          dateFormat: settingsObj.dateFormat || prev.dateFormat,
          timeZone: settingsObj.timeZone || prev.timeZone,
        }));
      }
    } catch (error) {
      console.error('Erreur chargement settings:', error);
    }
  }, []);

  const loadSystemInfo = useCallback(async () => {
    try {
      const platformInfo = window.api.platform || {};
      const platform = navigator.platform;
      const memory = (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : 'N/A';
      const version = platformInfo.version || '3.0.0';
      const arch = platformInfo.arch || (navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} cores` : 'N/A');
      setSystemInfo({
        version,
        electron: platformInfo.electron || 'N/A',
        node: platformInfo.node || 'N/A',
        chrome: 'N/A',
        platform,
        arch,
        memory,
        cpu: 'N/A',
      });
    } catch (error) {
      console.error('Erreur chargement system info:', error);
    }
  }, []);

  // ⭐ FIX: Load License Info
  const loadLicense = useCallback(async () => {
    try {
      const result = await window.api.license.checkStatus();
      if (result?.success) {
        setLicenseStatus(result.status || 'UNKNOWN');
        setLicenseInfo(prev => ({
          ...prev,
          packageType: result.packageType || null,
          packageName: result.packageName || result.packageType || 'Aucune licence',
          daysRemaining: Number(result.daysRemaining) || 0,
          minutesRemaining: result.minutesRemaining != null ? Number(result.minutesRemaining) : null,
          expirationDate: result.expirationDate || null,
          initialExpirationDate: result.expirationDate || null,
          isActive: result.isValid === true && result.isActive === true,
          isUnlimited: result.isLifetime === true,
          customerName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
          companyName: user?.companyName || '',
          features: [],
          licenseKey: result.licenseKey || '',
        }));
      }
    } catch (error) {
      console.error('Erreur chargement license:', error);
    }
  }, [user]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadSettings();
      await loadSystemInfo();
      await loadLicense();
      setLoading(false);
    };
    init();
  }, [loadSettings, loadSystemInfo, loadLicense]);

  const handleSettingsChange = (newSettings: AppSettings) => setSettings(newSettings);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await Promise.all(Object.entries(settings).map(([key, value]) => window.api.settings.set(key, value)));
      showSuccess('Paramètres sauvegardés', 'Tous vos paramètres ont été enregistrés avec succès.');
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error);
      showError('Erreur de sauvegarde', 'Une erreur est survenue.', error.message || 'Erreur inconnue');
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  // ⭐ FIX: NAMPIANA NY TAB LICENSE
  const tabItems = [
    { id: 'general', label: 'Général', icon: Settings2 },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'system', label: 'Système', icon: Info },
    { id: 'backup', label: 'Sauvegarde', icon: Database },
    { id: 'license', label: 'Licence', icon: Crown },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <ParametresGeneral settings={settings} onSettingsChange={handleSettingsChange} isDark={isDark} />;
      case 'profile':
        return <ParametresProfile user={user || {}} />;
      case 'system':
        return <ParametresSystemInfo systemInfo={systemInfo} isDark={isDark} />;
      case 'backup':
        return <ParametresBackup isDark={isDark} />;
      // ⭐ FIX: NAMPIANA NY LICENSE
      case 'license':
        return <ParametresLicense status={licenseStatus} licenseInfo={licenseInfo} isDark={isDark} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen font-sans transition-colors duration-300" style={{ background: isDark ? '#0A1222' : '#F8FAFC' }}>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center w-full">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={30} className="animate-spin text-indigo-500" />
              <span className="text-[14px] font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                Chargement des paramètres...
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-indigo-600 text-white shadow-sm">
                  <Settings2 size={24} />
                </div>
                <div>
                  <h1 className="text-[22px] font-bold tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                    Paramètres
                  </h1>
                  <p className="mt-0.5 text-[14px]" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    Gérez les paramètres de votre application.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-col md:flex-row gap-6 pb-8">
              <nav className="w-full md:w-56 flex-shrink-0 rounded-lg border p-2 h-fit flex flex-row md:flex-col gap-1 shadow-sm"
                style={{ background: isDark ? '#0F172A' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }}>
                {tabItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-medium transition-all duration-200 w-full text-left ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-medium transition-all duration-200 w-full text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 mt-auto"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </nav>

              <div className="flex-1 rounded-lg border p-6 min-h-[400px] shadow-sm"
                style={{ background: isDark ? '#0F172A' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }}>
                {renderContent()}
              </div>
            </div>

            <SuccessModal
              isOpen={successModal.isOpen}
              onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
              title={successModal.title}
              message={successModal.message}
              details={successModal.details}
              autoCloseDelay={successModal.autoClose}
              isDark={isDark}
            />
            <ErrorModal
              isOpen={errorModal.isOpen}
              onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
              title={errorModal.title}
              message={errorModal.message}
              details={errorModal.details}
              autoCloseDelay={errorModal.autoClose}
              isDark={isDark}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Parametres;