import React, { useEffect, useState, useRef, useCallback } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  details?: string;
  buttonText?: string;
  autoCloseDelay?: number;
  isDark?: boolean;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
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
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clearTimers = useCallback(() => {
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
    if (progressTimerRef.current) { clearInterval(progressTimerRef.current); progressTimerRef.current = null; }
  }, []);
  const handleClose = useCallback(() => { clearTimers(); onClose(); }, [clearTimers, onClose]);

  useEffect(() => {
    if (!isOpen) { clearTimers(); setProgress(100); return; }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter') { event.preventDefault(); handleClose(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    if (autoCloseDelay && autoCloseDelay > 0) {
      const startedAt = Date.now();
      setProgress(100);
      progressTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, 100 - (elapsed / autoCloseDelay) * 100);
        setProgress(remaining);
        if (remaining <= 0) { clearTimers(); onClose(); }
      }, 50);
      closeTimerRef.current = setTimeout(() => { clearTimers(); onClose(); }, autoCloseDelay);
    }
    return () => { window.removeEventListener('keydown', handleKeyDown); clearTimers(); };
  }, [isOpen, autoCloseDelay, clearTimers, handleClose, onClose]);

  if (!isMounted) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-200 ${isOpen ? 'bg-slate-950/45 backdrop-blur-[3px] opacity-100' : 'bg-slate-950/0 opacity-0 pointer-events-none'}`}
      onMouseDown={(event) => { if (event.target === event.currentTarget) handleClose(); }} role="presentation">
      <div className={`relative w-full max-w-[400px] overflow-hidden rounded-2xl border bg-white shadow-[0_20px_50px_rgba(15,23,42,0.18)] transition-all duration-200 ease-out dark:border-slate-800 dark:bg-[#0F172A] dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)] ${isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-[0.98] opacity-0'}`}
        onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="success-modal-title">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-indigo-600 dark:bg-indigo-400" />
        <button type="button" onClick={handleClose} aria-label="Fermer"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-all duration-150 hover:bg-slate-100 hover:text-slate-700 active:scale-95 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200">
          <X className="h-[17px] w-[17px]" strokeWidth={2} />
        </button>
        <div className="px-7 pt-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
            <CheckCircle2 className="h-[40px] w-[40px]" strokeWidth={2.1} />
          </div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-600 dark:text-emerald-400">Succès</div>
          <h2 id="success-modal-title" className="text-[18px] font-semibold leading-6 tracking-tight text-slate-900 dark:text-slate-100">{title}</h2>
        </div>
        <div className="px-7 pt-4">
          <p className="text-center text-[14px] leading-[1.55] text-slate-500 dark:text-slate-400">{message}</p>
          {details && (
            <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-[13px] leading-5 text-slate-700 dark:border-indigo-500/15 dark:bg-indigo-500/[0.06] dark:text-slate-300">
              {details}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end px-7 pb-6 pt-6">
          <button type="button" onClick={handleClose}
            className="min-w-[88px] rounded-lg bg-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-indigo-400/30 dark:focus:ring-offset-slate-900">
            {buttonText}
          </button>
        </div>
        {autoCloseDelay && autoCloseDelay > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100 dark:bg-slate-800">
            <div className="h-full bg-indigo-600 transition-[width] duration-75 ease-linear dark:bg-indigo-400" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessModal;