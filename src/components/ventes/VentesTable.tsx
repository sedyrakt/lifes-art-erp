// ============================================================
// src/components/ventes/VentesTable.tsx
// LIFE'S ART ERP - VENTES
// ⭐ PREMIUM COMPACT TABLE
// ⭐ FIX: Esorina ny formatMoney (mampiseho Ariary mivantana)
// ============================================================

import React,{memo,useCallback,useEffect,useMemo,useState}from'react';
import{createPortal}from'react-dom';
import{ArrowRight,CheckSquare,Download,Eye,FileText,MoreVertical,Plus,Receipt,TextSelection,Trash2,User}from'lucide-react';
import{useTheme}from'../../contexts/ThemeContext';

interface VentesTableProps{
  data:any[];
  type:'devis'|'factures';
  loading?:boolean;
  totalItems?:number;
  onView:(item:any)=>void;
  onDelete:(item:any)=>void;
  onAdd:()=>void;
  onConvertDevisToFacture?:(devis:any)=>void;
  onDownloadFacture?:(facture:any)=>void;
  onDownloadDevisPDF?:(devis:any)=>void;
  selectedIds?:Set<number>;
  onSelectAll?:(checked:boolean)=>void;
  onSelectOne?:(id:number,checked:boolean)=>void;
  onBulkDelete?:(ids:number[])=>void;
}

interface MenuPosition{
  top?:number;
  bottom?:number;
  left?:number;
  right?:number;
}

const MENU_WIDTH=220;
const MENU_HEIGHT=200;
const MENU_PADDING=12;

const SkeletonRow=memo(({isDark}:{isDark:boolean})=>{
  const s=isDark?'animate-pulse rounded-md bg-white/[0.07]':'animate-pulse rounded-md bg-slate-200';
  const b=isDark?'border-white/[0.09]':'border-slate-200';
  return(
    <tr className="h-[64px]">
      <td className={`border px-3 py-3 ${b}`}><div className={`${s} h-4 w-4`}/></td>
      <td className={`border px-5 py-3 ${b}`}><div className={`${s} h-6 w-24`}/></td>
      <td className={`border px-5 py-3 ${b}`}><div className={`${s} h-10 w-10 rounded-xl`}/></td>
      <td className={`border px-5 py-3 ${b}`}><div className="space-y-2"><div className={`${s} h-4 w-32`}/><div className={`${s} h-3 w-24`}/></div></td>
      <td className={`border px-5 py-3 ${b}`}><div className={`${s} h-5 w-24`}/></td>
      <td className={`border px-5 py-3 ${b}`}><div className={`${s} h-5 w-24`}/></td>
      <td className={`border px-5 py-3 ${b}`}><div className={`${s} h-5 w-24`}/></td>
      <td className={`border px-4 py-3 ${b}`}><div className={`${s} ml-auto h-8 w-28 rounded-lg`}/></td>
    </tr>
  );
});

SkeletonRow.displayName='SkeletonRow';

const getStatutBadge=(statut?:string)=>{
  const s=(statut||'En attente').toLowerCase();
  if(['converti','payée','payee'].includes(s))
    return{
      bg:'bg-emerald-50 dark:bg-emerald-500/10',
      text:'text-emerald-700 dark:text-emerald-400',
      border:'border-emerald-200 dark:border-emerald-500/20',
      label:statut||'Validé',
      dot:'bg-emerald-500'
    };
  if(['en attente','attente'].includes(s))
    return{
      bg:'bg-amber-50 dark:bg-amber-500/10',
      text:'text-amber-700 dark:text-amber-400',
      border:'border-amber-200 dark:border-amber-500/20',
      label:'En attente',
      dot:'bg-amber-500'
    };
  if(['annulé','annule'].includes(s))
    return{
      bg:'bg-rose-50 dark:bg-rose-500/10',
      text:'text-rose-700 dark:text-rose-400',
      border:'border-rose-200 dark:border-rose-500/20',
      label:'Annulé',
      dot:'bg-rose-500'
    };
  return{
    bg:'bg-slate-50 dark:bg-slate-500/10',
    text:'text-slate-700 dark:text-slate-400',
    border:'border-slate-200 dark:border-slate-500/20',
    label:statut||'En attente',
    dot:'bg-slate-500'
  };
};

const VentesTable:React.FC<VentesTableProps>=({
  data=[],
  type,
  loading=false,
  totalItems,
  onView,
  onDelete,
  onAdd,
  onConvertDevisToFacture,
  onDownloadFacture,
  onDownloadDevisPDF,
  selectedIds=new Set<number>(),
  onSelectAll,
  onSelectOne,
  onBulkDelete
})=>{
  const{isDark}=useTheme();

  const bg=isDark?'bg-[#111c30]':'bg-white';
  const secondaryBg=isDark?'bg-[#0f192b]':'bg-slate-50/70';
  const border=isDark?'border-white/[0.14]':'border-slate-200';
  const cellBorder=isDark?'border-white/[0.09]':'border-slate-200';
  const headerBorder=isDark?'border-white/[0.16]':'border-slate-300';

  const[openMenuId,setOpenMenuId]=useState<number|null>(null);
  const[menuPosition,setMenuPosition]=useState<MenuPosition>({});

  const safeSelectedIds=selectedIds||new Set<number>();

  const statusStats=useMemo(()=>{
    let enAttente=0,valides=0,annules=0;
    for(const item of data){
      const s=(item?.statut||'En attente').toLowerCase();
      if(['en attente','attente'].includes(s))enAttente++;
      else if(['converti','payée','payee'].includes(s))valides++;
      else if(['annulé','annule'].includes(s))annules++;
    }
    return{enAttente,valides,annules};
  },[data]);

  const allSelected=data.length>0&&data.every(item=>safeSelectedIds.has(item.id));
  const someSelected=safeSelectedIds.size>0&&!allSelected;

  useEffect(()=>{
    if(openMenuId===null)return;
    const esc=(e:KeyboardEvent)=>{
      if(e.key==='Escape')setOpenMenuId(null);
    };
    const resize=()=>setOpenMenuId(null);
    document.addEventListener('keydown',esc);
    window.addEventListener('resize',resize);
    return()=>{
      document.removeEventListener('keydown',esc);
      window.removeEventListener('resize',resize);
    };
  },[openMenuId]);

  const toggleMenu=useCallback((id:number,e:React.MouseEvent<HTMLButtonElement>)=>{
    e.stopPropagation();

    if(openMenuId===id){
      setOpenMenuId(null);
      return;
    }

    const rect=e.currentTarget.getBoundingClientRect();
    const vw=window.innerWidth;
    const vh=window.innerHeight;
    const pos:MenuPosition={};

    const below=vh-rect.bottom;
    const above=rect.top;

    if(below<MENU_HEIGHT+MENU_PADDING&&above>MENU_HEIGHT+MENU_PADDING)
      pos.bottom=vh-rect.top+4;
    else
      pos.top=rect.bottom+4;

    const right=vw-rect.right;

    if(right<MENU_WIDTH+MENU_PADDING&&rect.left>MENU_WIDTH+MENU_PADDING)
      pos.right=vw-rect.right+4;
    else
      pos.left=Math.max(MENU_PADDING,rect.right-MENU_WIDTH);

    setMenuPosition(pos);
    setOpenMenuId(id);
  },[openMenuId]);

  const handleMenuAction=useCallback((callback:()=>void,e:React.MouseEvent)=>{
    e.stopPropagation();
    setOpenMenuId(null);
    callback();
  },[]);

  const currentItem=useMemo(
    ()=>openMenuId===null?null:data.find(item=>item?.id===openMenuId)||null,
    [data,openMenuId]
  );

  if(!loading&&!data.length){
    return(
      <div className={`flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-2xl border px-6 py-14 text-center shadow-sm ${bg} ${border}`}>
        <div className="mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-400">
          {type==='devis'?<FileText size={30} strokeWidth={1.7}/>:<Receipt size={30} strokeWidth={1.7}/>}
        </div>

        <h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100">
          Aucun {type==='devis'?'devis':'facture'} trouvé
        </h3>

        <p className="mt-2 max-w-[390px] text-[14px] leading-6 text-slate-500 dark:text-slate-400">
          Aucun {type==='devis'?'devis':'facture'} ne correspond aux critères actuels.
          <br/>
          Essayez de modifier vos filtres ou de réinitialiser la recherche.
        </p>

        <button
          type="button"
          onClick={onAdd}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[.98]"
        >
          <Plus size={17}/>
          Nouveau {type==='devis'?'devis':'facture'}
        </button>
      </div>
    );
  }

  return(
    <div className={`relative overflow-hidden rounded-2xl border shadow-sm dark:shadow-[0_14px_45px_rgba(0,0,0,.20)] ${bg} ${border}`}>

      {safeSelectedIds.size>0&&(
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5 ${isDark?'border-white/[0.08] bg-indigo-500/[0.065]':'border-indigo-100 bg-indigo-50/75'}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <CheckSquare size={15}/>
            </div>
            <div>
              <div className="text-[14px] font-semibold text-indigo-700 dark:text-indigo-300">
                {safeSelectedIds.size} {type==='devis'?'devis':'facture'}{safeSelectedIds.size>1?'s':''} sélectionné{safeSelectedIds.size>1?'s':''}
              </div>
              <div className="text-[12px] text-indigo-500/75 dark:text-indigo-400/70">
                Action groupée disponible
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={()=>onBulkDelete?.(Array.from(safeSelectedIds))}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-rose-700 active:scale-[.98]"
            >
              <Trash2 size={15}/>
              Supprimer
            </button>

            <button
              type="button"
              onClick={()=>onSelectAll?.(false)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <TextSelection size={15}/>
              Désélectionner
            </button>
          </div>
        </div>
      )}

      <div className="custom-scrollbar scrollbar-gutter-stable overflow-x-auto overflow-y-auto">
        <table className={`w-full min-w-[1200px] table-fixed border-collapse border text-left ${border}`}>
          <thead className={`sticky top-0 z-20 backdrop-blur-xl ${isDark?'bg-[#111c30]/97':'bg-slate-50/97'}`}>
            <tr className="text-[12px] font-semibold uppercase tracking-[.055em] text-slate-500 dark:text-slate-400">

              <th className={`w-[48px] border px-3 py-4 ${headerBorder}`}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={el=>{if(el)el.indeterminate=someSelected}}
                  onChange={e=>onSelectAll?.(e.target.checked)}
                  className="h-[17px] w-[17px] cursor-pointer accent-indigo-600"
                  aria-label="Sélectionner tous les éléments"
                />
              </th>

              <th className={`w-[180px] border px-5 py-4 ${headerBorder}`}>
                Référence
              </th>

              <th className={`w-[220px] border px-5 py-4 ${headerBorder}`}>
                Client
              </th>

              <th className={`w-[150px] border px-5 py-4 ${headerBorder}`}>
                Date
              </th>

              <th className={`w-[110px] border px-5 py-4 ${headerBorder}`}>
                Total HT
              </th>

              <th className={`w-[110px] border px-5 py-4 ${headerBorder}`}>
                Total TTC
              </th>

              <th className={`w-[130px] border px-5 py-4 ${headerBorder}`}>
                Statut
              </th>

              <th className={`w-[105px] border px-4 py-4 text-right ${headerBorder}`}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody className={bg}>
            {loading?(
              Array.from({length:7},(_,i)=><SkeletonRow key={i} isDark={isDark}/>)
            ):(
              data.filter(Boolean).map(item=>{
                const selected=safeSelectedIds.has(item.id);
                const badge=getStatutBadge(item.statut);

                return(
                  <tr
                    key={item.id}
                    onClick={()=>{
                      setOpenMenuId(null);
                      onView(item);
                    }}
                    className={`group h-[64px] cursor-pointer transition ${selected?(isDark?'bg-indigo-500/[.085]':'bg-indigo-50/80'):isDark?'hover:bg-white/[.025]':'hover:bg-slate-50/80'}`}
                  >
                    <td
                      className={`border px-3 py-3 ${cellBorder}`}
                      onClick={e=>e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={e=>onSelectOne?.(item.id,e.target.checked)}
                        className="h-[17px] w-[17px] cursor-pointer accent-indigo-600"
                        aria-label={`Sélectionner ${item.reference||item.id}`}
                      />
                    </td>

                    <td className={`border px-5 py-3 ${cellBorder}`}>
                      <span className="inline-flex items-center rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 font-mono text-[14px] font-semibold text-indigo-600 dark:border-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-400">
                        {item.reference||'—'}
                      </span>
                    </td>

                    <td className={`border px-5 py-3 ${cellBorder}`}>
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                          <User size={16} className="text-indigo-500 dark:text-indigo-400"/>
                        </div>

                        <div className="min-w-0">
                          <div
                            className="max-w-[180px] truncate text-[15px] font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400"
                            title={item.client_nom||'Client inconnu'}
                          >
                            {item.client_nom||'Client inconnu'}
                          </div>

                          <div className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
                            ID #{String(item.id).padStart(3,'0')}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className={`border px-5 py-3 ${cellBorder}`}>
                      {item.date_devis||item.date_facture||item.created_at?(
                        <div className="flex flex-col">
                          <span className="text-[14px] font-medium text-slate-700 dark:text-slate-300">
                            {item.date_devis||item.date_facture||item.created_at}
                          </span>

                          {!item.date_devis&&!item.date_facture&&item.created_at&&(
                            <span className="mt-0.5 text-[12px] text-slate-400 dark:text-slate-500">
                              Heure : {new Date(item.created_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
                            </span>
                          )}
                        </div>
                      ):(
                        <span className="text-[14px] text-slate-400">—</span>
                      )}
                    </td>

                    <td className={`border px-5 py-3 ${cellBorder}`}>
                      {/* ⭐ FIX: Esorina ny formatMoney */}
                      <span className="whitespace-nowrap text-[14px] font-medium text-slate-700 dark:text-slate-300">
                        {Number(item.total_ht||0).toLocaleString('fr-FR')} Ar
                      </span>
                    </td>

                    <td className={`border px-5 py-3 ${cellBorder}`}>
                      {/* ⭐ FIX: Esorina ny formatMoney */}
                      <span className="whitespace-nowrap text-[15px] font-bold text-slate-900 dark:text-slate-100">
                        {Number(item.total_ttc||0).toLocaleString('fr-FR')} Ar
                      </span>
                    </td>

                    <td className={`border px-5 py-3 ${cellBorder}`}>
                      <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-[13px] font-semibold ${badge.bg} ${badge.text} ${badge.border}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`}/>
                        {badge.label}
                      </span>
                    </td>

                    <td
                      className={`border px-4 py-3 text-right ${cellBorder}`}
                      onClick={e=>e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">

                        {type==='devis'&&(
                          <>
                            <button
                              type="button"
                              title="Télécharger PDF"
                              onClick={()=>onDownloadDevisPDF?.(item)}
                              className="action-btn hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                            >
                              <Download size={16}/>
                            </button>

                            <button
                              type="button"
                              title="Convertir en facture"
                              onClick={()=>onConvertDevisToFacture?.(item)}
                              className="action-btn hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                            >
                              <ArrowRight size={16}/>
                            </button>
                          </>
                        )}

                        {type==='factures'&&(
                          <button
                            type="button"
                            title="Télécharger PDF"
                            onClick={()=>onDownloadFacture?.(item)}
                            className="action-btn hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                          >
                            <Download size={16}/>
                          </button>
                        )}

                        <button
                          type="button"
                          title="Voir les détails"
                          onClick={()=>onView(item)}
                          className="action-btn hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                        >
                          <Eye size={16}/>
                        </button>

                        <button
                          type="button"
                          title="Actions"
                          aria-label={`Actions pour ${item.reference||item.id}`}
                          aria-expanded={openMenuId===item.id}
                          onClick={e=>toggleMenu(item.id,e)}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition ${openMenuId===item.id?'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100':'text-slate-400 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-700 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}
                        >
                          <MoreVertical size={17}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {openMenuId!==null&&currentItem&&createPortal(
        <div
          className={`fixed z-[99999] w-[220px] overflow-hidden rounded-xl border py-1.5 shadow-[0_18px_55px_rgba(15,23,42,.18)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100 ${isDark?'border-white/[.10] bg-[#111c30]/98':'border-slate-200 bg-white/98'}`}
          style={{
            top:menuPosition.top!==undefined?`${menuPosition.top}px`:undefined,
            bottom:menuPosition.bottom!==undefined?`${menuPosition.bottom}px`:undefined,
            left:menuPosition.left!==undefined?`${menuPosition.left}px`:undefined,
            right:menuPosition.right!==undefined?`${menuPosition.right}px`:undefined
          }}
          onMouseDown={e=>e.stopPropagation()}
          onClick={e=>e.stopPropagation()}
        >
          <div className={`border-b px-4 py-3 ${isDark?'border-white/[.08]':'border-slate-100'}`}>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                {type==='devis'?<FileText size={14}/>:<Receipt size={14}/>}
              </div>

              <div className="min-w-0">
                <div className="max-w-[165px] truncate text-[14px] font-semibold text-slate-900 dark:text-slate-100">
                  {currentItem.reference||'—'}
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-slate-400">
                  ID #{currentItem.id}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col text-[14px]">
            <MenuButton
              icon={<Eye size={15}/>}
              label="Voir les détails"
              onMouseDown={e=>handleMenuAction(()=>onView(currentItem),e)}
            />

            {type==='devis'&&(
              <>
                <MenuButton
                  icon={<Download size={15}/>}
                  label="Télécharger PDF"
                  tone="indigo"
                  onMouseDown={e=>handleMenuAction(()=>onDownloadDevisPDF?.(currentItem),e)}
                />

                <MenuButton
                  icon={<ArrowRight size={15}/>}
                  label="Convertir en facture"
                  tone="emerald"
                  onMouseDown={e=>handleMenuAction(()=>onConvertDevisToFacture?.(currentItem),e)}
                />
              </>
            )}

            {type==='factures'&&(
              <MenuButton
                icon={<Download size={15}/>}
                label="Télécharger PDF"
                tone="indigo"
                onMouseDown={e=>handleMenuAction(()=>onDownloadFacture?.(currentItem),e)}
              />
            )}

            <div className={`mx-3 my-1 border-t ${isDark?'border-white/[.07]':'border-slate-100'}`}/>

            <MenuButton
              icon={<Trash2 size={15}/>}
              label="Supprimer"
              tone="danger"
              onMouseDown={e=>handleMenuAction(()=>onDelete(currentItem),e)}
            />
          </div>
        </div>,
        document.body
      )}

      <div className={`flex flex-wrap items-center justify-between gap-4 border-t px-5 py-3.5 ${secondaryBg} ${border}`}>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-slate-500 dark:text-slate-400">

          <span className="flex items-center gap-2">
            {type==='devis'?<FileText size={14} className="text-indigo-500"/>:<Receipt size={14} className="text-indigo-500"/>}
            <span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {totalItems??data.length}
              </span>{' '}
              {type==='devis'?'devis':'facture'}
              {(totalItems??data.length)>1?'s':''}
            </span>
          </span>

          <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700"/>

          {statusStats.enAttente>0&&(
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500"/>
              <span><b>{statusStats.enAttente}</b> En attente</span>
            </span>
          )}

          {statusStats.valides>0&&(
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"/>
              <span>
                <b>{statusStats.valides}</b>{' '}
                {type==='devis'?'Converti':'Payée'}
              </span>
            </span>
          )}

          {statusStats.annules>0&&(
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500"/>
              <span>
                <b>{statusStats.annules}</b> Annulé{statusStats.annules>1?'s':''}
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-400 dark:text-slate-500">
          <User size={14}/>
          Gestion des {type==='devis'?'devis':'factures'}
        </div>
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
        .action-btn{display:flex;height:32px;width:32px;align-items:center;justify-content:center;border-radius:8px;color:rgb(148 163 184);opacity:0;transition:all .15s}
        .group:hover .action-btn,.action-btn:focus{opacity:1}
        @keyframes rowIn{from{opacity:0;transform:translateY(2px)}to{opacity:1;transform:translateY(0)}}
        tbody tr{animation:rowIn .18s ease-out}
      `}</style>
    </div>
  );
};

interface MenuButtonProps{
  icon:React.ReactNode;
  label:string;
  tone?:'indigo'|'emerald'|'danger';
  onMouseDown:(e:React.MouseEvent<HTMLButtonElement>)=>void;
}

const MenuButton:React.FC<MenuButtonProps>=({
  icon,label,tone='default' as any,onMouseDown
})=>{
  const toneClass=
    tone==='indigo'
      ?'hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400'
      :tone==='emerald'
        ?'hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400'
        :tone==='danger'
          ?'text-rose-500 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10'
          :'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/[.06]';

  const iconClass=
    tone==='indigo'
      ?'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
      :tone==='emerald'
        ?'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
        :tone==='danger'
          ?'bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400'
          :'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';

  return(
    <button
      type="button"
      onMouseDown={onMouseDown}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium transition-colors ${toneClass}`}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
};

export default memo(VentesTable);