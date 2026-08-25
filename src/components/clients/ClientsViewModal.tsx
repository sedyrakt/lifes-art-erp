import React,{useEffect,useState}from'react';
import{X,Edit,User}from'lucide-react';
import{useTheme}from'../../contexts/ThemeContext';
import{formatMoney}from'../../lib/formatMoney';

const COLORS={
 light:{card:'#FFF',surface:'#FFF',surfaceSoft:'#F8FAFC',border:'#E2E8F0',text:'#0F172A',muted:'#64748B',subMuted:'#94A3B8',primary:'#6366F1',primaryHover:'#4F46E5',primarySoft:'rgba(99,102,241,.08)',primaryBorder:'rgba(99,102,241,.18)'},
 dark:{card:'#0F172A',surface:'#0F172A',surfaceSoft:'#111C30',border:'#334155',text:'#F8FAFC',muted:'#94A3B8',subMuted:'#64748B',primary:'#818CF8',primaryHover:'#6366F1',primarySoft:'rgba(99,102,241,.12)',primaryBorder:'rgba(99,102,241,.25)'}
};

interface Client{
 id:number;nom:string;email:string;telephone:string;adresse:string;ville:string;
 code_postal:string;pays:string;image:string;type:'Particulier'|'Entreprise';
 created_at:string;nb_commandes?:number;total_achats?:number;
}
interface ClientsViewModalProps{
 client:Client;imageUrl:string|null;onClose:()=>void;onEdit:()=>void;
 getTypeColor:(type:string)=>string;getTypeIcon:(type:string)=>React.ReactNode;
 handleImageError:(id:number)=>void;isDark?:boolean;
}

const FormCell:React.FC<{label:string;children:React.ReactNode;borderRight?:boolean;borderBottom?:boolean;fullWidth?:boolean}>=({label,children,borderRight=true,borderBottom=true,fullWidth=false})=>{
 const{isDark}=useTheme(),theme=isDark?COLORS.dark:COLORS.light;
 const border=isDark?'border-white/[.06]':'border-slate-200';
 return <div className={`min-w-0 px-3 py-2.5 ${borderRight?`border-r ${border}`:''} ${borderBottom?`border-b ${border}`:''} ${fullWidth?'col-span-3':''}`} style={{background:theme.card}}>
  <div className="mb-0.5 truncate text-[12px] font-semibold uppercase tracking-[.045em]" style={{color:theme.muted}}>{label||' '}</div>
  <div className="min-w-0 text-[14px] font-medium leading-4" style={{color:theme.text}}>{children}</div>
 </div>;
};

const InfoRow:React.FC<{label:string;value:React.ReactNode}>=({label,value})=>{
 const{isDark}=useTheme(),theme=isDark?COLORS.dark:COLORS.light;
 return <div className="flex items-start justify-between gap-4">
  <span className="truncate text-[12px] font-medium" style={{color:theme.muted}}>{label}</span>
  <span className="min-w-0 text-right text-[13px] font-semibold" style={{color:theme.text}}>{value}</span>
 </div>;
};

const EmptyValue:React.FC<{theme:any}>=({theme})=><span style={{color:theme.muted}}>Non spécifié</span>;

const ClientsViewModal:React.FC<ClientsViewModalProps>=({
 client,imageUrl,onClose,onEdit,getTypeColor,handleImageError,isDark:isDarkProp
})=>{
 const{isDark:contextDark}=useTheme(),isDark=isDarkProp!==undefined?isDarkProp:contextDark;
 const theme=isDark?COLORS.dark:COLORS.light,border=isDark?'border-white/[.06]':'border-slate-200';
 const[visible,setVisible]=useState(false);

 useEffect(()=>{const t=window.setTimeout(()=>setVisible(true),10);return()=>window.clearTimeout(t)},[]);
 useEffect(()=>{
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();onClose()}};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 },[onClose]);

 const initials=(client.nom||'?').trim().split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?';
 const date=client.created_at?new Date(client.created_at):null;
 const formattedDate=date&&!Number.isNaN(date.getTime())?date.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'}):null;
 const commandes=typeof client.nb_commandes==='number'?client.nb_commandes:null;
 const total=typeof client.total_achats==='number'?client.total_achats:0;

 return <div className={`fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-5 transition-all duration-200 ${visible?'opacity-100':'opacity-0'}`}
  style={{background:isDark?'rgba(0,0,0,.75)':'rgba(15,23,42,.55)',backdropFilter:'blur(5px)'}}
  role="dialog" aria-modal="true" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
  <div className={`relative flex w-full max-w-4xl max-h-[85vh] flex-col overflow-hidden rounded-2xl border ${border} shadow-[0_24px_70px_rgba(0,0,0,.22)] transition-all ${visible?'translate-y-0 scale-100':'translate-y-2 scale-[.98]'}`}
   style={{background:theme.card}} onMouseDown={e=>e.stopPropagation()}>
   <div className="absolute inset-x-0 top-0 z-20 h-[3px]" style={{background:theme.primary}}/>

   <header className={`flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-5 ${border}`} style={{background:theme.surface}}>
    <div className="flex min-w-0 items-center gap-2.5">
     <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border" style={{borderColor:theme.primaryBorder,background:theme.primarySoft,color:theme.primary}}>
      <User className="h-4 w-4"/>
     </div>
     <div className="min-w-0">
      <div className="flex items-center gap-2">
       <h2 className="truncate text-[15px] font-semibold" style={{color:theme.text}}>Détails du client</h2>
       <span className="hidden rounded-md border px-2 py-0.5 font-mono text-[11px] sm:inline-flex" style={{color:theme.primary,background:theme.primarySoft,borderColor:theme.primaryBorder}}>CLI-{String(client.id).padStart(6,'0')}</span>
      </div>
      <p className="mt-0.5 truncate text-[13px]" style={{color:theme.muted}}>Informations détaillées du client</p>
     </div>
    </div>
    <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-rose-500/10 hover:text-rose-500" style={{color:theme.muted}}><X className="h-4 w-4"/></button>
   </header>

   <main className="flex-1 overflow-y-auto p-4 sm:p-5">
    <div className="flex flex-col gap-4 lg:flex-row">
     <aside className="w-full shrink-0 lg:w-[200px]">
      <div className="flex flex-col gap-3">
       <div className={`relative aspect-square overflow-hidden rounded-xl border ${border}`} style={{background:theme.surfaceSoft}}>
        {imageUrl?<img src={imageUrl} alt={client.nom} className="h-full w-full object-cover" onError={()=>handleImageError(client.id)}/>:<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white">{initials}</div></div>}
       </div>

       <div className={`overflow-hidden rounded-xl border ${border}`} style={{background:theme.card}}>
        <div className={`border-b px-3 py-2.5 ${border}`}><span className="text-[12px] font-semibold uppercase tracking-[.045em]" style={{color:theme.muted}}>Résumé</span></div>
        <div className="space-y-2 p-3">
         <InfoRow label="Type" value={client.type}/>
         <div className="h-px" style={{background:theme.border}}/>
         <InfoRow label="Total Achats" value={formatMoney(total)}/>
         <div className="h-px" style={{background:theme.border}}/>
         <InfoRow label="Commandes" value={commandes??'—'}/>
         <div className="h-px" style={{background:theme.border}}/>
         <InfoRow label="Identifiant" value={`#${client.id}`}/>
        </div>
       </div>
      </div>
     </aside>

     <div className="min-w-0 flex-1 space-y-4">
      <div className="overflow-hidden rounded-xl border" style={{background:theme.card,borderColor:theme.border}}>
       <div className={`border-b px-3 py-2.5 ${border}`}><span className="text-[13px] font-semibold uppercase tracking-[.045em]" style={{color:theme.muted}}>Informations générales</span></div>
       <div className={`grid grid-cols-1 border-l border-t sm:grid-cols-2 lg:grid-cols-3 ${border}`}>
        <FormCell label="Nom">{client.nom||<EmptyValue theme={theme}/>}</FormCell>
        <FormCell label="Email">{client.email||<EmptyValue theme={theme}/>}</FormCell>
        <FormCell label="Téléphone" borderRight={false}>{client.telephone||<EmptyValue theme={theme}/>}</FormCell>
        <FormCell label="Type"><span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase ${getTypeColor(client.type)}`}>{client.type}</span></FormCell>
        <FormCell label="Adresse">{client.adresse||<EmptyValue theme={theme}/>}</FormCell>
        <FormCell label="Ville / CP" borderRight={false}>{[client.ville,client.code_postal].filter(Boolean).join(', ')||<EmptyValue theme={theme}/>}</FormCell>
        <FormCell label="Pays">{client.pays||<EmptyValue theme={theme}/>}</FormCell>
        <FormCell label="Client depuis">{formattedDate||<EmptyValue theme={theme}/>}</FormCell>
        <FormCell label="" borderRight={false}><span className="invisible">.</span></FormCell>
       </div>
      </div>

      <div className="overflow-hidden rounded-xl border" style={{background:theme.card,borderColor:theme.border}}>
       <div className={`border-b px-3 py-2.5 ${border}`}><span className="text-[13px] font-semibold uppercase tracking-[.045em]" style={{color:theme.muted}}>Coordonnées</span></div>
       <div className={`grid grid-cols-1 border-l border-t sm:grid-cols-2 ${border}`}>
        <FormCell label="Adresse email" borderBottom={false}>{client.email?<a href={`mailto:${client.email}`} className="break-all hover:text-indigo-500" style={{color:theme.text}}>{client.email}</a>:<EmptyValue theme={theme}/>}</FormCell>
        <FormCell label="Téléphone" borderRight={false} borderBottom={false}>{client.telephone?<a href={`tel:${client.telephone}`} className="hover:text-indigo-500" style={{color:theme.text}}>{client.telephone}</a>:<EmptyValue theme={theme}/>}</FormCell>
       </div>
      </div>
     </div>
    </div>
   </main>

   <footer className={`flex shrink-0 items-center justify-end gap-2 border-t px-4 py-2.5 sm:px-5 ${border}`} style={{background:theme.surfaceSoft}}>
    <span className="hidden text-[11px] sm:block" style={{color:theme.subMuted}}>Échap pour fermer</span>
    <button type="button" onClick={onClose} className="h-8 rounded-lg border px-3 text-[13px] font-medium" style={{borderColor:theme.border,color:theme.text}}>Fermer</button>
    <button type="button" onClick={onEdit} className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-white" style={{background:theme.primary}}>
     <Edit className="h-3.5 w-3.5"/>Modifier
    </button>
   </footer>
  </div>
 </div>;
};

export default ClientsViewModal;