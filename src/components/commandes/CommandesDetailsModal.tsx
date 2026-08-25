// src/components/commandes/CommandesDetailsModal.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Receipt, ShoppingBag, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';

const STATUS = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
} as const;

type StatusType = typeof STATUS[keyof typeof STATUS];

interface Commande {
  id: number; numero: string; client_nom: string; client_telephone: string; client_email: string;
  date_commande: string; statut: StatusType; total_ht: number; total_ttc: number; remise: number;
  observation: string; created_at?: string; updated_at?: string;
}

interface DetailCommande {
  id: number; produit_id: number; produit_nom: string; produit_code: string;
  quantite: number; prix_unitaire: number; total_ligne: number; produit_image?: string;
}

interface CommandesDetailsModalProps {
  commande: Commande; details?: DetailCommande[]; onClose: () => void; onGenerateFacture: () => void;
  clientImageUrl?: string | null; clientImageError?: boolean;
}

const COLORS = {
  light: { card: '#FFFFFF', surface: '#FFFFFF', surfaceSoft: '#F8FAFC', footer: '#F8FAFC', border: '#E2E8F0', borderStrong: '#CBD5E1', text: '#0F172A', muted: '#64748B', subMuted: '#94A3B8', primary: '#6366F1', primaryHover: '#4F46E5', primarySoft: 'rgba(99,102,241,0.08)', primaryBorder: 'rgba(99,102,241,0.18)', success: '#059669', successBg: 'rgba(16,185,129,0.10)', successBorder: 'rgba(16,185,129,0.25)', warning: '#D97706', warningBg: 'rgba(245,158,11,0.10)', warningBorder: 'rgba(245,158,11,0.25)', danger: '#DC2626', dangerBg: 'rgba(239,68,68,0.08)', dangerBorder: 'rgba(239,68,68,0.20)' },
  dark: { card: '#0F172A', surface: '#0F172A', surfaceSoft: '#111827', footer: '#0F172A', border: '#334155', borderStrong: '#475569', text: '#F8FAFC', muted: '#94A3B8', subMuted: '#64748B', primary: '#818CF8', primaryHover: '#6366F1', primarySoft: 'rgba(99,102,241,0.12)', primaryBorder: 'rgba(99,102,241,0.25)', success: '#34D399', successBg: 'rgba(16,185,129,0.14)', successBorder: 'rgba(52,211,153,0.28)', warning: '#FBBF24', warningBg: 'rgba(245,158,11,0.12)', warningBorder: 'rgba(251,191,36,0.25)', danger: '#F87171', dangerBg: 'rgba(239,68,68,0.12)', dangerBorder: 'rgba(248,113,113,0.25)' }
} as const;

type ThemeColors = typeof COLORS.light;

interface FormCellProps { label: string; children: React.ReactNode; borderRight?: boolean; borderBottom?: boolean; fullWidth?: boolean; }

const FormCell: React.FC<FormCellProps> = ({ label, children, borderRight = true, borderBottom = true, fullWidth = false }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  const borderClass = isDark ? 'border-white/[0.06]' : 'border-slate-200';
  return (
    <div className={['flex min-w-0 items-center px-3 py-2.5', borderRight ? `border-r ${borderClass}` : '', borderBottom ? `border-b ${borderClass}` : '', fullWidth ? 'col-span-3' : ''].join(' ')} style={{ background: theme.card }}>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 truncate text-[12px] font-semibold uppercase tracking-[0.045em]" style={{ color: theme.muted }}>{label || ' '}</div>
        <div className="min-w-0 text-[14px] font-medium leading-4" style={{ color: theme.text }}>{children}</div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ statut: StatusType; theme: ThemeColors; }> = ({ statut, theme }) => {
  let style = { background: theme.primarySoft, borderColor: theme.primaryBorder, color: theme.primary };
  if (statut === STATUS.CONFIRMED || statut === STATUS.DELIVERED) style = { background: theme.successBg, borderColor: theme.successBorder, color: theme.success };
  if (statut === STATUS.PENDING) style = { background: theme.warningBg, borderColor: theme.warningBorder, color: theme.warning };
  if (statut === STATUS.CANCELLED) style = { background: theme.dangerBg, borderColor: theme.dangerBorder, color: theme.danger };
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1 text-[12px] font-semibold" style={style}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.color }} />
      {statut}
    </span>
  );
};

const CommandesDetailsModal: React.FC<CommandesDetailsModalProps> = ({ commande, details = [], onClose, onGenerateFacture, clientImageUrl, clientImageError }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  const borderClass = isDark ? 'border-white/[0.06]' : 'border-slate-200';
  const [isVisible, setIsVisible] = useState(false);
  const [productImages, setProductImages] = useState<Record<number, string | null>>({});
  const imageCacheRef = useRef<Record<number, string | null>>({});
  const loadingImagesRef = useRef<Set<number>>(new Set());
  const safeDetails = useMemo(() => (Array.isArray(details) ? details : []), [details]);

  useEffect(() => {
    let cancelled = false;
    const loadImages = async () => {
      const pending = safeDetails.filter(detail => !Object.prototype.hasOwnProperty.call(imageCacheRef.current, detail.produit_id) && !loadingImagesRef.current.has(detail.produit_id));
      if (!pending.length) return;
      pending.forEach(detail => { loadingImagesRef.current.add(detail.produit_id); });
      const entries = await Promise.all(pending.map(async detail => {
        const productId = detail.produit_id;
        if (!detail.produit_image || !window.api?.images?.getUrl) { imageCacheRef.current[productId] = null; loadingImagesRef.current.delete(productId); return [productId, null] as const; }
        try {
          const result = await window.api.images.getUrl(detail.produit_image);
          const url = result?.success && result.data ? result.data : null;
          imageCacheRef.current[productId] = url; loadingImagesRef.current.delete(productId); return [productId, url] as const;
        } catch (error) {
          console.error('[CommandesDetailsModal] Erreur chargement image produit:', error);
          imageCacheRef.current[productId] = null; loadingImagesRef.current.delete(productId); return [productId, null] as const;
        }
      }));
      if (!cancelled) setProductImages(prev => ({ ...prev, ...Object.fromEntries(entries) }));
    };
    loadImages();
    return () => { cancelled = true; };
  }, [safeDetails]);

  useEffect(() => { const timer = window.setTimeout(() => setIsVisible(true), 10); return () => window.clearTimeout(timer); }, []);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key !== 'Escape') return; event.preventDefault(); onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown); };
  }, [onClose]);

  const formatDate = (date?: string) => { if (!date) return '—'; try { return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch { return date; } };
  const formatDateTime = (date?: string) => { if (!date) return '—'; try { return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return date; } };
  const getInitials = (name?: string) => { if (!name?.trim()) return '?'; return name.trim().split(/\s+/).map(part => part[0]).join('').toUpperCase().slice(0, 2); };
  const calculatedTotalHT = useMemo(() => safeDetails.reduce((total, detail) => total + Number(detail.quantite || 0) * Number(detail.prix_unitaire || 0), 0), [safeDetails]);
  const remise = Number(commande.remise) || 0;
  const baseHT = Math.max(calculatedTotalHT - remise, 0);
  const calculatedTVA = useMemo(() => baseHT * 0.2, [baseHT]);
  const calculatedTotalTTC = useMemo(() => baseHT + calculatedTVA, [baseHT, calculatedTVA]);
  const quantiteTotale = useMemo(() => safeDetails.reduce((total, detail) => total + Number(detail.quantite || 0), 0), [safeDetails]);

  return (
    <div className={['fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-5', 'transition-all duration-200', isVisible ? 'opacity-100' : 'opacity-0'].join(' ')} style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }} role="dialog" aria-modal="true" aria-labelledby="commande-view-title" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={['relative flex w-full max-w-[70%] max-h-[80vh] flex-col', 'overflow-hidden rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.22)]', 'transition-all duration-200', borderClass, isVisible ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[0.985]'].join(' ')} style={{ background: theme.card }} onMouseDown={event => event.stopPropagation()}>
        <div className="absolute left-0 right-0 top-0 z-30 h-[3px]" style={{ background: theme.primary }} />

        {/* HEADER */}
        <header className={`flex shrink-0 items-center justify-between gap-4 border-b px-4 py-3 sm:px-5 ${borderClass}`} style={{ background: theme.surface }}>
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border" style={{ background: theme.primarySoft, borderColor: theme.primaryBorder, color: theme.primary }}>
              <ShoppingBag className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="commande-view-title" className="truncate text-[15px] font-semibold tracking-tight" style={{ color: theme.text }}>Détails de la commande</h2>
                <span className="hidden shrink-0 rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium sm:inline-flex" style={{ color: theme.primary, background: theme.primarySoft, borderColor: theme.primaryBorder }}>{commande.numero}</span>
              </div>
              <p className="mt-0.5 truncate text-[13px]" style={{ color: theme.muted }}>Consultation des informations de la commande</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden sm:block"><StatusBadge statut={commande.statut} theme={theme} /></div>
            <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-rose-500/10 hover:text-rose-500" style={{ color: theme.muted }}>
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </header>

        {/* BODY */}
        <main className="flex-1 overflow-y-auto custom-commande-scroll">
          <div className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* SIDEBAR */}
              <aside className="w-full shrink-0 lg:w-[200px]">
                <div className="flex flex-col gap-3">
                  {/* CLIENT */}
                  <div className={`relative aspect-square overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.card }}>
                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 p-4 text-center">
                      {clientImageUrl && !clientImageError ? <img src={clientImageUrl} alt={commande.client_nom} className="h-16 w-16 rounded-full border-2 border-white/30 object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white shadow-lg">{getInitials(commande.client_nom)}</div>}
                      <p className="mt-3 text-[14px] font-bold text-white">{commande.client_nom || 'Client inconnu'}</p>
                      <p className="mt-1 text-[11px] text-white/70">Client</p>
                    </div>
                  </div>

                  {/* RÉSUMÉ */}
                  <div className={`overflow-hidden rounded-xl border ${borderClass}`} style={{ background: theme.card }}>
                    <div className={`border-b px-3 py-2.5 ${borderClass}`}>
                      <span className="text-[12px] font-semibold uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Résumé</span>
                    </div>
                    <div className="space-y-2 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[12px] font-medium" style={{ color: theme.muted }}>N° commande</span>
                        <span className="max-w-[100px] truncate text-right text-[13px] font-semibold" style={{ color: theme.text }}>{commande.numero}</span>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[12px] font-medium" style={{ color: theme.muted }}>Date</span>
                        <span className="max-w-[100px] truncate text-right text-[13px] font-medium" style={{ color: theme.text }}>{formatDate(commande.date_commande)}</span>
                      </div>
                      <div className="my-2 h-px" style={{ background: theme.border }} />
                      <div>
                        <div className="mb-0.5 text-[12px] font-medium" style={{ color: theme.muted }}>Total TTC</div>
                        <div className="text-[15px] font-semibold tracking-tight" style={{ color: theme.primary }}>{formatMoney(calculatedTotalTTC)}</div>
                      </div>
                      <div className="mt-3 rounded-lg px-2.5 py-1.5" style={{ background: theme.primarySoft, border: `1px solid ${theme.primaryBorder}` }}>
                        <span className="text-[12px] font-semibold" style={{ color: theme.primary }}>{commande.statut}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              {/* MAIN */}
              <div className="min-w-0 flex-1 space-y-4">
                {/* INFORMATIONS */}
                <div className="overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                  <div className={`border-b px-3 py-2.5 ${borderClass}`} style={{ background: theme.card }}>
                    <span className="text-[13px] font-semibold uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Informations générales</span>
                  </div>
                  <div className={`grid grid-cols-1 border-l border-t sm:grid-cols-2 lg:grid-cols-3 ${borderClass}`}>
                    <FormCell label="N° Commande"><span className="block truncate font-mono text-[14px] font-semibold" style={{ color: theme.primary }}>{commande.numero}</span></FormCell>
                    <FormCell label="Client"><span className="block truncate text-[14px] font-medium" style={{ color: theme.text }}>{commande.client_nom || '—'}</span></FormCell>
                    <FormCell label="Date" borderRight={false}><span className="block truncate text-[14px] font-medium" style={{ color: theme.text }}>{formatDate(commande.date_commande)}</span></FormCell>
                    <FormCell label="Statut"><span className="inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[12px] font-semibold uppercase" style={{ background: theme.primarySoft, borderColor: theme.primaryBorder, color: theme.primary }}>{commande.statut}</span></FormCell>
                    <FormCell label="Téléphone"><span className="block truncate text-[14px] font-medium" style={{ color: theme.text }}>{commande.client_telephone || '—'}</span></FormCell>
                    <FormCell label="Email" borderRight={false}><span className="block truncate text-[14px] font-medium" style={{ color: theme.text }}>{commande.client_email || '—'}</span></FormCell>
                    <FormCell label="Qté totale"><span className="block truncate text-[14px] font-medium" style={{ color: theme.text }}>{quantiteTotale}</span></FormCell>
                    <FormCell label="Remise"><span className="block truncate text-[14px] font-medium" style={{ color: theme.text }}>{remise > 0 ? `- ${formatMoney(remise)}` : '—'}</span></FormCell>
                    <FormCell label="Créé le" borderRight={false}><span className="block truncate text-[14px] font-medium" style={{ color: theme.muted }}>{formatDateTime(commande.created_at)}</span></FormCell>
                  </div>
                </div>

                {/* ARTICLES */}
                <div className="overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                  <div className={`border-b px-3 py-2.5 ${borderClass}`} style={{ background: theme.card }}>
                    <span className="text-[13px] font-semibold uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Articles commandés · {safeDetails.length}</span>
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
                        {safeDetails.map(detail => {
                          const imageUrl = productImages[detail.produit_id];
                          const lineTotal = Number(detail.quantite || 0) * Number(detail.prix_unitaire || 0);
                          return (
                            <tr key={detail.id} className="border-b transition-colors last:border-b-0 hover:bg-slate-50 dark:hover:bg-white/[0.02]" style={{ borderColor: theme.border }}>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border" style={{ borderColor: theme.border, background: theme.surfaceSoft }}>
                                    {imageUrl ? <img src={imageUrl} alt={detail.produit_nom} className="h-full w-full object-cover" /> : <Box className="h-4 w-4" style={{ color: theme.primary }} />}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-[13px] font-semibold" style={{ color: theme.text }}>{detail.produit_nom || 'Produit inconnu'}</p>
                                    <p className="mt-0.5 truncate font-mono text-[12px]" style={{ color: theme.muted }}>{detail.produit_code || '—'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-center text-[13px] font-bold" style={{ color: theme.text }}>{detail.quantite}</td>
                              <td className="px-3 py-2.5 text-right text-[13px] font-medium" style={{ color: theme.muted }}>{formatMoney(detail.prix_unitaire)}</td>
                              <td className="px-3 py-2.5 text-right text-[13px] font-bold" style={{ color: theme.primary }}>{formatMoney(lineTotal)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {!safeDetails.length && <div className="flex items-center justify-center px-4 py-10 text-[13px]" style={{ color: theme.muted }}>Aucun article dans cette commande.</div>}
                </div>

                {/* RÉCAPITULATIF */}
                <div className="overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                  <div className={`border-b px-3 py-2.5 ${borderClass}`} style={{ background: theme.card }}>
                    <span className="text-[13px] font-semibold uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Récapitulatif</span>
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium" style={{ color: theme.muted }}>Sous-total HT</span>
                      <span className="text-[14px] font-semibold" style={{ color: theme.text }}>{formatMoney(calculatedTotalHT)}</span>
                    </div>
                    {remise > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-medium" style={{ color: theme.muted }}>Remise</span>
                        <span className="text-[14px] font-semibold" style={{ color: theme.success }}>- {formatMoney(remise)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium" style={{ color: theme.muted }}>TVA (20%)</span>
                      <span className="text-[14px] font-semibold" style={{ color: theme.text }}>{formatMoney(calculatedTVA)}</span>
                    </div>
                    <div className="my-2 h-px" style={{ background: theme.border }} />
                    <div className="flex items-center justify-between rounded-lg border px-3 py-2.5" style={{ background: theme.primarySoft, borderColor: theme.primaryBorder }}>
                      <span className="text-[14px] font-bold uppercase tracking-wide" style={{ color: theme.primary }}>Total TTC</span>
                      <span className="text-[20px] font-bold tracking-tight" style={{ color: theme.primary }}>{formatMoney(calculatedTotalTTC)}</span>
                    </div>
                  </div>
                </div>

                {/* OBSERVATION */}
                {commande.observation?.trim() && (
                  <div className="overflow-hidden rounded-xl border" style={{ background: theme.card, borderColor: theme.border }}>
                    <div className={`border-b px-3 py-2.5 ${borderClass}`} style={{ background: theme.card }}>
                      <span className="text-[13px] font-semibold uppercase tracking-[0.045em]" style={{ color: theme.muted }}>Observation</span>
                    </div>
                    <div className="px-4 py-3 text-[13px] leading-5" style={{ color: theme.text }}>{commande.observation}</div>
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
            <button type="button" onClick={onClose} className="h-8 rounded-lg border px-3 text-[13px] font-medium transition-all hover:bg-slate-100 active:scale-[0.98] dark:hover:bg-white/[0.05]" style={{ borderColor: theme.border, color: theme.text, background: 'transparent' }}>Fermer</button>
            <button type="button" onClick={onGenerateFacture} className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]" style={{ background: theme.primary }}>
              <Receipt className="h-3.5 w-3.5" strokeWidth={2} />Générer la facture
            </button>
          </div>
        </footer>

        <style>{`.custom-commande-scroll::-webkit-scrollbar{width:6px;height:6px}.custom-commande-scroll::-webkit-scrollbar-track{background:transparent}.custom-commande-scroll::-webkit-scrollbar-thumb{background:rgba(100,116,139,0.24);border-radius:999px}.custom-commande-scroll::-webkit-scrollbar-thumb:hover{background:rgba(100,116,139,0.40)}`}</style>
      </div>
    </div>
  );
};

export default CommandesDetailsModal;