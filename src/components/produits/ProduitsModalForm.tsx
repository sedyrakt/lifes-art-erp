// src/components/produits/ProduitsModalForm.tsx
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Package, ImageIcon, Check, Upload, Trash2, Plus, Loader2, ChevronDown } from 'lucide-react';

interface Produit {
  id?: number; code?: string; nom?: string; description?: string; categorie_id?: number | null;
  fournisseur_id?: number | null; prix_achat?: number; prix_vente?: number; quantite_stock?: number;
  quantite_minimale?: number; unite?: string; image?: string | null; status?: string;
}

interface Category { id: number; nom?: string; name?: string; }
interface Fournisseur { id: number; nom?: string; name?: string; }

interface ProduitsModalFormProps {
  isOpen: boolean; onClose: () => void; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  editingProduit?: Produit | null; categories?: Category[]; fournisseurs?: Fournisseur[];
  generateCode: () => string; isDark?: boolean; imagePreview?: string | null; imagePath?: string | null;
  uploadingImage?: boolean; onImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: () => void; fileInputRef?: React.RefObject<HTMLInputElement>;
}

const UNITES = [
  { value: 'pièce', label: 'Pièce' }, { value: 'L', label: 'Litre (L)' }, { value: 'ml', label: 'Millilitre (ml)' },
  { value: 'KG', label: 'Kilogramme (KG)' }, { value: 'g', label: 'Gramme (g)' }, { value: 'pot', label: 'Pot' },
  { value: 'sachet', label: 'Sachet' }, { value: 'carton', label: 'Carton' },
];

interface CustomDropdownProps {
  value: string | number | null | undefined; onChange: (value: string | number) => void;
  options: { id: number | string; label: string }[]; placeholder?: string; isDark?: boolean; required?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ value, onChange, options, placeholder = 'Sélectionner...', isDark = false, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, openUp: false });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => String(opt.id) === String(value));
  const displayValue = selectedOption ? selectedOption.label : placeholder;
  const borderColor = isDark ? '#334155' : '#D1D5DB';
  const backgroundColor = isDark ? '#0F172A' : '#FFFFFF';
  const textColor = isDark ? '#F1F5F9' : '#0F172A';
  const mutedColor = isDark ? '#64748B' : '#94A3B8';

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = Math.min(220, Math.max(48, options.length * 40 + 48));
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
    setPosition({ top: openUp ? rect.top - dropdownHeight - 4 : rect.bottom + 4, left: rect.left, width: rect.width, openUp });
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('scroll', handleScroll, true); window.removeEventListener('resize', handleResize); };
  }, [isOpen, options.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (buttonRef.current && !buttonRef.current.contains(target) && dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  const handleSelect = (newValue: string | number) => { onChange(newValue); setIsOpen(false); };

  const dropdown = isOpen ? createPortal(
    <div ref={dropdownRef} className="fixed" style={{ top: position.top, left: position.left, width: position.width, zIndex: 999999 }}>
      <div className="overflow-hidden rounded-lg border shadow-2xl" style={{ background: backgroundColor, borderColor, boxShadow: isDark ? '0 18px 45px rgba(0,0,0,0.55)' : '0 18px 45px rgba(15,23,42,0.20)' }}>
        <div className="max-h-[220px] overflow-y-auto py-1" style={{ scrollbarWidth: 'thin', scrollbarColor: isDark ? '#475569 transparent' : '#CBD5E1 transparent' }}>
          <button type="button" onClick={() => handleSelect('')} className="w-full px-3 py-2.5 text-left text-[14px] transition-colors" style={{ color: mutedColor, background: !selectedOption ? (isDark ? 'rgba(99,102,241,0.10)' : '#EEF2FF') : 'transparent' }} onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC'; }} onMouseLeave={(e) => { e.currentTarget.style.background = !selectedOption ? (isDark ? 'rgba(99,102,241,0.10)' : '#EEF2FF') : 'transparent'; }}>
            {placeholder}
          </button>
          {options.map((option) => {
            const selected = String(option.id) === String(value);
            return (
              <button key={option.id} type="button" onClick={() => handleSelect(option.id)} className="w-full px-3 py-2.5 text-left text-[14px] font-medium transition-colors" style={{ color: selected ? (isDark ? '#A5B4FC' : '#4F46E5') : textColor, background: selected ? (isDark ? 'rgba(99,102,241,0.12)' : '#EEF2FF') : 'transparent' }} onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC'; }} onMouseLeave={(e) => { e.currentTarget.style.background = selected ? (isDark ? 'rgba(99,102,241,0.12)' : '#EEF2FF') : 'transparent'; }}>
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>, document.body) : null;

  return (
    <>
      <button ref={buttonRef} type="button" onClick={() => { if (!isOpen) updatePosition(); setIsOpen((prev) => !prev); }} className="flex h-10 w-full items-center justify-between rounded-lg border px-3 text-left text-[14px] outline-none transition-all" style={{ background: backgroundColor, borderColor: isOpen ? (isDark ? '#818CF8' : '#6366F1') : borderColor, color: selectedOption ? textColor : mutedColor, boxShadow: isOpen ? (isDark ? '0 0 0 3px rgba(129,140,248,0.10)' : '0 0 0 3px rgba(99,102,241,0.08)') : 'none' }}>
        <span className="min-w-0 truncate">{displayValue}{required && <span className="ml-1 text-rose-500">*</span>}</span>
        <ChevronDown size={16} className={`ml-2 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ color: isDark ? '#94A3B8' : '#64748B' }} />
      </button>
      {dropdown}
    </>
  );
};

const numberValue = (value: unknown, fallback = 0): number => { const n = Number(value); return Number.isFinite(n) ? n : fallback; };
const formatAriary = (value: number): string => `${Math.round(value).toLocaleString('fr-FR')} Ar`;

const ProduitsModalForm: React.FC<ProduitsModalFormProps> = ({ isOpen, onClose, onSubmit, editingProduit, categories = [], fournisseurs = [], generateCode, isDark = false, imagePreview, imagePath, uploadingImage = false, onImageChange, onRemoveImage, fileInputRef }) => {
  const generatedCode = useMemo(() => editingProduit?.code || generateCode(), [editingProduit?.code, generateCode]);
  const [selectedCategorie, setSelectedCategorie] = useState<string | number>(editingProduit?.categorie_id ?? '');
  const [selectedFournisseur, setSelectedFournisseur] = useState<string | number>(editingProduit?.fournisseur_id ?? '');
  const [selectedUnite, setSelectedUnite] = useState<string>(editingProduit?.unite || 'pièce');

  useEffect(() => {
    if (!isOpen) return;
    setSelectedCategorie(editingProduit?.categorie_id ?? '');
    setSelectedFournisseur(editingProduit?.fournisseur_id ?? '');
    setSelectedUnite(editingProduit?.unite || 'pièce');
  }, [isOpen, editingProduit]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.ctrlKey && event.key.toLowerCase() === 'enter') {
        event.preventDefault();
        const form = document.getElementById('produit-modal-form') as HTMLFormElement | null;
        form?.requestSubmit();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  if (!isOpen) return null;

  const prixAchat = numberValue(editingProduit?.prix_achat);
  const prixVente = numberValue(editingProduit?.prix_vente);
  const marge = prixVente - prixAchat;
  const margePercent = prixAchat > 0 ? (marge / prixAchat) * 100 : 0;
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';
  const categoryOptions = categories.map((c) => ({ id: c.id, label: c.nom || c.name || `Catégorie #${c.id}` }));
  const fournisseurOptions = fournisseurs.map((f) => ({ id: f.id, label: f.nom || f.name || `Fournisseur #${f.id}` }));
  const uniteOptions = UNITES.map((u) => ({ id: u.value, label: u.label }));
  const isProduitFini = Number(selectedCategorie) === 2;

  const modal = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="produit-modal-title">
      <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-[3px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} />
      <div className={`relative z-[100000] flex w-full max-w-[70%] max-h-[86vh] flex-col overflow-visible rounded-2xl border shadow-[0_24px_80px_rgba(15,23,42,0.25)] ${borderClass}`} style={{ background: isDark ? '#0F172A' : '#FFFFFF' }}>
        {/* HEADER */}
        <div className={`flex h-[70px] shrink-0 items-center justify-between border-b px-5 ${borderClass}`} style={{ background: isDark ? '#0F172A' : '#FFFFFF' }}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><Package size={18} strokeWidth={2} /></div>
            <div className="min-w-0">
              <h2 id="produit-modal-title" className={`truncate text-[17px] font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{editingProduit ? 'Modifier le produit' : 'Nouveau produit'}</h2>
              <p className={`mt-0.5 truncate text-[13px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{editingProduit ? 'Modifiez les informations du produit' : 'Ajoutez un nouveau produit à votre catalogue'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"><X size={18} /></button>
        </div>

        {/* FORM */}
        <form id="produit-modal-form" onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" style={{ paddingBottom: '40px' }}>
            <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-[210px_minmax(0,1fr)]">
              {/* IMAGE / SUMMARY */}
              <div className="flex flex-col gap-3">
                <div className={`relative flex min-h-[210px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed transition-all ${isDark ? 'bg-slate-900/40 hover:border-indigo-400 hover:bg-indigo-500/5' : 'bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/40'}`} style={{ borderColor: isDark ? '#475569' : '#D1D5DB' }} onClick={() => fileInputRef?.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files?.[0]; if (!file || !onImageChange) return; const dataTransfer = new DataTransfer(); dataTransfer.items.add(file); if (fileInputRef?.current) { fileInputRef.current.files = dataTransfer.files; fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true })); } }}>
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Aperçu produit" className="absolute inset-0 h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/45 opacity-0 transition-opacity hover:opacity-100">
                        <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[14px] font-medium text-slate-700 shadow-lg"><Upload size={14} />Changer l'image</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">{uploadingImage ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}</div>
                      <p className={`text-[14px] font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{uploadingImage ? 'Téléchargement...' : 'Ajouter une image'}</p>
                      <p className="mt-1 text-center text-[12px] text-slate-400">Cliquez ou glissez-déposez</p>
                      <p className="mt-1 text-center text-[11px] text-slate-400">PNG, JPG, WEBP ou GIF · 10 MB max.</p>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={onImageChange} />
                </div>

                {imagePreview && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); onRemoveImage?.(); }} className={`flex h-9 items-center justify-center gap-2 rounded-lg border text-[14px] font-medium transition-all hover:bg-rose-100 ${isDark ? 'border-rose-500/20 bg-rose-500/10 text-rose-400' : 'border-rose-200 bg-rose-50 text-rose-600'}`}>
                    <Trash2 size={14} />Supprimer l'image
                  </button>
                )}

                {/* SUMMARY */}
                <div className={`rounded-xl border p-3 ${borderClass}`} style={{ background: isDark ? 'rgba(15,23,42,0.5)' : '#F8FAFC' }}>
                  <div className="mb-2.5"><span className={`text-[14px] font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Résumé</span></div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between"><span className="text-[13px] text-slate-500 dark:text-slate-400">Prix d'achat</span><span className={`text-[14px] font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{formatAriary(prixAchat)}</span></div>
                    <div className="flex items-center justify-between"><span className="text-[13px] text-slate-500 dark:text-slate-400">Prix de vente</span><span className="text-[14px] font-medium text-indigo-600 dark:text-indigo-400">{formatAriary(prixVente)}</span></div>
                    <div className={`my-2 border-t ${borderClass}`} />
                    <div className="flex items-end justify-between">
                      <span className={`text-[14px] font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Marge</span>
                      <div className="text-right">
                        <div className={`text-[18px] font-bold ${marge >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{marge >= 0 ? '+' : ''}{formatAriary(marge)}</div>
                        <div className="text-[11px] text-slate-400">{margePercent.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FIELDS */}
              <div className="min-w-0 grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                <Field label="Code produit" required isDark={isDark}><input type="text" name="code" defaultValue={generatedCode} placeholder="PRD-000001" required className={inputClass(isDark)} /></Field>
                <Field label="Désignation" required isDark={isDark}><input type="text" name="nom" defaultValue={editingProduit?.nom || ''} placeholder="Nom du produit" required autoFocus={!editingProduit} className={inputClass(isDark)} /></Field>
                <Field label="Catégorie" isDark={isDark}>
                  <CustomDropdown value={selectedCategorie} onChange={(val) => setSelectedCategorie(val)} options={categoryOptions} placeholder="Sélectionner une catégorie" isDark={isDark} />
                  <input type="hidden" name="categorie_id" value={selectedCategorie} readOnly />
                </Field>
                {!isProduitFini && (
                  <Field label="Fournisseur" isDark={isDark}>
                    <CustomDropdown value={selectedFournisseur} onChange={(val) => setSelectedFournisseur(val)} options={fournisseurOptions} placeholder="Sélectionner un fournisseur" isDark={isDark} />
                    <input type="hidden" name="fournisseur_id" value={selectedFournisseur} readOnly />
                  </Field>
                )}
                <Field label="Prix d'achat (Ar)" isDark={isDark}><input type="number" name="prix_achat" defaultValue={editingProduit?.prix_achat ?? 0} min="0" step="1" placeholder="0" className={inputClass(isDark)} /></Field>
                <Field label="Prix de vente (Ar)" required isDark={isDark}><input type="number" name="prix_vente" defaultValue={editingProduit?.prix_vente ?? 0} min="0" step="1" placeholder="0" required className={inputClass(isDark)} /></Field>
                <Field label="Stock initial" isDark={isDark}><input type="number" name="quantite_stock" defaultValue={editingProduit?.quantite_stock ?? 0} min="0" step="1" placeholder="0" className={inputClass(isDark)} /></Field>
                <Field label="Stock minimum" isDark={isDark}><input type="number" name="quantite_minimale" defaultValue={editingProduit?.quantite_minimale ?? 5} min="0" step="1" placeholder="5" className={inputClass(isDark)} /></Field>
                <Field label="Unité" required isDark={isDark}>
                  <CustomDropdown value={selectedUnite} onChange={(val) => setSelectedUnite(String(val))} options={uniteOptions} placeholder="Sélectionner une unité" isDark={isDark} required />
                  <input type="hidden" name="unite" value={selectedUnite} readOnly />
                </Field>
                <Field label="Statut" isDark={isDark}>
                  <div className={`flex h-10 overflow-hidden rounded-lg border ${borderClass}`} style={{ background: isDark ? '#0F172A' : '#FFFFFF' }}>
                    <label className="flex flex-1 cursor-pointer items-center justify-center">
                      <input type="radio" name="status" value="actif" defaultChecked={editingProduit?.status !== 'inactif'} className="peer sr-only" />
                      <span className="flex h-[34px] w-[calc(100%-4px)] items-center justify-center gap-1.5 rounded-md text-[14px] font-medium text-slate-500 transition-all peer-checked:bg-white peer-checked:text-emerald-600 peer-checked:shadow-sm dark:text-slate-400 dark:peer-checked:bg-slate-800 dark:peer-checked:text-emerald-400"><Check size={13} />Actif</span>
                    </label>
                    <label className="flex flex-1 cursor-pointer items-center justify-center">
                      <input type="radio" name="status" value="inactif" defaultChecked={editingProduit?.status === 'inactif'} className="peer sr-only" />
                      <span className="flex h-[34px] w-[calc(100%-4px)] items-center justify-center rounded-md text-[14px] font-medium text-slate-500 transition-all peer-checked:bg-white peer-checked:text-rose-600 peer-checked:shadow-sm dark:text-slate-400 dark:peer-checked:bg-slate-800 dark:peer-checked:text-rose-400">Inactif</span>
                    </label>
                  </div>
                </Field>
                <div className="md:col-span-2">
                  <Field label="Description" isDark={isDark}>
                    <textarea name="description" defaultValue={editingProduit?.description || ''} placeholder="Description du produit..." rows={3} className={`w-full resize-none rounded-lg border px-3 py-2.5 text-[14px] outline-none transition-all focus:ring-2 ${isDark ? 'border-slate-700 bg-[#0F172A] text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:ring-indigo-400/10' : 'border-gray-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/10'}`} />
                  </Field>
                </div>
                <input type="hidden" name="image" value={imagePath || ''} readOnly />
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className={`flex h-[58px] shrink-0 items-center justify-between border-t px-5 ${borderClass}`} style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}>
            <div className="hidden text-[12px] font-medium text-slate-400 sm:block">Échap pour fermer · Ctrl + Entrée pour enregistrer</div>
            <div className="ml-auto flex items-center gap-2">
              <button type="button" onClick={onClose} className="h-9 rounded-lg px-4 text-[14px] font-medium text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200">Annuler</button>
              <button type="submit" disabled={uploadingImage} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                {uploadingImage ? <Loader2 size={15} className="animate-spin" /> : editingProduit ? <Check size={15} /> : <Plus size={15} />}
                {editingProduit ? 'Enregistrer' : 'Ajouter'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

interface FieldProps { label: string; required?: boolean; icon?: React.ReactNode; isDark?: boolean; children: React.ReactNode; }

const Field: React.FC<FieldProps> = ({ label, required = false, isDark = false, children }) => (
  <div className="min-w-0">
    <label className={`mb-1.5 flex items-center gap-1.5 text-[14px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
      <span>{label}</span>
      {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const inputClass = (isDark: boolean) => `
  h-10 w-full rounded-lg border px-3 text-[14px] outline-none transition-all focus:ring-2
  ${isDark ? 'border-slate-700 bg-[#0F172A] text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:ring-indigo-400/10' : 'border-gray-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/10'}
`;

export default ProduitsModalForm;