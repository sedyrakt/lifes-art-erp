// ============================================================
// src/pages/Register.tsx
// ============================================================
// ⭐ PREMIUM COMPACT DESKTOP REGISTER
// ⭐ STATIC LOGO FIX
// ⭐ LOGO: /images/logo.png
// ⭐ DASHBOARD IMAGE: /images/miniaturedark.png
// ⭐ DASHBOARD IMAGE: /images/miniaturelight.png
// ⭐ DARK / LIGHT MODE
// ⭐ PREMIUM COMPACT UI
// ⭐ FONT SIZE SYNCED WITH SIDEBAR
// ============================================================

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Building, Check, Cloud, Eye, EyeOff, LayoutDashboard, Loader2, Lock, Mail, Moon, ShieldCheck, Sun, User, Users as UsersIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { validateEmail, validateNotEmpty, validatePassword } from '../utils/validators';
import SuccessModal from '../components/common/SuccessModal';
import ErrorModal from '../components/common/ErrorModal';

// ============================================================
// STATIC ASSETS
// ============================================================
const LOGO_PATH = './images/logo.png';
const MINIATURE_DARK_PATH = './images/miniaturedark.png';
const MINIATURE_LIGHT_PATH = './images/miniaturelight.png';

// ============================================================
// TYPES
// ============================================================
interface RegisterFormData { firstName: string; lastName: string; email: string; phone: string; password: string; confirmPassword: string; companyName: string; role: string; }
interface FormErrors { firstName?: string; lastName?: string; email?: string; phone?: string; password?: string; confirmPassword?: string; companyName?: string; terms?: string; }
interface PasswordStrengthResult { score: number; label: string; color: string; }

// ============================================================
// APP INFO
// ============================================================
const APP_INFO = { name: "Life's Art", version: '1.0.0', copyright: "2026 Life's Art ERP Pro" };

// ============================================================
// THEME
// ============================================================
const THEME = {
  dark: { surface: '#111827', surfaceAlt: '#1E293B', surfaceSoft: '#0F172A', border: '#1F2937', borderStrong: '#334155', text: '#FFFFFF', muted: '#94A3B8', subMuted: '#64748B', primary: '#6366F1', primaryHover: '#4F46E5', inputBg: '#111827' },
  light: { surface: '#FFFFFF', surfaceAlt: '#F1F5F9', surfaceSoft: '#F8FAFC', border: '#E2E8F0', borderStrong: '#CBD5E1', text: '#0F172A', muted: '#64748B', subMuted: '#94A3B8', primary: '#4F46E5', primaryHover: '#4338CA', inputBg: '#FFFFFF' }
} as const;

// ============================================================
// PASSWORD STRENGTH
// ============================================================
const getPasswordStrength = (password: string): PasswordStrengthResult => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Excellent'];
  const colors = ['', '#EF4444', '#F97316', '#F59E0B', '#10B981', '#059669'];
  return { score, label: labels[score] || '', color: colors[score] || '' };
};

// ============================================================
// PASSWORD STRENGTH BARS
// ============================================================
const PasswordStrengthBars: React.FC<{ password: string; }> = ({ password }) => {
  const { isDark } = useTheme();
  const colors = isDark ? THEME.dark : THEME.light;
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  if (!password) return null;
  return (
    <div className="mt-0.5 flex items-center gap-2">
      <div className="flex min-w-0 flex-1 gap-1">{Array.from({ length: 5 }).map((_, index) => {
        const active = index < strength.score;
        return <div key={index} className="h-0.5 flex-1 rounded-full transition-all duration-300" style={{ background: active ? strength.color : colors.border }} />;
      })}</div>
      {strength.label && <span className="shrink-0 text-[10px] font-semibold" style={{ color: strength.color }}>{strength.label}</span>}
    </div>
  );
};

// ============================================================
// CUSTOM CHECKBOX
// ============================================================
const CustomCheckbox: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean; label: string; hasError?: boolean; }> = ({ checked, onChange, disabled = false, label, hasError = false }) => {
  const { isDark } = useTheme();
  const colors = isDark ? THEME.dark : THEME.light;
  return (
    <button type="button" disabled={disabled} role="checkbox" aria-checked={checked} onClick={() => { if (!disabled) onChange(!checked); }} className={['group flex w-full items-start gap-2', 'text-left outline-none', disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'].join(' ')}>
      <span className="mt-[2px] flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border transition-all duration-150" style={{ borderColor: hasError ? '#EF4444' : checked ? colors.primary : colors.borderStrong, background: checked ? colors.primary : 'transparent' }}>
        {checked && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
      </span>
      <span className="text-[13px] font-medium leading-3.5" style={{ color: colors.muted }}>{label}</span>
    </button>
  );
};

// ============================================================
// FORM INPUT
// ============================================================
const FormInput: React.FC<{ label: string; name: string; value: string; placeholder?: string; type?: string; icon: React.ElementType; error?: string; disabled?: boolean; autoComplete?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; rightElement?: React.ReactNode; }> = ({ label, name, value, placeholder, type = 'text', icon: Icon, error, disabled = false, autoComplete, onChange, rightElement }) => {
  const { isDark } = useTheme();
  const colors = isDark ? THEME.dark : THEME.light;
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);
  const borderColor = hasError ? '#EF4444' : focused ? colors.primary : colors.border;
  return (
    <div className="min-w-0">
      <label htmlFor={name} className="mb-0.5 block text-[13px] font-semibold" style={{ color: colors.muted }}>{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: focused ? colors.primary : colors.subMuted }} />
        <input id={name} name={name} type={type} value={value} placeholder={placeholder} disabled={disabled} autoComplete={autoComplete} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} className={['h-8 w-full rounded-md border pl-8', rightElement ? 'pr-8' : 'pr-2.5', 'text-[14px] font-medium outline-none', 'transition-all duration-150', 'disabled:cursor-not-allowed', 'disabled:opacity-60'].join(' ')} style={{ background: isDark ? 'transparent' : colors.inputBg, color: colors.text, borderColor, boxShadow: focused && !hasError ? `0 0 0 2px ${colors.primary}15` : 'none' }} />
        {rightElement}
      </div>
      {error && <p className="mt-0.5 text-[13px] font-medium text-red-500">{error}</p>}
    </div>
  );
};

// ============================================================
// REGISTER PAGE
// ============================================================
export const Register: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const colors = isDark ? THEME.dark : THEME.light;
  const navigate = useNavigate();
  const miniatureSrc = isDark ? MINIATURE_DARK_PATH : MINIATURE_LIGHT_PATH;
  const logoSrc = LOGO_PATH;

  // LOGO DEBUG
  useEffect(() => {
    const img = new Image();
    img.onload = () => console.log('✅ REGISTER LOGO FOUND:', img.src, `${img.width}x${img.height}`);
    img.onerror = () => console.error('❌ REGISTER LOGO NOT FOUND:', img.src);
    img.src = logoSrc;
    console.log('REGISTER LOGO PATH:', logoSrc);
  }, [logoSrc]);

  // FORM STATE
  const [formData, setFormData] = useState<RegisterFormData>({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', companyName: '', role: 'user' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // INPUT CHANGE
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // VALIDATION
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!validateNotEmpty(formData.firstName)) newErrors.firstName = 'Prénom requis';
    if (!validateNotEmpty(formData.lastName)) newErrors.lastName = 'Nom requis';
    if (!validateNotEmpty(formData.email)) newErrors.email = 'Email requis';
    else if (!validateEmail(formData.email)) newErrors.email = "Format d'email invalide";
    if (!validateNotEmpty(formData.companyName)) newErrors.companyName = 'Entreprise requise';
    const pwdCheck = validatePassword(formData.password);
    if (!pwdCheck.valid) newErrors.password = pwdCheck.message;
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    if (!termsAccepted) newErrors.terms = 'Veuillez accepter les conditions';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true); setErrorMsg(null);
    try {
      const cleanEmail = formData.email.trim().toLowerCase();
      const cleanCompanyName = formData.companyName.trim();
      const cleanFirstName = formData.firstName.trim();
      const cleanLastName = formData.lastName.trim();
      const existingUser = await window.api.users.getByEmail(cleanEmail);
      if (existingUser?.success && existingUser?.data) { setErrors({ email: 'Cet email est déjà utilisé.' }); setLoading(false); return; }
      const result = await window.api.users.create({ email: cleanEmail, password: formData.password, firstName: cleanFirstName, lastName: cleanLastName, phone: formData.phone.trim(), companyName: cleanCompanyName, role: 'admin' });
      if (!result?.success) { setErrorMsg(result?.error || "Une erreur est survenue lors de l'inscription."); return; }
      localStorage.setItem('register_email', cleanEmail); localStorage.setItem('register_firstName', cleanFirstName); localStorage.setItem('register_companyName', cleanCompanyName);
      setShowSuccess(true);
    } catch (error: any) { setErrorMsg(error?.message || 'Erreur de connexion au serveur.'); }
    finally { setLoading(false); }
  };

  // MODAL HANDLERS
  const handleSuccessClose = () => { setShowSuccess(false); navigate('/login', { replace: true }); };
  const handleErrorClose = () => { setErrorMsg(null); };

  // RENDER
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-3 transition-colors duration-200" style={{ background: isDark ? 'linear-gradient(135deg, #4F46E5 0%, #312E81 45%, #0F172A 100%)' : 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 45%, #F8FAFC 100%)' }}>
      <button type="button" onClick={toggleTheme} className="fixed right-4 top-4 z-40 flex h-7 w-7 items-center justify-center rounded-full border transition-all" style={{ background: colors.surface, borderColor: colors.border, color: colors.muted }}>{isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}</button>
      <div className="flex w-full max-w-[980px] overflow-hidden rounded-xl border shadow-xl" style={{ background: colors.surface, borderColor: colors.border }}>
        {/* RIGHT SIDEBAR / PREVIEW */}
        <div className="hidden w-1/2 shrink-0 flex-col justify-between border-r p-5 lg:flex" style={{ background: colors.surfaceAlt, borderColor: colors.border }}>
          <div className="space-y-3">
            <div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-lg text-white" style={{ background: colors.primary }}><Cloud className="h-3.5 w-3.5" /></div><div><div className="text-[15px] font-bold tracking-tight" style={{ color: colors.text }}>Life's Art ERP</div><div className="text-[10px] font-medium tracking-wide" style={{ color: colors.muted }}>Enterprise Solution</div></div></div>
            <h2 className="text-[15px] font-bold leading-tight tracking-tight" style={{ color: colors.text }}>Gérez tout,<br />partout.</h2>
            <div className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-lg border" style={{ borderColor: colors.border }}><img src={miniatureSrc} alt="Dashboard" className="h-full w-full object-contain p-1" /></div>
            <div className="grid grid-cols-2 gap-1.5">{[{ icon: ShieldCheck, title: 'Données sécurisées' }, { icon: UsersIcon, title: 'Gestion RH' }, { icon: LayoutDashboard, title: 'Tableau de bord' }, { icon: Cloud, title: 'Offline First' }].map((item, i) => { const Icon = item.icon; return (<div key={i} className="flex items-center gap-1.5 rounded border p-2 text-[13px] font-medium" style={{ borderColor: colors.border, color: colors.text }}><Icon size={12} style={{ color: colors.primary }} />{item.title}</div>); })}</div>
          </div>
        </div>
        {/* LEFT FORM */}
        <div className="flex w-full flex-col justify-between p-5 lg:w-1/2">
          <div><h1 className="mb-0.5 text-[22px] font-bold tracking-tight" style={{ color: colors.text }}>Créer un compte</h1><p className="mb-3 text-[14px] font-medium" style={{ color: colors.muted }}>Commencez votre essai gratuit.</p></div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <FormInput label="Prénom" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Prenom" icon={User} error={errors.firstName} />
              <FormInput label="Nom" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Nom" icon={User} error={errors.lastName} />
            </div>
            <FormInput label="Email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Addresse email" icon={Mail} error={errors.email} autoComplete="email" />
            <FormInput label="Entreprise" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Nom de votre société" icon={Building} error={errors.companyName} />
            <div className="grid grid-cols-2 gap-2">
              <div className="min-w-0">
                <FormInput label="Mot de passe" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange} placeholder="Mot de passe" icon={Lock} error={errors.password} autoComplete="new-password" rightElement={<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1" style={{ color: colors.subMuted }}>{showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}</button>} />
                <PasswordStrengthBars password={formData.password} />
              </div>
              <FormInput label="Confirmation" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleInputChange} placeholder="Répéter le mot de passe" icon={Lock} error={errors.confirmPassword} autoComplete="new-password" rightElement={<button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1" style={{ color: colors.subMuted }}>{showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}</button>} />
            </div>
            <CustomCheckbox checked={termsAccepted} onChange={setTermsAccepted} label="J'accepte les conditions d'utilisation." hasError={Boolean(errors.terms)} />
            {errors.terms && <p className="-mt-1 text-[13px] font-medium text-red-500">{errors.terms}</p>}
            <button type="submit" disabled={loading} className="mt-1 flex h-9 w-full items-center justify-center gap-2 rounded-lg text-[14px] font-semibold text-white transition-all hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60" style={{ background: colors.primary }}>{loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <>Créer mon compte<ArrowRight className="h-3.5 w-3.5" /></>}</button>
          </form>
          <div className="mt-3 text-center text-[14px] font-medium" style={{ color: colors.muted }}>Déjà inscrit ? <Link to="/login" className="font-semibold hover:underline" style={{ color: colors.primary }}>Se connecter</Link></div>
        </div>
      </div>
      <SuccessModal isOpen={showSuccess} onClose={handleSuccessClose} title="Succès" message="Votre compte a été créé avec succès !" buttonText="Aller à la connexion" autoCloseDelay={2000} />
      <ErrorModal isOpen={!!errorMsg} onClose={handleErrorClose} title="Erreur" message={errorMsg || ''} buttonText="OK" autoCloseDelay={4000} />
    </div>
  );
};

export default Register;