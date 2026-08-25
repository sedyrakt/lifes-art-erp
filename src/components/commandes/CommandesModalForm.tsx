import React,{useEffect,useMemo,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {ShoppingCart,X,Phone,Mail,CheckCircle,User,Lightbulb,Check,Search} from 'lucide-react';
import {useTheme} from '../../contexts/ThemeContext';
import {formatMoney} from '../../lib/formatMoney';
import CommandesProductSelector from './CommandesProductSelector';

const COLORS={
  light:{
    overlay:'rgba(15,23,42,.36)',card:'#FFF',surface:'#FFF',surfaceSoft:'#F8FAFC',
    border:'#E2E8F0',text:'#0F172A',muted:'#64748B',subMuted:'#94A3B8',
    primary:'#4F46E5',primaryHover:'#4338CA',primaryBg:'rgba(79,70,229,.07)',
    primaryBorder:'rgba(79,70,229,.15)',danger:'#E11D48',dangerBg:'rgba(244,63,94,.07)'
  },
  dark:{
    overlay:'rgba(7,4,4,.66)',card:'#0F172A',surface:'#0F172A',surfaceSoft:'#111C30',
    border:'#334155',text:'#F8FAFC',muted:'#94A3B8',subMuted:'#64748B',
    primary:'#818CF8',primaryHover:'#6366F1',primaryBg:'rgba(99,102,241,.12)',
    primaryBorder:'rgba(129,140,248,.20)',danger:'#FB7185',dangerBg:'rgba(244,63,94,.11)'
  }
};

interface Client{id:number;nom:string;email:string;telephone:string;adresse:string}
interface Produit{id:number;nom:string;code:string;prix_vente:number;quantite_stock:number;unite?:string;image?:string}
interface SelectedProduct{id:number;quantite:number}
interface Props{
  isOpen:boolean;onClose:()=>void;onSubmit:(e:React.FormEvent)=>void;
  clients:Client[];produits:Produit[];selectedClientId:number|null;
  onClientChange:(id:number|null)=>void;selectedProduits:SelectedProduct[];
  onAddProduit:(id:number,quantite:number)=>void;
  onUpdateQuantite:(id:number,quantite:number)=>void;
  onRemoveProduit:(id:number)=>void;onClearPanier:()=>void;isDark?:boolean
}

const TVA_RATE=.2;

const SearchableDropdown:React.FC<{
  options:Client[];value:number|null;onChange:(id:number|null)=>void;
  placeholder:string;isDark:boolean;theme:any
}>=({options,value,onChange,placeholder,isDark,theme})=>{
  const[open,setOpen]=useState(false),[search,setSearch]=useState('');
  const ref=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const outside=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false)};
    const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)};
    document.addEventListener('mousedown',outside);
    document.addEventListener('keydown',escape);
    return()=>{document.removeEventListener('mousedown',outside);document.removeEventListener('keydown',escape)};
  },[]);

  const filtered=useMemo(()=>{
    const t=search.trim().toLowerCase();
    if(!t)return options.slice(0,100);
    return options.filter(c=>
      c.nom?.toLowerCase().includes(t)||
      c.email?.toLowerCase().includes(t)||
      c.telephone?.toLowerCase().includes(t)
    ).slice(0,100);
  },[options,search]);

  const selected=options.find(c=>c.id===value);

  return(
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <input value={open?search:selected?.nom||''}
          onChange={e=>{setSearch(e.target.value);setOpen(true)}}
          onFocus={()=>setOpen(true)} placeholder={placeholder}
          className={`h-9 w-full rounded-lg border px-3 pr-9 text-[14px] font-medium outline-none ${isDark?'border-slate-700 bg-[#0F172A] text-slate-100 placeholder:text-slate-500':'border-gray-300 bg-white text-slate-800 placeholder:text-slate-400'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10`}/>
        <Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"/>
      </div>

      {open&&(
        <div className="absolute left-0 right-0 z-[100] mt-1 max-h-60 overflow-y-auto rounded-lg border py-1 shadow-xl" style={{background:isDark?'#0F172A':'#FFF',borderColor:theme.border}}>
          {!filtered.length?<div className="px-4 py-8 text-center text-[14px] text-slate-500">Aucun client trouvé</div>:
          filtered.map(client=>{
            const active=client.id===value;
            return(
              <button key={client.id} type="button"
                onClick={()=>{onChange(client.id);setSearch('');setOpen(false)}}
                className={`flex w-full items-center gap-3 px-3 py-3 text-left ${active?'bg-indigo-50 dark:bg-indigo-500/10':'hover:bg-slate-50 dark:hover:bg-slate-800/70'}`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"><User size={15}/></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-semibold text-slate-800 dark:text-slate-200">{client.nom}</div>
                  <div className="mt-0.5 flex gap-2 text-[13px] text-slate-400 dark:text-slate-500">
                    {client.telephone&&<span className="truncate">{client.telephone}</span>}
                    {client.email&&<><span>•</span><span className="truncate">{client.email}</span></>}
                  </div>
                </div>
                {active&&<Check size={15} className="text-indigo-600 dark:text-indigo-400"/>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CommandesModalForm:React.FC<Props>=({
  isOpen,onClose,onSubmit,clients,produits,selectedClientId,onClientChange,
  selectedProduits,onAddProduit,onUpdateQuantite,onRemoveProduit,onClearPanier,isDark:propDark
})=>{
  const{isDark:contextDark}=useTheme();
  const isDark=propDark??contextDark;
  const theme=isDark?COLORS.dark:COLORS.light;
  const formRef=useRef<HTMLFormElement>(null);
  const[visible,setVisible]=useState(false);
  const borderClass=isDark?'border-slate-700':'border-gray-300';

  useEffect(()=>{
    if(!isOpen){setVisible(false);return}
    const t=window.setTimeout(()=>setVisible(true),10);
    return()=>window.clearTimeout(t);
  },[isOpen]);

  useEffect(()=>{
    if(!isOpen)return;
    const key=(e:KeyboardEvent)=>{
      if(e.key==='Escape'){e.preventDefault();onClose()}
      if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();formRef.current?.requestSubmit()}
    };
    window.addEventListener('keydown',key);
    return()=>window.removeEventListener('keydown',key);
  },[isOpen,onClose]);

  useEffect(()=>{
    if(!isOpen)return;
    const old=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return()=>{document.body.style.overflow=old};
  },[isOpen]);

  const client=useMemo(()=>clients.find(c=>c.id===selectedClientId),[clients,selectedClientId]);
  const totalHT=useMemo(()=>selectedProduits.reduce((sum,item)=>{
    const p=produits.find(x=>x.id===item.id);
    return p?sum+p.prix_vente*item.quantite:sum;
  },0),[produits,selectedProduits]);
  const totalTVA=totalHT*TVA_RATE,totalTTC=totalHT+totalTVA;
  const totalQty=selectedProduits.reduce((s,i)=>s+i.quantite,0);

  if(!isOpen)return null;

  const InfoRow=({label,value}:{label:string;value:React.ReactNode})=>(
    <div className="flex items-start justify-between gap-4">
      <span className="truncate text-[14px]" style={{color:theme.muted}}>{label}</span>
      <span className="min-w-0 text-right text-[14px]" style={{color:theme.text}}>{value}</span>
    </div>
  );

  const modal=(
    <div className={`fixed inset-0 z-[999999] flex items-center justify-center overflow-y-auto p-3 transition-opacity duration-200 ${visible?'opacity-100':'opacity-0'}`}
      style={{background:theme.overlay,backdropFilter:'blur(5px)'}} role="dialog" aria-modal="true"
      onMouseDown={e=>e.target===e.currentTarget&&onClose()}>

      <div className={`relative flex max-h-[86vh] w-full max-w-[70%] flex-col overflow-hidden rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,.22)] transition-all duration-200 ${visible?'translate-y-0 scale-100':'translate-y-2 scale-[.985]'} ${borderClass}`}
        style={{background:theme.card}} onMouseDown={e=>e.stopPropagation()}>

        <div className="absolute left-0 right-0 top-0 z-30 h-[3px]" style={{background:theme.primary}}/>

        <header className={`flex shrink-0 items-center justify-between gap-4 border-b px-5 py-4 sm:px-6 ${borderClass}`} style={{background:theme.surface}}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border" style={{borderColor:theme.border,background:theme.surfaceSoft}}>
              <ShoppingCart size={20} style={{color:theme.primary}}/>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-[16px] font-semibold" style={{color:theme.text}}>Nouvelle commande</h2>
                <span className="hidden rounded-md border px-2 py-0.5 text-[12px] font-medium sm:inline-flex" style={{color:theme.primary,background:theme.primaryBg,borderColor:theme.primaryBorder}}>Vente</span>
              </div>
              <p className="mt-0.5 truncate text-[13px]" style={{color:theme.muted}}>Sélectionnez un client et composez votre panier</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[.06]">
            <X size={18}/>
          </button>
        </header>

        <form ref={formRef} onSubmit={onSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-5 lg:p-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">

              <aside className="flex flex-col gap-3">
                <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{background:theme.surface}}>
                  <div className={`border-b px-4 py-3 text-[14px] ${borderClass}`} style={{color:theme.text}}>Résumé</div>
                  <div className="space-y-3 p-4">
                    <InfoRow label="Client" value={client?.nom||'—'}/>
                    <div className="h-px" style={{background:theme.border}}/>
                    <InfoRow label="Références" value={selectedProduits.length}/>
                    <div className="h-px" style={{background:theme.border}}/>
                    <InfoRow label="Qté totale" value={totalQty}/>
                    <div className="h-px" style={{background:theme.border}}/>
                    <InfoRow label="Total HT" value={formatMoney(totalHT)}/>
                    <div className="h-px" style={{background:theme.border}}/>
                    <InfoRow label="TVA (20%)" value={formatMoney(totalTVA)}/>
                    <div className="h-px" style={{background:theme.border}}/>
                    <div className={`flex items-end justify-between rounded-xl border px-4 py-3.5 ${borderClass}`} style={{background:theme.primaryBg,borderColor:theme.primaryBorder}}>
                      <span className="text-[13px] uppercase tracking-wider" style={{color:theme.primary}}>Total TTC</span>
                      <span className="text-[20px] font-bold" style={{color:theme.primary}}>{formatMoney(totalTTC)}</span>
                    </div>
                  </div>
                </div>

                {(!selectedClientId||!selectedProduits.length)&&(
                  <div className="flex items-start gap-2 rounded-lg border px-3 py-2.5" style={{borderColor:isDark?'rgba(248,113,113,.18)':'#FECACA',background:theme.dangerBg}}>
                    <Lightbulb size={14} className="mt-0.5 shrink-0" style={{color:theme.danger}}/>
                    <div>
                      <p className="text-[13px] font-bold" style={{color:theme.danger}}>À compléter</p>
                      <p className="mt-0.5 text-[13px]" style={{color:theme.muted}}>
                        {!selectedClientId&&'Sélectionnez un client. '}
                        {!selectedProduits.length&&'Ajoutez au moins un produit.'}
                      </p>
                    </div>
                  </div>
                )}

                {client&&(
                  <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{background:theme.surface}}>
                    <div className={`border-b px-4 py-3 text-[14px] ${borderClass}`} style={{color:theme.text}}>Client sélectionné</div>
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-indigo-50 dark:border-slate-700 dark:bg-indigo-500/10">
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{client.nom?.[0]?.toUpperCase()||'?'}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-semibold" style={{color:theme.text}}>{client.nom}</p>
                          {client.telephone&&<div className="mt-1 flex items-center gap-2 text-[14px]" style={{color:theme.muted}}><Phone size={13}/>{client.telephone}</div>}
                          {client.email&&<div className="mt-1 flex items-center gap-2 text-[14px]" style={{color:theme.muted}}><Mail size={13}/><span className="truncate">{client.email}</span></div>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </aside>

              <div className="min-w-0">
                <div className={`overflow-hidden rounded-xl border ${borderClass}`}>
                  <div className="p-4">
                    <div className="grid grid-cols-1 gap-3.5">
                      <div>
                        <label className="mb-1.5 block text-[12px] uppercase tracking-wider" style={{color:theme.muted}}>Client <span style={{color:theme.danger}}>*</span></label>
                        <SearchableDropdown options={clients} value={selectedClientId} onChange={onClientChange} placeholder="Rechercher un client..." isDark={isDark} theme={theme}/>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[12px] uppercase tracking-wider" style={{color:theme.muted}}>Coordonnées</label>
                        <div className={`flex min-h-9 flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg border px-3 ${borderClass}`} style={{background:isDark?'#111827':'#F8FAFC'}}>
                          {client?<>{client.telephone&&<span className="flex items-center gap-1.5 text-[14px]" style={{color:theme.text}}><Phone size={12}/>{client.telephone}</span>}{client.email&&<span className="flex min-w-0 items-center gap-1.5 text-[14px]" style={{color:theme.text}}><Mail size={12}/><span className="truncate">{client.email}</span></span>}{!client.telephone&&!client.email&&<span style={{color:theme.muted}}>Aucune coordonnée</span>}</>:<span style={{color:theme.muted}}>Sélectionnez un client</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`border-t ${borderClass}`}>
                    <CommandesProductSelector
                      produits={produits}
                      selectedProduits={selectedProduits}
                      onAddProduit={onAddProduit}
                      onUpdateQuantite={onUpdateQuantite}
                      onRemoveProduit={onRemoveProduit}
                      onClearPanier={onClearPanier}
                      theme={theme}
                      isDark={isDark}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        <footer className={`flex shrink-0 items-center justify-end gap-2 border-t px-5 py-3 sm:px-6 ${borderClass}`} style={{background:theme.surfaceSoft}}>
          <button type="button" onClick={onClose} className={`h-9 rounded-lg border px-4 text-[14px] font-medium ${borderClass}`} style={{color:theme.text}}>Fermer</button>
          <button type="button" disabled={!selectedClientId||!selectedProduits.length} onClick={()=>formRef.current?.requestSubmit()}
            className="flex h-9 items-center gap-2 rounded-lg px-4 text-[14px] font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            style={{background:theme.primary}}>
            <CheckCircle size={14}/>Valider la commande
          </button>
        </footer>
      </div>
    </div>
  );

  return createPortal(modal,document.body);
};

export default CommandesModalForm;