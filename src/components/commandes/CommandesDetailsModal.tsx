// ============================================================
// src/components/commandes/CommandesDetailsModal.tsx
// ⭐ PREMIUM COMMANDE DETAILS MODAL
// ⭐ DARK + LIGHT MODE
// ⭐ READABLE TYPOGRAPHY (identique aux tables)
// ⭐ ALL BORDER SYSTEM
// ⭐ RESPONSIVE LAYOUT
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Package, Receipt, X, Calendar, User, Box, Phone, Mail, Hash, Clock, ShoppingBag } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';

const STATUS = { PENDING: 'En attente', CONFIRMED: 'Confirmée', DELIVERED: 'Livrée', CANCELLED: 'Annulée' } as const;
type StatusType = typeof STATUS[keyof typeof STATUS];

interface Commande { id: number; numero: string; client_nom: string; client_telephone: string; client_email: string; date_commande: string; statut: StatusType; total_ht: number; total_ttc: number; remise: number; observation: string; updated_at?: string; }
interface DetailCommande { id: number; produit_id: number; produit_nom: string; produit_code: string; quantite: number; prix_unitaire: number; total_ligne: number; produit_image?: string; nb_commandes?: number; }
interface CommandesDetailsModalProps { commande: Commande; details?: DetailCommande[]; onClose: () => void; onGenerateFacture: () => void; clientImageUrl?: string | null; clientImageError?: boolean; }

const COLORS = {
  light: { card: '#FFFFFF', surface: '#FFFFFF', surfaceSoft: '#F8FAFC', border: '#E2E8F0', text: '#0F172A', muted: '#64748B', subtle: '#94A3B8', primary: '#4F46E5', primaryHover: '#4338CA', primaryBg: 'rgba(79,70,229,0.07)', primaryBorder: 'rgba(79,70,229,0.15)', success: '#059669', successBg: 'rgba(16,185,129,0.08)', successBorder: 'rgba(16,185,129,0.16)', warning: '#D97706', warningBg: 'rgba(245,158,11,0.08)', warningBorder: 'rgba(245,158,11,0.16)', danger: '#E11D48', dangerBg: 'rgba(244,63,94,0.07)', dangerBorder: 'rgba(244,63,94,0.15)' },
  dark: { card: '#0F172A', surface: '#0F172A', surfaceSoft: '#111C30', border: 'rgba(148,163,184,0.15)', text: '#F8FAFC', muted: '#94A3B8', subtle: '#64748B', primary: '#818CF8', primaryHover: '#6366F1', primaryBg: 'rgba(99,102,241,0.12)', primaryBorder: 'rgba(129,140,248,0.20)', success: '#34D399', successBg: 'rgba(16,185,129,0.11)', successBorder: 'rgba(52,211,153,0.18)', warning: '#FBBF24', warningBg: 'rgba(245,158,11,0.11)', warningBorder: 'rgba(251,191,36,0.18)', danger: '#FB7185', dangerBg: 'rgba(244,63,94,0.11)', dangerBorder: 'rgba(251,113,133,0.18)' },
};

// ============================================================
// SECTION TITLE
// ============================================================

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; theme: typeof COLORS.light; }> = ({ icon, title, theme }) => (
  <div className="flex items-center gap-2.5 px-4 py-2.5 border-b" style={{ borderColor: theme.border, background: theme.surface }}>
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ background: theme.primaryBg, color: theme.primary }}>{icon}</div>
    <span className="text-[12px] font-semibold uppercase tracking-[0.04em]" style={{ color: theme.text }}>{title}</span>
  </div>
);

// ============================================================
// INFO ROW
// ============================================================

const InfoRow: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode; }> = ({ label, value, icon }) => (
  <div className="flex items-start justify-between gap-4">
    <div className="flex min-w-0 items-center gap-2">
      {icon && <span className="shrink-0 text-slate-400 dark:text-slate-500">{icon}</span>}
      <span className="truncate text-[12px] font-medium text-slate-500 dark:text-slate-400">{label}</span>
    </div>
    <div className="min-w-0 text-right text-[13px] font-semibold text-slate-800 dark:text-slate-200">{value}</div>
  </div>
);

// ============================================================
// STATUS BADGE
// ============================================================

const StatusBadge: React.FC<{ statut: StatusType; theme: typeof COLORS.light; }> = ({ statut, theme }) => {
  let style = { background: theme.primaryBg, borderColor: theme.primaryBorder, color: theme.primary };
  if (statut === STATUS.DELIVERED || statut === STATUS.CONFIRMED) style = { background: theme.successBg, borderColor: theme.successBorder, color: theme.success };
  if (statut === STATUS.PENDING) style = { background: theme.warningBg, borderColor: theme.warningBorder, color: theme.warning };
  if (statut === STATUS.CANCELLED) style = { background: theme.dangerBg, borderColor: theme.dangerBorder, color: theme.danger };

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[12px] font-semibold" style={style}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.color }} />
      {statut}
    </span>
  );
};

// ============================================================
// COMPONENT
// ============================================================

const CommandesDetailsModal: React.FC<CommandesDetailsModalProps> = ({ commande, details, onClose, onGenerateFacture, clientImageUrl, clientImageError }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  const [isVisible, setIsVisible] = useState(false);
  const [productImages, setProductImages] = useState<Record<number, string | null>>({});
  const safeDetails = details || [];
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';

  useEffect(() => {
    let cancelled = false;
    const loadImages = async () => {
      const entries = await Promise.all(safeDetails.map(async detail => {
        if (!detail.produit_image) return [detail.produit_id, null] as const;
        try {
          if (!window.api?.images?.getUrl) return [detail.produit_id, null] as const;
          const result = await window.api.images.getUrl(detail.produit_image);
          if (!result?.success || !result.data) return [detail.produit_id, null] as const;
          const separator = result.data.includes('?') ? '&' : '?';
          return [detail.produit_id, `${result.data}${separator}t=${Date.now()}`] as const;
        } catch (error) { console.error('Erreur chargement image produit:', error); return [detail.produit_id, null] as const; }
      }));
      if (!cancelled) setProductImages(Object.fromEntries(entries));
    };
    loadImages();
    return () => { cancelled = true; };
  }, [safeDetails]);

  useEffect(() => { const timer = window.setTimeout(() => setIsVisible(true), 10); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); onClose(); } }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, [onClose]);

  const formatDate = (date?: string) => { if (!date) return '—'; try { return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch { return date; } };
  const formatDateTime = (date?: string) => { if (!date) return '—'; try { return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return date; } };
  const getInitials = (name: string) => { if (!name) return '?'; return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); };

  const calculatedTotalHT = useMemo(() => safeDetails.reduce((acc, detail) => acc + (detail.quantite || 0) * (detail.prix_unitaire || 0), 0), [safeDetails]);
  const calculatedTVA = useMemo(() => calculatedTotalHT * 0.20, [calculatedTotalHT]);
  const calculatedTotalTTC = useMemo(() => calculatedTotalHT + calculatedTVA, [calculatedTotalHT, calculatedTVA]);
  const remise = Number(commande.remise) || 0;

  return (
    <div className={`fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-5 transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ background: isDark ? 'rgba(0, 0, 0, 0.71)' : 'rgba(15,23,42,0.52)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }} role="dialog" aria-modal="true" aria-labelledby="commande-view-title" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`relative flex w-full max-w-[950px] max-h-[85vh] flex-col overflow-hidden rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.22)] transition-all duration-200 ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[0.985]'} ${borderClass}`} style={{ background: theme.card }} onMouseDown={e => e.stopPropagation()}>
        <div className="absolute left-0 right-0 top-0 z-30 h-[3px]" style={{ background: theme.primary }} />

        {/* HEADER */}
        <header className={`flex shrink-0 items-center justify-between gap-4 border-b px-5 py-3.5 sm:px-6 ${borderClass}`} style={{ background: theme.surface }}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border" style={{ borderColor: theme.border, background: theme.surfaceSoft }}>
              {/* ⭐ FIX: Logo path ovaina ho './images/logo.png' */}
              <img src="./images/logo.png" alt="Logo" className="max-h-[24px] max-w-[24px] object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="commande-view-title" className="truncate text-[15px] font-semibold tracking-tight sm:text-[16px]" style={{ color: theme.text }}>Détails de la commande</h2>
                <span className="hidden shrink-0 rounded-md border px-2 py-0.5 font-mono text-[12px] font-semibold sm:inline-flex" style={{ color: theme.primary, background: theme.primaryBg, borderColor: theme.primaryBorder }}>{commande.numero}</span>
              </div>
              <p className="mt-0.5 truncate text-[13px]" style={{ color: theme.muted }}>Consultation des informations de la commande</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden sm:block"><StatusBadge statut={commande.statut} theme={theme} /></div>
            <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white">
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </header>

        {/* BODY */}
        <main className="flex-1 overflow-y-auto custom-commande-scroll">
          <div className="p-4 sm:p-5 lg:p-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
              {/* SIDEBAR */}
              <aside className="flex flex-col gap-3">
                <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.surface }}>
                  <SectionTitle icon={<User className="h-3.5 w-3.5" strokeWidth={2} />} title="Client" theme={theme} />
                  <div className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-indigo-50 dark:border-slate-700 dark:bg-indigo-500/10">
                        {clientImageUrl && !clientImageError ? (
                          <img src={clientImageUrl} alt={commande.client_nom} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        ) : (
                          <span className="text-[14px] font-semibold text-indigo-600 dark:text-indigo-400">{getInitials(commande.client_nom || '?')}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold leading-4" style={{ color: theme.text }}>{commande.client_nom || 'Client inconnu'}</p>
                        <div className="mt-1 space-y-0.5">
                          {commande.client_telephone && <div className="flex items-center gap-2"><Phone size={12} className="shrink-0" style={{ color: theme.subtle }} /><span className="truncate text-[13px]" style={{ color: theme.muted }}>{commande.client_telephone}</span></div>}
                          {commande.client_email && <div className="flex items-center gap-2"><Mail size={12} className="shrink-0" style={{ color: theme.subtle }} /><span className="truncate text-[13px]" style={{ color: theme.muted }}>{commande.client_email}</span></div>}
                          {!commande.client_telephone && !commande.client_email && <span className="text-[13px]" style={{ color: theme.subtle }}>Aucune coordonnée</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.surface }}>
                  <SectionTitle icon={<FileText className="h-3.5 w-3.5" strokeWidth={2} />} title="Informations" theme={theme} />
                  <div className="space-y-2.5 p-3.5">
                    <InfoRow label="N° commande" value={commande.numero} icon={<Hash size={12} />} />
                    <div className="h-px" style={{ background: theme.border }} />
                    <InfoRow label="Date" value={formatDate(commande.date_commande)} icon={<Calendar size={12} />} />
                    <div className="h-px" style={{ background: theme.border }} />
                    <InfoRow label="Dernière mise à jour" value={formatDateTime(commande.updated_at)} icon={<Clock size={12} />} />
                    <div className="h-px" style={{ background: theme.border }} />
                    <div>
                      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide" style={{ color: theme.subtle }}>Statut</span>
                      <StatusBadge statut={commande.statut} theme={theme} />
                    </div>
                  </div>
                </div>
              </aside>

              {/* MAIN CONTENT */}
              <section className="min-w-0 space-y-3">
                <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.surface }}>
                  <SectionTitle icon={<Package className="h-3.5 w-3.5" strokeWidth={2} />} title={`Articles commandés · ${safeDetails.length}`} theme={theme} />
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] border-collapse">
                      <thead>
                        <tr className="border-b" style={{ borderColor: theme.border, background: theme.surfaceSoft }}>
                          <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme.muted }}>Produit</th>
                          <th className="px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme.muted }}>Qté</th>
                          <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme.muted }}>Prix unitaire</th>
                          <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme.muted }}>Total</th>
                          {safeDetails.some(d => d.nb_commandes !== undefined) && (
                            <th className="px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme.muted }}>Nb. Cmd.</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {safeDetails.map(detail => {
                          const imageUrl = productImages[detail.produit_id];
                          const calculatedTotal = (detail.quantite || 0) * (detail.prix_unitaire || 0);
                          return (
                            <tr key={detail.id} className="border-b transition-colors last:border-b-0 hover:bg-slate-50 dark:hover:bg-white/[0.02]" style={{ borderColor: theme.border }}>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border" style={{ borderColor: theme.border, background: theme.surfaceSoft }}>
                                    {imageUrl ? <img src={imageUrl} alt={detail.produit_nom} className="h-full w-full object-cover" /> : <Box className="h-4 w-4" style={{ color: theme.primary }} />}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-[13px] font-semibold" style={{ color: theme.text }}>{detail.produit_nom}</p>
                                    <p className="mt-0.5 truncate font-mono text-[12px]" style={{ color: theme.muted }}>{detail.produit_code || '—'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-2.5 text-center text-[13px] font-semibold" style={{ color: theme.text }}>{detail.quantite}</td>
                              <td className="px-4 py-2.5 text-right text-[13px] font-medium" style={{ color: theme.muted }}>{formatMoney(detail.prix_unitaire)}</td>
                              <td className="px-4 py-2.5 text-right text-[13px] font-bold" style={{ color: theme.primary }}>{formatMoney(calculatedTotal)}</td>
                              {safeDetails.some(d => d.nb_commandes !== undefined) && (
                                <td className="px-4 py-2.5 text-center text-[13px] font-bold" style={{ color: theme.primary }}>
                                  {detail.nb_commandes ?? 0}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {safeDetails.length === 0 && <div className="flex items-center justify-center px-4 py-10 text-[13px]" style={{ color: theme.muted }}>Aucun article dans cette commande.</div>}
                </div>

                <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.surface }}>
                  <SectionTitle icon={<Receipt className="h-3.5 w-3.5" strokeWidth={2} />} title="Récapitulatif" theme={theme} />
                  <div className="p-4 sm:p-4">
                    <div className="ml-auto w-full max-w-md space-y-2.5">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[13px] font-medium" style={{ color: theme.muted }}>Sous-total HT</span>
                        <span className="text-[13px] font-semibold" style={{ color: theme.text }}>{formatMoney(calculatedTotalHT)}</span>
                      </div>
                      {remise > 0 && (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[13px] font-medium" style={{ color: theme.muted }}>Remise</span>
                          <span className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">- {formatMoney(remise)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[13px] font-medium" style={{ color: theme.muted }}>TVA</span>
                        <span className="text-[13px] font-semibold" style={{ color: theme.text }}>{formatMoney(calculatedTVA)}</span>
                      </div>
                      <div className="h-px" style={{ background: theme.border }} />
                      <div className="flex items-center justify-between gap-4 rounded-xl border px-4 py-2.5" style={{ background: theme.primaryBg, borderColor: theme.primaryBorder }}>
                        <div>
                          <span className="block text-[13px] font-semibold uppercase tracking-wider" style={{ color: theme.primary }}>Total TTC</span>
                          <span className="mt-0.5 block text-[12px]" style={{ color: theme.muted }}>Montant final</span>
                        </div>
                        <span className="text-[18px] font-bold tracking-tight" style={{ color: theme.primary }}>{formatMoney(calculatedTotalTTC)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {commande.observation?.trim() && (
                  <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.surface }}>
                    <SectionTitle icon={<FileText className="h-3.5 w-3.5" strokeWidth={2} />} title="Observation" theme={theme} />
                    <div className="px-4 py-2.5">
                      <p className="whitespace-pre-wrap text-[13px] leading-4" style={{ color: theme.muted }}>{commande.observation}</p>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className={`flex shrink-0 items-center justify-end gap-2 border-t px-5 py-2.5 sm:px-6 ${borderClass}`} style={{ background: theme.surfaceSoft }}>
          <button type="button" onClick={onClose} className="h-8 rounded-lg border px-3 text-[13px] font-medium transition-all hover:bg-slate-100 active:scale-[0.98] dark:hover:bg-white/[0.05]" style={{ borderColor: theme.border, color: theme.text, background: 'transparent' }}>
            Fermer
          </button>
          <button type="button" onClick={onGenerateFacture} className="flex h-8 items-center gap-2 rounded-lg bg-indigo-600 px-3 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]">
            <Receipt className="h-3.5 w-3.5" strokeWidth={2} />
            Générer la facture
          </button>
        </footer>

        <style>{`
          .custom-commande-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
          .custom-commande-scroll::-webkit-scrollbar-track { background: transparent; }
          .custom-commande-scroll::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.24); border-radius: 999px; }
          .custom-commande-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.40); }
        `}</style>
      </div>
    </div>
  );
};

export default CommandesDetailsModal;