// ============================================================
// src/components/profile/ProfileForm.tsx - SYNCED FONTS
// ⭐ FIX: Font Size mifanaraka amin'ny Sidebar (14px/15px/13px)
// ============================================================

import React from 'react'; 
import { AlertCircle, User, Mail, Phone, Building, UserCircle } from 'lucide-react';

interface FormData { firstName: string; lastName: string; email: string; phone: string; companyName: string; }
interface ProfileFormProps { formData: FormData; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; errors: Record<string, string>; isEditing: boolean; onSubmit: (e: React.FormEvent) => void; }

const ProfileForm: React.FC<ProfileFormProps> = ({ formData, onChange, onBlur, errors, isEditing, onSubmit }) => {
  const fields = [
    { name: 'firstName', label: 'Prénom', icon: User, placeholder: 'Votre prénom', required: true, colSpan: 1, autoComplete: 'given-name', type: 'text' },
    { name: 'lastName', label: 'Nom', icon: User, placeholder: 'Votre nom', required: true, colSpan: 1, autoComplete: 'family-name', type: 'text' },
    { name: 'email', label: 'Adresse email', icon: Mail, placeholder: 'email@entreprise.com', required: true, colSpan: 2, autoComplete: 'email', type: 'email' },
    { name: 'phone', label: 'Téléphone', icon: Phone, placeholder: '+261 32 123 4567', required: false, colSpan: 1, autoComplete: 'tel', type: 'tel' },
    { name: 'companyName', label: 'Entreprise', icon: Building, placeholder: "Nom de l'entreprise", required: true, colSpan: 1, autoComplete: 'organization', type: 'text' },
  ];
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 dark:border-slate-800 dark:bg-[#0F172A] dark:shadow-none">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3.5 bg-white dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20"><UserCircle size={18} strokeWidth={2} /></div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">Informations personnelles</h2>
          <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">Gérez vos informations de profil</p>
        </div>
        {isEditing && <span className="shrink-0 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-[13px] font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">Modification</span>}
      </div>
      <form onSubmit={onSubmit} className="p-5">
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
          {fields.map(field => { 
            const Icon = field.icon, error = errors[field.name], value = formData[field.name as keyof FormData] || '', isDisabled = !isEditing; 
            return (
              <div key={field.name} className={field.colSpan === 2 ? 'md:col-span-2' : ''}>
                <label htmlFor={`profile-${field.name}`} className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-slate-600 dark:text-slate-300">
                  <Icon size={14} strokeWidth={1.8} className="text-slate-400 dark:text-slate-500" />
                  <span>{field.label}</span>
                  {field.required && <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon size={16} strokeWidth={1.8} className={`transition-colors duration-150 ${error ? 'text-rose-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  </div>
                  <input 
                    id={`profile-${field.name}`} 
                    type={field.type} 
                    name={field.name} 
                    value={value} 
                    onChange={onChange} 
                    onBlur={onBlur} 
                    disabled={isDisabled} 
                    autoComplete={field.autoComplete} 
                    placeholder={field.placeholder} 
                    required={field.required} 
                    aria-invalid={Boolean(error)} 
                    aria-describedby={error ? `profile-${field.name}-error` : undefined} 
                    className={`h-10 w-full rounded-lg border bg-white pl-10 pr-3 text-[14px] font-medium text-slate-900 outline-none transition-all duration-150 placeholder:text-slate-400 border-slate-300 hover:border-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 disabled:hover:border-slate-300 dark:bg-[#1E293B] dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/10 dark:disabled:bg-slate-800/60 dark:disabled:text-slate-400 dark:disabled:hover:border-slate-700 ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-500/60 dark:focus:border-rose-400 dark:focus:ring-rose-400/10' : ''}`} 
                  />
                </div>
                {error && (
                  <div id={`profile-${field.name}-error`} className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-rose-500 dark:text-rose-400">
                    <AlertCircle size={12} strokeWidth={2} />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            ); 
          })}
        </div>
      </form>
    </section>
  );
};
export default ProfileForm;