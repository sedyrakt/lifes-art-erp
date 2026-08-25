// ============================================================
// src/components/commandes/CommandesTable.tsx
// ⭐ LIFE'S ART ERP — COMMANDES TABLE
// ⭐ Production Ready / Compact / Stable
// ⭐ FIX: Esorina ny formatMoney (mampiseho Ariary mivantana)
// ============================================================

import React,{memo,useCallback,useEffect,useMemo,useState}from'react';
import{createPortal}from'react-dom';
import{CheckCircle,CheckSquare,Eye,X,ImageOff,Package,Phone,Plus,Receipt,ShoppingCart,TextSelection,Trash2,Truck,XCircle,MoreVertical}from'lucide-react';
import{useTheme}from'../../contexts/ThemeContext';
import{STATUS,type StatusType,type Commande}from'../../types/commandes';

interface CommandesTableProps{
  commandes:Commande[];
  loading?:boolean;
  totalItems?:number;
  generating:boolean;
  onView:(commande:Commande)=>void;
  onGenerateFacture:(commande:Commande)=>void;
  onConfirmStatus:(id:number,statut:StatusType)=>void;
  onDelete:(commande:Commande)=>void;
  onAdd:()=>void;
  getStatusColor:(statut:string)=>string;
  getStatusIcon:(statut:string)=>React.ReactNode;
  clientImageUrls?:Record<number,string|null>;
  clientImageErrors?:Record<number,boolean>;
  handleClientImageError?:(id:number)=>void;
  produitImageUrls?:Record<number,string|null>;
  produitImageErrors?:Record<number,boolean>;
  handleProduitImageError?:(id:number)=>void;
  selectedIds?:Set<number>;
  onSelectAll?:(checked:boolean)=>void;
  onSelectOne?:(id:number,checked:boolean)=>void;
  onBulkConfirmStatus?:(ids:number[],status:StatusType)=>void;
  onBulkDelete?:(ids:number[])=>void;
}

interface MenuPosition{top?:number;bottom?:number;left?:number;right?:number;}
interface ParsedProduct{nom:string;quantite:number;code?:string;image?:string;id?:number;}

const MENU_WIDTH=220;
const MENU_HEIGHT=240;
const MENU_PADDING=12;

const parseProducts=(produits?:string):ParsedProduct[]=>{
  if(!produits?.trim())return[];
  return produits.split(',')
    .map(v=>v.trim())
    .filter(Boolean)
    .map(item=>{
      const match=item.match(/^(.*?)\s*\(x(\d+)\)\s*$/);
      if(!match)return{nom:item,quantite:1};
      return{nom:match[1].trim(),quantite:Number(match[2])||1};
    });
};

const formatCommandeDate=(date?:string)=>{
  if(!date)return null;
  const parsed=new Date(date);
  if(Number.isNaN(parsed.getTime()))return null;
  return{
    date:parsed.toLocaleDateString('fr-FR'),
    time:parsed.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})
  };
};

const getStatusDotColor=(statut:StatusType)=>{
  switch(statut){
    case STATUS.PENDING:return'bg-amber-500';
    case STATUS.CONFIRMED:return'bg-emerald-500';
    case STATUS.SHIPPED:return'bg-blue-500';
    case STATUS.DELIVERED:return'bg-emerald-500';
    case STATUS.CANCELLED:return'bg-rose-500';
    default:return'bg-slate-400';
  }
};

const SkeletonRow=memo(({isDark}:{isDark:boolean})=>{
  const c=isDark?'animate-pulse rounded-md bg-white/[0.07]':'animate-pulse rounded-md bg-slate-200';
  const b=isDark?'border-white/[0.09]':'border-slate-200';

  return(
    <tr className="h-[64px]">
      <td className={`border px-3 py-3 ${b}`}><div className={`${c} h-4 w-4`}/></td>
      <td className={`border px-3 py-3 ${b}`}><div className={`${c} h-6 w-24`}/></td>
      <td className={`border px-3 py-3 ${b}`}><div className={`${c} h-10 w-10 rounded-xl`}/></td>
      <td className={`border px-3 py-3 ${b}`}><div className="space-y-2"><div className={`${c} h-4 w-32`}/><div className={`${c} h-3 w-24`}/></div></td>
      <td className={`border px-3 py-3 ${b}`}><div className="flex items-center gap-2"><div className={`${c} h-8 w-8`}/><div className={`${c} h-4 w-36`}/></div></td>
      <td className={`border px-3 py-3 ${b}`}><div className="space-y-2"><div className={`${c} h-4 w-20`}/><div className={`${c} h-3 w-14`}/></div></td>
      <td className={`border px-3 py-3 ${b}`}><div className={`${c} h-5 w-24`}/></td>
      <td className={`border px-3 py-3 ${b}`}><div className={`${c} h-8 w-28 rounded-lg`}/></td>
      <td className={`border px-3 py-3 ${b}`}><div className="flex justify-end gap-1"><div className={`${c} h-8 w-8`}/><div className={`${c} h-8 w-8`}/><div className={`${c} h-8 w-8`}/></div></td>
    </tr>
  );
});

SkeletonRow.displayName='SkeletonRow';

const CommandesTable:React.FC<CommandesTableProps>=({
  commandes,
  loading=false,
  totalItems,
  generating,
  onView,
  onGenerateFacture,
  onConfirmStatus,
  onDelete,
  onAdd,
  getStatusColor,
  getStatusIcon,
  clientImageUrls={},
  clientImageErrors={},
  handleClientImageError,
  produitImageUrls={},
  produitImageErrors={},
  handleProduitImageError,
  selectedIds=new Set<number>(),
  onSelectAll,
  onSelectOne,
  onBulkConfirmStatus,
  onBulkDelete
})=>{
  const{isDark}=useTheme();

  const tableBackground=isDark?'bg-[#111c30]':'bg-white';
  const tableSecondaryBackground=isDark?'bg-[#0f192b]':'bg-slate-50/70';
  const borderColor=isDark?'border-white/[0.14]':'border-slate-200';
  const cellBorderColor=isDark?'border-white/[0.09]':'border-slate-200';
  const headerBorderColor=isDark?'border-white/[0.16]':'border-slate-300';

  const[openMenuId,setOpenMenuId]=useState<number|null>(null);
  const[menuPosition,setMenuPosition]=useState<MenuPosition>({});

  const safeSelectedIds=selectedIds||new Set<number>();

  const statusStats=useMemo(()=>{
    const stats={enAttente:0,confirmees:0,expediees:0,livrees:0,annulees:0};

    for(const commande of commandes){
      switch(commande.statut){
        case STATUS.PENDING:stats.enAttente++;break;
        case STATUS.CONFIRMED:stats.confirmees++;break;
        case STATUS.SHIPPED:stats.expediees++;break;
        case STATUS.DELIVERED:stats.livrees++;break;
        case STATUS.CANCELLED:stats.annulees++;break;
      }
    }

    return stats;
  },[commandes]);

  const allSelected=commandes.length>0&&commandes.every(c=>safeSelectedIds.has(c.id));
  const someSelected=safeSelectedIds.size>0&&!allSelected;

  useEffect(()=>{
    if(openMenuId===null)return;

    const escape=(event:KeyboardEvent)=>{
      if(event.key==='Escape')setOpenMenuId(null);
    };

    const close=()=>setOpenMenuId(null);

    document.addEventListener('keydown',escape);
    window.addEventListener('resize',close);
    window.addEventListener('scroll',close,true);

    return()=>{
      document.removeEventListener('keydown',escape);
      window.removeEventListener('resize',close);
      window.removeEventListener('scroll',close,true);
    };
  },[openMenuId]);

  const toggleMenu=useCallback((id:number,event:React.MouseEvent<HTMLButtonElement>)=>{
    event.stopPropagation();

    if(openMenuId===id){
      setOpenMenuId(null);
      return;
    }

    const rect=event.currentTarget.getBoundingClientRect();
    const vw=window.innerWidth;
    const vh=window.innerHeight;
    const position:MenuPosition={};

    const below=vh-rect.bottom;
    const above=rect.top;

    if(below<MENU_HEIGHT+MENU_PADDING&&above>MENU_HEIGHT+MENU_PADDING){
      position.bottom=vh-rect.top+4;
    }else{
      position.top=rect.bottom+4;
    }

    const right=vw-rect.right;

    if(right<MENU_WIDTH+MENU_PADDING&&rect.left>MENU_WIDTH+MENU_PADDING){
      position.right=right+4;
    }else{
      position.left=Math.max(MENU_PADDING,rect.right-MENU_WIDTH);
    }

    setMenuPosition(position);
    setOpenMenuId(id);
  },[openMenuId]);

  const handleMenuAction=useCallback((callback:()=>void,event:React.MouseEvent)=>{
    event.stopPropagation();
    setOpenMenuId(null);
    callback();
  },[]);

  const getLocalStatusColor=useCallback((statut:StatusType)=>{
    if(statut===STATUS.CONFIRMED)
      return isDark?'border-emerald-500/25 bg-emerald-500/10 text-emerald-400':'border-emerald-200 bg-emerald-50 text-emerald-700';

    if(statut===STATUS.DELIVERED)
      return isDark?'border-blue-500/25 bg-blue-500/10 text-blue-400':'border-blue-200 bg-blue-50 text-blue-700';

    if(statut===STATUS.SHIPPED)
      return isDark?'border-indigo-500/25 bg-indigo-500/10 text-indigo-400':'border-indigo-200 bg-indigo-50 text-indigo-700';

    if(statut===STATUS.CANCELLED)
      return isDark?'border-rose-500/25 bg-rose-500/10 text-rose-400':'border-rose-200 bg-rose-50 text-rose-700';

    return getStatusColor(statut);
  },[getStatusColor,isDark]);

  const currentCommande=useMemo(
    ()=>openMenuId===null?null:commandes.find(c=>c.id===openMenuId)??null,
    [commandes,openMenuId]
  );

  if(!loading&&commandes.length===0){
    return(
      <div className={`flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-2xl border px-6 py-14 text-center shadow-sm ${tableBackground} ${borderColor}`}>
        <div className="mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-400">
          <ShoppingCart size={30} strokeWidth={1.7}/>
        </div>

        <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-slate-900 dark:text-slate-100">
          Aucune commande trouvée
        </h3>

        <p className="mt-2 max-w-[390px] text-[14px] leading-6 text-slate-500 dark:text-slate-400">
          Aucune commande ne correspond aux critères actuels.
          <br/>
          Essayez de modifier vos filtres ou de réinitialiser la recherche.
        </p>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onAdd} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(79,70,229,0.22)] transition hover:bg-indigo-700 active:scale-[0.98]">
            <Plus size={17}/>Nouvelle commande
          </button>

          <button type="button" onClick={()=>onSelectAll?.(false)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[14px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
            <X size={17}/>Réinitialiser
          </button>
        </div>
      </div>
    );
  }

  return(
    <div className={`relative overflow-hidden rounded-2xl border shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:shadow-[0_14px_45px_rgba(0,0,0,0.20)] ${tableBackground} ${borderColor}`}>

      {safeSelectedIds.size>0&&(
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5 ${isDark?'border-white/[0.08] bg-indigo-500/[0.065]':'border-indigo-100 bg-indigo-50/75'}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <CheckSquare size={15}/>
            </div>

            <div>
              <span className="block text-[14px] font-semibold text-indigo-700 dark:text-indigo-300">
                {safeSelectedIds.size} commande{safeSelectedIds.size>1?'s':''} sélectionnée{safeSelectedIds.size>1?'s':''}
              </span>
              <span className="mt-0.5 block text-[12px] text-indigo-500/75 dark:text-indigo-400/70">
                Action groupée disponible
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={()=>onBulkConfirmStatus?.([...safeSelectedIds],STATUS.DELIVERED)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-emerald-700">
              <Truck size={15}/>Livrer
            </button>

            <button type="button" onClick={()=>onBulkConfirmStatus?.([...safeSelectedIds],STATUS.CANCELLED)} className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-amber-700">
              <XCircle size={15}/>Annuler
            </button>

            <button type="button" onClick={()=>onBulkDelete?.([...safeSelectedIds])} className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-rose-700">
              <Trash2 size={15}/>Supprimer
            </button>

            <button type="button" onClick={()=>onSelectAll?.(false)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
              <TextSelection size={15}/>Désélectionner
            </button>
          </div>
        </div>
      )}

      <div className="custom-scrollbar overflow-x-auto overflow-y-auto scrollbar-gutter-stable">
        <table className={`w-full min-w-[1280px] table-fixed border-collapse border text-left ${borderColor}`}>
          <thead className={`sticky top-0 z-20 backdrop-blur-xl ${isDark?'bg-[#111c30]/97':'bg-slate-50/97'}`}>
            <tr className="text-[12px] font-semibold uppercase tracking-[0.055em] text-slate-500 dark:text-slate-400">
              <th className={`w-[48px] border px-3 py-4 ${headerBorderColor}`}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={el=>{if(el)el.indeterminate=someSelected;}}
                  onChange={e=>onSelectAll?.(e.target.checked)}
                  className="h-[17px] w-[17px] cursor-pointer accent-indigo-600"
                  aria-label="Sélectionner toutes les commandes"
                />
              </th>

              <th className={`w-[155px] border px-5 py-4 ${headerBorderColor}`}>N° Commande</th>
              <th className={`w-[78px] border px-5 py-4 ${headerBorderColor}`}>Photo</th>
              <th className={`w-[200px] border px-5 py-4 ${headerBorderColor}`}>Client</th>
              <th className={`w-[240px] border px-5 py-4 ${headerBorderColor}`}>Produits</th>
              <th className={`w-[130px] border px-5 py-4 ${headerBorderColor}`}>Date</th>
              <th className={`w-[140px] border px-5 py-4 ${headerBorderColor}`}>Total TTC</th>
              <th className={`w-[145px] border px-5 py-4 ${headerBorderColor}`}>Statut</th>
              <th className={`w-[105px] border px-4 py-4 text-right ${headerBorderColor}`}>Actions</th>
            </tr>
          </thead>

          <tbody className={tableBackground}>
            {loading?
              Array.from({length:7},(_,i)=><SkeletonRow key={i} isDark={isDark}/>)
              :
              commandes.map(commande=>{
                const clientImageUrl=clientImageUrls[commande.client_id]||null;
                const clientImageError=clientImageErrors[commande.client_id]||false;

                const initials=commande.client_nom?.trim()
                  .split(/\s+/)
                  .filter(Boolean)
                  .map(v=>v.charAt(0))
                  .join('')
                  .slice(0,2)
                  .toUpperCase()||'?';

                const isSelected=safeSelectedIds.has(commande.id);
                const products=parseProducts(commande.produits_noms);
                const visibleProducts=products.slice(0,2);
                const hiddenProducts=Math.max(0,products.length-2);
                const formattedDate=formatCommandeDate(commande.date_commande);

                let firstProductImageUrl:string|null=null;
                let firstProductImageError=false;
                let firstProductId:number|null=null;

                if(commande.produits_details?.length){
                  const detail=commande.produits_details[0];
                  firstProductId=detail.produit_id||detail.id||null;

                  if(detail.image)firstProductImageUrl=detail.image;
                  else if(firstProductId)firstProductImageUrl=produitImageUrls[firstProductId]||null;

                  if(firstProductId)firstProductImageError=!!produitImageErrors[firstProductId];
                }

                return(
                  <tr
                    key={commande.id}
                    onClick={()=>{setOpenMenuId(null);onView(commande);}}
                    className={`group h-[64px] cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? isDark?'bg-indigo-500/[0.085]':'bg-indigo-50/80'
                        : isDark?'hover:bg-white/[0.025]':'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className={`border px-3 py-3 ${cellBorderColor}`} onClick={e=>e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={e=>onSelectOne?.(commande.id,e.target.checked)}
                        className="h-[17px] w-[17px] cursor-pointer accent-indigo-600"
                        aria-label={`Sélectionner ${commande.numero}`}
                      />
                    </td>

                    <td className={`border px-5 py-3 ${cellBorderColor}`}>
                      <span className="inline-flex items-center rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 font-mono text-[14px] font-semibold text-indigo-600 dark:border-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-400">
                        {commande.numero}
                      </span>
                    </td>

                    <td className={`border px-5 py-3 ${cellBorderColor}`}>
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        {clientImageUrl&&!clientImageError?
                          <img src={clientImageUrl} alt={commande.client_nom||'Client'} loading="lazy" className="h-full w-full object-cover" onError={()=>handleClientImageError?.(commande.client_id)}/>
                          :
                          clientImageError?
                            <ImageOff size={16} className="text-slate-400"/>
                            :
                            <span className="text-[12px] font-bold text-indigo-600 dark:text-indigo-400">{initials}</span>
                        }
                      </div>
                    </td>

                    <td className={`border px-5 py-3 ${cellBorderColor}`}>
                      <div className="min-w-0">
                        <div className="max-w-[175px] truncate text-[15px] font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                          {commande.client_nom||'Client inconnu'}
                        </div>

                        {commande.client_telephone?
                          <div className="mt-1 flex items-center gap-1.5 truncate text-[13px] text-slate-500 dark:text-slate-400">
                            <Phone size={12}/>{commande.client_telephone}
                          </div>
                          :
                          <span className="mt-1 block text-[13px] text-slate-400">Aucun téléphone</span>
                        }
                      </div>
                    </td>

                    <td className={`border px-5 py-3 ${cellBorderColor}`}>
                      <div className="flex max-w-[240px] items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                          {firstProductImageUrl&&!firstProductImageError?
                            <img
                              src={firstProductImageUrl}
                              alt={products[0]?.nom||'Produit'}
                              loading="lazy"
                              className="h-full w-full object-cover"
                              onError={()=>firstProductId&&handleProduitImageError?.(firstProductId)}
                            />
                            :
                            <Package size={15} className="text-indigo-500 dark:text-indigo-400"/>
                          }
                        </div>

                        {products.length===0?
                          <span className="text-[14px] text-slate-400">Aucun produit</span>
                          :
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span
                              className="max-w-[155px] truncate text-[14px] font-medium text-slate-700 dark:text-slate-300"
                              title={products.map(p=>`${p.nom} (x${p.quantite})`).join(', ')}
                            >
                              {visibleProducts.map(p=>p.nom).join(', ')}
                            </span>

                            {hiddenProducts>0&&(
                              <span className="inline-flex shrink-0 items-center rounded-full border border-indigo-100 bg-indigo-50 px-1.5 py-0.5 text-[11px] font-bold text-indigo-600 dark:border-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-400">
                                +{hiddenProducts}
                              </span>
                            )}
                          </div>
                        }
                      </div>
                    </td>

                    <td className={`border px-5 py-3 ${cellBorderColor}`}>
                      {formattedDate?
                        <div className="flex flex-col">
                          <span className="text-[14px] font-medium text-slate-700 dark:text-slate-300">{formattedDate.date}</span>
                          <span className="mt-1 text-[12px] text-slate-400">{formattedDate.time}</span>
                        </div>
                        :
                        <span className="text-[14px] text-slate-400">—</span>
                      }
                    </td>

                    <td className={`border px-5 py-3 ${cellBorderColor}`}>
                      {/* ⭐ FIX: Esorina ny formatMoney, mampiseho Ariary mivantana */}
                      <span className="whitespace-nowrap text-[14px] font-bold text-slate-900 dark:text-slate-100">
                        {Number(commande.total_ttc||0).toLocaleString('fr-FR')} Ar
                      </span>
                    </td>

                    <td className={`border px-5 py-3 ${cellBorderColor}`}>
                      <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-[13px] font-semibold ${getLocalStatusColor(commande.statut)}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${getStatusDotColor(commande.statut)}`}/>
                        {getStatusIcon(commande.statut)}
                        {commande.statut}
                      </span>
                    </td>

                    <td className={`border px-4 py-3 text-right ${cellBorderColor}`} onClick={e=>e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={()=>onGenerateFacture(commande)}
                          disabled={generating}
                          title="Générer la facture"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                        >
                          {generating?
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"/>
                            :
                            <Receipt size={17} strokeWidth={1.8}/>
                          }
                        </button>

                        <button
                          type="button"
                          onClick={()=>onView(commande)}
                          title="Voir la commande"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                        >
                          <Eye size={17}/>
                        </button>

                        <button
                          type="button"
                          onClick={e=>toggleMenu(commande.id,e)}
                          title="Actions"
                          aria-label={`Actions pour ${commande.numero}`}
                          aria-expanded={openMenuId===commande.id}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                            openMenuId===commande.id
                              ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100'
                              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <MoreVertical size={18}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>

      {openMenuId!==null&&currentCommande&&createPortal(
        <div
          className={`fixed z-[99999] w-[220px] overflow-hidden rounded-xl border py-1.5 shadow-[0_18px_55px_rgba(15,23,42,0.18)] ${
            isDark?'border-white/[0.10] bg-[#111c30]':'border-slate-200 bg-white'
          }`}
          style={{
            top:menuPosition.top!==undefined?`${menuPosition.top}px`:undefined,
            bottom:menuPosition.bottom!==undefined?`${menuPosition.bottom}px`:undefined,
            left:menuPosition.left!==undefined?`${menuPosition.left}px`:undefined,
            right:menuPosition.right!==undefined?`${menuPosition.right}px`:undefined
          }}
          onMouseDown={e=>e.stopPropagation()}
          onClick={e=>e.stopPropagation()}
        >
          <div className={`border-b px-4 py-3 ${isDark?'border-white/[0.08]':'border-slate-100'}`}>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <Receipt size={14}/>
              </div>

              <div className="min-w-0">
                <div className="max-w-[165px] truncate text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                  {currentCommande.numero}
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-slate-400">ID #{currentCommande.id}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col text-[14px]">
            {currentCommande.statut===STATUS.PENDING&&(
              <>
                <button type="button" onMouseDown={e=>handleMenuAction(()=>onConfirmStatus(currentCommande.id,STATUS.CONFIRMED),e)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-slate-700 hover:bg-emerald-50 dark:text-slate-200 dark:hover:bg-emerald-500/10">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"><CheckCircle size={15}/></span>
                  Confirmer
                </button>

                <button type="button" onMouseDown={e=>handleMenuAction(()=>onConfirmStatus(currentCommande.id,STATUS.CANCELLED),e)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-slate-700 hover:bg-amber-50 dark:text-slate-200 dark:hover:bg-amber-500/10">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"><XCircle size={15}/></span>
                  Annuler
                </button>
              </>
            )}

            {currentCommande.statut===STATUS.CONFIRMED&&(
              <>
                <button type="button" onMouseDown={e=>handleMenuAction(()=>onConfirmStatus(currentCommande.id,STATUS.DELIVERED),e)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-slate-700 hover:bg-emerald-50 dark:text-slate-200 dark:hover:bg-emerald-500/10">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"><Truck size={15}/></span>
                  Livrer
                </button>

                <button type="button" onMouseDown={e=>handleMenuAction(()=>onConfirmStatus(currentCommande.id,STATUS.CANCELLED),e)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-slate-700 hover:bg-amber-50 dark:text-slate-200 dark:hover:bg-amber-500/10">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"><XCircle size={15}/></span>
                  Annuler
                </button>
              </>
            )}

            {(currentCommande.statut===STATUS.SHIPPED||currentCommande.statut===STATUS.DELIVERED)&&(
              <button type="button" onMouseDown={e=>handleMenuAction(()=>onView(currentCommande),e)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-medium text-slate-700 hover:bg-indigo-50 dark:text-slate-200 dark:hover:bg-indigo-500/10">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><Eye size={15}/></span>
                Voir les détails
              </button>
            )}

            <div className={`mx-3 my-1 border-t ${isDark?'border-white/[0.07]':'border-slate-100'}`}/>

            <button type="button" onMouseDown={e=>handleMenuAction(()=>onDelete(currentCommande),e)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-semibold text-rose-500 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400"><Trash2 size={15}/></span>
              Supprimer
            </button>
          </div>
        </div>,
        document.body
      )}

      <div className={`flex flex-wrap items-center justify-between gap-4 border-t px-5 py-3.5 ${tableSecondaryBackground} ${borderColor}`}>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-2">
            <ShoppingCart size={14} className="text-indigo-500"/>
            <span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{totalItems??commandes.length}</span>
              {' '}commande{(totalItems??commandes.length)>1?'s':''}
            </span>
          </span>

          {statusStats.enAttente>0&&(
            <span className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${getStatusDotColor(STATUS.PENDING)}`}/>
              <span><b className="text-slate-900 dark:text-slate-100">{statusStats.enAttente}</b> En attente</span>
            </span>
          )}

          {statusStats.confirmees>0&&(
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"/>
              <span><b className="text-slate-900 dark:text-slate-100">{statusStats.confirmees}</b> Confirmée{statusStats.confirmees>1?'s':''}</span>
            </span>
          )}

          {statusStats.expediees>0&&(
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500"/>
              <span><b className="text-slate-900 dark:text-slate-100">{statusStats.expediees}</b> Expédiée{statusStats.expediees>1?'s':''}</span>
            </span>
          )}

          {statusStats.livrees>0&&(
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"/>
              <span><b className="text-slate-900 dark:text-slate-100">{statusStats.livrees}</b> Livrée{statusStats.livrees>1?'s':''}</span>
            </span>
          )}

          {statusStats.annulees>0&&(
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500"/>
              <span><b className="text-slate-900 dark:text-slate-100">{statusStats.annulees}</b> Annulée{statusStats.annulees>1?'s':''}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-400 dark:text-slate-500">
          <ShoppingCart size={14}/>
          Gestion des commandes
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
        @keyframes rowIn{from{opacity:0;transform:translateY(2px)}to{opacity:1;transform:translateY(0)}}
        .group{animation:rowIn .18s ease-out}
      `}</style>
    </div>
  );
};

export default memo(CommandesTable);