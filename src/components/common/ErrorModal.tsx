// src/components/common/ErrorModal.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { XCircle, X, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  details?: string;
  buttonText?: string;
  autoCloseDelay?: number;
  isDark?: boolean;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  details,
  buttonText = 'OK',
  autoCloseDelay = 4000,
  isDark: propIsDark,
}) => {
  const { isDark: contextIsDark } = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : contextIsDark;

  const [isMounted, setIsMounted] = useState(isOpen);
  useEffect(() => {
    if (isOpen) { setIsMounted(true); return; }
    const timer = window.setTimeout(() => setIsMounted(false), 180);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const [progress, setProgress] = useState(100);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
  }, []);

  useEffect(() => {
    if (!isOpen) { setProgress(100); clearTimers(); return; }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter') { event.preventDefault(); clearTimers(); onClose(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    if (autoCloseDelay > 0) {
      const startTime = Date.now();
      setProgress(100);
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setProgress(Math.max((1 - elapsed / autoCloseDelay) * 100, 0));
      }, 50);
      timerRef.current = setTimeout(() => { clearTimers(); onClose(); }, autoCloseDelay);
    }
    return () => { window.removeEventListener('keydown', handleKeyDown); clearTimers(); };
  }, [isOpen, autoCloseDelay, onClose, clearTimers]);

  const handleClose = useCallback(() => { clearTimers(); onClose(); }, [clearTimers, onClose]);

  if (!isMounted) return null;

  // ⭐ FIX: Mode Light - Mazava (White / Slate-50)
  const colors = isDark
    ? {
        overlay: 'rgba(2, 6, 23, 0.72)', card: '#0F172A', border: '#1E293B', divider: '#1E293B',
        text: '#F8FAFC', muted: '#CBD5E1', subtle: '#94A3B8',
        iconBg: 'rgba(239, 68, 68, 0.10)', icon: '#F87171',
        detailsBg: 'rgba(15, 23, 42, 0.75)', detailsBorder: '#334155',
        button: '#4F46E5', buttonHover: '#4338CA',
        closeHover: 'rgba(255,255,255,0.07)',
        progressBg: '#1E293B', progress: '#EF4444',
      }
    : {
        overlay: 'rgba(15, 23, 42, 0.25)', card: '#FFFFFF', border: '#E2E8F0', divider: '#F1F5F9',
        text: '#0F172A', muted: '#475569', subtle: '#64748B',
        iconBg: '#FEF2F2', icon: '#DC2626',
        detailsBg: '#F8FAFC', detailsBorder: '#E2E8F0',
        button: '#4F46E5', buttonHover: '#4338CA',
        closeHover: '#F1F5F9',
        progressBg: '#F1F5F9', progress: '#DC2626',
      };

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-180 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      style={{ backgroundColor: colors.overlay, backdropFilter: 'blur(3px)' }}
      onMouseDown={(event) => { if (event.target === event.currentTarget) handleClose(); }}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="error-modal-title" aria-describedby="error-modal-description"
        className={`relative w-full max-w-[460px] overflow-hidden rounded-2xl border shadow-[0_20px_50px_rgba(15,23,42,0.12)] transition-all duration-180 ease-out ${isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-1 scale-[0.985] opacity-0'}`}
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
        onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b px-5 py-4" style={{ borderColor: colors.divider }}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: colors.iconBg }}>
              <XCircle size={20} strokeWidth={2} style={{ color: colors.icon }} />
            </div>
            <div className="min-w-0">
              <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: colors.icon }}>Erreur</div>
              <h2 id="error-modal-title" className="truncate text-[15px] font-semibold leading-5" style={{ color: colors.text }}>{title}</h2>
            </div>
          </div>
          <button type="button" onClick={handleClose} aria-label="Fermer"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-150"
            style={{ color: colors.subtle }}
            onMouseEnter={(event) => { event.currentTarget.style.backgroundColor = colors.closeHover; event.currentTarget.style.color = colors.text; }}
            onMouseLeave={(event) => { event.currentTarget.style.backgroundColor = 'transparent'; event.currentTarget.style.color = colors.subtle; }}>
            <X size={17} strokeWidth={2} />
          </button>
        </div>
        <div className="px-5 py-5">
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: colors.iconBg }}>
              <AlertTriangle size={14} strokeWidth={2} style={{ color: colors.icon }} />
            </div>
            <p id="error-modal-description" className="min-w-0 text-[14px] font-medium leading-6" style={{ color: colors.muted }}>{message}</p>
          </div>
          {details && (
            <div className="mt-4 rounded-xl border px-4 py-3" style={{ backgroundColor: colors.detailsBg, borderColor: colors.detailsBorder }}>
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.07em]" style={{ color: colors.subtle }}>Détails</div>
              <p className="whitespace-pre-wrap break-words text-[12.5px] leading-5 font-mono" style={{ color: colors.muted }}>{details}</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end border-t px-5 py-3" style={{ borderColor: colors.divider }}>
          <button type="button" onClick={handleClose}
            className="min-w-[76px] rounded-lg px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            style={{ backgroundColor: colors.button }}
            onMouseEnter={(event) => { event.currentTarget.style.backgroundColor = colors.buttonHover; }}
            onMouseLeave={(event) => { event.currentTarget.style.backgroundColor = colors.button; }}>
            {buttonText}
          </button>
        </div>
        {autoCloseDelay > 0 && (
          <div className="absolute bottom-0 left-0 h-[2px] w-full" style={{ backgroundColor: colors.progressBg }}>
            <div className="h-full" style={{ width: `${progress}%`, backgroundColor: colors.progress, transition: 'width 50ms linear' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorModal;