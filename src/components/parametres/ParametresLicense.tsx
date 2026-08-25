// ============================================================
// src/components/parametres/ParametresLicense.tsx
// ⭐ MITOVY DESIGN TANTERAKA AMIN'NY Login.tsx
// ⭐ INDIGO THEME
// ⭐ FONT SIZE SYNCED (15px/14px/13px/12px)
// ⭐ FIX: ESRINA NY ICON REHETRA AFA-TSY NY BOUTON
// ⭐ FIX: ESRINA NY FONCTIONNALITÉS
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

// ⭐ INDIGO THEME - MITOVY AMIN'NY LOGIN.TSX
const THEME = {
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
    primaryBorder: 'rgba(99,102,241,0.2)',
    secondary: '#10B981',
    secondaryBg: 'rgba(16,185,129,0.06)',
    secondaryBorder: 'rgba(16,185,129,0.2)',
    green: '#10B981',
    greenBg: 'rgba(16,185,129,0.08)',
    red: '#EF4444',
    redBg: 'rgba(239,68,68,0.08)',
    gold: '#D4A84F',
    goldBg: 'rgba(212,168,79,0.08)',
    purple: '#8B5CF6',
    purpleBg: 'rgba(139,92,246,0.08)',
  },
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
    primaryBorder: 'rgba(99,102,241,0.2)',
    secondary: '#10B981',
    secondaryBg: 'rgba(16,185,129,0.15)',
    secondaryBorder: 'rgba(16,185,129,0.2)',
    green: '#10B981',
    greenBg: 'rgba(16,185,129,0.15)',
    red: '#EF4444',
    redBg: 'rgba(239,68,68,0.15)',
    gold: '#D4A84F',
    goldBg: 'rgba(212,168,79,0.12)',
    purple: '#8B5CF6',
    purpleBg: 'rgba(139,92,246,0.12)',
  }
};

// ⭐ PACKAGES (TSY MISY FEATURES)
const PACKAGES: Record<string, any> = {
  test: { id: 'test', name: 'Test (30 min)', prefix: 'TS', isTest: true, color: '#8B5CF6' },
  basic: { id: 'basic', name: 'Basic', prefix: 'BS', color: '#6366F1' },
  standard: { id: 'standard', name: 'Standard', prefix: 'ST', color: '#F27681' },
  premium: { id: 'premium', name: 'Premium', prefix: 'PR', color: '#D4A84F' },
  national: { id: 'national', name: 'National', prefix: 'NA', color: '#10B981' },
  centralized: { id: 'centralized', name: 'Centralized', prefix: 'CE', isLifetime: true, color: '#EF4444' },
};

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

interface ParametresLicenseProps {
  status?: string | null;
  licenseInfo: LicenseInfo;
  isDark?: boolean;
}

const ParametresLicense: React.FC<ParametresLicenseProps> = ({ status, licenseInfo }) => {
  const { isDark } = useTheme();
  const theme = isDark ? THEME.dark : THEME.light;
  const { user } = useAuth();

  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const effectiveExpirationDate = useMemo(() => {
    if (licenseInfo?.isUnlimited) return null;
    const baseDate = licenseInfo?.initialExpirationDate || licenseInfo?.expirationDate;
    if (baseDate) {
      const d = new Date(baseDate);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  }, [licenseInfo]);

  const pkgInfo = useMemo(() => {
    if (!licenseInfo || !licenseInfo.packageType) return null;
    const rawType = licenseInfo.packageType.toLowerCase().trim();
    const pkg = PACKAGES[rawType];
    if (pkg) {
      return {
        ...pkg,
        name: licenseInfo?.packageName || pkg.name,
      };
    }
    return null;
  }, [licenseInfo]);

  useEffect(() => {
    if (!effectiveExpirationDate || licenseInfo?.isUnlimited) {
      setTimeRemaining({ days: -1, hours: -1, minutes: -1, seconds: -1 });
      return;
    }
    const updateTimer = () => {
      const now = new Date();
      const diff = effectiveExpirationDate.getTime() - now.getTime();
      if (diff > 0) {
        setTimeRemaining({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [effectiveExpirationDate, licenseInfo?.isUnlimited]);

  const isActive = status === 'VALID' || status === 'ACTIVE' || status === 'active' || licenseInfo?.isActive;
  const statusColor = isActive ? theme.green : theme.red;

  const renderTimer = () => {
    if (!effectiveExpirationDate && !licenseInfo?.isUnlimited) {
      return (
        <div className="flex items-center justify-center gap-1.5 py-0.5" style={{ color: theme.muted }}>
          <span className="text-[13px] font-semibold">Aucune date</span>
        </div>
      );
    }
    if (licenseInfo?.isUnlimited) {
      return (
        <div className="flex items-center justify-center gap-1.5 py-0.5" style={{ color: theme.green }}>
          <span className="text-[13px] font-bold uppercase">Illimité</span>
        </div>
      );
    }
    if (timeRemaining.days === 0 && timeRemaining.hours === 0 && timeRemaining.minutes === 0 && timeRemaining.seconds === 0) {
      return (
        <div className="flex items-center justify-center gap-1.5 py-0.5" style={{ color: theme.red }}>
          <span className="text-[13px] font-bold uppercase">Expirée</span>
        </div>
      );
    }
    const isNear = timeRemaining.days <= 7;
    return (
      <div className="flex items-center justify-center gap-1.5">
        {[
          { label: 'J', value: timeRemaining.days },
          { label: 'H', value: timeRemaining.hours },
          { label: 'M', value: timeRemaining.minutes },
          { label: 'S', value: timeRemaining.seconds },
        ].map((item, idx) => (
          <div key={idx} className="px-2 py-1 rounded border text-center" style={{ background: theme.surfaceAlt, borderColor: isNear ? `${theme.red}40` : theme.border }}>
            <span className="text-[13px] font-bold tabular-nums" style={{ color: isNear ? theme.red : theme.text }}>
              {String(Math.max(0, item.value)).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-bold uppercase ml-0.5" style={{ color: theme.subMuted }}>{item.label}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderBadge = () => {
    const pkg = pkgInfo;
    if (!pkg) return null;
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded border text-[12px] font-bold uppercase tracking-wider"
        style={{ background: theme.surface, borderColor: `${pkg.color || theme.primary}30`, color: pkg.color || theme.primary }}
      >
        {pkg.prefix || licenseInfo?.packageType?.toUpperCase() || 'ÉDITION'}
      </span>
    );
  };

  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: theme.border, background: theme.surface }}>
      {/* Header compact */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: theme.border }}>
        <div className="flex items-center gap-2.5">
          {/* ⭐ FIX: ESRINA NY ICON */}
          <div>
            <h3 className="text-[15px] font-bold" style={{ color: theme.text }}>Licence</h3>
            <p className="text-[12px] text-muted" style={{ color: theme.muted }}>Life's Art ERP</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[12px] font-bold uppercase" style={{ background: isActive ? theme.greenBg : theme.redBg, color: statusColor, borderColor: `${statusColor}40` }}>
          {isActive ? 'Protégé' : 'Verrouillé'}
        </div>
      </div>

      {/* Package compact */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: theme.border }}>
        <div className="flex items-center gap-2.5">
          {/* ⭐ FIX: ESRINA NY ICON */}
          <div>
            <div className="flex items-center gap-2">
              {renderBadge()}
              {licenseInfo?.isUnlimited && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[11px] font-bold">LIFETIME</span>
              )}
            </div>
            <h4 className="text-[14px] font-bold" style={{ color: theme.text }}>{pkgInfo?.name || 'Aucune licence'}</h4>
          </div>
        </div>
        {licenseInfo?.licenseKey && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border" style={{ background: theme.surfaceAlt, borderColor: theme.border }}>
            <code className="text-[12px] font-bold tracking-wide" style={{ color: theme.text }}>{licenseInfo.licenseKey}</code>
          </div>
        )}
      </div>

      {/* Timer compact */}
      <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ borderColor: theme.border }}>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: theme.muted }}>Expiration</span>
        </div>
        {renderTimer()}
      </div>

      {/* Dates & Identity compact */}
      <div className="grid grid-cols-2 border-b" style={{ borderColor: theme.border }}>
        <div className="px-4 py-2.5 border-r flex items-center gap-2.5" style={{ borderColor: theme.border }}>
          <div>
            <p className="text-[11px] font-bold uppercase" style={{ color: theme.subMuted }}>Activée</p>
            <p className="text-[13px] font-semibold" style={{ color: theme.text }}>
              {licenseInfo?.initialExpirationDate ? new Date(licenseInfo.initialExpirationDate).toLocaleDateString('fr-FR') : '—'}
            </p>
          </div>
        </div>
        <div className="px-4 py-2.5 flex items-center gap-2.5">
          <div>
            <p className="text-[11px] font-bold uppercase" style={{ color: theme.subMuted }}>Expire</p>
            <p className="text-[13px] font-semibold" style={{ color: theme.text }}>
              {effectiveExpirationDate ? new Date(effectiveExpirationDate).toLocaleDateString('fr-FR') : 'Illimité'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 border-b" style={{ borderColor: theme.border }}>
        <div className="px-4 py-2.5 border-r flex items-center gap-2.5" style={{ borderColor: theme.border }}>
          <div className="overflow-hidden">
            <p className="text-[11px] font-bold uppercase" style={{ color: theme.subMuted }}>Titulaire</p>
            <p className="text-[13px] font-semibold truncate" style={{ color: theme.text }}>
              {licenseInfo?.customerName || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'N/A')}
            </p>
          </div>
        </div>
        <div className="px-4 py-2.5 flex items-center gap-2.5">
          <div className="overflow-hidden">
            <p className="text-[11px] font-bold uppercase" style={{ color: theme.subMuted }}>Entreprise</p>
            <p className="text-[13px] font-semibold truncate" style={{ color: theme.text }}>
              {licenseInfo?.companyName || user?.companyName || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* ⭐ FIX: ESRINA NY FONCTIONNALITÉS */}
    </div>
  );
};

export default ParametresLicense;