// ============================================================
// src/components/ventes/VentesProductSelector.tsx
// ⭐ PREMIUM PRODUCT SELECTOR (MITOVY AMIN'NY COMMANDES)
// ⭐ DARK + LIGHT MODE (INDIGO THEME)
// ⭐ FIX: Misy ny decrementQuantity sy incrementQuantity
// ⭐ FIX: ESRINA NY ICON REHETRA AFA-TSY NY BOUTON
// ============================================================
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Package, Plus, XCircle, ShoppingCart, Hash, Minus, Trash2, AlertTriangle, Search, Check, Boxes } from 'lucide-react';
import { formatMoney } from '../../lib/formatMoney';

interface Produit { id: number; nom: string; code: string; prix_vente: number; quantite_stock: number; unite?: string; image?: string; categorie_nom?: string; }
interface SelectedProduct { id: number; quantite: number; prix_unitaire: number; total: number; }
interface VentesProductSelectorProps {
  produits: Produit[];
  selectedProduits: SelectedProduct[];
  onAddProduit: (id: number, quantite: number, prix_unitaire: number) => void;
  onUpdateQuantite: (id: number, quantite: number) => void;
  onRemoveProduit: (id: number) => void;
  onClearPanier: () => void;
  theme: any;
  isDark: boolean;
}

// ⭐ FIX: Manivana ho "Produit fini" fotsiny
const filterProduitsFinis = (produits: Produit[]): Produit[] => {
  return produits.filter(p => {
    const categorie = (p.categorie_nom || '').toLowerCase();
    return categorie === 'produit fini' || categorie === 'produits finis' || categorie === 'patisserie' || categorie === 'glace';
  });
};

const ProductSearchDropdown: React.FC<{ options: Produit[]; value: string; onChange: (id: string) => void; placeholder: string; isDark: boolean; theme: any }> = ({ options, value, onChange, placeholder, isDark, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false); };
    const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false); };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => { document.removeEventListener('mousedown', handleOutside); document.removeEventListener('keydown', handleEscape); };
  }, []);

  const filteredOptions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return options.slice(0, 100);
    return options.filter((product) => {
      const nom = product.nom?.toLowerCase() || '';
      const code = product.code?.toLowerCase() || '';
      return nom.includes(term) || code.includes(term);
    }).slice(0, 100);
  }, [options, searchTerm]);

  const selectedOption = options.find((product) => String(product.id) === value);
  const handleSelect = (id: string) => { onChange(id); setSearchTerm(''); setIsOpen(false); };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="relative">
        <input type="text" value={isOpen ? searchTerm : selectedOption ? `${selectedOption.nom} (${selectedOption.code})` : ''} onChange={(event) => { setSearchTerm(event.target.value); setIsOpen(true); }} onFocus={() => setIsOpen(true)} placeholder={placeholder} className={`h-9 w-full rounded-lg border px-3 pr-9 text-[14px] font-medium outline-none transition-all duration-150 ${isDark ? 'border-slate-700 bg-[#0F172A] text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10' : 'border-gray-300 bg-white text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10'}`} />
        <Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        {selectedOption && !isOpen && (
          <button type="button" onClick={() => { onChange(''); setSearchTerm(''); setIsOpen(false); }} className="absolute right-8 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">×</button>
        )}
      </div>
      {isOpen && (
        <div className="absolute left-0 right-0 z-[80] mt-1 max-h-60 overflow-y-auto rounded-lg border py-1 shadow-xl" style={{ background: isDark ? '#0F172A' : '#FFFFFF', borderColor: theme.border }}>
          {filteredOptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
              <Package size={20} className="mb-2 text-slate-400" />
              <p className="text-[14px] font-medium text-slate-500 dark:text-slate-400">Aucun produit fini trouvé</p>
            </div>
          ) : (
            filteredOptions.map((product) => {
              const isSelected = String(product.id) === value;
              return (
                <button key={product.id} type="button" onClick={() => handleSelect(String(product.id))} className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/70'}`}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"><Package size={15} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold text-slate-800 dark:text-slate-200">{product.nom}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-[12px] text-slate-400 dark:text-slate-500">
                      <span>{product.code}</span>
                      <span>•</span>
                      <span>Stock: {product.quantite_stock}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-[14px] font-bold text-indigo-600 dark:text-indigo-400">{formatMoney(product.prix_vente)}</div>
                    {isSelected && <Check size={15} className="ml-auto mt-0.5 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const VentesProductSelector: React.FC<VentesProductSelectorProps> = ({ produits, selectedProduits, onAddProduit, onUpdateQuantite, onRemoveProduit, onClearPanier, theme, isDark }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantityValue, setQuantityValue] = useState('1');
  const [productImages, setProductImages] = useState<Record<number, string | null>>({});
  const [stockMessage, setStockMessage] = useState('');
  const produitsDisponibles = useMemo(() => filterProduitsFinis(produits).filter((product) => Number(product.quantite_stock) > 0), [produits]);
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';

  // ⭐ FIX: CACHE IMAGES
  const imagesLoaded = useRef<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const loadImages = async () => {
      const selectedProducts = selectedProduits
        .map((item) => produits.find((product) => product.id === item.id))
        .filter((product): product is Produit => Boolean(product))
        .filter((product) => Boolean(product.image))
        .filter((product) => !imagesLoaded.current.has(product.id));

      for (const product of selectedProducts) {
        if (cancelled) continue;
        try {
          if (!window.api?.images?.getUrl) continue;
          const result = await window.api.images.getUrl(product.image);
          if (cancelled || !result?.success || !result.data) continue;
          const separator = result.data.includes('?') ? '&' : '?';
          imagesLoaded.current.add(product.id);
          setProductImages((previous) => {
            if (previous[product.id]) return previous;
            return { ...previous, [product.id]: `${result.data}${separator}t=${Date.now()}` };
          });
        } catch (error) {
          console.error('Erreur chargement image:', error);
          imagesLoaded.current.add(product.id);
        }
      }
    };
    loadImages();
    return () => { cancelled = true; };
  }, [selectedProduits, produits]);

  const removeRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    selectedProduits.forEach((item) => {
      const product = produits.find((p) => p.id === item.id);
      if (!product || product.quantite_stock <= 0) {
        if (!removeRef.current.has(item.id)) {
          removeRef.current.add(item.id);
          onRemoveProduit(item.id);
        }
      }
    });
    const currentIds = new Set(selectedProduits.map((item) => item.id));
    removeRef.current.forEach((id) => { if (!currentIds.has(id)) removeRef.current.delete(id); });
  }, [produits, selectedProduits, onRemoveProduit]);

  // ⭐ FIX: Misy ny decrementQuantity sy incrementQuantity
  const normalizeQuantity = (value: string) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed < 1) return '1';
    return String(parsed);
  };
  const incrementQuantity = () => { const current = Number.parseInt(quantityValue, 10) || 1; setQuantityValue(String(current + 1)); };
  const decrementQuantity = () => { const current = Number.parseInt(quantityValue, 10) || 1; setQuantityValue(normalizeQuantity(String(current - 1))); };

  const handleAdd = () => {
    setStockMessage('');
    const productId = Number(selectedProductId);
    if (!productId) return;
    const product = produits.find((item) => item.id === productId);
    if (!product || product.quantite_stock <= 0) {
      setStockMessage('Ce produit fini est en rupture de stock.');
      return;
    }
    const quantity = Number.parseInt(quantityValue, 10);
    if (!Number.isFinite(quantity) || quantity < 1) {
      setStockMessage('La quantité doit être supérieure à 0.');
      return;
    }
    const existing = selectedProduits.find((item) => item.id === productId);
    const finalQuantity = existing ? existing.quantite + quantity : quantity;
    if (finalQuantity > product.quantite_stock) {
      setStockMessage(`Stock insuffisant. Disponible : ${product.quantite_stock}.`);
      return;
    }
    if (existing) onUpdateQuantite(productId, finalQuantity);
    else onAddProduit(productId, quantity, product.prix_vente);
    setSelectedProductId('');
    setQuantityValue('1');
    setStockMessage('');
  };

  const totalPanier = useMemo(() => selectedProduits.reduce((total, item) => total + (item.total || 0), 0), [selectedProduits]);
  const totalQuantite = useMemo(() => selectedProduits.reduce((total, item) => total + item.quantite, 0), [selectedProduits]);

  return (
    <div className="overflow-hidden bg-white dark:bg-[#0F172A]">
      {/* PRODUCT ADD SECTION */}
      <div className={`border-b ${borderClass}`}>
        <div className="flex items-center justify-between gap-3 bg-slate-50/70 px-5 py-3 dark:bg-[#111c30]">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><Package size={16} /></div>
            <div className="min-w-0">
              <h3 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">Ajouter un produit fini</h3>
              <p className="mt-0.5 truncate text-[12px] text-slate-500 dark:text-slate-400">Recherchez un produit fini et indiquez la quantité.</p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-[12px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"><Boxes size={12} />{produitsDisponibles.length}</span>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-[minmax(0,1fr)_120px_110px]">
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Produit</label>
            <ProductSearchDropdown options={produitsDisponibles} value={selectedProductId} onChange={setSelectedProductId} placeholder="Rechercher un produit fini..." isDark={isDark} theme={theme} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Quantité</label>
            <div className={`flex h-9 items-center overflow-hidden rounded-lg border ${borderClass}`} style={{ background: isDark ? '#0F172A' : '#FFFFFF' }}>
              <button type="button" onClick={decrementQuantity} className="flex h-full w-8 items-center justify-center text-slate-400 transition-colors hover:bg-slate-50 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400"><Minus size={13} /></button>
              <input type="number" min="1" value={quantityValue} onChange={(event) => { const value = event.target.value; if (value === '') { setQuantityValue(''); return; } const parsed = Number.parseInt(value, 10); if (Number.isFinite(parsed) && parsed >= 1) setQuantityValue(String(parsed)); }} onBlur={() => setQuantityValue(normalizeQuantity(quantityValue))} className="h-full min-w-0 flex-1 border-x border-slate-200 bg-transparent text-center text-[14px] font-semibold text-slate-800 outline-none dark:border-slate-700 dark:text-slate-100" />
              <button type="button" onClick={incrementQuantity} className="flex h-full w-8 items-center justify-center text-slate-400 transition-colors hover:bg-slate-50 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400"><Plus size={13} /></button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Action</label>
            <button type="button" onClick={handleAdd} disabled={!selectedProductId} className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500">
              <Plus size={14} />Ajouter
            </button>
          </div>
        </div>
        {stockMessage && (
          <div className="mx-4 mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
            <AlertTriangle size={14} className="shrink-0" /><span>{stockMessage}</span>
          </div>
        )}
      </div>

      {/* CART SECTION */}
      <div className="bg-white dark:bg-[#0F172A]">
        <div className={`flex items-center justify-between gap-3 border-b px-5 py-3 bg-white dark:bg-[#0F172A] ${borderClass}`}>
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><ShoppingCart size={16} /></div>
            <div className="min-w-0">
              <h3 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">Panier actuel</h3>
              <span className="block truncate text-[12px] text-slate-500 dark:text-slate-400">{selectedProduits.length} réf. · {totalQuantite} art.</span>
            </div>
          </div>
          {selectedProduits.length > 0 && (
            <button type="button" onClick={onClearPanier} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400">
              <Trash2 size={13} />Vider
            </button>
          )}
        </div>

        <div className={`hidden grid-cols-12 border-b bg-slate-50/70 px-5 py-2 text-[12px] font-bold uppercase tracking-wider text-slate-400 dark:bg-[#111C30] md:grid ${borderClass}`}>
          <div className="col-span-4">Produit</div>
          <div className="col-span-2 text-right">Prix</div>
          <div className="col-span-2 text-center">Qté</div>
          <div className="col-span-2 text-right">Total</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        {selectedProduits.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500"><ShoppingCart size={19} /></div>
            <h4 className="text-[14px] font-semibold text-slate-800 dark:text-slate-200">Aucun produit dans le panier</h4>
            <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">Ajoutez des produits finis pour commencer.</p>
          </div>
        ) : (
          <div className="max-h-[280px] overflow-y-auto custom-command-cart-scrollbar">
            {selectedProduits.map((item) => {
              const product = produits.find((p) => p.id === item.id);
              const isRupture = !product || product.quantite_stock <= 0;
              const total = product ? product.prix_vente * item.quantite : 0;
              const imageUrl = productImages[item.id];
              return (
                <div key={item.id} className={`group grid grid-cols-1 gap-3 border-b px-5 py-3.5 transition-colors hover:bg-slate-50/70 md:grid-cols-12 md:items-center dark:hover:bg-[#1e293b] ${borderClass} ${isRupture ? 'bg-rose-50/40 dark:bg-rose-500/5' : ''}`}>
                  <div className="col-span-4 flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-slate-50 dark:bg-slate-800" style={{ borderColor: theme.border }}>
                      {imageUrl ? <img src={imageUrl} alt={product?.nom || 'Produit'} className="h-full w-full object-cover" /> : <Package size={15} className="text-indigo-500 dark:text-indigo-400" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-slate-800 dark:text-slate-200">{product ? product.nom : 'Produit indisponible'}</p>
                      {product ? (
                        <span className="mt-0.5 block truncate font-mono text-[12px] text-slate-400 dark:text-slate-500">{product.code}</span>
                      ) : (
                        <span className="mt-0.5 flex items-center gap-1 text-[12px] font-semibold text-rose-500"><AlertTriangle size={11} />Rupture</span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 text-right text-[14px] font-medium text-slate-700 dark:text-slate-300">{product ? formatMoney(product.prix_vente) : '—'}</div>
                  <div className="col-span-2">
                    {!isRupture ? (
                      <div className="mx-auto flex h-7 w-fit items-center overflow-hidden rounded-md border bg-white dark:bg-[#0F172A]" style={{ borderColor: theme.border }}>
                        <button type="button" disabled={item.quantite <= 1} onClick={() => { if (item.quantite > 1) onUpdateQuantite(item.id, item.quantite - 1); }} className="flex h-full w-7 items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-slate-800"><Minus size={12} /></button>
                        <span className="flex h-full min-w-[28px] items-center justify-center border-x border-slate-200 text-[13px] font-bold text-slate-800 dark:border-slate-700 dark:text-slate-200">{item.quantite}</span>
                        <button type="button" disabled={item.quantite >= (product?.quantite_stock || 0)} onClick={() => { if (product && item.quantite + 1 <= product.quantite_stock) onUpdateQuantite(item.id, item.quantite + 1); }} className="flex h-full w-7 items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-slate-800"><Plus size={12} /></button>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center text-[12px] font-bold text-rose-500">Rupture</span>
                    )}
                  </div>
                  <div className="col-span-2 text-right text-[14px] font-bold text-indigo-600 dark:text-indigo-400">{!isRupture ? formatMoney(total) : '—'}</div>
                  <div className="col-span-2 flex justify-end">
                    <button type="button" onClick={() => onRemoveProduit(item.id)} className="rounded-lg p-1.5 text-slate-400 opacity-60 transition-all hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"><XCircle size={15} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedProduits.length > 0 && (
          <div className={`flex items-center justify-between border-t bg-slate-50/70 px-5 py-3 dark:bg-[#111C30] ${borderClass}`}>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">Total</span>
              <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[12px] font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">{totalQuantite} art.</span>
            </div>
            <span className="text-[18px] font-bold tracking-tight text-slate-900 dark:text-white">{formatMoney(totalPanier)}</span>
          </div>
        )}
      </div>

      <style>{`
        .custom-command-cart-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-command-cart-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-command-cart-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.22); border-radius: 999px; }
        .custom-command-cart-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.38); }
      `}</style>
    </div>
  );
};

export default VentesProductSelector;