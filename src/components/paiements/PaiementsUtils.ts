export const ITEMS_PER_PAGE = 10;

export type TabId = 'employes' | 'commande' | 'facture';
export type DeleteType = 'commande' | 'facture';
export type SortField = 'date_paiement' | 'montant';
export type SortDirection = 'ASC' | 'DESC';

export const safeNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const safeString = (value: unknown): string => String(value ?? '');

export const normalizeText = (value: unknown): string =>
  safeString(value).trim().toLowerCase();

export const formatDate = (value: unknown): string => {
  if (!value) return '-';
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getStatusClass = (status: unknown, isDark: boolean): string => {
  const v = normalizeText(status);
  if (v === 'payée' || v === 'paye' || v === 'livrée' || v === 'payé')
    return isDark
      ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
      : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
  if (v === 'en cours')
    return isDark
      ? 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20'
      : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
  if (v === 'annulée')
    return isDark
      ? 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20'
      : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
  if (v === 'en attente')
    return isDark
      ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20'
      : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
  return isDark
    ? 'bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20'
    : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200';
};

export const moisLabels = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const annees = [2023, 2024, 2025, 2026, 2027];