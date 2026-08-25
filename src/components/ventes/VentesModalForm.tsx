// ============================================================
// src/components/ventes/VentesModalForm.tsx
// ⭐ PREMIUM VENTES MODAL FORM
// ⭐ DARK + LIGHT MODE (INDIGO THEME)
// ⭐ FIX: Mampiasa id (fa tsy produit_id)
// ⭐ FIX: ESRINA NY ICON REHETRA AFA-TSY NY BOUTON
// ============================================================
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Receipt, FileText, X, Phone, Mail, CheckCircle, User, Lightbulb, Check, Info, Search, Box, Clock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';
import VentesProductSelector from './VentesProductSelector';

const COLORS = {
  light: {
    overlay: 'rgba(15, 23, 42, 0.36)',
    card: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceSoft: '#F8FAFC',
    footer: '#F8FAFC',
    border: '#E2E8F0',
    text: '#0F172A',
    muted: '#64748B',
    subMuted: '#94A3B8',
    primary: '#4F46E5',
    primaryHover: '#4338CA',
    primaryBg: 'rgba(79,70,229,0.07)',
    primaryBorder: 'rgba(79,70,229,0.15)',
    success: '#059669',
    successBg: 'rgba(16,185,129,0.08)',
    successBorder: 'rgba(16,185,129,0.16)',
    warning: '#D97706',
    warningBg: 'rgba(245,158,11,0.08)',
    warningBorder: 'rgba(245,158,11,0.16)',
    danger: '#E11D48',
    dangerBg: 'rgba(244,63,94,0.07)',
    dangerBorder: 'rgba(244,63,94,0.15)'
  },
  dark: {
    overlay: 'rgba(7, 4, 4, 0.66)',
    card: '#0F172A',
    surface: '#0F172A',
    surfaceSoft: '#111C30',
    footer: '#0F172A',
    border: '#334155',
    text: '#F8FAFC',
    muted: '#94A3B8',
    subMuted: '#64748B',
    primary: '#818CF8',
    primaryHover: '#6366F1',
    primaryBg: 'rgba(99,102,241,0.12)',
    primaryBorder: 'rgba(129,140,248,0.20)',
    success: '#34D399',
    successBg: 'rgba(16,185,129,0.11)',
    successBorder: 'rgba(52,211,153,0.18)',
    warning: '#FBBF24',
    warningBg: 'rgba(245,158,11,0.11)',
    warningBorder: 'rgba(251,191,36,0.18)',
    danger: '#FB7185',
    dangerBg: 'rgba(244,63,94,0.11)',
    dangerBorder: 'rgba(251,113,133,0.18)'
  },
};

// ⭐ FIX: Mampiasa id (fa tsy produit_id)
interface Client { id: number; nom: string; email: string; telephone: string; adresse: string; }
interface Produit { id: number; nom: string; code: string; prix_vente: number; quantite_stock: number; unite?: string; image?: string; categorie_nom?: string; }
interface SelectedProduct { id: number; quantite: number; prix_unitaire: number; total: number; }
interface VentesModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  type: 'devis' | 'factures';
  clients: Client[];
  produits: Produit[];
  selectedClientId: number | null;
  onClientChange: (id: number | null) => void;
  selectedProduits: SelectedProduct[];
  onAddProduit: (id: number, quantite: number, prix_unitaire: number) => void;
  onUpdateQuantite: (id: number, quantite: number) => void;
  onRemoveProduit: (id: number) => void;
  onClearPanier: () => void;
  formData: any;
  setFormData: (data: any) => void;
  isDark?: boolean;
}

const TVA_RATE = 0.2;

// ⭐ SectionTitle - ESRINA NY ICON
const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; theme: typeof COLORS.light; borderClass: string }> = ({ icon, title, theme, borderClass }) => (
  <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${borderClass}`} style={{ background: theme.surface }}>
    {/* ⭐ FIX: ESRINA NY ICON */}
    <span className="text-[14px] font-normal" style={{ color: theme.text }}>{title}</span>
  </div>
);

// ⭐ SearchableDropdown - ESRINA NY ICON (options)
const SearchableDropdown: React.FC<{ options: Client[]; value: number | null; onChange: (id: number | null) => void; placeholder: string; isDark: boolean; theme: typeof COLORS.light }> = ({ options, value, onChange, placeholder, isDark, theme }) => {
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
    return options.filter((client) => {
      const nom = client.nom?.toLowerCase() || '';
      const email = client.email?.toLowerCase() || '';
      const telephone = client.telephone?.toLowerCase() || '';
      return nom.includes(term) || email.includes(term) || telephone.includes(term);
    }).slice(0, 100);
  }, [options, searchTerm]);

  const selectedOption = options.find((client) => client.id === value);
  const handleSelect = (id: number) => { onChange(id); setSearchTerm(''); setIsOpen(false); };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="relative">
        <input type="text" value={isOpen ? searchTerm : selectedOption?.nom || ''} onChange={(event) => { setSearchTerm(event.target.value); setIsOpen(true); }} onFocus={() => setIsOpen(true)} placeholder={placeholder} className={`h-9 w-full rounded-lg border px-3 pr-9 text-[14px] font-medium outline-none transition-all ${isDark ? 'border-slate-700 bg-[#0F172A] text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10' : 'border-gray-300 bg-white text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10'}`} />
        <Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>
      {isOpen && (
        <div className="absolute left-0 right-0 z-[100] mt-1 max-h-60 overflow-y-auto rounded-lg border py-1 shadow-xl" style={{ background: isDark ? '#0F172A' : '#FFFFFF', borderColor: theme.border }}>
          {filteredOptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
              <User size={20} className="mb-2 text-slate-400" />
              <p className="text-[14px] font-medium text-slate-500 dark:text-slate-400">Aucun client trouvé</p>
            </div>
          ) : (
            filteredOptions.map((client) => {
              const selected = client.id === value;
              return (
                <button key={client.id} type="button" onClick={() => handleSelect(client.id)} className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors ${selected ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/70'}`}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"><User size={15} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold text-slate-800 dark:text-slate-200">{client.nom}</div>
                    <div className="mt-0.5 flex min-w-0 items-center gap-2 text-[13px] text-slate-400 dark:text-slate-500">
                      {client.telephone && <span className="truncate">{client.telephone}</span>}
                      {client.email && <><span>•</span><span className="truncate">{client.email}</span></>}
                    </div>
                  </div>
                  {selected && <Check size={15} className="shrink-0 text-indigo-600 dark:text-indigo-400" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const VentesModalForm: React.FC<VentesModalFormProps> = ({ isOpen, onClose, onSubmit, type, clients, produits, selectedClientId, onClientChange, selectedProduits, onAddProduit, onUpdateQuantite, onRemoveProduit, onClearPanier, formData, setFormData, isDark: propIsDark }) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : themeIsDark;
  const theme = isDark ? COLORS.dark : COLORS.light;
  const formRef = useRef<HTMLFormElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';

  useEffect(() => { if (!isOpen) { setIsVisible(false); return; } const timer = window.setTimeout(() => setIsVisible(true), 10); return () => window.clearTimeout(timer); }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); formRef.current?.requestSubmit(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  const selectedClient = useMemo(() => clients.find((client) => client.id === selectedClientId), [clients, selectedClientId]);
  // ⭐ FIX: safeSelectedProduits (mampiasa id)
  const safeSelectedProduits = useMemo(() => Array.isArray(selectedProduits) ? selectedProduits : [], [selectedProduits]);

  const totalHT = useMemo(() => safeSelectedProduits.reduce((sum, item) => { 
    const product = produits.find((p) => p.id === item.id); 
    if (!product) return sum; 
    return sum + product.prix_vente * item.quantite; 
  }, 0), [produits, safeSelectedProduits]);
  
  const totalTVA = totalHT * TVA_RATE;
  const totalTTC = totalHT + totalTVA;
  
  const totalQuantity = useMemo(() => safeSelectedProduits.reduce((sum, item) => sum + item.quantite, 0), [safeSelectedProduits]);
  const handleOverlayMouseDown = (event: React.MouseEvent<HTMLDivElement>) => { if (event.target === event.currentTarget) onClose(); };

  // ⭐ InfoRow - ESRINA NY ICON
  const InfoRow: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2">
        {/* ⭐ FIX: ESRINA NY ICON */}
        <span className="truncate text-[14px] font-normal" style={{ color: theme.muted }}>{label}</span>
      </div>
      <div className="min-w-0 text-right text-[14px] font-normal" style={{ color: theme.text }}>{value}</div>
    </div>
  );

  if (!isOpen) return null;

  const modal = (
    <div className={`fixed inset-0 z-[999999] flex items-center justify-center overflow-y-auto p-3 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ background: theme.overlay, backdropFilter: 'blur(5px)' }} role="dialog" aria-modal="true" aria-labelledby="vente-modal-title" onMouseDown={handleOverlayMouseDown}>
      <div className={`relative flex w-full max-w-[950px] max-h-[92vh] flex-col overflow-hidden rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.22)] transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[0.985]'} ${borderClass}`} style={{ background: theme.card }} onMouseDown={(event) => event.stopPropagation()}>
        <div className="absolute left-0 right-0 top-0 z-30 h-[3px]" style={{ background: theme.primary }} />

        {/* HEADER */}
        <header className={`flex shrink-0 items-center justify-between gap-4 border-b px-5 py-4 sm:px-6 ${borderClass}`} style={{ background: theme.surface }}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border" style={{ borderColor: theme.border, background: theme.surfaceSoft }}>
              {type === 'devis' ? <FileText size={20} strokeWidth={2} style={{ color: theme.primary }} /> : <Receipt size={20} strokeWidth={2} style={{ color: theme.primary }} />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="vente-modal-title" className="truncate text-[16px] font-semibold tracking-tight" style={{ color: theme.text }}>{type === 'devis' ? 'Nouveau devis' : 'Nouvelle facture'}</h2>
                <span className="hidden shrink-0 rounded-md border px-2 py-0.5 text-[12px] font-medium sm:inline-flex" style={{ color: theme.primary, background: theme.primaryBg, borderColor: theme.primaryBorder }}>{type === 'devis' ? 'Devis' : 'Facture'}</span>
              </div>
              <p className="mt-0.5 truncate text-[13px]" style={{ color: theme.muted }}>Sélectionnez un client et composez votre panier</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white">
            <X className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        </header>

        {/* BODY */}
        <form ref={formRef} onSubmit={onSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-5 lg:p-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
              {/* SIDEBAR */}
              <aside className="flex flex-col gap-3">
                <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.surface }}>
                  <SectionTitle icon={<Info className="h-3.5 w-3.5" strokeWidth={2} />} title="Résumé" theme={theme} borderClass={borderClass} />
                  <div className="space-y-3 p-4">
                    <InfoRow label="Client" value={selectedClient?.nom || '—'} />
                    <div className="h-px" style={{ background: theme.border }} />
                    <InfoRow label="Références" value={String(safeSelectedProduits.length)} />
                    <div className="h-px" style={{ background: theme.border }} />
                    <InfoRow label="Qté totale" value={String(totalQuantity)} />
                    <div className="h-px" style={{ background: theme.border }} />
                    <InfoRow label="Total HT" value={formatMoney(totalHT)} />
                    <div className="h-px" style={{ background: theme.border }} />
                    <InfoRow label="TVA (20%)" value={formatMoney(totalTVA)} />
                    <div className="h-px" style={{ background: theme.border }} />
                    <div className={`flex items-end justify-between gap-2 rounded-xl border px-4 py-3.5 ${borderClass}`} style={{ background: theme.primaryBg, borderColor: theme.primaryBorder }}>
                      <span className="block text-[13px] font-normal uppercase tracking-wider" style={{ color: theme.primary }}>Total TTC</span>
                      <span className="text-[20px] font-bold tracking-tight" style={{ color: theme.primary }}>{formatMoney(totalTTC)}</span>
                    </div>
                  </div>
                </div>

                {(!selectedClientId || safeSelectedProduits.length === 0) && (
                  <div className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 ${borderClass}`} style={{ borderColor: isDark ? 'rgba(248,113,113,0.18)' : '#FECACA', background: theme.dangerBg }}>
                    <Lightbulb size={14} className="mt-0.5 shrink-0" style={{ color: theme.danger }} />
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold" style={{ color: theme.danger }}>À compléter</p>
                      <p className="mt-0.5 text-[13px] leading-4" style={{ color: theme.muted }}>
                        {!selectedClientId && 'Sélectionnez un client. '}
                        {safeSelectedProduits.length === 0 && 'Ajoutez au moins un produit.'}
                      </p>
                    </div>
                  </div>
                )}

                {selectedClient && (
                  <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.surface }}>
                    <SectionTitle icon={<User className="h-3.5 w-3.5" strokeWidth={2} />} title="Client sélectionné" theme={theme} borderClass={borderClass} />
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-indigo-50 dark:border-slate-700 dark:bg-indigo-500/10">
                          <span className="text-[15px] font-semibold text-indigo-600 dark:text-indigo-400">{selectedClient.nom?.charAt(0).toUpperCase() || '?'}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-semibold leading-5" style={{ color: theme.text }}>{selectedClient.nom}</p>
                          <div className="mt-1.5 space-y-1">
                            {selectedClient.telephone && <div className="flex items-center gap-2"><Phone size={13} className="shrink-0" style={{ color: theme.subtle }} /><span className="truncate text-[14px]" style={{ color: theme.muted }}>{selectedClient.telephone}</span></div>}
                            {selectedClient.email && <div className="flex items-center gap-2"><Mail size={13} className="shrink-0" style={{ color: theme.subtle }} /><span className="truncate text-[14px]" style={{ color: theme.muted }}>{selectedClient.email}</span></div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </aside>

              {/* MAIN */}
              <div className="min-w-0">
                <div className={`overflow-hidden rounded-xl border ${borderClass}`}>
                  <div className="p-4">
                    <div className="grid grid-cols-1 gap-3.5">
                      <div>
                        <label className="mb-1.5 block flex items-center gap-1.5 text-[12px] font-normal uppercase tracking-wider" style={{ color: theme.muted }}>
                          {/* ⭐ FIX: ESRINA NY ICON */}
                          Client <span className="ml-1" style={{ color: theme.danger }}>*</span>
                        </label>
                        <SearchableDropdown options={clients} value={selectedClientId} onChange={onClientChange} placeholder="Rechercher un client..." isDark={isDark} theme={theme} />
                      </div>
                      <div>
                        <label className="mb-1.5 block flex items-center gap-1.5 text-[12px] font-normal uppercase tracking-wider" style={{ color: theme.muted }}>
                          {/* ⭐ FIX: ESRINA NY ICON */}
                          Coordonnées
                        </label>
                        <div className={`flex min-h-9 flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg border px-3 ${borderClass}`} style={{ background: isDark ? '#111827' : '#F8FAFC' }}>
                          {selectedClient ? (
                            <>
                              {selectedClient.telephone && <span className="flex items-center gap-1.5 text-[14px] font-medium" style={{ color: theme.text }}><Phone size={12} style={{ color: theme.muted }} />{selectedClient.telephone}</span>}
                              {selectedClient.email && <span className="flex min-w-0 items-center gap-1.5 text-[14px] font-medium" style={{ color: theme.text }}><Mail size={12} className="shrink-0" style={{ color: theme.muted }} /><span className="truncate">{selectedClient.email}</span></span>}
                              {!selectedClient.telephone && !selectedClient.email && <span className="text-[14px]" style={{ color: theme.muted }}>Aucune coordonnée</span>}
                            </>
                          ) : <span className="text-[14px]" style={{ color: theme.muted }}>Sélectionnez un client</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`border-t ${borderClass}`}>
                    <VentesProductSelector produits={produits} selectedProduits={safeSelectedProduits} onAddProduit={onAddProduit} onUpdateQuantite={onUpdateQuantite} onRemoveProduit={onRemoveProduit} onClearPanier={onClearPanier} theme={theme} isDark={isDark} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* FOOTER */}
        <footer className={`flex shrink-0 items-center justify-end gap-2 border-t px-5 py-3 sm:px-6 ${borderClass}`} style={{ background: theme.surfaceSoft }}>
          <button type="button" onClick={onClose} className={`h-9 rounded-lg border px-4 text-[14px] font-medium transition-all hover:bg-slate-100 active:scale-[0.98] dark:hover:bg-white/[0.05] ${borderClass}`} style={{ background: 'transparent', color: theme.text }}>Fermer</button>
          <button type="button" onClick={() => formRef.current?.requestSubmit()} disabled={!selectedClientId || safeSelectedProduits.length === 0} className="flex h-9 items-center gap-2 rounded-lg px-4 text-[14px] font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50" style={{ background: theme.primary }} onMouseEnter={e => { if (selectedClientId && safeSelectedProduits.length > 0) e.currentTarget.style.background = theme.primaryHover; }} onMouseLeave={e => { e.currentTarget.style.background = theme.primary; }}>
            <CheckCircle className="h-3.5 w-3.5" strokeWidth={2} /> {type === 'devis' ? 'Valider le devis' : 'Valider la facture'}
          </button>
        </footer>
      </div>
    </div>
  );
  return createPortal(modal, document.body);
};

export default VentesModalForm;