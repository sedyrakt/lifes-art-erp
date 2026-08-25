// ============================================================
// src/components/company/CompanySettingsModal/CompanySettingsActions.tsx
// ============================================================

import React from'react';
import{Save,FileDown,Loader2}from'lucide-react';

interface CompanySettingsActionsProps{
 isGenerateMode:boolean;
 loading:boolean;
 savingImage:boolean;
 isDark:boolean;
 onClose:()=>void;
 onSave:()=>void;
 onGenerate:()=>void;
}

const CompanySettingsActions:React.FC<CompanySettingsActionsProps>=({
 isGenerateMode,loading,savingImage,isDark,onClose,onSave,onGenerate
})=>{
 const busy=loading||savingImage;

 return(
  <div className="flex shrink-0 items-center justify-end gap-2.5 border-t px-5 py-3.5" style={{background:isDark?'#0F172A':'#FFF',borderColor:isDark?'#334155':'#E2E8F0'}}>
   <button type="button" onClick={onClose} disabled={busy} className="inline-flex h-9 items-center justify-center rounded-lg border px-3.5 text-[14px] font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50" style={{borderColor:isDark?'#334155':'#E2E8F0',color:isDark?'#CBD5E1':'#5F6368',background:isDark?'#0F172A':'#FFF'}}>
    Annuler
   </button>

   {isGenerateMode?(
    <button type="button" onClick={onGenerate} disabled={busy} className="inline-flex h-9 min-w-[105px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-[14px] font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50">
     {busy?<><Loader2 className="h-4 w-4 animate-spin"/><span>{savingImage?'Sauvegarde...':'Génération...'}</span></>:<><FileDown className="h-4 w-4"/><span>Générer</span></>}
    </button>
   ):(
    <button type="button" onClick={onSave} disabled={busy} className="inline-flex h-9 min-w-[115px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-[14px] font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50">
     {busy?<><Loader2 className="h-4 w-4 animate-spin"/><span>{savingImage?'Sauvegarde...':'Enregistrement...'}</span></>:<><Save className="h-4 w-4"/><span>Enregistrer</span></>}
    </button>
   )}
  </div>
 );
};

export default CompanySettingsActions;