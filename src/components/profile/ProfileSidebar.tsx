// ============================================================
// src/components/profile/ProfileSidebar.tsx - SYNCED FONTS
// ⭐ FIX: Font Size mifanaraka amin'ny Sidebar (15px/14px/13px)
// ⭐ FIX: Nesoriko ny bouton 2FA sy ny props mifandraika
// ============================================================

import React from 'react';
import { User, Shield, Calendar, Building, KeyRound, LogOut, CheckCircle2, XCircle } from 'lucide-react';

interface ProfileSidebarProps {
  role: string;
  memberSince: string;
  companyName: string;
  twoFAEnabled: boolean;
  onPasswordChange: () => void;
  onLogout: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  role, memberSince, companyName, twoFAEnabled, onPasswordChange, onLogout,
}) => {
  const infoCards = [
    { icon: User, label: 'Rôle professionnel', value: role || 'Utilisateur' },
    { icon: Calendar, label: 'Membre depuis', value: memberSince || '—' },
    { icon: Building, label: 'Entreprise rattachée', value: companyName || "Life's Art ERP" },
  ];

  return (
    <aside className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-[#0F172A] dark:hover:shadow-none">
      <div className="h-[2px] w-full bg-indigo-500" />
      <div className="p-5">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><Shield size={18} strokeWidth={2} /></div>
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold text-slate-900 dark:text-slate-100">Informations & sécurité</h3>
            <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">Gestion de votre compte</p>
          </div>
        </div>
        <div className="mt-4 space-y-2.5">
          {infoCards.map(item => { 
            const Icon = item.icon; 
            return (
              <div key={item.label} className="group flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 transition-all duration-150 hover:border-indigo-200 hover:bg-indigo-50/30 dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-indigo-500/10 dark:group-hover:text-indigo-400"><Icon size={16} strokeWidth={2} /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{item.label}</p>
                  <p className="mt-0.5 truncate text-[14px] font-semibold text-slate-800 dark:text-slate-200" title={item.value}>{item.value}</p>
                </div>
              </div>
            ); 
          })}
        </div>
        <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
          <div className="mb-2.5 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-200">Authentification 2FA</p>
              <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">Sécurité supplémentaire</p>
            </div>
            <div className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] font-semibold ${twoFAEnabled ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
              {twoFAEnabled ? <><CheckCircle2 size={11} />Activée</> : <><XCircle size={11} />Désactivée</>}
            </div>
          </div>
          {/* ⭐ Nesoriko ny bouton 2FA eto */}
        </div>
        <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
          <button type="button" onClick={onPasswordChange} className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[14px] font-medium text-slate-700 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400">
            <KeyRound size={15} />Changer le mot de passe
          </button>
        </div>
        <div className="mt-3">
          <button type="button" onClick={onLogout} className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md dark:bg-red-500 dark:hover:bg-red-600">
            <LogOut size={15} />Déconnexion sécurisée
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ProfileSidebar;