import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Package,Plus,XCircle,ShoppingCart,Minus,Trash2,AlertTriangle,Search,Check,Boxes} from 'lucide-react';
import {formatMoney} from '../../lib/formatMoney';

interface Produit{id:number;nom:string;code:string;prix_vente:number;quantite_stock:number;unite?:string;image?:string}
interface SelectedProduct{id:number;quantite:number}
interface Props{
  produits:Produit[];selectedProduits:SelectedProduct[];
  onAddProduit:(id:number,quantite:number)=>void;
  onUpdateQuantite:(id:number,quantite:number)=>void;
  onRemoveProduit:(id:number)=>void;onClearPanier:()=>void;
  theme:any;isDark:boolean
}

const ProductSearchDropdown:React.FC<{
  options:Produit[];value:string;onChange:(id:string)=>void;
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
    return options.filter(p=>p.nom?.toLowerCase().includes(t)||p.code?.toLowerCase().includes(t)).slice(0,100);
  },[options,search]);

  const selected=options.find(p=>String(p.id)===value);

  return(
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <input value={open?search:selected?`${selected.nom} (${selected.code})`:''}
          onChange={e=>{setSearch(e.target.value);setOpen(true)}}
          onFocus={()=>setOpen(true)} placeholder={placeholder}
          className={`h-9 w-full rounded-lg border px-3 pr-9 text-[14px] font-medium outline-none ${isDark?'border-slate-700 bg-[#0F172A] text-slate-100 placeholder:text-slate-500':'border-gray-300 bg-white text-slate-800 placeholder:text-slate-400'} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10`}/>
        <Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"/>
        {selected&&!open&&<button type="button" onClick={()=>{onChange('');setSearch('')}} className="absolute right-8 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600">×</button>}
      </div>

      {open&&(
        <div className="absolute left-0 right-0 z-[80] mt-1 max-h-60 overflow-y-auto rounded-lg border py-1 shadow-xl" style={{background:isDark?'#0F172A':'#FFF',borderColor:theme.border}}>
          {!filtered.length?<div className="px-4 py-8 text-center text-[14px] text-slate-500">Aucun produit trouvé</div>:
          filtered.map(product=>{
            const active=String(product.id)===value;
            return(
              <button key={product.id} type="button" onClick={()=>{onChange(String(product.id));setSearch('');setOpen(false)}}
                className={`flex w-full items-center gap-3 px-3 py-3 text-left ${active?'bg-indigo-50 dark:bg-indigo-500/10':'hover:bg-slate-50 dark:hover:bg-slate-800/70'}`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"><Package size={15}/></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-semibold text-slate-800 dark:text-slate-200">{product.nom}</div>
                  <div className="mt-0.5 flex gap-2 text-[12px] text-slate-400"><span>{product.code}</span><span>•</span><span>Stock: {product.quantite_stock}</span></div>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-bold text-indigo-600 dark:text-indigo-400">{formatMoney(product.prix_vente)}</div>
                  {active&&<Check size={15} className="ml-auto text-indigo-600"/>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CommandesProductSelector:React.FC<Props>=({
  produits,selectedProduits,onAddProduit,onUpdateQuantite,onRemoveProduit,onClearPanier,theme,isDark
})=>{
  const[selectedProductId,setSelectedProductId]=useState('');
  const[quantityValue,setQuantityValue]=useState('1');
  const[productImages,setProductImages]=useState<Record<number,string|null>>({});
  const[stockMessage,setStockMessage]=useState('');
  const loaded=useRef<Set<number>>(new Set());
  const removeRef=useRef<Set<number>>(new Set());
  const borderClass=isDark?'border-slate-700':'border-gray-300';

  const disponibles=useMemo(()=>produits.filter(p=>Number(p.quantite_stock)>0),[produits]);

  useEffect(()=>{
    let cancelled=false;
    const load=async()=>{
      const list=selectedProduits
        .map(i=>produits.find(p=>p.id===i.id))
        .filter((p):p is Produit=>Boolean(p?.image))
        .filter(p=>!loaded.current.has(p.id));

      for(const product of list){
        if(cancelled)break;
        try{
          if(!window.api?.images?.getUrl)continue;
          const result=await window.api.images.getUrl(product.image);
          if(cancelled||!result?.success||!result.data)continue;
          loaded.current.add(product.id);
          setProductImages(prev=>prev[product.id]?prev:{...prev,[product.id]:result.data});
        }catch(error){
          console.error('Erreur chargement image:',error);
          loaded.current.add(product.id);
        }
      }
    };
    load();
    return()=>{cancelled=true};
  },[selectedProduits,produits]);

  useEffect(()=>{
    selectedProduits.forEach(item=>{
      const p=produits.find(x=>x.id===item.id);
      if(!p||p.quantite_stock<=0&&!removeRef.current.has(item.id)){
        removeRef.current.add(item.id);
        onRemoveProduit(item.id);
      }
    });
    const ids=new Set(selectedProduits.map(i=>i.id));
    removeRef.current.forEach(id=>{if(!ids.has(id))removeRef.current.delete(id)});
  },[produits,selectedProduits,onRemoveProduit]);

  const normalize=(v:string)=>{
    const n=Number.parseInt(v,10);
    return Number.isFinite(n)&&n>=1?String(n):'1';
  };

  const add=()=>{
    setStockMessage('');
    const id=Number(selectedProductId);
    const p=produits.find(x=>x.id===id);
    const qty=Number.parseInt(quantityValue,10);
    if(!id)return;
    if(!p||p.quantite_stock<=0)return setStockMessage('Ce produit est actuellement en rupture de stock.');
    if(!Number.isFinite(qty)||qty<1)return setStockMessage('La quantité doit être supérieure à 0.');
    const existing=selectedProduits.find(i=>i.id===id);
    const finalQty=existing?existing.quantite+qty:qty;
    if(finalQty>p.quantite_stock)return setStockMessage(`Stock insuffisant. Disponible : ${p.quantite_stock}.`);
    existing?onUpdateQuantite(id,finalQty):onAddProduit(id,qty);
    setSelectedProductId('');
    setQuantityValue('1');
  };

  const total=useMemo(()=>selectedProduits.reduce((sum,item)=>{
    const p=produits.find(x=>x.id===item.id);
    return p?sum+p.prix_vente*item.quantite:sum;
  },0),[produits,selectedProduits]);

  const totalQty=selectedProduits.reduce((sum,i)=>sum+i.quantite,0);

  return(
    <div className="overflow-hidden bg-white dark:bg-[#0F172A]">

      <div className={`border-b ${borderClass}`}>
        <div className="flex items-center justify-between gap-3 bg-slate-50/70 px-5 py-3 dark:bg-[#111c30]">
          <div>
            <h3 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">Ajouter un produit</h3>
            <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">Recherchez un produit et indiquez la quantité.</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-[12px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            <Boxes size={12}/>{disponibles.length}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-[minmax(0,1fr)_120px_110px]">
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-500">Produit</label>
            <ProductSearchDropdown options={disponibles} value={selectedProductId} onChange={setSelectedProductId} placeholder="Rechercher un produit..." isDark={isDark} theme={theme}/>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-500">Quantité</label>
            <div className={`flex h-9 items-center overflow-hidden rounded-lg border ${borderClass}`} style={{background:isDark?'#0F172A':'#FFF'}}>
              <button type="button" onClick={()=>setQuantityValue(normalize(String((Number.parseInt(quantityValue,10)||1)-1)))} className="flex h-full w-8 items-center justify-center text-slate-400 hover:text-indigo-600"><Minus size={13}/></button>
              <input type="number" min="1" value={quantityValue}
                onChange={e=>{const v=e.target.value;if(v==='')return setQuantityValue('');const n=Number.parseInt(v,10);if(Number.isFinite(n)&&n>=1)setQuantityValue(String(n))}}
                onBlur={()=>setQuantityValue(normalize(quantityValue))}
                className="h-full min-w-0 flex-1 border-x border-slate-200 bg-transparent text-center text-[14px] font-semibold outline-none dark:border-slate-700 dark:text-slate-100"/>
              <button type="button" onClick={()=>setQuantityValue(String((Number.parseInt(quantityValue,10)||1)+1))} className="flex h-full w-8 items-center justify-center text-slate-400 hover:text-indigo-600"><Plus size={13}/></button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-500">Action</label>
            <button type="button" onClick={add} disabled={!selectedProductId} className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 text-[13px] font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:bg-indigo-500 dark:disabled:bg-slate-800">
              <Plus size={14}/>Ajouter
            </button>
          </div>
        </div>

        {stockMessage&&<div className="mx-4 mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"><AlertTriangle size={14}/>{stockMessage}</div>}
      </div>

      <div>
        <div className={`flex items-center justify-between border-b px-5 py-3 ${borderClass}`}>
          <div>
            <h3 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">Panier actuel</h3>
            <span className="text-[12px] text-slate-500">{selectedProduits.length} réf. · {totalQty} art.</span>
          </div>
          {selectedProduits.length>0&&<button type="button" onClick={onClearPanier} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={13}/>Vider</button>}
        </div>

        <div className={`hidden grid-cols-12 border-b bg-slate-50/70 px-5 py-2 text-[12px] font-bold uppercase tracking-wider text-slate-400 dark:bg-[#111C30] md:grid ${borderClass}`}>
          <div className="col-span-4">Produit</div><div className="col-span-2 text-right">Prix</div><div className="col-span-2 text-center">Qté</div><div className="col-span-2 text-right">Total</div><div className="col-span-2 text-right">Action</div>
        </div>

        {!selectedProduits.length?
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-slate-400 dark:bg-slate-800"><ShoppingCart size={19}/></div>
            <h4 className="text-[14px] font-semibold text-slate-800 dark:text-slate-200">Aucun produit dans le panier</h4>
            <p className="mt-1 text-[13px] text-slate-500">Ajoutez des produits pour commencer.</p>
          </div>
        :
          <div className="max-h-[280px] overflow-y-auto custom-command-cart-scrollbar">
            {selectedProduits.map(item=>{
              const p=produits.find(x=>x.id===item.id);
              const rupture=!p||p.quantite_stock<=0;
              const lineTotal=p?p.prix_vente*item.quantite:0;

              return(
                <div key={item.id} className={`group grid grid-cols-1 gap-3 border-b px-5 py-3.5 md:grid-cols-12 md:items-center ${borderClass} ${rupture?'bg-rose-50/40 dark:bg-rose-500/5':'hover:bg-slate-50/70 dark:hover:bg-[#1e293b]'}`}>
                  <div className="col-span-4 flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-slate-50 dark:bg-slate-800" style={{borderColor:theme.border}}>
                      {productImages[item.id]?<img src={productImages[item.id]!} alt={p?.nom||'Produit'} className="h-full w-full object-cover"/>:<Package size={15} className="text-indigo-500"/>}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-slate-800 dark:text-slate-200">{p?.nom||'Produit indisponible'}</p>
                      {p?<span className="font-mono text-[12px] text-slate-400">{p.code}</span>:<span className="flex items-center gap-1 text-[12px] font-semibold text-rose-500"><AlertTriangle size={11}/>Rupture</span>}
                    </div>
                  </div>

                  <div className="col-span-2 text-right text-[14px] text-slate-700 dark:text-slate-300">{p?formatMoney(p.prix_vente):'—'}</div>

                  <div className="col-span-2">
                    {!rupture?
                      <div className="mx-auto flex h-7 w-fit items-center overflow-hidden rounded-md border bg-white dark:bg-[#0F172A]" style={{borderColor:theme.border}}>
                        <button type="button" disabled={item.quantite<=1} onClick={()=>item.quantite>1&&onUpdateQuantite(item.id,item.quantite-1)} className="flex h-full w-7 items-center justify-center text-slate-400 hover:text-indigo-600 disabled:opacity-30"><Minus size={12}/></button>
                        <span className="flex h-full min-w-[28px] items-center justify-center border-x border-slate-200 text-[13px] font-bold dark:border-slate-700 dark:text-slate-200">{item.quantite}</span>
                        <button type="button" disabled={item.quantite>=(p?.quantite_stock||0)} onClick={()=>p&&item.quantite+1<=p.quantite_stock&&onUpdateQuantite(item.id,item.quantite+1)} className="flex h-full w-7 items-center justify-center text-slate-400 hover:text-indigo-600 disabled:opacity-30"><Plus size={12}/></button>
                      </div>
                    :<span className="flex justify-center text-[12px] font-bold text-rose-500">Rupture</span>}
                  </div>

                  <div className="col-span-2 text-right text-[14px] font-bold text-indigo-600 dark:text-indigo-400">{rupture?'—':formatMoney(lineTotal)}</div>

                  <div className="col-span-2 flex justify-end">
                    <button type="button" onClick={()=>onRemoveProduit(item.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"><XCircle size={15}/></button>
                  </div>
                </div>
              );
            })}
          </div>
        }

        {selectedProduits.length>0&&
          <div className={`flex items-center justify-between border-t bg-slate-50/70 px-5 py-3 dark:bg-[#111C30] ${borderClass}`}>
            <div className="flex items-center gap-2"><span className="text-[13px] font-semibold text-slate-500">Total</span><span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[12px] font-bold text-indigo-600">{totalQty} art.</span></div>
            <span className="text-[18px] font-bold text-slate-900 dark:text-white">{formatMoney(total)}</span>
          </div>
        }
      </div>

      <style>{`.custom-command-cart-scrollbar::-webkit-scrollbar{width:6px;height:6px}.custom-command-cart-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-command-cart-scrollbar::-webkit-scrollbar-thumb{background:rgba(100,116,139,.22);border-radius:999px}.custom-command-cart-scrollbar::-webkit-scrollbar-thumb:hover{background:rgba(100,116,139,.38)}`}</style>
    </div>
  );
};

export default CommandesProductSelector;