// ============================================================
// src/components/common/ConfirmModal.tsx
// GOOGLE-LIKE / PREMIUM ERP CONFIRM MODAL
// ============================================================

import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, CheckCircle, ShieldAlert } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'red' | 'green' | 'amber' | 'primary';
  icon?: React.ReactNode;
  isDark?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  confirmColor = 'red',
  icon,
  isDark: propIsDark,
}) => {
  const { isDark: contextIsDark } = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : contextIsDark;

  const [isMounted, setIsMounted] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      return;
    }
    const timer = window.setTimeout(() => setIsMounted(false), 180);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key === 'Enter') { event.preventDefault(); onConfirm(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm]);

  if (!isMounted) return null;

  const colorConfig = {
    red: {
      icon: 'text-red-600 dark:text-red-400',
      iconBg: 'bg-red-50 border-red-100 dark:bg-red-500/10 dark:border-red-500/20',
      accent: 'bg-red-500',
      button: 'bg-red-600 hover:bg-red-700',
      eyebrow: 'text-red-600 dark:text-red-400',
    },
    green: {
      icon: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20',
      accent: 'bg-emerald-500',
      button: 'bg-emerald-600 hover:bg-emerald-700',
      eyebrow: 'text-emerald-600 dark:text-emerald-400',
    },
    amber: {
      icon: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20',
      accent: 'bg-amber-500',
      button: 'bg-amber-600 hover:bg-amber-700',
      eyebrow: 'text-amber-600 dark:text-amber-400',
    },
    primary: {
      icon: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20',
      accent: 'bg-indigo-500',
      button: 'bg-indigo-600 hover:bg-indigo-700',
      eyebrow: 'text-indigo-600 dark:text-indigo-400',
    },
  };

  // ⭐ FIX: sécuriser la récupération des couleurs
  const safeColor = colorConfig[confirmColor] ? confirmColor : 'red';
  const colors = colorConfig[safeColor];

  const getDefaultIcon = () => {
    const commonClass = `h-[21px] w-[21px] ${colors.icon}`;
    switch (safeColor) {
      case 'green': return <CheckCircle className={commonClass} strokeWidth={2} />;
      case 'amber': return <AlertTriangle className={commonClass} strokeWidth={2} />;
      case 'primary': return <ShieldAlert className={commonClass} strokeWidth={2} />;
      default: return <AlertTriangle className={commonClass} strokeWidth={2} />;
    }
  };

  const iconToShow = icon || getDefaultIcon();

  const formatMessage = (msg: string) => {
    const parts = msg.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-slate-800 dark:text-slate-100">{part.slice(2, -2)}</strong>;
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-200 ease-out ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-message"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[4px] dark:bg-slate-950/75" aria-hidden="true" />
      <div
        className={`relative z-10 w-full max-w-[430px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-[#0F172A] dark:shadow-[0_24px_70px_rgba(0,0,0,0.45)] transition-all duration-200 ease-out ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[0.97]'}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={`absolute inset-x-0 top-0 h-[3px] ${colors.accent}`} />
        <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-slate-100 hover:text-slate-700 active:scale-95 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200" aria-label="Fermer">
          <X size={17} strokeWidth={2} />
        </button>
        <div className="px-6 pb-3 pt-7">
          <div className="flex items-start gap-3.5 pr-8">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${colors.iconBg}`}>
              {iconToShow}
            </div>
            <div className="min-w-0 pt-0.5">
              <div className={`mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${colors.eyebrow}`}>Confirmation</div>
              <h2 id="confirm-modal-title" className="text-[16px] font-semibold leading-6 tracking-[-0.01em] text-slate-900 dark:text-slate-100">{title}</h2>
            </div>
          </div>
        </div>
        <div id="confirm-modal-message" className="px-6 pb-5 text-[14px] font-normal leading-6 text-slate-500 dark:text-slate-400">
          {formatMessage(message)}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-900/40">
          <button type="button" onClick={onClose} className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-700 transition-all duration-150 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] dark:border-slate-700 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-600">
            {cancelText}
          </button>
          <button type="button" onClick={onConfirm} className={`h-9 rounded-lg px-4 text-[13px] font-semibold text-white shadow-sm transition-all duration-150 hover:shadow-md active:scale-[0.98] ${colors.button}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;