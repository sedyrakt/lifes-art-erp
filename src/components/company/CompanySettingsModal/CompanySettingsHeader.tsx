// ============================================================
// src/components/company/CompanySettingsModal/CompanySettingsHeader.tsx
// ============================================================

import React from'react';
import{X,Building2,FilePlus2}from'lucide-react';

interface CompanySettingsHeaderProps{
 isGenerateMode:boolean;
 isDark:boolean;
 onClose:()=>void;
}

const CompanySettingsHeader:React.FC<CompanySettingsHeaderProps>=({isGenerateMode,isDark,onClose})=>{
 const title=isGenerateMode?'Générer la facture':"Informations de l'entreprise";
 const description=isGenerateMode?'Renseignez les informations nécessaires pour la facture':'Configurez les informations utilisées sur vos factures';

 return(
  <header className="relative flex shrink-0 items-center justify-between border-b px-5 py-3.5 sm:px-6" style={{background:isDark?'#0F172A':'#FFF',borderColor:isDark?'#334155':'#E2E8F0'}}>
   <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-500"/>
   <div className="flex min-w-0 items-center gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border" style={{borderColor:isDark?'#334155':'#E2E8F0',background:isDark?'#0F172A':'#F8FAFC'}}>
     <img src="/logo.png" alt="Logo" className="h-7 w-auto max-w-[30px] object-contain"/>
    </div>
    <div className="min-w-0">
     <div className="flex items-center gap-2">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500">
       {isGenerateMode?<FilePlus2 size={14}/>:<Building2 size={14}/>}
      </div>
      <h2 id="company-settings-modal-title" className="truncate text-[16px] font-semibold tracking-tight" style={{color:isDark?'#F8FAFC':'#202124'}}>{title}</h2>
     </div>
     <p className="mt-1 truncate text-[13px] font-medium" style={{color:isDark?'#CBD5E1':'#5F6368'}}>{description}</p>
    </div>
   </div>
   <button type="button" onClick={onClose} aria-label="Fermer" title="Fermer" className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all hover:bg-slate-100 dark:hover:bg-slate-800" style={{color:isDark?'#CBD5E1':'#5F6368'}}>
    <X size={18}/>
   </button>
  </header>
 );
};

export default CompanySettingsHeader;