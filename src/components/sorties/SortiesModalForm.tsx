// ============================================================
// src/components/sorties/SortiesModalForm.tsx
// ============================================================
// ⭐ PREMIUM SORTIE FORM MODAL
// ⭐ DARK + LIGHT MODE
// ⭐ READABLE TYPOGRAPHY (identique aux tables)
// ⭐ ALL BORDER SYSTEM
// ⭐ RESPONSIVE LAYOUT
// ============================================================

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, Package, DollarSign, MapPin, Hash, FileText, Box, Info, Plus, Calendar, ArrowUp, AlertTriangle, CheckCircle2, Search, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';

const COLORS = {
  light: { overlay: 'rgba(15, 23, 42, 0.48)', card: '#FFFFFF', surface: '#FFFFFF', surfaceSoft: '#F8FAFC', surfaceMuted: '#F1F5F9', border: '#E2E8F0', text: '#0F172A', muted: '#64748B', subtle: '#94A3B8', primary: '#4F46E5', primaryHover: '#4338CA', primarySoft: 'rgba(79,70,229,0.07)', primaryBorder: 'rgba(79,70,229,0.16)', danger: '#DC2626', success: '#059669', successBg: 'rgba(5,150,105,0.07)', successBorder: 'rgba(5,150,105,0.15)' },
  dark: { overlay: 'rgba(0,0,0,0.82)', card: '#0F172A', surface: '#0F172A', surfaceSoft: '#111C30', surfaceMuted: '#162033', border: 'rgba(148,163,184,0.15)', text: '#F8FAFC', muted: '#94A3B8', subtle: '#64748B', primary: '#818CF8', primaryHover: '#6366F1', primarySoft: 'rgba(129,140,248,0.10)', primaryBorder: 'rgba(129,140,248,0.20)', danger: '#F87171', success: '#34D399', successBg: 'rgba(52,211,153,0.10)', successBorder: 'rgba(52,211,153,0.18)' }
};

interface SortiesModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  produits: any[];
  isDark?: boolean;
}

// ============================================================
// FORM FIELD
// ============================================================

const FormField: React.FC<{ label: string; children: React.ReactNode; icon?: React.ReactNode; required?: boolean; className?: string; fullWidth?: boolean; }> = ({ label, children, icon, required = false, className = '', fullWidth = false }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'md:col-span-2' : ''} ${className}`}>
      <label className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.muted }}>
        {icon && <span className="flex shrink-0 items-center justify-center" style={{ color: theme.subtle }}>{icon}</span>}
        <span>{label}{required && <span className="ml-1" style={{ color: theme.danger }}>*</span>}</span>
      </label>
      {children}
    </div>
  );
};

const inputBase = 'w-full h-9 rounded-lg border px-3 text-[14px] font-medium outline-none transition-all duration-150 focus:ring-2';

// ============================================================
// PRODUCT SEARCH DROPDOWN
// ============================================================

const ProductSearchDropdown: React.FC<{ options: any[]; value: number | null; onChange: (id: number | null, product?: any | null) => void; placeholder: string; isDark: boolean; theme: any; }> = ({ options, value, onChange, placeholder, isDark, theme }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [remoteProducts, setRemoteProducts] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';

  const selectedFromOptions = (options || []).find((opt) => Number(opt?.id) === Number(value));
  const selectedFromRemote = (remoteProducts || []).find((opt) => Number(opt?.id) === Number(value));
  const selectedOption = selectedFromRemote || selectedFromOptions || null;
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const localFiltered = (options || []).filter((opt) => {
    const nom = String(opt?.nom || '').toLowerCase();
    const code = String(opt?.code || '').toLowerCase();
    if (!normalizedSearch) return true;
    return nom.includes(normalizedSearch) || code.includes(normalizedSearch);
  });
  const mergedProducts = [...localFiltered, ...remoteProducts];
  const uniqueProducts = mergedProducts.filter((product, index, array) => array.findIndex((item) => Number(item?.id) === Number(product?.id)) === index);

  useEffect(() => {
    if (!isOpen) return;
    const term = searchTerm.trim();
    if (!term) { setRemoteProducts([]); setSearchLoading(false); return; }
    const timer = window.setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      if (!window.api?.products?.getAll) return;
      setSearchLoading(true);
      try {
        const result = await window.api.products.getAll({ search: term, limit: 50, status: 'actif' });
        if (requestId !== requestIdRef.current) return;
        if (result?.success && Array.isArray(result.data)) setRemoteProducts(result.data);
        else setRemoteProducts([]);
      } catch (error) {
        console.error('Recherche produit:', error);
        if (requestId === requestIdRef.current) setRemoteProducts([]);
      } finally {
        if (requestId === requestIdRef.current) setSearchLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchTerm, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFocus = useCallback(() => {
    setSearchTerm('');
    setRemoteProducts([]);
    setIsOpen(true);
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }, []);

  const handleSelect = useCallback((product: any) => {
    const id = Number(product?.id);
    if (!Number.isInteger(id) || id <= 0) return;
    onChange?.(id, product);
    setSearchTerm('');
    setRemoteProducts([]);
    setIsOpen(false);
  }, [onChange]);

  const clearSelection = useCallback(() => {
    onChange?.(null, null);
    setSearchTerm('');
    setRemoteProducts([]);
    setIsOpen(false);
  }, [onChange]);

  const displayValue = isOpen ? searchTerm : selectedOption ? `${selectedOption.nom || ''}${selectedOption.code ? ` (${selectedOption.code})` : ''}` : '';

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="relative">
        <input ref={searchInputRef} type="text" value={displayValue} onChange={(event) => { setSearchTerm(event.target.value); if (!isOpen) setIsOpen(true); }} onFocus={handleFocus} placeholder={placeholder} autoComplete="off" className={`${inputBase} pr-20 ${isDark ? 'border-slate-700 bg-[#0F172A] text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-indigo-500/15' : 'border-gray-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/10'}`} />
        {selectedOption && (
          <button type="button" onClick={clearSelection} className="absolute right-9 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Effacer le produit">
            <X className="h-3.5 w-3.5" style={{ color: theme.subtle }} />
          </button>
        )}
        {searchLoading ? (
          <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin" style={{ color: theme.primary }} />
        ) : (
          <Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: theme.subtle }} />
        )}
      </div>
      {isOpen && (
        <div className={`absolute left-0 right-0 z-[100] mt-1 max-h-72 overflow-hidden rounded-xl border shadow-2xl ${borderClass}`} style={{ background: isDark ? '#111C30' : '#FFFFFF' }}>
          <div className="max-h-72 overflow-y-auto py-1">
            {searchLoading && uniqueProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center px-4 py-7" style={{ color: theme.muted }}>
                <Loader2 className="mb-2 h-5 w-5 animate-spin" style={{ color: theme.primary }} />
                <span className="text-[13px]">Recherche des produits...</span>
              </div>
            )}
            {!searchLoading && uniqueProducts.length === 0 && (
              <div className="px-4 py-7 text-center" style={{ color: theme.muted }}>
                <Search className="mx-auto mb-2 h-5 w-5 opacity-50" />
                <div className="text-[13px] font-medium">Aucun produit trouvé</div>
                {searchTerm && <div className="mt-1 text-[12px]" style={{ color: theme.subtle }}>Aucun résultat pour "{searchTerm}"</div>}
              </div>
            )}
            {uniqueProducts.length > 0 && (
              <>
                <div className={`sticky top-0 z-10 border-b px-3 py-2 text-[11px] font-semibold uppercase tracking-wider ${borderClass}`} style={{ color: theme.subtle, background: isDark ? '#111C30' : '#FFFFFF' }}>
                  {uniqueProducts.length} produit{uniqueProducts.length > 1 ? 's' : ''} trouvé{uniqueProducts.length > 1 ? 's' : ''}
                </div>
                {uniqueProducts.map((product) => {
                  const isSelected = Number(product?.id) === Number(value);
                  return (
                    <button key={product.id} type="button" onClick={() => handleSelect(product)} className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors" style={{ background: isSelected ? theme.primarySoft : 'transparent', color: isSelected ? theme.primary : theme.text }} onMouseEnter={(event) => { if (!isSelected) event.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC'; }} onMouseLeave={(event) => { if (!isSelected) event.currentTarget.style.background = 'transparent'; }}>
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: isSelected ? theme.primarySoft : isDark ? '#162033' : '#F1F5F9', color: isSelected ? theme.primary : theme.muted }}>
                          <Package className="h-4 w-4" />
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-[14px] font-semibold">{product.nom || 'Produit sans nom'}</span>
                          {product.code && <span className="truncate font-mono text-[12px]" style={{ color: theme.subtle }}>{product.code}</span>}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Box className="h-3 w-3" style={{ color: theme.subtle }} />
                        <span className="text-[13px] font-medium" style={{ color: theme.muted }}>{Number(product.quantite_stock || 0).toLocaleString('fr-FR')}</span>
                        {isSelected && <CheckCircle2 className="ml-1 h-4 w-4" style={{ color: theme.primary }} />}
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// COMPONENT
// ============================================================

const SortiesModalForm: React.FC<SortiesModalFormProps> = ({ isOpen, onClose, onSubmit, produits, isDark: isDarkProp }) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : themeIsDark;
  const theme = isDark ? COLORS.dark : COLORS.light;
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';

  useEffect(() => { if (!isOpen) { setIsVisible(false); return; } const timer = window.setTimeout(() => setIsVisible(true), 10); return () => window.clearTimeout(timer); }, [isOpen]);
  useEffect(() => { if (!isOpen) { setSelectedProductId(null); setSelectedProduct(null); setProductImageUrl(null); setLoadingImage(false); setImageError(false); setQuantity(1); } }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (selectedProduct && quantity > 0 && !(!!selectedProduct && quantity > Number(selectedProduct?.quantite_stock || 0))) formRef.current?.requestSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, selectedProduct, quantity]);

  useEffect(() => {
    if (!selectedProductId) { setSelectedProduct(null); setProductImageUrl(null); setLoadingImage(false); setImageError(false); return; }
    const product = produits.find((p) => Number(p?.id) === Number(selectedProductId));
    if (!product) { setSelectedProduct(null); setProductImageUrl(null); setLoadingImage(false); setImageError(false); return; }
    setSelectedProduct(product);
    setImageError(false);
    if (!product.image) { setProductImageUrl(null); setLoadingImage(false); return; }
    setLoadingImage(true);
    setProductImageUrl(null);
    if (window.api?.images?.getUrl) {
      window.api.images.getUrl(product.image).then((result: any) => {
        if (result?.success && result?.data) {
          const separator = result.data.includes('?') ? '&' : '?';
          setProductImageUrl(`${result.data}${separator}t=${Date.now()}`);
        } else {
          setProductImageUrl(null);
        }
      }).catch(() => setProductImageUrl(null)).finally(() => setLoadingImage(false));
    } else {
      setProductImageUrl(null);
      setLoadingImage(false);
    }
  }, [selectedProductId, produits]);

  const handleProductChange = useCallback((id: number | null, product?: any | null) => {
    setSelectedProductId(id);
    setSelectedProduct(product || null);
  }, []);

  const prixUnitaire = Number(selectedProduct?.prix_vente || 0);
  const stockDisponible = Number(selectedProduct?.quantite_stock || 0);
  const montantTotal = prixUnitaire * Math.max(quantity, 0);
  const stockInsuffisant = !!selectedProduct && quantity > stockDisponible;
  const initiales = selectedProduct?.nom?.charAt(0)?.toUpperCase() || '?';

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ background: isDark ? 'rgba(0,0,0,0.82)' : theme.overlay, backdropFilter: 'blur(6px)' }} role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={`relative flex w-full max-w-4xl max-h-[80vh] flex-col overflow-hidden rounded-2xl border shadow-[0_24px_70px_rgba(0,0,0,0.20)] transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[0.985]'} ${borderClass}`} style={{ background: theme.card }} onMouseDown={(event) => event.stopPropagation()}>
        <div className="absolute left-0 right-0 top-0 z-20 h-[3px]" style={{ background: theme.primary }} />

        {/* HEADER */}
        <header className={`flex shrink-0 items-center justify-between border-b px-5 py-3.5 sm:px-6 ${borderClass}`} style={{ background: theme.surface }}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border" style={{ background: theme.primarySoft, borderColor: theme.primaryBorder, color: theme.primary }}>
              <ArrowUp className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-[15px] font-semibold tracking-tight sm:text-[16px]" style={{ color: theme.text }}>Nouvelle sortie de stock</h2>
                <span className="hidden items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold sm:inline-flex" style={{ color: theme.danger, background: isDark ? 'rgba(220,38,38,0.10)' : '#FEF2F2', borderColor: isDark ? 'rgba(220,38,38,0.20)' : '#FECACA' }}>
                  <ArrowUp className="h-3 w-3" />SORTIE
                </span>
              </div>
              <p className="mt-0.5 truncate text-[12px]" style={{ color: theme.muted }}>Enregistrez une sortie de stock rapidement</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-150 hover:bg-slate-100 active:scale-95 dark:hover:bg-white/[0.06]" style={{ color: theme.muted }} aria-label="Fermer">
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </header>

        {/* BODY */}
        <form ref={formRef} onSubmit={onSubmit} className="flex-1 overflow-y-auto custom-modal-scrollbar">
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[210px_minmax(0,1fr)]">
              {/* SIDEBAR */}
              <aside className="flex flex-col gap-3">
                <div className={`relative aspect-square w-full overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.surfaceSoft }}>
                  <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold shadow-sm" style={{ color: theme.danger, background: isDark ? 'rgba(220,38,38,0.12)' : '#FEF2F2', borderColor: isDark ? 'rgba(220,38,38,0.20)' : '#FECACA' }}>
                    <ArrowUp size={11} />Sortie stock
                  </div>
                  {selectedProduct ? (
                    <>
                      {loadingImage ? (
                        <div className="flex h-full w-full items-center justify-center"><div className="h-7 w-7 animate-spin rounded-full border-[3px] border-indigo-500 border-t-transparent" /></div>
                      ) : productImageUrl && !imageError ? (
                        <img key={productImageUrl} src={productImageUrl} alt={selectedProduct.nom} className="h-full w-full object-cover" onError={() => setImageError(true)} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-semibold shadow-lg" style={{ background: 'linear-gradient(135deg,#818CF8,#4F46E5)', color: '#FFFFFF' }}>{initiales}</div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center px-4 text-center">
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                        <Package className="h-5 w-5" style={{ color: theme.primary }} />
                      </div>
                      <div className="text-[14px] font-semibold" style={{ color: theme.text }}>Aucun produit</div>
                      <div className="mt-0.5 text-[12px]" style={{ color: theme.subtle }}>Sélectionnez un produit</div>
                    </div>
                  )}
                </div>

                <div className={`rounded-xl border p-3 ${borderClass}`} style={{ background: theme.surface }}>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: theme.primarySoft, color: theme.primary }}>
                      <Info className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[12px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.text }}>Résumé</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[12px] font-medium" style={{ color: theme.muted }}>Produit</span>
                      <span className="max-w-[125px] truncate text-right text-[13px] font-semibold" style={{ color: theme.text }}>{selectedProduct?.nom || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium" style={{ color: theme.muted }}>Prix vente</span>
                      <span className="text-[13px] font-medium" style={{ color: theme.text }}>{formatMoney(Number(selectedProduct?.prix_vente || 0))}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium" style={{ color: theme.muted }}>Quantité</span>
                      <span className="text-[13px] font-medium" style={{ color: theme.text }}>{quantity} unité{quantity > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium" style={{ color: theme.muted }}>Stock actuel</span>
                      <span className="text-[13px] font-medium" style={{ color: stockDisponible > 0 ? theme.success : theme.danger }}>{stockDisponible.toLocaleString('fr-FR')} unités</span>
                    </div>
                    <div className="my-2 h-px" style={{ background: theme.border }} />
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-semibold" style={{ color: theme.text }}>Montant total</span>
                      <span className="text-[15px] font-bold tracking-tight" style={{ color: theme.primary }}>{formatMoney(montantTotal)}</span>
                    </div>
                  </div>
                </div>

                {selectedProduct && (
                  <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-bold ${borderClass}`} style={{ borderColor: stockInsuffisant ? theme.danger : theme.success, background: stockInsuffisant ? (isDark ? 'rgba(248,113,113,0.10)' : '#FEF2F2') : (isDark ? 'rgba(52,211,153,0.10)' : '#ECFDF5'), color: stockInsuffisant ? theme.danger : theme.success }}>
                    {stockInsuffisant ? <><AlertTriangle className="h-4 w-4 shrink-0" /><span>Stock insuffisant (max {stockDisponible})</span></> : <><CheckCircle2 className="h-4 w-4 shrink-0" /><span>Stock disponible</span></>}
                  </div>
                )}
              </aside>

              {/* MAIN FORM */}
              <section className="min-w-0">
                <input type="hidden" name="produit_id" value={selectedProductId ?? ''} />
                <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 md:grid-cols-2">
                  <FormField label="Produit" required icon={<Package className="h-3.5 w-3.5" />} fullWidth>
                    <ProductSearchDropdown options={produits || []} value={selectedProductId} onChange={handleProductChange} placeholder="Rechercher par nom ou code produit..." isDark={isDark} theme={theme} />
                  </FormField>
                  <FormField label="Quantité" required icon={<Box className="h-3.5 w-3.5" />}>
                    <input type="number" name="quantite" required min="1" max={selectedProduct ? stockDisponible : undefined} value={quantity} onChange={(e) => { const value = Number(e.target.value); setQuantity(Number.isFinite(value) && value > 0 ? value : 1); }} className={`${inputBase} ${isDark ? 'border-slate-700 bg-[#0F172A] text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-indigo-500/15' : 'border-gray-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/10'} ${stockInsuffisant ? 'border-rose-300 dark:border-rose-500/40' : ''}`} placeholder="Ex. 10" />
                  </FormField>
                  <FormField label="Destination" icon={<MapPin className="h-3.5 w-3.5" />}>
                    <input type="text" name="destination" className={`${inputBase} ${isDark ? 'border-slate-700 bg-[#0F172A] text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-indigo-500/15' : 'border-gray-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/10'}`} placeholder="Client, service..." />
                  </FormField>
                  <FormField label="Référence" icon={<Hash className="h-3.5 w-3.5" />}>
                    <input type="text" name="reference" className={`${inputBase} ${isDark ? 'border-slate-700 bg-[#0F172A] text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-indigo-500/15' : 'border-gray-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/10'}`} placeholder={`SOR-${Date.now().toString().slice(-4)}`} />
                  </FormField>
                  <FormField label="Prix unitaire" required icon={<DollarSign className="h-3.5 w-3.5" />}>
                    <div className="relative">
                      <input type="number" name="prix_unitaire" value={prixUnitaire} readOnly className={`${inputBase} cursor-not-allowed pr-10 ${isDark ? 'border-slate-700 bg-[#0F172A] text-slate-100 focus:border-indigo-500 focus:ring-indigo-500/15' : 'border-gray-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/10'}`} style={{ color: theme.muted }} />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold" style={{ color: theme.subtle }}>Ar</span>
                    </div>
                  </FormField>
                  <FormField label="Date de sortie" icon={<Calendar className="h-3.5 w-3.5" />}>
                    <input type="text" value={new Date().toLocaleDateString('fr-FR')} disabled readOnly className={`${inputBase} cursor-not-allowed ${isDark ? 'border-slate-700 bg-[#0F172A] text-slate-100' : 'border-gray-300 bg-white text-slate-900'}`} style={{ color: theme.muted }} />
                  </FormField>
                  <FormField label="Observation" icon={<FileText className="h-3.5 w-3.5" />} fullWidth>
                    <textarea name="observation" rows={3} className={`w-full resize-none rounded-lg border px-3 py-2 text-[14px] font-medium outline-none transition-all duration-150 focus:ring-2 ${isDark ? 'border-slate-700 bg-[#0F172A] text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-indigo-500/15' : 'border-gray-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/10'}`} placeholder="Notes ou observations particulières..." />
                  </FormField>
                </div>
              </section>
            </div>
          </div>
        </form>

        {/* FOOTER */}
        <footer className={`flex shrink-0 items-center justify-between gap-3 border-t px-5 py-2.5 sm:px-6 ${borderClass}`} style={{ background: theme.surfaceSoft }}>
          <span className="hidden text-[11px] font-medium sm:block" style={{ color: theme.subtle }}>Échap pour fermer · Ctrl + Entrée pour enregistrer</span>
          <div className="ml-auto flex items-center gap-1.5">
            <button type="button" onClick={onClose} className={`h-8 rounded-lg border px-3 text-[13px] font-medium transition-all duration-150 hover:bg-slate-100 active:scale-[0.98] dark:hover:bg-white/[0.05] ${borderClass}`} style={{ background: 'transparent', color: theme.text }}>
              Annuler
            </button>
            <button type="button" onClick={() => formRef.current?.requestSubmit()} disabled={!selectedProductId || quantity <= 0 || stockInsuffisant} className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-white shadow-sm transition-all duration-150 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50" style={{ background: theme.primary }} onMouseEnter={(event) => { if (selectedProductId && !stockInsuffisant) event.currentTarget.style.background = theme.primaryHover; }} onMouseLeave={(event) => { event.currentTarget.style.background = theme.primary; }}>
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />Enregistrer
            </button>
          </div>
        </footer>

        <style>{`
          .custom-modal-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
          .custom-modal-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-modal-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.25); border-radius: 999px; }
          .custom-modal-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.40); }
        `}</style>
      </div>
    </div>
  );
};

export default SortiesModalForm;