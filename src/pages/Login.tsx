// ============================================================
// src/pages/Login.tsx
// ============================================================
// ⭐ PREMIUM COMPACT DESKTOP LOGIN
// ⭐ STATIC LOGO FIX
// ⭐ LOGO: /images/logo.png
// ⭐ DASHBOARD IMAGE: /images/miniaturedark.png
// ⭐ DASHBOARD IMAGE: /images/miniaturelight.png
// ⭐ DARK / LIGHT MODE
// ⭐ PREMIUM COMPACT UI
// ⭐ FONT SIZE SYNCED WITH SIDEBAR
// ============================================================

import React, { useEffect, useState } from 'react';
import { ArrowRight, Cloud, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, Moon, ShieldCheck, Sun } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validateNotEmpty } from '../utils/validators';
import SuccessModal from '../components/common/SuccessModal';
import ErrorModal from '../components/common/ErrorModal';

// ============================================================
// STATIC ASSETS
// ============================================================
const LOGO_PATH = './images/logo.png';
const MINIATURE_DARK_PATH = './images/miniaturedark.png';
const MINIATURE_LIGHT_PATH = './images/miniaturelight.png';

// ============================================================
// APP INFO
// ============================================================
const APP_INFO = { version: '1.0.0', copyright: "2026 Life's Art ERP Pro" };

// ============================================================
// THEME
// ============================================================
const THEME = {
  dark: { surface: '#111827', surfaceAlt: '#1E293B', surfaceSoft: '#0F172A', border: '#1F2937', borderStrong: '#334155', text: '#FFFFFF', muted: '#94A3B8', subMuted: '#64748B', primary: '#6366F1', primaryHover: '#4F46E5', primaryBg: 'rgba(99,102,241,0.12)', green: '#10B981', red: '#EF4444', inputBg: 'transparent' },
  light: { surface: '#FFFFFF', surfaceAlt: '#F1F5F9', surfaceSoft: '#F8FAFC', border: '#E2E8F0', borderStrong: '#CBD5E1', text: '#0F172A', muted: '#64748B', subMuted: '#94A3B8', primary: '#6366F1', primaryHover: '#4338CA', primaryBg: 'rgba(99,102,241,0.06)', green: '#10B981', red: '#EF4444', inputBg: '#FFFFFF' }
} as const;

// ============================================================
// SKELETON LOGIN
// ============================================================
const SkeletonLogin = () => {
  const { isDark } = useTheme();
  const colors = isDark ? THEME.dark : THEME.light;
  const Skeleton = ({ className = '' }: { className?: string; }) => (
    <div className={`animate-pulse rounded-lg ${className}`} style={{ background: 'rgba(0,0,0,0.08)' }} />
  );
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-3" style={{ background: colors.surfaceSoft }}>
      <div className="w-full max-w-[980px] overflow-hidden rounded-xl border bg-white/50 dark:bg-[#0F172A]/50 lg:grid lg:grid-cols-2" style={{ borderColor: colors.border, minHeight: '450px' }}>
        <div className="flex flex-col justify-between border-r p-5" style={{ borderColor: colors.border }}>
          <div><div className="mb-6 flex items-center gap-2"><Skeleton className="h-7 w-7 rounded-lg" /><Skeleton className="h-3 w-16" /></div><Skeleton className="mb-1 h-6 w-32" /><Skeleton className="h-3 w-48" /></div>
          <div className="space-y-2"><Skeleton className="h-7 w-full" /><Skeleton className="h-7 w-full" /><Skeleton className="h-3 w-28" /><Skeleton className="h-8 w-full" /></div>
        </div>
        <div className="hidden flex-col border-l bg-white/40 p-5 dark:bg-slate-900/40 lg:flex" style={{ borderColor: colors.border }}>
          <div className="flex flex-1 flex-col items-center justify-center gap-4"><Skeleton className="h-3 w-24" /><Skeleton className="h-6 w-40" /><Skeleton className="aspect-video w-full rounded-lg" /></div>
        </div>
      </div>
      <style>{`@keyframes pulse { 50% { opacity: .55; } } .animate-pulse { animation: pulse 1.6s cubic-bezier(.4,0,.6,1) infinite; }`}</style>
    </div>
  );
};

// ============================================================
// FULL PAGE LOADER
// ============================================================
const FullPageLoader = () => {
  const { isDark } = useTheme();
  const colors = isDark ? THEME.dark : THEME.light;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: isDark ? 'rgba(11,15,25,.76)' : 'rgba(248,250,252,.76)', backdropFilter: 'blur(5px)' }}>
      <div className="w-[320px] max-w-[calc(100vw-32px)] rounded-2xl border p-6 text-center shadow-2xl" style={{ background: colors.surface, borderColor: colors.border }}>
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: colors.primaryBg }}><Loader2 className="h-5 w-5 animate-spin" style={{ color: colors.primary }} /></div>
        <div className="text-[14px] font-semibold" style={{ color: colors.text }}>Connexion en cours</div>
        <div className="mt-1 text-[13px]" style={{ color: colors.muted }}>Sécurisation de votre session...</div>
      </div>
    </div>
  );
};

// ============================================================
// LOGIN PAGE
// ============================================================
const Login: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, loading: authLoading, login, error: authError, clearError, setSession } = useAuth();
  const navigate = useNavigate();
  const colors = isDark ? THEME.dark : THEME.light;

  // STATIC ASSETS
  const logoSrc = LOGO_PATH;
  const miniatureSrc = isDark ? MINIATURE_DARK_PATH : MINIATURE_LIGHT_PATH;

  // LOGO DEBUG
  useEffect(() => {
    const img = new Image();
    img.onload = () => console.log('✅ LOGIN LOGO FOUND:', img.src, `${img.width}x${img.height}`);
    img.onerror = () => console.error('❌ LOGIN LOGO NOT FOUND:', img.src);
    img.src = logoSrc;
    console.log('LOGIN LOGO PATH:', logoSrc);
  }, [logoSrc]);

  // FORM
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);

  // PAGE LOADING
  useEffect(() => { const timer = setTimeout(() => setIsPageLoading(false), 500); return () => clearTimeout(timer); }, []);

  // AUTH REDIRECT
  useEffect(() => { if (isAuthenticated) navigate('/dashboard', { replace: true }); }, [isAuthenticated, navigate]);

  // AUTH ERROR
  useEffect(() => { if (!authError) return; setErrorMsg(authError); setShowError(true); clearError(); }, [authError, clearError]);

  // INPUT CHANGE
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // VALIDATION
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!validateNotEmpty(formData.email)) newErrors.email = 'Adresse email requise';
    else if (!validateEmail(formData.email)) newErrors.email = "Format d'email invalide";
    if (!validateNotEmpty(formData.password)) newErrors.password = 'Mot de passe requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !validate()) return;
    setLoading(true);
    try {
      const success = await login(formData.email.trim(), formData.password);
      if (success) { setSuccessMsg('Bienvenue sur votre espace.'); setShowSuccess(true); }
      else { setErrorMsg('Identifiants incorrects ou accès refusé.'); setShowError(true); }
    } catch (err: any) { setErrorMsg(err?.message || 'Erreur de connexion.'); setShowError(true); }
    finally { setLoading(false); }
  };

  // VERIFY 2FA
  const handleVerify2FA = async () => {
    if (twoFACode.length !== 6) { setErrorMsg('Code 2FA invalide (6 chiffres).'); setShowError(true); return; }
    if (!pendingUserId) { setErrorMsg('Identifiant de session manquant.'); setShowError(true); return; }
    setLoading(true);
    try {
      const result = await window.api.auth.verify2FALogin(pendingUserId, twoFACode);
      if (typeof result === 'object' && result?.success && result?.token && result?.user) {
        setSession(result.token, result.user);
        setShow2FA(false); setTwoFACode(''); setPendingUserId(null);
        setSuccessMsg(`Bienvenue ${result.user?.firstName || 'Collaborateur'} !`);
        setShowSuccess(true);
        return;
      }
      setErrorMsg('Code 2FA invalide.'); setShowError(true); setTwoFACode('');
    } catch (err: any) { setErrorMsg(err?.message || 'Erreur 2FA.'); setShowError(true); }
    finally { setLoading(false); }
  };

  // SUCCESS
  const handleSuccessClose = () => { setShowSuccess(false); navigate('/dashboard', { replace: true }); };

  // PAGE LOADERS
  if (isPageLoading) return <SkeletonLogin />;
  if (authLoading) return (<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-7 w-7 animate-spin" style={{ color: colors.primary }} /><span className="ml-2 text-[14px]" style={{ color: colors.muted }}>Chargement...</span></div>);
  if (isAuthenticated) return null;

  // 2FA SCREEN
  if (show2FA) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-3 transition-colors duration-200" style={{ background: isDark ? 'linear-gradient(135deg, #4F46E5 0%, #312E81 45%, #0F172A 100%)' : 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 45%, #F8FAFC 100%)' }}>
        <div className="w-full max-w-[380px] overflow-hidden rounded-xl border p-5 shadow-xl" style={{ background: colors.surface, borderColor: colors.border }}>
          <div className="mb-3 flex justify-center"><div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: colors.primaryBg }}><KeyRound className="h-4 w-4" style={{ color: colors.primary }} /></div></div>
          <div className="text-center"><h2 className="text-[18px] font-semibold" style={{ color: colors.text }}>Vérification en deux étapes</h2><p className="mt-0.5 text-[13px]" style={{ color: colors.muted }}>Code de sécurité à 6 chiffres.</p></div>
          <div className="mt-4 flex justify-center gap-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <input key={i} type="text" inputMode="numeric" maxLength={1} value={twoFACode[i] || ''} disabled={loading} autoFocus={i === 0}
                onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); if (v.length > 1) return; const chars = twoFACode.split(''); chars[i] = v; setTwoFACode(chars.join('')); if (v && i < 5) document.querySelectorAll('[data-2fa]')[i + 1]?.focus(); }}
                onKeyDown={(e) => { if (e.key === 'Backspace' && !twoFACode[i] && i > 0) document.querySelectorAll('[data-2fa]')[i - 1]?.focus(); }}
                data-2fa className="h-8 w-8 rounded-md border text-center text-[14px] font-semibold outline-none transition-all" style={{ background: colors.surfaceAlt, borderColor: twoFACode[i] ? colors.primary : colors.border, color: colors.text }} />
            ))}
          </div>
          <button type="button" disabled={loading || twoFACode.length !== 6} onClick={handleVerify2FA} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md py-2 text-[14px] font-semibold text-white transition-all disabled:opacity-50" style={{ background: colors.primary }}>{loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <>Vérifier<ArrowRight className="h-3 w-3" /></>}</button>
          <button type="button" disabled={loading} onClick={() => { setShow2FA(false); setTwoFACode(''); setPendingUserId(null); }} className="mt-2 w-full text-center text-[14px] hover:underline" style={{ color: colors.muted }}>Retour</button>
        </div>
      </div>
    );
  }

  // MAIN LOGIN
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-3 transition-colors duration-200" style={{ background: isDark ? 'linear-gradient(135deg, #4F46E5 0%, #312E81 45%, #0F172A 100%)' : 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 45%, #F8FAFC 100%)' }}>
      {loading && <FullPageLoader />}
      <button type="button" onClick={toggleTheme} className="fixed right-4 top-4 z-40 flex h-7 w-7 items-center justify-center rounded-full border transition-all" style={{ background: colors.surface, borderColor: colors.border, color: colors.muted }}>{isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}</button>
      <div className="flex w-full max-w-[980px] overflow-hidden rounded-xl border shadow-xl" style={{ background: colors.surface, borderColor: colors.border }}>
        {/* RIGHT SIDEBAR */}
        <div className="hidden w-1/2 shrink-0 flex-col justify-between border-r p-5 lg:flex" style={{ background: colors.surfaceAlt, borderColor: colors.border }}>
          <div className="space-y-3">
            <div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-lg text-white" style={{ background: colors.primary }}><Cloud className="h-3.5 w-3.5" /></div><div><div className="text-[14px] font-semibold" style={{ color: colors.text }}>Life's Art ERP</div><div className="text-[13px]" style={{ color: colors.muted }}>Enterprise Solution</div></div></div>
            <h2 className="text-[20px] font-semibold leading-tight" style={{ color: colors.text }}>Gérez tout,<br />partout.</h2>
            <div className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-lg border" style={{ borderColor: colors.border }}><img src={miniatureSrc} alt="Dashboard Preview" className="h-full w-full object-contain p-1" /></div>
            <div className="grid grid-cols-2 gap-1.5">{[{ icon: ShieldCheck, title: 'Accès sécurisé' }, { icon: Cloud, title: 'Offline First' }].map((item, i) => { const Icon = item.icon; return (<div key={i} className="flex items-center gap-1.5 rounded border p-2 text-[14px] font-medium" style={{ borderColor: colors.border, color: colors.text }}><Icon size={12} style={{ color: colors.primary }} />{item.title}</div>); })}</div>
          </div>
        </div>
        {/* LEFT FORM */}
        <div className="flex w-full flex-col justify-between p-5 lg:w-1/2">
          <div className="mb-3 flex items-center gap-2"><img src={logoSrc} alt="Life's Art" className="h-7 w-7 object-contain" onError={(e) => console.error('❌ LOGIN IMG ERROR:', e.currentTarget.src)} onLoad={(e) => console.log('✅ LOGIN IMG LOADED:', e.currentTarget.src)} /><span className="text-[14px] font-bold" style={{ color: colors.text }}>Life's Art</span></div>
          <div><h1 className="mb-0.5 text-[22px] font-bold" style={{ color: colors.text }}>Bienvenue</h1><p className="mb-3 text-[13px]" style={{ color: colors.muted }}>Connectez-vous à votre espace.</p></div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div><label className="mb-1 block text-[13px] font-medium" style={{ color: colors.muted }}>Adresse email</label><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: colors.subMuted }} /><input type="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} disabled={loading} placeholder="Addresse email" className="h-10 w-full rounded-md border pl-9 pr-3 text-[14px] font-medium outline-none transition-all" style={{ background: isDark ? 'transparent' : colors.inputBg, color: colors.text, borderColor: errors.email ? colors.red : colors.border }} onFocus={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.primary}15`; }} onBlur={(e) => { e.currentTarget.style.borderColor = errors.email ? colors.red : colors.border; e.currentTarget.style.boxShadow = 'none'; }} /></div>{errors.email && <p className="mt-0.5 text-[13px] font-medium text-red-500">{errors.email}</p>}</div>
            <div><div className="mb-1 flex items-center justify-between"><label className="text-[13px] font-medium" style={{ color: colors.muted }}>Mot de passe</label><button type="button" onClick={() => { setErrorMsg('Contactez le support pour réinitialiser.'); setShowError(true); }} className="text-[13px] hover:underline" style={{ color: colors.primary }}>Oublié ?</button></div><div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: colors.subMuted }} /><input type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password" value={formData.password} onChange={handleChange} disabled={loading} placeholder="••••••••" className="h-10 w-full rounded-md border pl-9 pr-9 text-[14px] font-medium outline-none transition-all" style={{ background: isDark ? 'transparent' : colors.inputBg, color: colors.text, borderColor: errors.password ? colors.red : colors.border }} onFocus={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.primary}15`; }} onBlur={(e) => { e.currentTarget.style.borderColor = errors.password ? colors.red : colors.border; e.currentTarget.style.boxShadow = 'none'; }} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1" style={{ color: colors.subMuted }}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>{errors.password && <p className="mt-0.5 text-[13px] font-medium text-red-500">{errors.password}</p>}</div>
            <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} disabled={loading} className="h-3 w-3 cursor-pointer rounded accent-indigo-600" /><span className="text-[13px]" style={{ color: colors.muted }}>Rester connecté</span></label>
            <button type="submit" disabled={loading} className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-md text-[14px] font-semibold text-white transition-all disabled:opacity-50" style={{ background: colors.primary, boxShadow: `0 4px 12px ${colors.primary}25` }}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Se connecter<ArrowRight className="h-4 w-4" /></>}</button>
          </form>
          <div className="mt-3 text-center text-[13px]" style={{ color: colors.muted }}>Pas encore de compte ? <Link to="/register" className="font-medium hover:underline" style={{ color: colors.primary }}>S'inscrire</Link></div>
          <footer className="mt-4 flex items-center justify-between border-t pt-3 text-[13px]" style={{ borderColor: colors.border, color: colors.subMuted }}><span>Life's Art ERP · v{APP_INFO.version}</span><div className="flex gap-3"><Link to="/terms" className="hover:underline">Conditions</Link><Link to="/support" className="hover:underline">Support</Link></div></footer>
        </div>
      </div>
      <SuccessModal isOpen={showSuccess} onClose={handleSuccessClose} title="Connexion réussie" message={successMsg} buttonText="Accéder au tableau de bord" autoCloseDelay={2000} />
      <ErrorModal isOpen={showError} onClose={() => setShowError(false)} title="Erreur" message={errorMsg} buttonText="OK" autoCloseDelay={4000} />
    </div>
  );
};

export default Login;