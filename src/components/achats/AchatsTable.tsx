// src/components/achats/AchatsTable.tsx
import React,{memo,useCallback,useEffect,useMemo,useState}from'react';
import{createPortal}from'react-dom';
import{CheckSquare,Eye,Edit,MoreVertical,Package,Plus,TextSelection,Trash2,Building2,Boxes}from'lucide-react';
import{useTheme}from'../../contexts/ThemeContext';
import{formatMoney}from'../../lib/formatMoney';

interface Achat{id:number;reference:string|null;fournisseur_id:number;fournisseur_nom?:string;date_achat:string;total_ht:number;total_ttc:number;designation?:string;nombre_produits?:number;statut?:string;observation?:string;created_at:string;updated_at?:string;}
interface AchatsTableProps{achats:Achat[];loading?:boolean;totalItems?:number;generating?:boolean;onView:(achat:Achat)=>void;onEdit:(achat:Achat)=>void;onDelete:(achat:Achat)=>void;onAdd:()=>void;onConfirmStatus?:(id:number,statut:string)=>void;onBulkConfirmStatus?:(ids:number[],statut:string)=>void;selectedIds?:Set<number>;onSelectAll?:(checked:boolean)=>void;onSelectOne?:(id:number,checked:boolean)=>void;onBulkDelete?:(ids:number[])=>void;}
interface MenuPosition{top?:number;bottom?:number;left?:number;right?:number;}
const MENU_WIDTH=220;const MENU_HEIGHT=160;const MENU_PADDING=12;

const SkeletonRow=memo(({isDark}:{isDark:boolean})=>{
  const c=isDark?'animate-pulse rounded-md bg-white/[0.07]':'animate-pulse rounded-md bg-slate-200';
  const border=isDark?'border-white/[0.09]':'border-slate-200';
  return(<tr className="h-[64px]"><td className={`border px-3 py-3 ${border}`}><div className={`${c} h-4 w-4`}/></td><td className={`border px-3 py-3 ${border}`}><div className={`${c} h-6 w-24`}/></td><td className={`border px-3 py-3 ${border}`}><div className={`${c} h-10 w-10 rounded-xl`}/></td><td className={`border px-3 py-3 ${border}`}><div className={`${c} h-4 w-32`}/></td><td className={`border px-3 py-3 ${border}`}><div className="space-y-2"><div className={`${c} h-4 w-32`}/><div className={`${c} h-3 w-24`}/></div></td><td className={`border px-3 py-3 ${border}`}><div className="flex items-center gap-2"><div className={`${c} h-8 w-8`}/><div className={`${c} h-4 w-20`}/></div></td><td className={`border px-3 py-3 ${border}`}><div className={`${c} h-5 w-24`}/></td><td className={`border px-3 py-3 ${border}`}><div className={`${c} h-5 w-24`}/></td><td className={`border px-3 py-3 ${border}`}><div className="flex justify-end gap-1"><div className={`${c} h-8 w-8`}/><div className={`${c} h-8 w-8`}/><div className={`${c} h-8 w-8`}/></div></td></tr>);
});
SkeletonRow.displayName='SkeletonRow';

const getStatutBadge=(statut?:string)=>{
  const s=(statut||'En attente').toLowerCase();
  if(s==='en attente'||s==='attente')return{bg:'bg-amber-50 dark:bg-amber-500/10',text:'text-amber-700 dark:text-amber-400',border:'border-amber-200 dark:border-amber-500/20',label:'En attente',dot:'bg-amber-500'};
  if(s==='validé'||s==='valide')return{bg:'bg-emerald-50 dark:bg-emerald-500/10',text:'text-emerald-700 dark:text-emerald-400',border:'border-emerald-200 dark:border-emerald-500/20',label:'Validé',dot:'bg-emerald-500'};
  if(s==='livré'||s==='livree'||s==='livre')return{bg:'bg-blue-50 dark:bg-blue-500/10',text:'text-blue-700 dark:text-blue-400',border:'border-blue-200 dark:border-blue-500/20',label:'Livré',dot:'bg-blue-500'};
  if(s==='annulé'||s==='annule')return{bg:'bg-rose-50 dark:bg-rose-500/10',text:'text-rose-700 dark:text-rose-400',border:'border-rose-200 dark:border-rose-500/20',label:'Annulé',dot:'bg-rose-500'};
  return{bg:'bg-slate-50 dark:bg-slate-500/10',text:'text-slate-700 dark:text-slate-400',border:'border-slate-200 dark:border-slate-500/20',label:statut||'En attente',dot:'bg-slate-500'};
};

const AchatsTable:React.FC<AchatsTableProps>=({achats,loading=false,totalItems,generating=false,onView,onEdit,onDelete,onAdd,onConfirmStatus,onBulkConfirmStatus,selectedIds=new Set<number>(),onSelectAll,onSelectOne,onBulkDelete})=>{
  const{isDark}=useTheme();
  const tableBackground=isDark?'bg-[#111c30]':'bg-white';
  const tableSecondaryBackground=isDark?'bg-[#0f192b]':'bg-slate-50/70';
  const borderColor=isDark?'border-white/[0.14]':'border-slate-200';
  const cellBorderColor=isDark?'border-white/[0.09]':'border-slate-200';
  const headerBorderColor=isDark?'border-white/[0.16]':'border-slate-300';
  const[openMenuId,setOpenMenuId]=useState<number|null>(null);
  const[menuPosition,setMenuPosition]=useState<MenuPosition>({});

  const statusStats=useMemo(()=>{let enAttente=0,valides=0,livres=0,annules=0,totalProduits=0;for(const achat of achats){totalProduits+=Number(achat.nombre_produits)||0;const s=(achat.statut||'En attente').toLowerCase();if(s==='en attente'||s==='attente')enAttente++;else if(s==='validé'||s==='valide')valides++;else if(s==='livré'||s==='livree'||s==='livre')livres++;else if(s==='annulé'||s==='annule')annules++;}return{enAttente,valides,livres,annules,totalProduits};},[achats]);

  const safeSelectedIds=selectedIds||new Set<number>();
  const allSelected=achats.length>0&&achats.every(achat=>safeSelectedIds.has(achat.id));
  const someSelected=safeSelectedIds.size>0&&!allSelected;

  useEffect(()=>{if(openMenuId===null)return;const handleEscape=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpenMenuId(null);};const handleResize=()=>setOpenMenuId(null);document.addEventListener('keydown',handleEscape);window.addEventListener('resize',handleResize);return()=>{document.removeEventListener('keydown',handleEscape);window.removeEventListener('resize',handleResize);};},[openMenuId]);

  const toggleMenu=useCallback((id:number,event:React.MouseEvent<HTMLButtonElement>)=>{event.stopPropagation();if(openMenuId===id){setOpenMenuId(null);return;}const rect=event.currentTarget.getBoundingClientRect();const viewportWidth=window.innerWidth;const viewportHeight=window.innerHeight;const position:MenuPosition={};const spaceBelow=viewportHeight-rect.bottom;const spaceAbove=rect.top;if(spaceBelow<MENU_HEIGHT+MENU_PADDING&&spaceAbove>MENU_HEIGHT+MENU_PADDING){position.bottom=viewportHeight-rect.top+4;}else{position.top=rect.bottom+4;}const spaceRight=viewportWidth-rect.right;if(spaceRight<MENU_WIDTH+MENU_PADDING&&rect.left>MENU_WIDTH+MENU_PADDING){position.right=viewportWidth-rect.right+4;}else{position.left=Math.max(MENU_PADDING,rect.right-MENU_WIDTH);}setMenuPosition(position);setOpenMenuId(id);},[openMenuId]);

  const handleMenuAction=useCallback((callback:()=>void,event:React.MouseEvent)=>{event.stopPropagation();setOpenMenuId(null);callback();},[]);
  const currentAchat=useMemo(()=>openMenuId===null?null:achats.find(achat=>achat.id===openMenuId)??null,[achats,openMenuId]);

  if(!loading&&achats.length===0){
    return(<div className={`flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-2xl border px-6 py-14 text-center shadow-sm ${tableBackground} ${borderColor} dark:shadow-[0_16px_45px_rgba(0,0,0,0.22)]`}>
      <div className="mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-400"><Package size={30} strokeWidth={1.7}/></div>
      <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-slate-900 dark:text-slate-100">Aucun achat trouvé</h3>
      <p className="mt-2 max-w-[390px] text-[14px] leading-6 text-slate-500 dark:text-slate-400">Aucun achat ne correspond aux critères actuels. Essayez de modifier vos filtres ou de réinitialiser la recherche.</p>
      <div className="mt-6 flex gap-3"><button type="button" onClick={onAdd} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(79,70,229,0.22)] transition-all duration-150 hover:bg-indigo-700 hover:shadow-[0_6px_18px_rgba(79,70,229,0.28)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 active:scale-[0.98]"><Plus size={17}/>Nouvel achat</button></div>
    </div>);
  }

  return(
    <div className={`relative overflow-hidden rounded-2xl border shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:shadow-[0_14px_45px_rgba(0,0,0,0.20)] ${tableBackground} ${borderColor}`}>
      {safeSelectedIds.size>0&&(
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5 ${isDark?'border-white/[0.08] bg-indigo-500/[0.065]':'border-indigo-100 bg-indigo-50/75'}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm"><CheckSquare size={15}/></div>
            <div className="flex flex-col"><span className="text-[14px] font-semibold text-indigo-700 dark:text-indigo-300">{safeSelectedIds.size} achat{safeSelectedIds.size>1?'s':''} sélectionné{safeSelectedIds.size>1?'s':''}</span><span className="mt-0.5 text-[12px] text-indigo-500/75 dark:text-indigo-400/70">Action groupée disponible</span></div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={()=>onBulkDelete?.(Array.from(safeSelectedIds))} className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-rose-700 hover:shadow-md active:scale-[0.98]"><Trash2 size={15}/>Supprimer</button>
            <button type="button" onClick={()=>onSelectAll?.(false)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"><TextSelection size={15}/>Désélectionner</button>
          </div>
        </div>
      )}

      <div className="custom-scrollbar overflow-x-auto overflow-y-auto scrollbar-gutter-stable">
        <table className={`w-full min-w-[1200px] table-fixed border border-collapse text-left ${borderColor}`}>
          <thead className={`sticky top-0 z-20 backdrop-blur-xl ${isDark?'bg-[#111c30]/97':'bg-slate-50/97'}`}>
            <tr className="text-[12px] font-semibold uppercase tracking-[0.055em] text-slate-500 dark:text-slate-400">
              <th scope="col" className={`w-[48px] border px-3 py-4 align-middle ${headerBorderColor}`}><input type="checkbox" checked={allSelected} ref={element=>{if(element)element.indeterminate=someSelected;}} onChange={event=>onSelectAll?.(event.target.checked)} className="h-[17px] w-[17px] cursor-pointer rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500/30 dark:border-slate-600" aria-label="Sélectionner tous les achats"/></th>
              <th scope="col" className={`w-[150px] border px-5 py-4 ${headerBorderColor}`}>Référence</th>
              <th scope="col" className={`w-[220px] border px-5 py-4 ${headerBorderColor}`}>Fournisseur</th>
              <th scope="col" className={`w-[145px] border px-5 py-4 ${headerBorderColor}`}>Date</th>
              <th scope="col" className={`w-[180px] border px-5 py-4 ${headerBorderColor}`}>Désignation</th>
              <th scope="col" className={`w-[90px] border px-5 py-4 ${headerBorderColor}`}>Produits</th>
              <th scope="col" className={`w-[160px] border px-5 py-4 ${headerBorderColor}`}>Statut</th>
              <th scope="col" className={`w-[140px] border px-5 py-4 ${headerBorderColor}`}>Total TTC</th>
              <th scope="col" className={`w-[105px] border px-4 py-4 text-right ${headerBorderColor}`}>Actions</th>
            </tr>
          </thead>
          <tbody className={tableBackground}>
            {loading?(Array.from({length:7}).map((_,index)=>(<SkeletonRow key={index} isDark={isDark}/>))):(achats.map(achat=>{
              const isSelected=safeSelectedIds.has(achat.id);
              const statutBadge=getStatutBadge(achat.statut);
              return(<tr key={achat.id} onClick={()=>{setOpenMenuId(null);onView(achat);}} className={`group h-[64px] cursor-pointer transition-all duration-150 ${isSelected?(isDark?'bg-indigo-500/[0.085]':'bg-indigo-50/80'):(isDark?'hover:bg-white/[0.025]':'hover:bg-slate-50/80')}`}>
                <td className={`border px-3 py-3 align-middle ${cellBorderColor}`} onClick={event=>event.stopPropagation()}><input type="checkbox" checked={isSelected} onChange={event=>onSelectOne?.(achat.id,event.target.checked)} className="h-[17px] w-[17px] cursor-pointer rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500/30 dark:border-slate-600" aria-label={`Sélectionner ${achat.reference||achat.id}`}/></td>
                <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}><span className="inline-flex items-center rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 font-mono text-[14px] font-semibold text-indigo-600 dark:border-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-400">{achat.reference||'—'}</span></td>
                <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}><div className="flex min-w-0 items-center gap-2.5"><div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800"><Building2 size={16} className="text-indigo-500 dark:text-indigo-400"/></div><div className="min-w-0"><div className="max-w-[165px] truncate text-[15px] font-semibold leading-5 text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400" title={achat.fournisseur_nom||'Fournisseur inconnu'}>{achat.fournisseur_nom||'Fournisseur inconnu'}</div><div className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">ID #{String(achat.id).padStart(3,'0')}</div></div></div></td>
                <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}>{achat.date_achat?(<div className="flex flex-col"><span className="text-[14px] font-medium text-slate-700 dark:text-slate-300">{new Date(achat.date_achat).toLocaleDateString('fr-FR')}</span><span className="mt-0.5 text-[12px] font-medium text-slate-400 dark:text-slate-500">{new Date(achat.date_achat).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</span></div>):(<span className="text-[14px] text-slate-400 dark:text-slate-500">—</span>)}</td>
                <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}><div className="min-w-0"><div className="max-w-[160px] truncate text-[14px] font-medium text-slate-700 dark:text-slate-300" title={achat.designation||'—'}>{achat.designation||'—'}</div></div></td>
                <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}><span className="inline-flex min-w-[40px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[14px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300"><Package size={13} strokeWidth={1.8}/><span>{achat.nombre_produits||0}</span></span></td>
                <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}><span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-[13px] font-semibold ${statutBadge.bg} ${statutBadge.text} ${statutBadge.border}`}><span className={`h-1.5 w-1.5 rounded-full ${statutBadge.dot}`}/>{statutBadge.label}</span></td>
                <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}><span className="whitespace-nowrap text-[15px] font-bold text-slate-900 dark:text-slate-100">{formatMoney(Number(achat.total_ttc)||0)}</span></td>
                <td className={`border px-4 py-3 align-middle text-right ${cellBorderColor}`} onClick={event=>event.stopPropagation()}><div className="flex items-center justify-end gap-1">
                  <button type="button" onClick={()=>onView(achat)} title="Voir les détails" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-all duration-150 hover:bg-indigo-50 hover:text-indigo-600 focus:opacity-100 focus:outline-none group-hover:opacity-100 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"><Eye size={16} strokeWidth={1.8}/></button>
                  <button type="button" onClick={()=>onEdit(achat)} title="Modifier" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-all duration-150 hover:bg-amber-50 hover:text-amber-600 focus:opacity-100 focus:outline-none group-hover:opacity-100 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"><Edit size={16} strokeWidth={1.8}/></button>
                  <button type="button" onClick={event=>toggleMenu(achat.id,event)} title="Actions" aria-label={`Actions pour ${achat.reference||achat.id}`} aria-expanded={openMenuId===achat.id} className={`flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 ${openMenuId===achat.id?'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100':'text-slate-400 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-700 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}><MoreVertical size={17}/></button>
                </div></td>
              </tr>);
            }))}
          </tbody>
        </table>
      </div>

      {openMenuId!==null&&currentAchat&&createPortal(
        <div className={`fixed z-[99999] w-[220px] overflow-hidden rounded-xl border py-1.5 shadow-[0_18px_55px_rgba(15,23,42,0.18)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100 ${isDark?'border-white/[0.10] bg-[#111c30]/98':'border-slate-200 bg-white/98'}`} style={{top:menuPosition.top!==undefined?`${menuPosition.top}px`:undefined,bottom:menuPosition.bottom!==undefined?`${menuPosition.bottom}px`:undefined,left:menuPosition.left!==undefined?`${menuPosition.left}px`:undefined,right:menuPosition.right!==undefined?`${menuPosition.right}px`:undefined}} onMouseDown={event=>event.stopPropagation()} onClick={event=>event.stopPropagation()}>
          <div className={`border-b px-4 py-3 ${isDark?'border-white/[0.08]':'border-slate-100'}`}><div className="flex items-center gap-2"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><Package size={14}/></div><div className="min-w-0"><div className="max-w-[165px] truncate text-[14px] font-semibold text-slate-900 dark:text-slate-100">{currentAchat.reference||'—'}</div><div className="mt-0.5 font-mono text-[10px] text-slate-400 dark:text-slate-500">ID #{currentAchat.id}</div></div></div></div>
          <div className="flex flex-col text-[14px]">
            <button type="button" onMouseDown={event=>handleMenuAction(()=>onView(currentAchat),event)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-200 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><Eye size={15}/></span><span>Voir les détails</span></button>
            <button type="button" onMouseDown={event=>handleMenuAction(()=>onEdit(currentAchat),event)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-slate-700 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:text-slate-200 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"><Edit size={15}/></span><span>Modifier</span></button>
            <div className={`mx-3 my-1 border-t ${isDark?'border-white/[0.07]':'border-slate-100'}`}/>
            <button type="button" onMouseDown={event=>handleMenuAction(()=>onDelete(currentAchat),event)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-semibold text-rose-500 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400"><Trash2 size={15}/></span><span>Supprimer</span></button>
          </div>
        </div>,document.body)}

      <div className={`flex flex-wrap items-center justify-between gap-4 border-t px-5 py-3.5 ${tableSecondaryBackground} ${borderColor}`}>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-2"><Package size={14} className="text-indigo-500 dark:text-indigo-400"/><span><span className="font-semibold text-slate-900 dark:text-slate-100">{totalItems??achats.length}</span> achat{(totalItems??achats.length)>1?'s':''}</span></span>
          <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700"/>
          <span className="flex items-center gap-2"><Boxes size={13} className="text-slate-400 dark:text-slate-500"/><span><span className="font-semibold text-slate-900 dark:text-slate-100">{statusStats.totalProduits}</span> produit{statusStats.totalProduits>1?'s':''}</span></span>
          <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700"/>
          {statusStats.enAttente>0&&<span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500"/><span><span className="font-semibold text-slate-900 dark:text-slate-100">{statusStats.enAttente}</span> En attente</span></span>}
          {statusStats.valides>0&&<span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500"/><span><span className="font-semibold text-slate-900 dark:text-slate-100">{statusStats.valides}</span> Validé{statusStats.valides>1?'s':''}</span></span>}
          {statusStats.livres>0&&<span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500"/><span><span className="font-semibold text-slate-900 dark:text-slate-100">{statusStats.livres}</span> Livré{statusStats.livres>1?'s':''}</span></span>}
          {statusStats.annules>0&&<span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-500"/><span><span className="font-semibold text-slate-900 dark:text-slate-100">{statusStats.annules}</span> Annulé{statusStats.annules>1?'s':''}</span></span>}
        </div>
        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-400 dark:text-slate-500"><Building2 size={14}/><span>Gestion des achats</span></div>
      </div>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:7px;height:7px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(100,116,139,.26);border-radius:999px}.custom-scrollbar::-webkit-scrollbar-thumb:hover{background:rgba(100,116,139,.46)}.custom-scrollbar{scrollbar-width:thin;scrollbar-color:rgba(100,116,139,.28) transparent}.dark .custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(148,163,184,.20)}.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover{background:rgba(148,163,184,.32)}.scrollbar-gutter-stable{scrollbar-gutter:stable}@keyframes rowIn{from{opacity:0;transform:translateY(2px)}to{opacity:1;transform:translateY(0)}}.group{animation:rowIn .18s ease-out}`}</style>
    </div>
  );
};

export default memo(AchatsTable);