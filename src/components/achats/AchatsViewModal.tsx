// ============================================================
// src/components/achats/AchatsViewModal.tsx
// ⭐ PREMIUM ACHAT VIEW MODAL (VERSION FINALE)
// ⭐ FIX: FontSize MITOVY amin'ny VentesModalForm (12px label, 14px valeur)
// ⭐ FIX: Esorina ny formatMoney (mampiseho Ariary mivantana)
// ============================================================

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FileText, Package, X, Calendar, User, Phone, Edit, Mail, Hash, Clock, Building2, Box, Receipt, CheckCircle, XCircle, Truck, AlertTriangle, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

// ============================================================
// TYPES
// ============================================================
interface AchatsViewModalProps {
  achat: any;
  loadingDetails: boolean;
  onClose: () => void;
  onEdit: () => void;
  isDark?: boolean;
}

const COLORS = {
  light: {
    card: '#FFFFFF', header: '#FFFFFF', footer: '#F8FAFC', border: '#E2E8F0', borderStrong: '#CBD5E1',
    text: '#0F172A', muted: '#64748B', subMuted: '#94A3B8', primary: '#6366F1', primaryHover: '#4F46E5',
    primarySoft: 'rgba(99,102,241,0.08)', primaryBorder: 'rgba(99,102,241,0.18)',
    success: '#059669', successBg: 'rgba(16,185,129,0.10)', successBorder: 'rgba(16,185,129,0.25)',
    warning: '#D97706', warningBg: 'rgba(245,158,11,0.10)', warningBorder: 'rgba(245,158,11,0.25)',
    danger: '#DC2626', dangerBg: 'rgba(239,68,68,0.08)', dangerBorder: 'rgba(239,68,68,0.20)'
  },
  dark: {
    card: '#0F172A', header: '#0F172A', footer: '#0F172A', border: '#334155', borderStrong: '#475569',
    text: '#F8FAFC', muted: '#94A3B8', subMuted: '#64748B', primary: '#818CF8', primaryHover: '#6366F1',
    primarySoft: 'rgba(99,102,241,0.12)', primaryBorder: 'rgba(99,102,241,0.25)',
    success: '#34D399', successBg: 'rgba(16,185,129,0.14)', successBorder: 'rgba(52,211,153,0.28)',
    warning: '#FBBF24', warningBg: 'rgba(245,158,11,0.12)', warningBorder: 'rgba(251,191,36,0.25)',
    danger: '#F87171', dangerBg: 'rgba(239,68,68,0.12)', dangerBorder: 'rgba(248,113,113,0.25)'
  },
};

// ============================================================
// FORMCell - ESRINA NY ICON + BORDER MANIFY + FONT MAIVANA
// ============================================================
interface FormCellProps {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  borderRight?: boolean;
  borderBottom?: boolean;
  fullWidth?: boolean;
}

const FormCell: React.FC<FormCellProps> = ({ label, children, icon, borderRight = true, borderBottom = true, fullWidth = false }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  const borderClass = isDark ? 'border-white/[0.06]' : 'border-slate-200';
  
  return (
    <div className={`flex min-w-0 items-center px-3 py-2.5 ${borderRight ? `border-r ${borderClass}` : ''} ${borderBottom ? `border-b ${borderClass}` : ''} ${fullWidth ? 'col-span-3' : ''}`} style={{ background: theme.card }}>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-1.5">
          {/* ⭐ FIX: text-[12px] (mitovy amin'ny VentesModalForm) */}
          <span className="truncate text-[12px] font-normal uppercase tracking-[0.045em]" style={{ color: theme.muted }}>{label || ' '}</span>
        </div>
        <div className="min-w-0 text-[14px] font-normal leading-4">{children}</div>
      </div>
    </div>
  );
};

// ============================================================
// SECTION TITLE - ESRINA NY ICON + BORDER MANIFY
// ============================================================
const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; theme: typeof COLORS.light | typeof COLORS.dark; }> = ({ icon, title, theme }) => {
  const { isDark } = useTheme();
  const borderClass = isDark ? 'border-white/[0.06]' : 'border-slate-200';
  return (
    <div className={`flex items-center gap-2 border-b px-3 py-2.5 ${borderClass}`} style={{ background: theme.surfaceSoft }}>
      {/* ⭐ FIX: text-[13px] (mitovy amin'ny VentesModalForm) */}
      <span className="text-[13px] font-normal uppercase tracking-[0.045em]" style={{ color: theme.text }}>{title}</span>
    </div>
  );
};

// ============================================================
// INFO ROW - ESRINA NY ICON
// ============================================================
const InfoRow: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode; }> = ({ label, value, icon }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2">
        {/* ⭐ FIX: text-[12px] (mitovy amin'ny VentesModalForm) */}
        <span className="truncate text-[12px] font-normal" style={{ color: theme.muted }}>{label}</span>
      </div>
      <div className="min-w-0 text-right text-[14px] font-normal" style={{ color: theme.text }}>{value}</div>
    </div>
  );
};

// ============================================================
// STATUS BADGE - ESRINA NY ICON
// ============================================================
const StatusBadge: React.FC<{ statut: string; theme: typeof COLORS.light | typeof COLORS.dark; }> = ({ statut, theme }) => {
  const statutLower = (statut || 'En attente').toLowerCase();
  let style = { background: theme.primarySoft, borderColor: theme.primaryBorder, color: theme.primary };

  if (statutLower === 'validé' || statutLower === 'valide') {
    style = { background: theme.successBg, borderColor: theme.successBorder, color: theme.success };
  } else if (statutLower === 'livré' || statutLower === 'livre') {
    style = { background: theme.successBg, borderColor: theme.successBorder, color: theme.success };
  } else if (statutLower === 'en attente' || statutLower === 'attente') {
    style = { background: theme.warningBg, borderColor: theme.warningBorder, color: theme.warning };
  } else if (statutLower === 'annulé' || statutLower === 'annule') {
    style = { background: theme.dangerBg, borderColor: theme.dangerBorder, color: theme.danger };
  }

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1 text-[12px] font-semibold" style={style}>
      {statut || 'En attente'}
    </span>
  );
};

// ============================================================
// COMPONENT
// ============================================================
const AchatsViewModal: React.FC<AchatsViewModalProps> = ({ achat, loadingDetails, onClose, onEdit, isDark: isDarkProp }) => {
  const { isDark: contextIsDark } = useTheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : contextIsDark;
  const theme = isDark ? COLORS.dark : COLORS.light;
  const [isVisible, setIsVisible] = useState(false);
  const [productImages, setProductImages] = useState<Record<number, string | null>>({});
  const safeDetails = achat?.details || [];
  const borderClass = isDark ? 'border-white/[0.06]' : 'border-slate-200';

  const imagesLoaded = useRef<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const loadImages = async () => {
      const uniqueDetails = safeDetails.filter(d => !imagesLoaded.current.has(d.produit_id));
      const entries = await Promise.all(uniqueDetails.map(async detail => {
        if (!detail.produit_image) {
          imagesLoaded.current.add(detail.produit_id);
          return [detail.produit_id, null] as const;
        }
        try {
          if (!window.api?.images?.getUrl) {
            imagesLoaded.current.add(detail.produit_id);
            return [detail.produit_id, null] as const;
          }
          const result = await window.api.images.getUrl(detail.produit_image);
          if (!result?.success || !result.data) {
            imagesLoaded.current.add(detail.produit_id);
            return [detail.produit_id, null] as const;
          }
          const separator = result.data.includes('?') ? '&' : '?';
          imagesLoaded.current.add(detail.produit_id);
          return [detail.produit_id, `${result.data}${separator}t=${Date.now()}`] as const;
        } catch (error) { 
          console.error('Erreur chargement image produit:', error); 
          imagesLoaded.current.add(detail.produit_id);
          return [detail.produit_id, null] as const; 
        }
      }));
      if (!cancelled) setProductImages(prev => ({ ...prev, ...Object.fromEntries(entries) }));
    };
    loadImages();
    return () => { cancelled = true; };
  }, [safeDetails]);

  useEffect(() => { const timer = window.setTimeout(() => setIsVisible(true), 10); return () => window.clearTimeout(timer); }, []);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const formatDate = (date?: string) => { if (!date) return '—'; try { return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch { return date; } };
  const formatDateTime = (date?: string) => { if (!date) return '—'; try { return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return date; } };
  const getInitials = (name: string) => { if (!name) return '?'; return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); };

  const calculatedTotalHT = useMemo(() => safeDetails.reduce((acc, detail) => acc + (detail.quantite || 0) * (detail.prix_unitaire || 0), 0), [safeDetails]);
  const calculatedTVA = useMemo(() => calculatedTotalHT * 0.20, [calculatedTotalHT]);
  const calculatedTotalTTC = useMemo(() => calculatedTotalHT + calculatedTVA, [calculatedTotalHT, calculatedTVA]);

  const numberProduits = achat?.nombre_produits || safeDetails.length || 0;
  const quantiteTotale = useMemo(() => safeDetails.reduce((sum, d) => sum + Number(d.quantite || 0), 0), [safeDetails]);

  // ⭐ FIX: Format Ariary tsotra
  const formatAriary = (value: number) => `${Number(value || 0).toLocaleString('fr-FR')} Ar`;

  return (
    <div className={`fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-5 transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }} role="dialog" aria-modal="true" aria-labelledby="achat-view-title" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`relative flex w-full max-w-[950px] max-h-[85vh] flex-col overflow-hidden rounded-2xl border ${borderClass} shadow-[0_24px_80px_rgba(0,0,0,0.22)] transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[0.985]'}`} style={{ background: theme.card }} onMouseDown={e => e.stopPropagation()}>
        <div className="absolute left-0 right-0 top-0 z-30 h-[3px]" style={{ background: theme.primary }} />

        {/* HEADER */}
        <header className={`flex shrink-0 items-center justify-between gap-4 border-b px-4 py-3 sm:px-5 ${borderClass}`} style={{ background: theme.surface }}>
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border" style={{ borderColor: theme.primaryBorder, background: theme.primarySoft, color: theme.primary }}>
              <FileText className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="achat-view-title" className="truncate text-[15px] font-semibold tracking-tight" style={{ color: theme.text }}>Détails de l'achat</h2>
                <span className="hidden shrink-0 rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium sm:inline-flex" style={{ color: theme.primary, background: theme.primarySoft, borderColor: theme.primaryBorder }}>{achat.reference || '—'}</span>
              </div>
              <p className="mt-0.5 truncate text-[13px]" style={{ color: theme.muted }}>Consultation des informations de l'achat</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden sm:block"><StatusBadge statut={achat.statut} theme={theme} /></div>
            <button type="button" onClick={onEdit} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12px] font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]" style={{ background: theme.primary }}>
              <Edit className="h-3.5 w-3.5" />
              Modifier
            </button>
            <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-rose-500/10 hover:text-rose-500" style={{ color: theme.muted }}>
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </header>

        {/* BODY */}
        <main className="flex-1 overflow-y-auto custom-achat-scroll">
          <div className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row">
              
              {/* ⭐ SIDEBAR GAUCHE */}
              <aside className="w-full shrink-0 lg:w-[200px]">
                <div className="flex flex-col gap-3">

                  {/* ⭐ CARTE FOURNISSEUR */}
                  <div className={`relative aspect-square overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.surfaceSoft }}>
                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 p-4 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white shadow-lg">
                        {getInitials(achat.fournisseur_nom || '?')}
                      </div>
                      <p className="mt-3 text-[14px] font-bold text-white">{achat.fournisseur_nom || 'Fournisseur inconnu'}</p>
                      <p className="mt-1 text-[11px] text-white/70">Fournisseur</p>
                    </div>
                  </div>

                  {/* ⭐ CARTE RÉSUMÉ */}
                  <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.card }}>
                    <div className={`flex items-center gap-2 border-b px-3 py-2.5 ${borderClass}`}>
                      <span className="text-[12px] font-normal uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Résumé</span>
                    </div>
                    <div className="p-3 space-y-2">
                      <InfoRow label="Référence" value={achat.reference || '—'} />
                      <div className="h-px" style={{ background: theme.border }} />
                      <InfoRow label="Date" value={formatDate(achat.date_achat)} />
                      <div className="h-px" style={{ background: theme.border }} />
                      <InfoRow label="Qté produits" value={numberProduits} />
                      <div className="h-px" style={{ background: theme.border }} />
                      <div>
                        <div className="mb-0.5 flex items-center gap-1.5 text-[12px] font-normal" style={{ color: theme.muted }}>
                          <Receipt className="h-3 w-3" /> Total TTC
                        </div>
                        {/* ⭐ FIX: Esorina ny formatMoney */}
                        <div className="text-[15px] font-semibold tracking-tight" style={{ color: theme.primary }}>{formatAriary(calculatedTotalTTC)}</div>
                      </div>
                      <div className="mt-2 flex items-center gap-2 rounded-lg px-2.5 py-1.5" style={{ background: theme.primarySoft, border: `1px solid ${theme.primaryBorder}` }}>
                        <StatusBadge statut={achat.statut} theme={theme} />
                      </div>
                    </div>
                  </div>

                </div>
              </aside>

              {/* ⭐ MAIN RIGHT */}
              <div className="min-w-0 flex-1 space-y-4">

                {/* ⭐ INFORMATIONS GÉNÉRALES (GRID 3 COLS) */}
                <div className="overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                  <div className={`flex items-center gap-2.5 border-b px-3 py-2.5 ${borderClass}`} style={{ background: theme.card }}>
                    <span className="text-[13px] font-normal uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Informations générales</span>
                  </div>
                  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l ${borderClass}`}>
                    <FormCell label="Référence" borderRight borderBottom>
                      <span className="block truncate font-mono text-[14px] font-semibold" style={{ color: theme.primary }}>{achat.reference || '—'}</span>
                    </FormCell>
                    <FormCell label="Fournisseur" borderRight borderBottom>
                      <span className="block truncate text-[14px] font-medium" style={{ color: theme.text }}>{achat.fournisseur_nom || '—'}</span>
                    </FormCell>
                    <FormCell label="Date" borderRight={false} borderBottom>
                      <span className="block truncate text-[14px] font-medium" style={{ color: theme.text }}>{formatDate(achat.date_achat)}</span>
                    </FormCell>
                    <FormCell label="Statut" borderRight borderBottom>
                      <span className="inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[12px] font-semibold uppercase" style={{ background: theme.primarySoft, borderColor: theme.primaryBorder, color: theme.primary }}>{achat.statut || 'En attente'}</span>
                    </FormCell>
                    <FormCell label="Qté produits" borderRight borderBottom>
                      <span className="block truncate text-[14px] font-medium" style={{ color: theme.text }}>{numberProduits}</span>
                    </FormCell>
                    <FormCell label="Quantité totale" borderRight={false} borderBottom>
                      <span className="block truncate text-[14px] font-medium" style={{ color: theme.text }}>{quantiteTotale}</span>
                    </FormCell>
                    <FormCell label="Créé le" borderRight={false} borderBottom={false} fullWidth>
                      <span className="block truncate text-[14px] font-medium" style={{ color: theme.muted }}>{formatDateTime(achat.created_at)}</span>
                    </FormCell>
                  </div>
                </div>

                {/* ⭐ PRODUITS ACHETÉS (TABLEAU) */}
                <div className="overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                  <div className={`flex items-center gap-2.5 border-b px-3 py-2.5 ${borderClass}`} style={{ background: theme.card }}>
                    <span className="text-[13px] font-normal uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Produits achetés · {safeDetails.length}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] border-collapse">
                      <thead>
                        <tr className="border-b" style={{ borderColor: theme.border, background: theme.surfaceSoft }}>
                          <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Produit</th>
                          <th className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Qté</th>
                          <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Prix unitaire</th>
                          <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingDetails ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                              <div className="flex items-center justify-center gap-2">
                                <Clock size={16} className="animate-spin" />
                                Chargement des détails...
                              </div>
                            </td>
                          </tr>
                        ) : safeDetails.length > 0 ? (
                          safeDetails.map(detail => {
                            const imageUrl = productImages[detail.produit_id];
                            const calculatedTotal = (detail.quantite || 0) * (detail.prix_unitaire || 0);
                            return (
                              <tr key={detail.id} className="border-b transition-colors last:border-b-0 hover:bg-slate-50 dark:hover:bg-white/[0.02]" style={{ borderColor: theme.border }}>
                                <td className="px-3 py-2.5">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border" style={{ borderColor: theme.border, background: theme.surfaceSoft }}>
                                      {imageUrl ? <img src={imageUrl} alt={detail.produit_nom} className="h-full w-full object-cover" /> : <Box className="h-4 w-4" style={{ color: theme.primary }} />}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="truncate text-[13px] font-semibold" style={{ color: theme.text }}>{detail.produit_nom}</p>
                                      <p className="mt-0.5 truncate font-mono text-[12px]" style={{ color: theme.muted }}>{detail.produit_code || '—'}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-2.5 text-center text-[13px] font-bold" style={{ color: theme.text }}>{detail.quantite}</td>
                                {/* ⭐ FIX: Esorina ny formatMoney */}
                                <td className="px-3 py-2.5 text-right text-[13px] font-medium" style={{ color: theme.muted }}>{formatAriary(detail.prix_unitaire)}</td>
                                <td className="px-3 py-2.5 text-right text-[13px] font-bold" style={{ color: theme.primary }}>{formatAriary(calculatedTotal)}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-4 text-center text-slate-500">
                              Aucun produit enregistré pour cet achat
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ⭐ RÉCAPITULATIF */}
                <div className="overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                  <div className={`flex items-center gap-2.5 border-b px-3 py-2.5 ${borderClass}`} style={{ background: theme.card }}>
                    <span className="text-[13px] font-normal uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Récapitulatif</span>
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium" style={{ color: theme.muted }}>Sous-total HT</span>
                      {/* ⭐ FIX: Esorina ny formatMoney */}
                      <span className="text-[14px] font-semibold" style={{ color: theme.text }}>{formatAriary(calculatedTotalHT)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium" style={{ color: theme.muted }}>TVA (20%)</span>
                      {/* ⭐ FIX: Esorina ny formatMoney */}
                      <span className="text-[14px] font-semibold" style={{ color: theme.text }}>{formatAriary(calculatedTVA)}</span>
                    </div>
                    <div className="my-2 h-px" style={{ background: theme.border }} />
                    <div className="flex items-center justify-between rounded-lg border px-3 py-2.5" style={{ background: theme.primarySoft, borderColor: theme.primaryBorder }}>
                      <span className="text-[14px] font-bold uppercase tracking-wide" style={{ color: theme.primary }}>Total TTC</span>
                      {/* ⭐ FIX: Esorina ny formatMoney */}
                      <span className="text-[20px] font-bold tracking-tight" style={{ color: theme.primary }}>{formatAriary(calculatedTotalTTC)}</span>
                    </div>
                  </div>
                </div>

                {/* ⭐ OBSERVATION */}
                {achat.observation?.trim() && (
                  <div className="overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                    <div className={`flex items-center gap-2.5 border-b px-3 py-2.5 ${borderClass}`} style={{ background: theme.card }}>
                      <span className="text-[13px] font-normal uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Observation</span>
                    </div>
                    <div className="px-4 py-3">
                      <p className="whitespace-pre-wrap text-[14px] leading-relaxed" style={{ color: theme.muted }}>{achat.observation}</p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className={`flex shrink-0 items-center justify-end gap-2 border-t px-4 py-2.5 sm:px-5 ${borderClass}`} style={{ background: theme.footer }}>
          <span className="hidden text-[11px] font-medium sm:block" style={{ color: theme.subMuted }}>Échap pour fermer</span>
          <div className="ml-auto flex items-center gap-1.5">
            <button type="button" onClick={onClose} className="h-8 rounded-lg border px-3 text-[13px] font-medium transition-all hover:bg-slate-100 active:scale-[0.98] dark:hover:bg-white/[0.05]" style={{ borderColor: theme.border, color: theme.text, background: 'transparent' }}>
              Fermer
            </button>
            <button type="button" onClick={onEdit} className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]" style={{ background: theme.primary }}>
              <Edit className="h-3.5 w-3.5" strokeWidth={2} />
              Modifier
            </button>
          </div>
        </footer>

        <style>{`
          .custom-achat-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
          .custom-achat-scroll::-webkit-scrollbar-track { background: transparent; }
          .custom-achat-scroll::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.24); border-radius: 999px; }
          .custom-achat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.40); }
        `}</style>
      </div>
    </div>
  );
};

export default AchatsViewModal;