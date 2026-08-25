// ============================================================
// src/components/mouvements/MouvementsTable.tsx
// ⭐ PREMIUM / COMPACT / PRODUCTION READY
// ============================================================
import React,{useCallback,useEffect,useMemo,useState}from'react';
import{createPortal}from'react-dom';
import{Activity,ArrowDown,ArrowUp,CheckSquare,ChevronRight,Eye,ImageOff,MoreVertical,Package,TextSelection,Trash2}from'lucide-react';
import{useTheme}from'../../contexts/ThemeContext';
import{formatMoney}from'../../lib/formatMoney';
import ConfirmModal from'../common/ConfirmModal';

interface Mouvement{
  id:number;
  produit_nom:string;
  produit_code:string;
  type_mouvement:string;
  quantite:number;
  ancien_stock:number;
  nouveau_stock:number;
  date_mouvement:string;
  reference:string;
  prix_achat?:number;
  prix_unitaire?:number;
  produit_image?:string;
}

interface MouvementsTableProps{
  mouvements:Mouvement[];
  getTypeColor:(type:string)=>string;
  getTypeIcon:(type:string)=>React.ReactNode;
  getTypeLabel:(type:string)=>string;
  selectedIds?:Set<number>;
  onSelectAll?:(checked:boolean)=>void;
  onSelectOne?:(id:number,checked:boolean)=>void;
  onBulkDelete?:(ids:number[])=>void;
  onView?:(mouvement:Mouvement)=>void;
  imageUrls?:Record<number,string|null>;
  loadImageForMouvement?:(mouvement:Mouvement)=>void;
}

interface MenuPosition{top?:number;bottom?:number;left?:number;right?:number}

const normalizeType=(type?:string)=>(type||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim();
const formatDate=(date?:string)=>{
  if(!date)return'-';
  const d=new Date(date);
  return Number.isNaN(d.getTime())?'-':d.toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'});
};
const formatTime=(date?:string)=>{
  if(!date)return'';
  const d=new Date(date);
  return Number.isNaN(d.getTime())?'':d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
};
const formatNumber=(value:number)=>Number(value||0).toLocaleString('fr-FR');

const MouvementsTable:React.FC<MouvementsTableProps>=({
  mouvements,getTypeColor,getTypeIcon,getTypeLabel,selectedIds=new Set<number>(),
  onSelectAll,onSelectOne,onBulkDelete,onView,imageUrls={},loadImageForMouvement
})=>{
  const{isDark}=useTheme();
  const bg=isDark?'bg-[#111c30]':'bg-white';
  const secondaryBg=isDark?'bg-[#0f192b]':'bg-slate-50/70';
  const border=isDark?'border-white/[0.14]':'border-slate-200';
  const cellBorder=isDark?'border-white/[0.09]':'border-slate-200';
  const headerBorder=isDark?'border-white/[0.16]':'border-slate-300';

  const[openMenuId,setOpenMenuId]=useState<number|null>(null);
  const[menuPosition,setMenuPosition]=useState<MenuPosition>({});
  const[showDeleteModal,setShowDeleteModal]=useState(false);
  const[deleteTargetId,setDeleteTargetId]=useState<number|null>(null);

  const safeMouvements=mouvements||[];
  const safeSelectedIds=selectedIds||new Set<number>();

  const stats=useMemo(()=>{
    let entrees=0,sorties=0,ajustements=0;
    safeMouvements.forEach(m=>{
      const type=normalizeType(m.type_mouvement);
      if(type.includes('ENTREE'))entrees++;
      else if(type.includes('SORTIE'))sorties++;
      else ajustements++;
    });
    return{total:safeMouvements.length,entrees,sorties,ajustements};
  },[safeMouvements]);

  const allSelected=safeMouvements.length>0&&safeMouvements.every(m=>safeSelectedIds.has(m.id));
  const someSelected=safeMouvements.length>0&&safeMouvements.some(m=>safeSelectedIds.has(m.id))&&!allSelected;

  useEffect(()=>{
    if(!loadImageForMouvement)return;
    safeMouvements.forEach(m=>{
      if(imageUrls[m.id]===undefined)loadImageForMouvement(m);
    });
  },[safeMouvements,imageUrls,loadImageForMouvement]);

  const closeMenu=useCallback(()=>setOpenMenuId(null),[]);

  useEffect(()=>{
    if(openMenuId===null)return;
    const outside=()=>closeMenu();
    const key=(e:KeyboardEvent)=>{if(e.key==='Escape')closeMenu()};
    document.addEventListener('mousedown',outside);
    document.addEventListener('keydown',key);
    return()=>{
      document.removeEventListener('mousedown',outside);
      document.removeEventListener('keydown',key);
    };
  },[openMenuId,closeMenu]);

  const toggleMenu=useCallback((id:number,e:React.MouseEvent<HTMLButtonElement>)=>{
    e.stopPropagation();
    if(openMenuId===id){closeMenu();return}
    const r=e.currentTarget.getBoundingClientRect();
    const W=205,H=130,P=12;
    const vw=window.innerWidth,vh=window.innerHeight;
    const pos:MenuPosition={};
    const below=vh-r.bottom,above=r.top;
    if(below<H+P&&above>H)pos.bottom=vh-r.top+4;
    else pos.top=r.bottom+4;
    const right=vw-r.right;
    if(right<W+P&&r.left>W)pos.right=vw-r.right+4;
    else pos.left=Math.max(P,r.right-W);
    setMenuPosition(pos);
    setOpenMenuId(id);
  },[openMenuId,closeMenu]);

  const menuAction=useCallback((callback:()=>void,e:React.MouseEvent)=>{
    e.stopPropagation();
    closeMenu();
    callback();
  },[closeMenu]);

  const confirmSingleDelete=useCallback((id:number)=>{
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  },[]);

  const confirmDelete=useCallback(()=>{
    if(deleteTargetId===null)return;
    onBulkDelete?.([deleteTargetId]);
    setDeleteTargetId(null);
    setShowDeleteModal(false);
  },[deleteTargetId,onBulkDelete]);

  if(!safeMouvements.length)return(
    <div className={`flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-2xl border px-6 py-14 text-center shadow-sm ${bg} ${border} dark:shadow-[0_16px_45px_rgba(0,0,0,0.22)]`}>
      <div className="mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-400">
        <Activity size={30} strokeWidth={1.7}/>
      </div>
      <h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100">Aucun mouvement</h3>
      <p className="mt-2 max-w-[390px] text-[14px] leading-6 text-slate-500 dark:text-slate-400">Aucun mouvement de stock n'a été enregistré pour le moment.</p>
    </div>
  );

  return(
    <div className={`relative overflow-hidden rounded-2xl border shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:shadow-[0_14px_45px_rgba(0,0,0,0.20)] ${bg} ${border}`}>

      {safeSelectedIds.size>0&&(
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5 ${isDark?'border-white/[0.08] bg-indigo-500/[0.065]':'border-indigo-100 bg-indigo-50/75'}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm"><CheckSquare size={15}/></div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-indigo-700 dark:text-indigo-300">{safeSelectedIds.size} mouvement{safeSelectedIds.size>1?'s':''} sélectionné{safeSelectedIds.size>1?'s':''}</span>
              <span className="mt-0.5 text-[12px] text-indigo-500/75 dark:text-indigo-400/70">Action groupée disponible</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={()=>onBulkDelete?.([...safeSelectedIds])} className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-rose-700 active:scale-[0.98]"><Trash2 size={15}/>Supprimer</button>
            <button type="button" onClick={()=>onSelectAll?.(false)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"><TextSelection size={15}/>Désélectionner</button>
          </div>
        </div>
      )}

      <div className="custom-scrollbar overflow-x-auto overflow-y-auto scrollbar-gutter-stable">
        <table className={`w-full min-w-[1050px] table-fixed border-collapse border text-left ${border}`}>
          <thead className={`sticky top-0 z-20 backdrop-blur-xl ${isDark?'bg-[#111c30]/97':'bg-slate-50/97'}`}>
            <tr className="text-[12px] font-semibold uppercase tracking-[0.055em] text-slate-500 dark:text-slate-400">
              <th className={`w-[48px] border px-3 py-4 ${headerBorder}`}>
                <input type="checkbox" checked={allSelected} ref={el=>{if(el)el.indeterminate=someSelected}} onChange={e=>onSelectAll?.(e.target.checked)} className="h-[17px] w-[17px] cursor-pointer accent-indigo-600" aria-label="Sélectionner tous les mouvements"/>
              </th>
              <th className={`w-[115px] border px-5 py-4 ${headerBorder}`}>Date</th>
              <th className={`w-[250px] border px-5 py-4 ${headerBorder}`}>Produit</th>
              <th className={`w-[130px] border px-5 py-4 ${headerBorder}`}>Type</th>
              <th className={`w-[90px] border px-5 py-4 ${headerBorder}`}>Quantité</th>
              <th className={`w-[130px] border px-5 py-4 ${headerBorder}`}>Prix unit.</th>
              <th className={`w-[150px] border px-5 py-4 ${headerBorder}`}>Stock</th>
              <th className={`w-[130px] border px-5 py-4 ${headerBorder}`}>Référence</th>
              <th className={`w-[88px] border px-4 py-4 text-right ${headerBorder}`}>Actions</th>
            </tr>
          </thead>

          <tbody className={bg}>
            {safeMouvements.map(m=>{
              const type=normalizeType(m.type_mouvement);
              const isEntree=type.includes('ENTREE');
              const isSortie=type.includes('SORTIE');
              const selected=safeSelectedIds.has(m.id);
              const imageUrl=imageUrls[m.id]||m.produit_image||null;
              const price=Number(m.prix_unitaire??m.prix_achat??0)||0;
              const ancien=Number(m.ancien_stock)||0;
              const nouveau=Number(m.nouveau_stock)||0;

              const quantity=isEntree
                ?{prefix:'+',wrapper:'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',icon:<ArrowDown size={12}/>}
                :isSortie
                ?{prefix:'-',wrapper:'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',icon:<ArrowUp size={12}/>}
                :{prefix:'±',wrapper:'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',icon:<Activity size={12}/>};

              return(
                <tr key={m.id} onClick={()=>onView?.(m)} className={`group h-[64px] cursor-pointer transition-all duration-150 ${selected?(isDark?'bg-indigo-500/[0.085]':'bg-indigo-50/80'):isDark?'hover:bg-white/[0.025]':'hover:bg-slate-50/80'}`}>

                  <td className={`border px-3 py-3 ${cellBorder}`} onClick={e=>e.stopPropagation()}>
                    <input type="checkbox" checked={selected} onChange={e=>onSelectOne?.(m.id,e.target.checked)} className="h-[17px] w-[17px] cursor-pointer accent-indigo-600" aria-label={`Sélectionner ${m.produit_nom||'ce mouvement'}`}/>
                  </td>

                  <td className={`border px-5 py-3 ${cellBorder}`}>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-slate-700 dark:text-slate-300">{formatDate(m.date_mouvement)}</span>
                      <span className="mt-0.5 text-[12px] text-slate-400 dark:text-slate-500">{formatTime(m.date_mouvement)}</span>
                    </div>
                  </td>

                  <td className={`border px-5 py-3 ${cellBorder}`}>
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        {imageUrl?<img src={imageUrl} alt={m.produit_nom||'Produit'} loading="lazy" className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"/>:
                          <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-700"><ImageOff size={18} className="text-slate-400 dark:text-slate-500"/></div>}
                        <span className={`absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full ring-2 ring-white dark:ring-slate-800 ${isEntree?'bg-emerald-500':isSortie?'bg-rose-500':'bg-amber-500'}`}/>
                      </div>
                      <div className="min-w-0">
                        <div title={m.produit_nom||'Produit inconnu'} className="truncate text-[15px] font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">{m.produit_nom||'Produit inconnu'}</div>
                        <div className="mt-0.5 flex min-w-0 items-center gap-1 text-[12px] font-medium text-slate-400 dark:text-slate-500"><Package size={11}/><span className="truncate font-mono">{m.produit_code||'Sans code'}</span></div>
                      </div>
                    </div>
                  </td>

                  <td className={`border px-5 py-3 ${cellBorder}`}>
                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[14px] font-medium ${getTypeColor(m.type_mouvement)}`}>{getTypeIcon(m.type_mouvement)}{getTypeLabel(m.type_mouvement)}</span>
                  </td>

                  <td className={`border px-5 py-3 ${cellBorder}`}>
                    <span className={`inline-flex min-w-[55px] items-center justify-center gap-1.5 rounded-md px-2 py-1 text-[14px] font-semibold ${quantity.wrapper}`}>{quantity.icon}{quantity.prefix}{formatNumber(Number(m.quantite)||0)}</span>
                  </td>

                  <td className={`border px-5 py-3 ${cellBorder}`}>
                    <div className="flex flex-col">
                      <span className="whitespace-nowrap text-[14px] font-semibold text-slate-900 dark:text-slate-100">{price>0?formatMoney(price):'—'}</span>
                      <span className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">Prix unitaire</span>
                    </div>
                  </td>

                  <td className={`border px-5 py-3 ${cellBorder}`}>
                    <div className="flex items-center gap-1.5">
                      <span title="Ancien stock" className="rounded-md bg-slate-100 px-2 py-1 text-[14px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{formatNumber(ancien)}</span>
                      <ChevronRight size={14} className={isEntree?'text-emerald-500':isSortie?'text-rose-500':'text-slate-300 dark:text-slate-600'}/>
                      <span title="Nouveau stock" className="rounded-md bg-indigo-50 px-2 py-1 text-[14px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">{formatNumber(nouveau)}</span>
                    </div>
                  </td>

                  <td className={`border px-5 py-3 ${cellBorder}`}>
                    <span className="block max-w-[110px] truncate font-mono text-[14px] text-slate-500 dark:text-slate-400" title={m.reference||''}>{m.reference||'-'}</span>
                  </td>

                  <td className={`border px-4 py-3 text-right ${cellBorder}`} onClick={e=>e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" title="Voir les détails" onClick={()=>onView?.(m)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"><Eye size={17}/></button>
                      <button type="button" title="Plus d'actions" aria-label={`Actions pour ${m.produit_nom||'ce mouvement'}`} aria-expanded={openMenuId===m.id} onClick={e=>toggleMenu(m.id,e)} className={`flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition ${openMenuId===m.id?'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100':'text-slate-400 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-700 dark:hover:border-slate-700 dark:hover:bg-slate-800'}`}><MoreVertical size={18}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {openMenuId!==null&&createPortal(
        <div className={`fixed z-[99999] w-[205px] overflow-hidden rounded-xl border py-1.5 shadow-[0_18px_55px_rgba(15,23,42,0.18)] backdrop-blur-2xl ${isDark?'border-white/[0.10] bg-[#111c30]/98':'border-slate-200 bg-white/98'}`}
          style={{
            top:menuPosition.top!==undefined?`${menuPosition.top}px`:undefined,
            bottom:menuPosition.bottom!==undefined?`${menuPosition.bottom}px`:undefined,
            left:menuPosition.left!==undefined?`${menuPosition.left}px`:undefined,
            right:menuPosition.right!==undefined?`${menuPosition.right}px`:undefined
          }}
          onMouseDown={e=>e.stopPropagation()}
          onClick={e=>e.stopPropagation()}
        >
          {(()=>{
            const current=safeMouvements.find(m=>m.id===openMenuId);
            if(!current)return null;
            return(
              <div className="flex flex-col text-[14px]">
                <button type="button" onMouseDown={e=>menuAction(()=>onView?.(current),e)} className="flex w-full items-center px-4 py-2.5 text-left font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[0.06]"><Eye size={16} className="mr-3 text-slate-500"/><span>Voir les détails</span></button>
                <div className={`mx-3 my-1 border-t ${isDark?'border-white/[0.07]':'border-slate-100'}`}/>
                <button type="button" onMouseDown={e=>menuAction(()=>confirmSingleDelete(current.id),e)} className="flex w-full items-center px-4 py-2.5 text-left font-semibold text-rose-500 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"><Trash2 size={16} className="mr-3"/><span>Supprimer</span></button>
              </div>
            );
          })()}
        </div>,
        document.body
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={()=>{setShowDeleteModal(false);setDeleteTargetId(null)}}
        onConfirm={confirmDelete}
        title="Confirmation de suppression"
        message="Voulez-vous vraiment supprimer ce mouvement de stock ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmColor="red"
        isDark={isDark}
      />

      <div className={`flex flex-wrap items-center justify-between gap-4 border-t px-5 py-3.5 ${secondaryBg} ${border}`}>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-slate-500 dark:text-slate-400">
          <span><b className="text-slate-900 dark:text-slate-100">{stats.total}</b> mouvement{stats.total>1?'s':''}</span>
          <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700"/>
          <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-emerald-500"/><span><b className="text-slate-900 dark:text-slate-100">{stats.entrees}</b> Entrée{stats.entrees>1?'s':''}</span></span>
          <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700"/>
          <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-rose-500"/><span><b className="text-slate-900 dark:text-slate-100">{stats.sorties}</b> Sortie{stats.sorties>1?'s':''}</span></span>
          {stats.ajustements>0&&<>
            <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700"/>
            <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-amber-500"/><span><b className="text-slate-900 dark:text-slate-100">{stats.ajustements}</b> Ajustement{stats.ajustements>1?'s':''}</span></span>
          </>}
        </div>
        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-400 dark:text-slate-500"><i className="h-2 w-2 rounded-full bg-emerald-500"/>Stock synchronisé</div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar{width:7px;height:7px}
        .custom-scrollbar::-webkit-scrollbar-track{background:transparent}
        .custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(100,116,139,.26);border-radius:999px}
        .custom-scrollbar::-webkit-scrollbar-thumb:hover{background:rgba(100,116,139,.46)}
        .custom-scrollbar{scrollbar-width:thin;scrollbar-color:rgba(100,116,139,.28) transparent}
        .dark .custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(148,163,184,.20)}
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover{background:rgba(148,163,184,.32)}
        .scrollbar-gutter-stable{scrollbar-gutter:stable}
        @keyframes rowIn{from{opacity:0;transform:translateY(2px)}to{opacity:1;transform:translateY(0)}}
        .group{animation:rowIn .18s ease-out}
      `}</style>
    </div>
  );
};

export default MouvementsTable;