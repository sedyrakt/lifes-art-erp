// ============================================================
// src/components/employes/EmployesFormFields.tsx
// ⭐ FIX: ESRINA NY ICON REHETRA AFA-TSY NY BOUTON
// ⭐ TSY NOVAINA NY COULEUR BORDER (border-slate-700 / border-gray-300)
// ============================================================
import React from 'react';
import { Mail, Phone, BriefcaseBusiness, Building2, CalendarDays, DollarSign, UserRound, Activity } from 'lucide-react';

interface EmployesFormFieldsProps { editingEmploye: any | null; isDark: boolean; }
interface FormCellProps { label: string; children: React.ReactNode; icon?: React.ReactNode; required?: boolean; fullWidth?: boolean; isDark?: boolean; }

// ⭐ FormCell - ESRINA NY ICON
const FormCell: React.FC<FormCellProps> = ({ label, children, icon, required = false, fullWidth = false, isDark = false }) => {
  const labelColor = isDark ? '#94A3B8' : '#64748B';
  const iconColor = isDark ? '#64748B' : '#94A3B8';
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <label className="flex items-center gap-1.5">
        {/* ⭐ FIX: ESRINA NY ICON */}
        <span className="text-[14px] font-semibold" style={{ color: labelColor }}>
          {label}{required && <span className="ml-1" style={{ color: '#EF4444' }}>*</span>}
        </span>
      </label>
      {children}
    </div>
  );
};

const EmployesFormFields: React.FC<EmployesFormFieldsProps> = ({ editingEmploye, isDark }) => {
  // ⭐ Boridy 14.5px / Bordure gray-300 sy slate-700
  const theme = isDark 
    ? { inputBg: '#0F172A', inputBorder: '#334155', text: '#F8FAFC', placeholder: '#64748B', primary: '#818CF8', ring: 'rgba(129,140,248,0.15)' } 
    : { inputBg: '#FFFFFF', inputBorder: '#D1D5DB', text: '#0F172A', placeholder: '#94A3B8', primary: '#6366F1', ring: 'rgba(99,102,241,0.12)' };
  
  const inputClass = 'w-full h-10 rounded-lg border px-3 text-[14.5px] font-medium outline-none transition-all duration-150';
  const inputStyle = { background: theme.inputBg, borderColor: theme.inputBorder, color: theme.text };

  return (<div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
    <FormCell label="Prénom" required isDark={isDark}>
      <input type="text" name="prenom" defaultValue={editingEmploye?.prenom || ''} required autoComplete="given-name" placeholder="Prénom" className={`${inputClass} focus:border-indigo-500 focus:ring-2`} style={{ ...inputStyle, '--tw-ring-color': theme.ring } as React.CSSProperties} />
    </FormCell>
    <FormCell label="Nom" required isDark={isDark}>
      <input type="text" name="nom" defaultValue={editingEmploye?.nom || ''} required autoComplete="family-name" placeholder="Nom" className={`${inputClass} focus:border-indigo-500 focus:ring-2`} style={inputStyle} />
    </FormCell>
    <FormCell label="Email" required isDark={isDark}>
      <input type="email" name="email" defaultValue={editingEmploye?.email || ''} required autoComplete="email" placeholder="email@entreprise.com" className={`${inputClass} focus:border-indigo-500 focus:ring-2`} style={inputStyle} />
    </FormCell>
    <FormCell label="Téléphone" isDark={isDark}>
      <input type="tel" name="telephone" defaultValue={editingEmploye?.telephone || ''} autoComplete="tel" placeholder="+261 32 123 4567" className={`${inputClass} focus:border-indigo-500 focus:ring-2`} style={inputStyle} />
    </FormCell>
    <FormCell label="Poste" required isDark={isDark}>
      <input type="text" name="poste" defaultValue={editingEmploye?.poste || ''} required placeholder="Ex : Responsable commercial" className={`${inputClass} focus:border-indigo-500 focus:ring-2`} style={inputStyle} />
    </FormCell>
    <FormCell label="Département" isDark={isDark}>
      <input type="text" name="departement" defaultValue={editingEmploye?.departement || ''} placeholder="vente" className={`${inputClass} focus:border-indigo-500 focus:ring-2`} style={inputStyle} />
    </FormCell>
    <FormCell label="Date d'embauche" isDark={isDark}>
      <input type="date" name="date_embauche" defaultValue={editingEmploye?.date_embauche || new Date().toISOString().split('T')[0]} className={`${inputClass} focus:border-indigo-500 focus:ring-2`} style={inputStyle} />
    </FormCell>
    <FormCell label="Salaire" required isDark={isDark}>
      <div className="relative">
        <input type="number" name="salaire" defaultValue={editingEmploye?.salaire || 0} required min="0" step="any" placeholder="700000" className={`${inputClass} pr-12 font-semibold focus:border-indigo-500 focus:ring-2`} style={inputStyle} />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[14px] font-semibold" style={{ color: theme.placeholder }}>Ar</span>
      </div>
    </FormCell>
    <FormCell label="Statut" fullWidth isDark={isDark}>
      <div className="relative">
        <select name="status" defaultValue={editingEmploye?.status || 'Actif'} className={`${inputClass} cursor-pointer appearance-none pr-9 focus:border-indigo-500 focus:ring-2`} style={inputStyle}>
          <option value="Actif">Actif</option>
          <option value="En congé">En congé</option>
          <option value="Inactif">Inactif</option>
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px]" style={{ color: theme.placeholder }}>▾</span>
      </div>
    </FormCell>
  </div>);
};
export default EmployesFormFields;