// src/components/parametres/Parametres2FAModal.tsx - EXCEL STYLE
// ⭐ DESIGN: Compact avec bordures 1px, grid 2 colonnes
// ⭐ FONTSIZE: Header 15px, Labels 11px, Code 14px
// ============================================================

import React from 'react';
import { Smartphone, X, Copy, Loader2, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const COLORS = {
  light: {
    surface: '#FFFFFF',
    surfaceAlt: '#F8FAFC',
    border: '#CBD5E1',
    text: '#0F172A',
    muted: '#64748B',
    primary: '#6366F1',
    primaryHover: '#4F46E5',
    inputBg: '#FFFFFF',
  },
  dark: {
    surface: '#1E293B',
    surfaceAlt: '#0B1120',
    border: '#334155',
    text: '#F3F4F6',
    muted: '#9CA3AF',
    primary: '#6366F1',
    primaryHover: '#4F46E5',
    inputBg: '#0F172A',
  }
};

interface Parametres2FAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
  twoFAQrCode: string;
  twoFASecret: string;
  twoFACode: string;
  onTwoFACodeChange: (code: string) => void;
  twoFALoading: boolean;
  onCopySecret: () => void;
  isDark: boolean;
}

// ⭐ Composant helper ho an'ny cellule (2 colonnes)
const FieldCell: React.FC<{
  label: string;
  children: React.ReactNode;
  isDark?: boolean;
  borderBottom?: boolean;
}> = ({ label, children, isDark = false, borderBottom = true }) => {
  const theme = isDark ? COLORS.dark : COLORS.light;
  const border = theme.border;
  
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${borderBottom ? 'border-b' : ''}`} style={{ borderColor: border, borderWidth: '1px', borderStyle: 'solid' }}>
      <div className="px-3 py-2.5 border-r flex items-center" style={{ borderColor: border, background: theme.surfaceAlt }}>
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.muted }}>{label}</span>
      </div>
      <div className="px-3 py-2.5 flex items-center" style={{ background: theme.surface }}>
        {children}
      </div>
    </div>
  );
};

const Parametres2FAModal: React.FC<Parametres2FAModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  twoFAQrCode,
  twoFASecret,
  twoFACode,
  onTwoFACodeChange,
  twoFALoading,
  onCopySecret,
  isDark,
}) => {
  const { isDark: themeIsDark } = useTheme();
  const theme = themeIsDark ? COLORS.dark : COLORS.light;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md border rounded-lg shadow-2xl overflow-hidden" style={{ background: theme.surface, borderColor: theme.border }}>
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" style={{ color: theme.primary }} />
            <h2 className="text-[15px] font-bold" style={{ color: theme.text }}>Activer le 2FA</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5" style={{ color: theme.muted }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY - EXCEL STYLE TABLE */}
        <div>
          {/* LIGNE QR CODE (pleine largeur) */}
          <div className="border-b p-4 flex flex-col items-center" style={{ borderColor: theme.border }}>
            <p className="text-[13px] font-medium mb-2" style={{ color: theme.muted }}>
              Scannez ce QR code avec Google Authenticator
            </p>
            {twoFAQrCode && (
              <img src={twoFAQrCode} alt="QR Code 2FA" className="w-36 h-36 border rounded" style={{ borderColor: theme.border }} />
            )}
          </div>

          {/* LIGNE: Clé secrète */}
          <FieldCell label="Clé secrète" isDark={themeIsDark} borderBottom={true}>
            <div className="flex items-center gap-2 w-full">
              <code className="flex-1 text-[13px] font-mono p-1 rounded break-all" style={{ background: themeIsDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', color: theme.text }}>
                {twoFASecret}
              </code>
              <button 
                onClick={onCopySecret} 
                className="p-1.5 rounded flex-shrink-0" 
                style={{ background: 'rgba(99,102,241,0.1)', color: theme.primary }}
                title="Copier la clé"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </FieldCell>

          {/* LIGNE: Code 2FA */}
          <FieldCell label="Code à 6 chiffres" isDark={themeIsDark} borderBottom={false}>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={twoFACode}
              onChange={(e) => onTwoFACodeChange(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-1.5 rounded focus:outline-none text-[14px] font-mono text-center tracking-wider border"
              style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }}
              onFocus={(e) => { 
                e.currentTarget.style.borderColor = theme.primary; 
                e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.primary}30`; 
              }}
              onBlur={(e) => { 
                e.currentTarget.style.borderColor = theme.border; 
                e.currentTarget.style.boxShadow = 'none'; 
              }}
              placeholder="123456"
              aria-label="Code d'authentification"
            />
          </FieldCell>

          {/* BOUTON */}
          <div className="p-4 border-t" style={{ borderColor: theme.border }}>
            <button
              onClick={onVerify}
              disabled={twoFALoading || twoFACode.length !== 6}
              className="w-full py-2 rounded text-[13px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-all"
              style={{ background: theme.primary }}
            >
              {twoFALoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              Activer le 2FA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Parametres2FAModal;