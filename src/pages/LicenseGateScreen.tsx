// ============================================================
// src/pages/LicenseGateScreen.tsx
// ⭐ MITOVY DESIGN TANTERAKA AMIN'NY Login.tsx
// ⭐ INDIGO THEME (FA TSY ROSE BLOSSOM)
// ⭐ LEFT/RIGHT BOX LAYOUT
// ⭐ FIX: ESRINA NY ICON COPY (Copier) REHETRA
// ============================================================

import React, { useEffect, useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Cloud, 
  CreditCard, 
  HelpCircle, 
  KeyRound, 
  LifeBuoy, 
  Loader2, 
  Lock,
  Moon, 
  ShieldCheck, 
  Sparkles,
  Sun, 
  XCircle,
  Zap,
  BarChart3,
  Users as UsersIcon,
  LayoutDashboard
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLicense } from '../contexts/LicenseContext';
import SuccessModal from '../components/common/SuccessModal';
import ErrorModal from '../components/common/ErrorModal';

// ============================================================
// STATIC ASSETS
// ============================================================
const LOGO_PATH = './images/logo.png';
const MINIATURE_DARK_PATH = './images/miniaturedark.png';
const MINIATURE_LIGHT_PATH = './images/miniaturelight.png';
const LOGO_DARK = './images/logo.png';
const LOGO_LIGHT = './images/logo.png';

// ============================================================
// INDIGO THEME - MITOVY AMIN'NY LOGIN.TSX
// ============================================================
const THEME = {
  dark: {
    surface: '#111827',
    surfaceAlt: '#1E293B',
    surfaceSoft: '#0F172A',
    border: '#1F2937',
    borderStrong: '#334155',
    text: '#FFFFFF',
    muted: '#94A3B8',
    subMuted: '#64748B',
    primary: '#6366F1',
    primaryHover: '#4F46E5',
    primaryBg: 'rgba(99,102,241,0.12)',
    green: '#10B981',
    red: '#EF4444',
    inputBg: 'transparent',
    bgGradient: 'linear-gradient(135deg, #4F46E5 0%, #312E81 45%, #0F172A 100%)',
    shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
    shadowSmall: '0 4px 15px rgba(0, 0, 0, 0.4)'
  },
  light: {
    surface: '#FFFFFF',
    surfaceAlt: '#F1F5F9',
    surfaceSoft: '#F8FAFC',
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    text: '#0F172A',
    muted: '#64748B',
    subMuted: '#94A3B8',
    primary: '#6366F1',
    primaryHover: '#4338CA',
    primaryBg: 'rgba(99,102,241,0.06)',
    green: '#10B981',
    red: '#EF4444',
    inputBg: '#FFFFFF',
    bgGradient: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 45%, #F8FAFC 100%)',
    shadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
    shadowSmall: '0 4px 15px rgba(99, 102, 241, 0.1)'
  }
} as const;

// ============================================================
// SKELETON LOADER (Same as Login.tsx)
// ============================================================
const SkeletonLicense = () => {
  const { isDark } = useTheme();
  const colors = isDark ? THEME.dark : THEME.light;
  
  const Skeleton = ({ className = '' }: { className?: string }) => (
    <div className={`animate-pulse rounded-lg ${className}`} style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
  );
  
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-3" style={{ background: colors.bgGradient }}>
      <div className="flex w-full max-w-[980px] overflow-hidden rounded-xl border" style={{ 
        background: colors.surface, 
        borderColor: colors.border,
        boxShadow: colors.shadow
      }}>
        <div className="hidden w-1/2 flex-col justify-between border-r p-5 lg:flex" style={{ background: colors.surfaceAlt, borderColor: colors.border }}>
          <div>
            <div className="mb-6 flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="mb-1 h-6 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
        <div className="flex w-full flex-col justify-center p-5 lg:w-1/2">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// LICENSE GATE SCREEN - MITOVY AMIN'NY LOGIN
// ============================================================
const LicenseGateScreen: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const colors = isDark ? THEME.dark : THEME.light;
  const navigate = useNavigate();
  
  const {
    status: licenseStatus,
    isValid: licenseIsValid,
    isActive: licenseIsActive,
    packageName,
    licenseKey: currentLicenseKey,
    daysRemaining,
    minutesRemaining,
    isTest,
    isLifetime,
    expirationDate,
    isLoading: licenseLoading,
    error: licenseError,
    refresh,
    activateWithCode,
    reset,
    isLicenseValid
  } = useLicense();

  const [activationCode, setActivationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // ⭐ LOGO DYNAMIQUE
  const logoSrc = isDark ? LOGO_DARK : LOGO_LIGHT;

  // STATIC ASSETS
  const miniatureSrc = isDark ? MINIATURE_DARK_PATH : MINIATURE_LIGHT_PATH;

  // ⭐ PAGE LOADING
  useEffect(() => { 
    const timer = setTimeout(() => setIsPageLoading(false), 500); 
    return () => clearTimeout(timer); 
  }, []);

  // ⭐ REFRESH LICENSE AU CHARGEMENT
  useEffect(() => {
    refresh();
  }, [refresh]);

  // ⭐ FIX: Rehefa miova ny license status, dia refresh
  useEffect(() => {
    if (licenseStatus === 'UNKNOWN' || licenseStatus === 'INVALID' || licenseStatus === 'EXPIRED') {
      refresh();
    }
  }, [licenseStatus, refresh]);

  // ⭐ REDIRECT SI LICENCE VALIDE
  useEffect(() => {
    if (licenseIsValid && licenseIsActive && !isPageLoading) {
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    }
  }, [licenseIsValid, licenseIsActive, isPageLoading, navigate]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!activationCode.trim()) {
      setError('Veuillez entrer votre code d\'activation.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await activateWithCode(activationCode.trim());
      
      if (result.success) {
        setShowSuccess(true);
        setError(null);
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2500);
      } else {
        setError(result.message || 'Code d\'activation invalide');
      }
    } catch (err: any) {
      console.error('Erreur activation:', err);
      setError(err?.message || 'Une erreur est survenue lors de l\'activation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetLicense = async () => {
    try {
      await reset();
      setActivationCode('');
      setError(null);
      setShowSuccess(false);
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors du reset:', error);
      setError('Impossible de réinitialiser la licence.');
    }
  };

  // ⭐ FIX: ESRINA NY HANDLE COPY KEY
  // const handleCopyKey = () => {
  //   if (currentLicenseKey) {
  //     navigator.clipboard.writeText(currentLicenseKey);
  //     setCopied(true);
  //     setTimeout(() => setCopied(false), 2000);
  //   }
  // };

  // ⭐ PAGE LOADERS
  if (isPageLoading || (licenseLoading && !licenseIsValid)) {
    return <SkeletonLicense />;
  }

  // ============================================================
  // ACTIVE LICENSE VIEW - WITH LEFT/RIGHT BOX LAYOUT
  // ============================================================
  if (licenseIsValid && licenseIsActive) {
    const expiryDate = expirationDate ? new Date(expirationDate) : null;
    const formattedExpiry = expiryDate ? expiryDate.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }) : 'Jamais';

    return (
      <div className="flex min-h-screen w-full items-center justify-center p-3" style={{ background: colors.bgGradient }}>
        
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="fixed right-4 top-4 z-40 flex h-7 w-7 items-center justify-center rounded-full border transition-all"
          style={{
            background: colors.surface,
            borderColor: colors.border,
            color: colors.primary,
            boxShadow: colors.shadowSmall
          }}
        >
          {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>
        
        {/* Main Card - Left/Right Box Layout */}
        <div className="flex w-full max-w-[980px] overflow-hidden rounded-xl border" style={{ 
          background: colors.surface, 
          borderColor: colors.border,
          boxShadow: colors.shadow
        }}>
          
          {/* LEFT SIDEBAR - LICENSE PREVIEW */}
          <div className="hidden w-1/2 flex-col justify-between border-r p-5 lg:flex" style={{ 
            background: colors.surfaceAlt,
            borderColor: colors.border
          }}>
            {/* Top Section */}
            <div className="space-y-3">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ 
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})`
                }}>
                  <Cloud className="h-4 w-4" />
                </div>
                <div>
                  <h1 className="text-[15px] font-bold" style={{ color: colors.text }}>Life's Art</h1>
                  <p className="text-[11px] font-medium" style={{ color: colors.muted }}>Enterprise Solution</p>
                </div>
              </div>
              
              {/* Title */}
              <div>
                <h2 className="text-[19px] font-bold leading-tight" style={{ color: colors.text }}>
                  Licence<br />Active
                </h2>
                <p className="mt-1 text-[12px]" style={{ color: colors.muted }}>
                  Votre licence est valide et prête à l'utilisation
                </p>
              </div>
              
              {/* License Preview Card */}
              <div className="relative overflow-hidden rounded-lg border" style={{ 
                borderColor: colors.border,
                background: colors.surface,
                boxShadow: colors.shadowSmall
              }}>
                {/* Card Header */}
                <div className="flex items-center gap-1 border-b p-2" style={{ borderColor: colors.border }}>
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: colors.primary }} />
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: colors.primary }} />
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: colors.primary }} />
                </div>
                
                {/* Card Content */}
                <div className="p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <img src={LOGO_PATH} alt="Logo" className="h-4 w-4 object-contain" />
                      <span className="text-[10px] font-semibold" style={{ color: colors.text }}>License Info</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="h-4 w-4 rounded" style={{ background: colors.primaryBg }} />
                      <div className="h-4 w-4 rounded" style={{ background: colors.primaryBg }} />
                    </div>
                  </div>
                  
                  {/* License Details Grid */}
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    <div className="rounded-lg p-2" style={{ background: colors.primaryBg }}>
                      <div className="text-[9px] font-medium" style={{ color: colors.muted }}>Plan</div>
                      <div className="text-[12px] font-bold capitalize" style={{ color: colors.primary }}>{packageName || 'Pro'}</div>
                    </div>
                    <div className="rounded-lg p-2" style={{ background: colors.primaryBg }}>
                      <div className="text-[9px] font-medium" style={{ color: colors.muted }}>Jours restants</div>
                      <div className="text-[12px] font-bold" style={{ color: colors.primary }}>{isLifetime ? '∞' : daysRemaining}</div>
                    </div>
                  </div>
                  
                  {/* License Key Display - ⭐ ESRINA NY COPY BUTTON */}
                  <div className="mb-2 rounded-lg p-2" style={{ background: colors.surfaceSoft }}>
                    <div className="text-[9px] font-medium mb-1" style={{ color: colors.muted }}>Code d'activation</div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-semibold" style={{ color: colors.text }}>
                        {currentLicenseKey || 'N/A'}
                      </span>
                      {/* ⭐ ESRINA NY COPY BUTTON */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Features */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { icon: ShieldCheck, title: 'Sécurisé' },
                { icon: BarChart3, title: 'Analytics' },
                { icon: UsersIcon, title: 'Équipe' },
                { icon: LayoutDashboard, title: 'Dashboard' }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-1.5 rounded-lg border p-2" style={{ borderColor: colors.border }}>
                    <Icon size={12} style={{ color: colors.primary }} />
                    <span className="text-[12px] font-medium" style={{ color: colors.text }}>{item.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* RIGHT - LICENSE ACTIONS WITH LOGO */}
          <div className="flex w-full flex-col justify-between p-5 lg:w-1/2">
            
            {/* Logo in Right Box */}
            <div className="mb-4 flex items-center gap-2">
              <img src={logoSrc} alt="Life's Art Logo" className="h-8 w-auto object-contain" />
              <div>
                <h1 className="text-[15px] font-bold" style={{ color: colors.text }}>Life's Art</h1>
                <p className="text-[11px] font-medium" style={{ color: colors.muted }}>Enterprise Solution</p>
              </div>
            </div>

        
            <div className="mb-5">
              <h1 className="text-[22px] font-bold" style={{ color: colors.text }}>Licence Active</h1>
              <p className="mt-1 text-[13px]" style={{ color: colors.muted }}>
                Gérez votre licence et accédez à votre espace
              </p>
            </div>
            
            {/* License Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border p-3" style={{ 
                borderColor: colors.border,
                background: colors.surfaceAlt
              }}>
                <div>
                  <p className="text-[11px] font-medium" style={{ color: colors.subMuted }}>Code d'activation</p>
                  <p className="font-mono text-[13px] font-semibold" style={{ color: colors.text }}>
                    {currentLicenseKey || 'N/A'}
                  </p>
                </div>
                {/* ⭐ ESRINA NY COPY BUTTON */}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border p-3" style={{ borderColor: colors.border }}>
                  <p className="text-[11px] font-medium" style={{ color: colors.subMuted }}>Plan</p>
                  <p className="text-[13px] font-semibold capitalize" style={{ color: colors.primary }}>
                    {packageName || 'Non spécifié'}
                  </p>
                </div>
                <div className="rounded-lg border p-3" style={{ borderColor: colors.border }}>
                  <p className="text-[11px] font-medium" style={{ color: colors.subMuted }}>Expire le</p>
                  <p className="text-[13px] font-semibold" style={{ color: colors.text }}>
                    {isLifetime ? 'Illimitée' : formattedExpiry}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border p-2 text-center" style={{ borderColor: colors.border }}>
                  <p className="text-[10px] font-medium" style={{ color: colors.subMuted }}>Type</p>
                  <p className="text-[12px] font-semibold" style={{ color: colors.text }}>
                    {isTest ? 'Test' : isLifetime ? 'Lifetime' : 'Standard'}
                  </p>
                </div>
                <div className="rounded-lg border p-2 text-center" style={{ borderColor: colors.border }}>
                  <p className="text-[10px] font-medium" style={{ color: colors.subMuted }}>Jours restants</p>
                  <p className="text-[12px] font-semibold" style={{ color: colors.text }}>
                    {isLifetime ? '∞' : daysRemaining}
                  </p>
                </div>
                <div className="rounded-lg border p-2 text-center" style={{ borderColor: colors.border }}>
                  <p className="text-[10px] font-medium" style={{ color: colors.subMuted }}>Statut</p>
                  <p className="text-[12px] font-semibold" style={{ color: colors.green }}>
                    Active
                  </p>
                </div>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="group flex h-10 w-full items-center justify-center gap-2 rounded-lg text-[14px] font-semibold text-white transition-all hover:opacity-95"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})`,
                  boxShadow: `0 4px 12px ${colors.primaryBg}`
                }}
              >
                Accéder au Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/support')}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg text-[14px] font-medium transition-all hover:opacity-80"
                style={{ 
                  background: colors.surfaceAlt,
                  color: colors.muted,
                  border: `1px solid ${colors.border}`
                }}
              >
                <LifeBuoy className="h-4 w-4" />
                Contacter le support
              </button>
              <button
                type="button"
                onClick={handleResetLicense}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg text-[14px] font-medium transition-all hover:opacity-80"
                style={{ 
                  background: 'transparent',
                  color: colors.red,
                  border: `1px solid ${colors.red}30`
                }}
              >
                <XCircle className="h-4 w-4" />
                Réinitialiser la licence
              </button>
            </div>
            
            {/* Footer */}
            <div className="mt-5 flex items-center justify-between border-t pt-3" style={{ borderColor: colors.border }}>
              <span className="text-[12px]" style={{ color: colors.subMuted }}>
                © 2026 Life's Art ERP
              </span>
              <div className="flex gap-3">
                <Link to="/terms" className="text-[12px] hover:underline" style={{ color: colors.subMuted }}>
                  Conditions
                </Link>
                <Link to="/support" className="text-[12px] hover:underline" style={{ color: colors.subMuted }}>
                  Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // LICENSE ACTIVATION VIEW (INACTIVE/EXPIRED) - LEFT/RIGHT LAYOUT
  // ============================================================
  const isExpired = licenseStatus === 'EXPIRED';

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-3" style={{ background: colors.bgGradient }}>
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ 
          background: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(248,250,252,0.9)',
          backdropFilter: 'blur(8px)'
        }}>
          <div className="w-[320px] max-w-[calc(100vw-32px)] rounded-2xl border p-6 text-center" style={{ 
            background: colors.surface, 
            borderColor: colors.border,
            boxShadow: colors.shadow
          }}>
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: colors.primaryBg }}>
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: colors.primary }} />
            </div>
            <div className="text-[14px] font-semibold" style={{ color: colors.text }}>Activation en cours</div>
            <div className="mt-1 text-[13px]" style={{ color: colors.muted }}>Vérification de votre licence...</div>
          </div>
        </div>
      )}
      
      {/* Theme Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="fixed right-4 top-4 z-40 flex h-7 w-7 items-center justify-center rounded-full border transition-all"
        style={{
          background: colors.surface,
          borderColor: colors.border,
          color: colors.primary,
          boxShadow: colors.shadowSmall
        }}
      >
        {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      </button>
      
      {/* Main Card - Left/Right Box Layout */}
      <div className="flex w-full max-w-[980px] overflow-hidden rounded-xl border" style={{ 
        background: colors.surface, 
        borderColor: colors.border,
        boxShadow: colors.shadow
      }}>
        
        {/* LEFT SIDEBAR - LICENSE PREVIEW */}
        <div className="hidden w-1/2 flex-col justify-between border-r p-5 lg:flex" style={{ 
          background: colors.surfaceAlt,
          borderColor: colors.border
        }}>
          {/* Top Section */}
          <div className="space-y-3">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ 
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})`
              }}>
                <Cloud className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-[15px] font-bold" style={{ color: colors.text }}>Life's Art ERP</h1>
                <p className="text-[11px] font-medium" style={{ color: colors.muted }}>Enterprise Solution</p>
              </div>
            </div>
            
            {/* Title */}
            <div>
              <h2 className="text-[19px] font-bold leading-tight" style={{ color: colors.text }}>
                Activez votre<br />licence
              </h2>
              <p className="mt-1 text-[12px]" style={{ color: colors.muted }}>
                Débloquez toutes les fonctionnalités
              </p>
            </div>
            
            {/* Dashboard Preview */}
            <div className="relative overflow-hidden rounded-lg border" style={{ 
              borderColor: colors.border,
              background: colors.surface,
              boxShadow: colors.shadowSmall
            }}>
              {/* Browser Mockup */}
              <div className="flex items-center gap-1 border-b p-2" style={{ borderColor: colors.border }}>
                <div className="h-1.5 w-1.5 rounded-full" style={{ background: colors.primary }} />
                <div className="h-1.5 w-1.5 rounded-full" style={{ background: colors.primary }} />
                <div className="h-1.5 w-1.5 rounded-full" style={{ background: colors.primary }} />
              </div>
              
              {/* Dashboard Content */}
              <div className="p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <img src={LOGO_PATH} alt="Logo" className="h-4 w-4 object-contain" />
                    <span className="text-[10px] font-semibold" style={{ color: colors.text }}>Dashboard</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-4 w-4 rounded" style={{ background: colors.primaryBg }} />
                    <div className="h-4 w-4 rounded" style={{ background: colors.primaryBg }} />
                  </div>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  <div className="rounded-lg p-2" style={{ background: colors.primaryBg }}>
                    <div className="text-[9px] font-medium" style={{ color: colors.muted }}>Ventes</div>
                    <div className="text-[12px] font-bold" style={{ color: colors.primary }}>12,847</div>
                  </div>
                  <div className="rounded-lg p-2" style={{ background: colors.primaryBg }}>
                    <div className="text-[9px] font-medium" style={{ color: colors.muted }}>Clients</div>
                    <div className="text-[12px] font-bold" style={{ color: colors.primary }}>3,452</div>
                  </div>
                </div>
                
                {/* Chart Placeholder */}
                <div className="mb-2 rounded-lg p-2" style={{ background: colors.surfaceSoft }}>
                  <div className="flex items-end gap-0.5 h-12">
                    {[40, 65, 45, 80, 55, 70, 35, 90, 60, 75, 50, 85].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t"
                        style={{
                          height: `${height}%`,
                          background: i % 2 === 0 ? colors.primary : colors.secondary,
                          opacity: 0.7
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { icon: ShieldCheck, title: 'Sécurisé' },
              { icon: BarChart3, title: 'Analytics' },
              { icon: UsersIcon, title: 'Équipe' },
              { icon: LayoutDashboard, title: 'Dashboard' }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-1.5 rounded-lg border p-2" style={{ borderColor: colors.border }}>
                  <Icon size={12} style={{ color: colors.primary }} />
                  <span className="text-[12px] font-medium" style={{ color: colors.text }}>{item.title}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* RIGHT - ACTIVATION FORM WITH LOGO */}
        <div className="flex w-full flex-col justify-between p-5 lg:w-1/2">
          
          {/* Logo in Right Box */}
          <div className="mb-4 flex items-center gap-2">
            <img src={logoSrc} alt="Life's Art Logo" className="h-8 w-auto object-contain" />
            <div>
              <h1 className="text-[15px] font-bold" style={{ color: colors.text }}>Life's Art ERP</h1>
              <p className="text-[11px] font-medium" style={{ color: colors.muted }}>Enterprise Solution</p>
            </div>
          </div>

          {/* Mobile Logo */}
          <div className="mb-4 flex items-center gap-2 lg:hidden">
            <img src={logoSrc} alt="Life's Art Logo" className="h-8 w-auto object-contain" />
            <span className="text-[14px] font-bold" style={{ color: colors.text }}>Life's Art</span>
          </div>

          <div className="mb-5">
            <h1 className="text-[22px] font-bold" style={{ color: colors.text }}>
              {isExpired ? 'Licence expirée' : 'Activation de licence'}
            </h1>
            <p className="mt-1 text-[13px]" style={{ color: colors.muted }}>
              {isExpired 
                ? 'Votre licence a expiré. Veuillez saisir un nouveau code d\'activation.'
                : 'Entrez votre code d\'activation pour accéder à toutes les fonctionnalités.'}
            </p>
          </div>
          
          {/* Expired Warning */}
          {isExpired && expirationDate && (
            <div className="mb-4 flex items-center justify-between rounded-lg border p-3" style={{ 
              background: `${colors.red}10`,
              borderColor: `${colors.red}30`
            }}>
              <div className="flex items-center gap-2">
                <XCircle className="h-3.5 w-3.5" style={{ color: colors.red }} />
                <span className="text-[12px] font-medium" style={{ color: colors.muted }}>
                  Date d'expiration :
                </span>
              </div>
              <span className="text-[12px] font-semibold" style={{ color: colors.red }}>
                {new Date(expirationDate).toLocaleDateString('fr-FR')}
              </span>
            </div>
          )}
          
          {/* Activation Form */}
          <form onSubmit={handleActivate} className="space-y-3">
            
            {/* Activation Code Input */}
            <div>
              <label className="mb-1 block text-[13px] font-medium" style={{ color: colors.muted }}>
                Code d'activation
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: colors.subMuted }} />
                <input
                  type="text"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                  placeholder="Entrez votre code d'activation"
                  disabled={isLoading}
                  className="h-9 w-full rounded-md border pl-8 pr-3 text-[13px] font-medium outline-none transition-all disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    background: isDark ? 'transparent' : colors.inputBg,
                    color: colors.text,
                    borderColor: error ? colors.red : colors.border
                  }}
                />
                {/* ⭐ ESRINA NY COPY BUTTON */}
              </div>
              {error && (
                <p className="mt-0.5 text-[12px] font-medium" style={{ color: colors.red }}>{error}</p>
              )}
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || licenseLoading}
              className="group relative flex h-10 w-full items-center justify-center gap-2 rounded-lg text-[14px] font-semibold text-white transition-all hover:opacity-95 disabled:opacity-50"
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})`,
                boxShadow: `0 4px 12px ${colors.primaryBg}`
              }}
            >
              {isLoading || licenseLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Activer ma licence
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
          
          {/* Feature Highlights */}
          <div className="mt-4 grid grid-cols-3 gap-1.5">
            {[
              { icon: Zap, text: 'Instantané' },
              { icon: ShieldCheck, text: 'Sécurisé' },
              { icon: Cloud, text: 'Auto-update' }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center justify-center gap-1 rounded-lg border p-2" style={{ borderColor: colors.border }}>
                  <Icon size={12} style={{ color: colors.primary }} />
                  <span className="text-[11px] font-medium" style={{ color: colors.muted }}>{item.text}</span>
                </div>
              );
            })}
          </div>
          
          {/* Footer Links */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/support')}
              className="group flex items-center gap-1 text-[12px] font-medium hover:underline"
              style={{ color: colors.primary }}
            >
              <LifeBuoy className="h-3 w-3" />
              Support
            </button>
            <button
              type="button"
              onClick={() => navigate('/buy-license')}
              className="group flex items-center gap-1 text-[12px] font-medium hover:underline"
              style={{ color: colors.primary }}
            >
              <CreditCard className="h-3 w-3" />
              Acheter
            </button>
          </div>
          
          {/* Footer */}
          <div className="mt-5 flex items-center justify-between border-t pt-3" style={{ borderColor: colors.border }}>
            <span className="text-[12px]" style={{ color: colors.subMuted }}>
              © 2026 Life's Art ERP
            </span>
            <div className="flex gap-3">
              <Link to="/terms" className="text-[12px] hover:underline" style={{ color: colors.subMuted }}>
                Conditions
              </Link>
              <Link to="/support" className="text-[12px] hover:underline" style={{ color: colors.subMuted }}>
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Licence activée !"
        message="Votre licence a été activée avec succès. Redirection vers le dashboard..."
        buttonText="Continuer"
        autoCloseDelay={2500}
      />
      <ErrorModal
        isOpen={!!error}
        onClose={() => setError(null)}
        title="Erreur d'activation"
        message={error || ''}
        buttonText="Réessayer"
        autoCloseDelay={4000}
      />
    </div>
  );
};

export default LicenseGateScreen;