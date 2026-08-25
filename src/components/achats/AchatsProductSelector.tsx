// src/components/achats/AchatsProductSelector.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Package, Plus, XCircle, ShoppingCart, Minus, Trash2, Search, Check, Boxes } from 'lucide-react';

interface Produit { id: number; nom: string; code: string; prix_achat: number; quantite_stock: number; unite?: string; image?: string; categorie_nom?: string; categorie_id?: number | null; }
interface SelectedProduct { id: number; quantite: number; prix_unitaire: number; total: number; }
interface AchatsProductSelectorProps { produits: Produit[]; selectedProduits: SelectedProduct[]; onAddProduit: (id: number, quantite: number) => void; onUpdateQuantite: (id: number, quantite: number) => void; onRemoveProduit: (id: number) => void; onClearPanier: () => void; theme: any; isDark: boolean; }

const isIngredient = (product: Produit) => {
  const categorie = String(product.categorie_nom || '').trim().toLowerCase();
  return product.categorie_id === 1 || categorie === 'akora' || categorie === 'ingredients' || categorie === 'ingrédients' || categorie === 'matières premières' || categorie === 'matieres premieres';
};

const ProductSearchDropdown: React.FC<{ options: Produit[]; value: string; onChange: (id: string) => void; placeholder: string; isDark: boolean; theme: any; }> = ({ options, value, onChange, placeholder, isDark, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    return options.filter((product) => { const nom = String(product.nom || '').toLowerCase(); const code = String(product.code || '').toLowerCase(); return nom.includes(term) || code.includes(term); }).slice(0, 100);
  }, [options, searchTerm]);

  const selectedOption = options.find((product) => String(product.id) === value);
  const handleSelect = (id: string) => { onChange(id); setSearchTerm(''); setIsOpen(false); };

  // ⭐ FIX: Format Ariary tsotra
  const formatAriary = (value: number) => `${Number(value || 0).toLocaleString('fr-FR')} Ar`;

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="relative">
        <input type="text" value={isOpen ? searchTerm : selectedOption ? `${selectedOption.nom} (${selectedOption.code})` : ''} onChange={(event) => { setSearchTerm(event.target.value); setIsOpen(true); }} onFocus={() => setIsOpen(true)} placeholder={placeholder} className={`h-9 w-full rounded-lg border px-3 pr-9 text-[14px] font-normal outline-none transition-all ${isDark ? 'border-white/[0.07] bg-[#0F172A] text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10' : 'border-slate-200 bg-white text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10'}`} />
        <Search size={15} strokeWidth={1.8} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>
      {isOpen && (
        <div className="absolute left-0 right-0 z-[999] mt-1 max-h-60 overflow-y-auto rounded-lg border py-1 shadow-xl" style={{ background: isDark ? '#0F172A' : '#FFFFFF', borderColor: theme.border }}>
          {filteredOptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-8 text-center"><Package size={19} strokeWidth={1.6} className="mb-2 text-slate-400" /><p className="text-[13px] font-normal text-slate-500 dark:text-slate-400">Aucun ingrédient trouvé</p></div>
          ) : (
            filteredOptions.map((product) => {
              const isSelected = String(product.id) === value;
              return (
                <button key={product.id} type="button" onClick={() => handleSelect(String(product.id))} className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/70'}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}><Package size={14} strokeWidth={1.7} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-medium text-slate-800 dark:text-slate-200">{product.nom}</div>
                    <div className="mt-0.5 flex min-w-0 items-center gap-2 text-[12px] text-slate-400 dark:text-slate-500"><span className="truncate">{product.code}</span><span>•</span><span className="truncate">Stock : {product.quantite_stock} {product.unite || 'pièce'}</span></div>
                  </div>
                  <div className="shrink-0 text-right">
                    {/* ⭐ FIX: Esorina ny formatMoney */}
                    <div className="text-[14px] font-semibold text-indigo-600 dark:text-indigo-400">{formatAriary(Number(product.prix_achat) || 0)}</div>
                    {isSelected && <Check size={14} strokeWidth={2} className="ml-auto mt-0.5 text-indigo-600 dark:text-indigo-400" />}
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

const AchatsProductSelector: React.FC<AchatsProductSelectorProps> = ({ produits, selectedProduits, onAddProduit, onUpdateQuantite, onRemoveProduit, onClearPanier, theme, isDark }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantityValue, setQuantityValue] = useState('1');
  const [productImages, setProductImages] = useState<Record<number, string | null>>({});
  const [stockMessage, setStockMessage] = useState('');
  const imagesLoaded = useRef<Set<number>>(new Set());
  const removeRef = useRef<Set<number>>(new Set());
  const borderClass = isDark ? 'border-white/[0.07]' : 'border-slate-200';
  const produitsDisponibles = useMemo(() => produits.filter((product) => isIngredient(product) && Number(product.quantite_stock) > 0 && Number(product.prix_achat) >= 0), [produits]);

  useEffect(() => {
    let cancelled = false;
    const loadImages = async () => {
      const selectedProducts = selectedProduits.map((item) => produits.find((product) => product.id === item.id)).filter((product): product is Produit => Boolean(product)).filter((product) => Boolean(product.image)).filter((product) => !imagesLoaded.current.has(product.id));
      for (const product of selectedProducts) {
        if (cancelled) return;
        try {
          if (!window.api?.images?.getUrl || !product.image) continue;
          const result = await window.api.images.getUrl(product.image);
          if (cancelled || !result?.success || !result.data) { imagesLoaded.current.add(product.id); continue; }
          const separator = result.data.includes('?') ? '&' : '?';
          imagesLoaded.current.add(product.id);
          setProductImages((previous) => { if (previous[product.id]) return previous; return { ...previous, [product.id]: `${result.data}${separator}t=${Date.now()}` }; });
        } catch { imagesLoaded.current.add(product.id); }
      }
    };
    loadImages();
    return () => { cancelled = true; };
  }, [selectedProduits, produits]);

  useEffect(() => {
    selectedProduits.forEach((item) => {
      const product = produits.find((p) => p.id === item.id);
      if (!product || !isIngredient(product) || Number(product.quantite_stock) <= 0) {
        if (!removeRef.current.has(item.id)) { removeRef.current.add(item.id); onRemoveProduit(item.id); }
      }
    });
    const currentIds = new Set(selectedProduits.map((item) => item.id));
    removeRef.current.forEach((id) => { if (!currentIds.has(id)) removeRef.current.delete(id); });
  }, [produits, selectedProduits, onRemoveProduit]);

  const safeSelectedProduits = useMemo(() => {
    return selectedProduits.filter((item) => { const product = produits.find((p) => p.id === item.id); return product && isIngredient(product) && Number(product.prix_achat) >= 0; }).map((item) => {
      const product = produits.find((p) => p.id === item.id);
      if (!product) return item;
      const prixUnitaire = Number(product.prix_achat) || 0;
      const quantite = Math.max(1, Number(item.quantite) || 1);
      return { ...item, quantite, prix_unitaire: prixUnitaire, total: prixUnitaire * quantite };
    });
  }, [selectedProduits, produits]);

  const totalPanier = useMemo(() => safeSelectedProduits.reduce((total, item) => total + (Number(item.total) || 0), 0), [safeSelectedProduits]);
  const totalQuantite = useMemo(() => safeSelectedProduits.reduce((total, item) => total + (Number(item.quantite) || 0), 0), [safeSelectedProduits]);

  const handleAdd = () => {
    setStockMessage('');
    const productId = Number(selectedProductId);
    if (!productId) { setStockMessage('Sélectionnez un ingrédient.'); return; }
    const product = produits.find((item) => item.id === productId);
    if (!product || !isIngredient(product)) { setStockMessage('Cet article n’est pas un ingrédient.'); return; }
    const stock = Number(product.quantite_stock) || 0;
    if (stock <= 0) { setStockMessage('Cet ingrédient est en rupture de stock.'); return; }
    const quantity = Number.parseInt(quantityValue, 10);
    if (!Number.isFinite(quantity) || quantity < 1) { setStockMessage('La quantité doit être supérieure à 0.'); return; }
    const existing = safeSelectedProduits.find((item) => item.id === productId);
    const finalQuantity = existing ? existing.quantite + quantity : quantity;
    if (finalQuantity > stock) { setStockMessage(`Stock insuffisant. Disponible : ${stock} ${product.unite || ''}`); return; }
    if (existing) { onUpdateQuantite(productId, finalQuantity); } else { onAddProduit(productId, quantity); }
    setSelectedProductId(''); setQuantityValue('1'); setStockMessage('');
  };

  const decrementInputQuantity = () => { const current = Number(quantityValue) || 1; setQuantityValue(String(Math.max(1, current - 1))); };
  const incrementInputQuantity = () => { const current = Number(quantityValue) || 1; setQuantityValue(String(current + 1)); };

  // ⭐ FIX: Format Ariary tsotra
  const formatAriary = (value: number) => `${Number(value || 0).toLocaleString('fr-FR')} Ar`;

  return (
    <div className="overflow-hidden" style={{ background: theme.surface }}>
      {/* AJOUT PRODUIT */}
      <div className={`border-b ${borderClass}`}>
        <div className="flex items-center justify-between gap-3 px-5 py-3" style={{ background: isDark ? '#111C30' : '#F8FAFC' }}>
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: theme.primaryBg, color: theme.primary }}><Package size={15} strokeWidth={1.8} /></div>
            <div className="min-w-0">
              <h3 className="text-[14px] font-medium" style={{ color: theme.text }}>Ajouter un ingrédient</h3>
              <p className="mt-0.5 truncate text-[12px]" style={{ color: theme.muted }}>Recherchez et sélectionnez un ingrédient.</p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium" style={{ color: theme.primary, background: theme.primaryBg, borderColor: theme.primaryBorder }}><Boxes size={11} strokeWidth={1.8} />{produitsDisponibles.length}</span>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-[minmax(0,1fr)_120px_110px]">
          <ProductSearchDropdown options={produitsDisponibles} value={selectedProductId} onChange={setSelectedProductId} placeholder="Rechercher un ingrédient..." isDark={isDark} theme={theme} />
          <div className="flex h-9 items-center overflow-hidden rounded-lg border" style={{ borderColor: theme.border, background: theme.surface }}>
            <button type="button" onClick={decrementInputQuantity} className="flex h-full w-8 shrink-0 items-center justify-center transition-colors hover:bg-slate-100 dark:hover:bg-slate-800" style={{ color: theme.muted }} aria-label="Diminuer la quantité"><Minus size={13} strokeWidth={2} /></button>
            <input type="number" min="1" value={quantityValue} onChange={(event) => setQuantityValue(event.target.value)} className="h-full min-w-0 flex-1 bg-transparent text-center text-[14px] font-medium outline-none" style={{ color: theme.text }} />
            <button type="button" onClick={incrementInputQuantity} className="flex h-full w-8 shrink-0 items-center justify-center transition-colors hover:bg-slate-100 dark:hover:bg-slate-800" style={{ color: theme.muted }} aria-label="Augmenter la quantité"><Plus size={13} strokeWidth={2} /></button>
          </div>
          <button type="button" onClick={handleAdd} disabled={!selectedProductId} className="flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-[14px] font-medium text-white shadow-sm transition-all hover:shadow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50" style={{ background: theme.primary }}><Plus size={14} strokeWidth={2} />Ajouter</button>
        </div>
        {stockMessage && <div className="mx-4 mb-3 rounded-lg border px-3 py-2 text-[12px]" style={{ color: theme.danger, background: theme.dangerBg, borderColor: theme.dangerBorder }}>{stockMessage}</div>}
      </div>

      {/* PANIER */}
      <div style={{ background: theme.surface }}>
        <div className={`flex items-center justify-between gap-3 border-b px-5 py-3 ${borderClass}`} style={{ background: theme.surface }}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: theme.primaryBg, color: theme.primary }}><ShoppingCart size={15} strokeWidth={1.8} /></div>
            <div>
              <h3 className="text-[14px] font-medium" style={{ color: theme.text }}>Panier actuel</h3>
              <span className="block text-[12px]" style={{ color: theme.muted }}>{safeSelectedProduits.length} réf. · {totalQuantite} art.</span>
            </div>
          </div>
          {safeSelectedProduits.length > 0 && <button type="button" onClick={onClearPanier} className="inline-flex items-center gap-1 text-[12px] font-medium transition-colors hover:text-rose-600" style={{ color: theme.muted }}><Trash2 size={12} strokeWidth={1.8} />Vider</button>}
        </div>

        {/* HEADER TABLE */}
        <div className={`hidden grid-cols-12 border-b px-5 py-2 text-[12px] font-medium uppercase tracking-wide md:grid ${borderClass}`} style={{ background: isDark ? '#111C30' : '#F8FAFC', color: theme.subMuted }}>
          <div className="col-span-4">Produit</div>
          <div className="col-span-2 text-right">Prix</div>
          <div className="col-span-2 text-center">Qté</div>
          <div className="col-span-2 text-right">Total</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        {/* EMPTY */}
        {safeSelectedProduits.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <ShoppingCart size={19} strokeWidth={1.5} className="mb-3 text-slate-400" />
            <h4 className="text-[13px] font-medium" style={{ color: theme.text }}>Aucun produit</h4>
            <p className="mt-1 text-[12px]" style={{ color: theme.muted }}>Ajoutez des ingrédients pour commencer.</p>
          </div>
        ) : (
          <div className="max-h-[280px] overflow-y-auto">
            {safeSelectedProduits.map((item) => {
              const product = produits.find((p) => p.id === item.id);
              if (!product) return null;
              const imageUrl = productImages[item.id];
              const stock = Number(product.quantite_stock) || 0;
              const currentQty = Number(item.quantite) || 1;
              return (
                <div key={item.id} className={`grid grid-cols-12 items-center border-b px-5 py-3 ${borderClass}`}>
                  <div className="col-span-4 flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg" style={{ background: isDark ? '#1E293B' : '#F8FAFC', border: `1px solid ${theme.border}` }}>
                      {imageUrl ? <img src={imageUrl} alt={product.nom} className="h-full w-full object-cover" /> : <Package size={14} strokeWidth={1.6} style={{ color: theme.muted }} />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium" style={{ color: theme.text }} title={product.nom}>{product.nom}</p>
                      <p className="truncate font-mono text-[12px]" style={{ color: theme.subMuted }}>{product.code}</p>
                    </div>
                  </div>
                  {/* ⭐ FIX: Esorina ny formatMoney */}
                  <div className="col-span-2 text-right text-[14px]" style={{ color: theme.text }}>{formatAriary(Number(item.prix_unitaire) || Number(product.prix_achat) || 0)}</div>
                  <div className="col-span-2 flex items-center justify-center gap-1.5">
                    <button type="button" onClick={() => onUpdateQuantite(item.id, Math.max(1, currentQty - 1))} disabled={currentQty <= 1} className="flex h-7 w-7 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800" style={{ borderColor: theme.border, color: theme.muted }} aria-label="Diminuer la quantité"><Minus size={12} strokeWidth={2} /></button>
                    <span className="min-w-[52px] text-center text-[13px] font-medium" style={{ color: theme.text }}>{currentQty} <span style={{ color: theme.muted }}>{product.unite || 'pièce'}</span></span>
                    <button type="button" onClick={() => { if (currentQty < stock) onUpdateQuantite(item.id, currentQty + 1); }} disabled={currentQty >= stock} className="flex h-7 w-7 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800" style={{ borderColor: theme.border, color: theme.muted }} aria-label="Augmenter la quantité"><Plus size={12} strokeWidth={2} /></button>
                  </div>
                  {/* ⭐ FIX: Esorina ny formatMoney */}
                  <div className="col-span-2 text-right text-[14px] font-semibold" style={{ color: theme.primary }}>{formatAriary(Number(item.total) || 0)}</div>
                  <div className="col-span-2 text-right">
                    <button type="button" onClick={() => onRemoveProduit(item.id)} className="inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" style={{ color: theme.subMuted }} title="Retirer" aria-label="Retirer du panier"><XCircle size={15} strokeWidth={1.7} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TOTAL */}
        {safeSelectedProduits.length > 0 && (
          <div className={`flex items-center justify-between border-t px-5 py-3 ${borderClass}`} style={{ background: isDark ? '#111C30' : '#F8FAFC' }}>
            <div>
              <span className="block text-[12px] font-medium" style={{ color: theme.muted }}>Total panier</span>
              <span className="block text-[12px]" style={{ color: theme.subMuted }}>{safeSelectedProduits.length} référence{safeSelectedProduits.length > 1 ? 's' : ''} · {totalQuantite} article{totalQuantite > 1 ? 's' : ''}</span>
            </div>
            {/* ⭐ FIX: Esorina ny formatMoney */}
            <span className="text-[18px] font-bold tracking-tight" style={{ color: theme.primary }}>{formatAriary(totalPanier)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchatsProductSelector;