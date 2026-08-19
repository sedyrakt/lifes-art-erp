// ============================================================
// src/components/profile/ProfileHeader.tsx - SYNCED FONTS
// ⭐ FIX: Font Size mifanaraka amin'ny Sidebar (22px/14px)
// ============================================================

import React from 'react'; 
import { User, Edit, Save, XCircle, Loader2, ShieldCheck } from 'lucide-react';

interface ProfileHeaderProps { role: string; isEditing: boolean; saving: boolean; onEdit: () => void; onCancel: () => void; onSave: () => void; }

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ role, isEditing, saving, onEdit, onCancel, onSave }) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition-colors dark:bg-indigo-500">
            <User size={21} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {/* ⭐ TITRE PRINCIPAL: 22px mifanaraka amin'ny Page Rapports */}
              <h1 className="text-[22px] font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100">Mon profil</h1>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[13px] font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
                <ShieldCheck size={12} strokeWidth={2} />{role}
              </span>
            </div>
            {/* ⭐ SUBTITRE: 14px mifanaraka amin'ny label sidebar */}
            <p className="mt-1 truncate text-[14px] font-medium text-slate-500 dark:text-slate-400">Gérez vos informations personnelles</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!isEditing ? 
            <button type="button" onClick={onEdit} className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-[14px] font-semibold text-white transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-[0.98] dark:bg-indigo-500 dark:hover:bg-indigo-600">
              <Edit size={16} strokeWidth={2} />Modifier
            </button> 
          : 
            <>
              <button type="button" onClick={onCancel} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[14px] font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">
                <XCircle size={16} strokeWidth={2} />Annuler
              </button>
              <button type="button" onClick={onSave} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-[14px] font-semibold text-white transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} strokeWidth={2} />}
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </>
          }
        </div>
      </div>
      {isEditing && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50/70 px-3 py-2 text-[14px] font-medium text-indigo-700 dark:border-indigo-500/10 dark:bg-indigo-500/5 dark:text-indigo-300">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />Mode modification activé
        </div>
      )}
    </div>
  );
};
export default ProfileHeader;