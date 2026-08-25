// ============================================================
// src/pages/DashboardStock.tsx
// ⭐ PRODUCTION - CLEAN COMPACT
// ⭐ Bénéfice = CA - Dépenses - Salaires PAYÉS (NÉGATIF AZO ATORO)
// ⭐ KPI 1-5 (Row 1: 5 colonnes - MISY PANIER MOYEN)
// ⭐ KPI 6-10 (Row 2: 5 colonnes - MISY RUPTURE STOCK)
// ⭐ KpiCard HEIGHT MITOVY (Compact)
// ⭐ Sparkline COMPACT (Bilava kely)
// ⭐ FontSize +0.5px (Mazava kokoa)
// ⭐ FIX: Date de début = Daty création client (Fomba 2)
// ============================================================

import React, { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { CalendarDays, ChevronDown, TrendingUp, TrendingDown, RefreshCw, Package, Users, AlertTriangle, Wallet, XCircle, ShoppingCart } from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useTheme } from '../contexts/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Filler,
  Legend
);

const formatAriary = (value: number | null | undefined) =>
  `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(value || 0))} Ar`;

const formatNumber = (value: number | null | undefined) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(value || 0));

const formatCompactAriary = (value: number) => {
  const amount = Number(value || 0);
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(2)}Mds Ar`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M Ar`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K Ar`;
  return `${amount} Ar`;
};

const safeNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

// ⭐ Sparkline - COMPACT (Bilava kely sy tsy takona)
const Sparkline = ({ data, color = '#635BFF' }: { data: number[]; color?: string }) => {
  const width = 150;
  const height = 38;
  
  const values = data.length > 0 ? data.map(safeNumber) : [20, 25, 19, 28, 22, 31, 27, 39, 34, 47];
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  
  const points = values.map((v, i) => {
    const x = values.length === 1 ? width / 2 : (i / (values.length - 1)) * width;
    const y = height - 6 - ((v - min) / range) * (height - 12);
    return `${x},${y}`;
  }).join(' ');
  
  const gradientId = `spark-gradient-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-8 w-full overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" points={points} opacity="0.9" />
      <polyline fill="none" stroke={`url(#${gradientId})`} strokeWidth="6" opacity="0.06" points={points} />
    </svg>
  );
};

// ⭐ KpiCard - FontSize +0.5px (Mazava kokoa)
const KpiCard = ({
  title,
  value,
  variation,
  sparkline,
  sparklineColor,
  negative = false,
  money = false,
  icon: Icon,
  iconColor = 'text-indigo-500',
  iconBg = 'bg-indigo-500/10'
}: {
  title: string;
  value: number | string;
  variation: number;
  sparkline: number[];
  sparklineColor?: string;
  negative?: boolean;
  money?: boolean;
  icon?: React.ElementType;
  iconColor?: string;
  iconBg?: string;
}) => {
  const isPositive = variation >= 0 && !negative;
  const color = sparklineColor || (isPositive ? '#635BFF' : '#EF4444');

  return (
    <div className="group relative min-w-0 h-[120px] overflow-hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-[1px] hover:border-slate-300 hover:bg-slate-50 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] dark:border-white/[0.055] dark:bg-[#111c30] dark:shadow-[0_10px_35px_rgba(0,0,0,0.20)] dark:hover:border-white/[0.10] dark:hover:bg-[#142039]">
      <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-indigo-500/[0.035] blur-2xl" />

      <div className="relative min-w-0">
        <div className="flex items-center justify-between">
          {/* ⭐ FIX: text-[10px] → text-[11px] */}
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{title}</p>
          {Icon && (
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
              {/* ⭐ FIX: size={12} → size={13} */}
              <Icon size={13} className={iconColor} />
            </div>
          )}
        </div>

        {/* ⭐ FIX: text-[20px] → text-[21px] */}
        <p className="mt-1 truncate text-[21px] font-bold tracking-tight text-slate-900 dark:text-white">
          {money ? formatAriary(Number(value)) : typeof value === 'string' ? value : formatNumber(Number(value))}
        </p>

        <div className="mt-0.5 flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp size={12} strokeWidth={2.5} className="text-emerald-600 dark:text-emerald-400" />
          ) : (
            <TrendingDown size={12} strokeWidth={2.5} className="text-red-600 dark:text-red-400" />
          )}

          {/* ⭐ FIX: text-[11px] → text-[12px] */}
          <span className={`text-[12px] font-semibold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {variation >= 0 ? '+' : ''}{variation.toFixed(1)}%
          </span>

          {/* ⭐ FIX: text-[10px] → text-[11px] */}
          <span className="text-[11px] text-slate-400 dark:text-slate-500">vs mois dernier</span>
        </div>
      </div>

      <div className="relative mt-1.5 w-full">
        <Sparkline data={sparkline} color={color} />
      </div>
    </div>
  );
};

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-white/[0.055] dark:bg-[#111c30] dark:shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${className}`}>
    {children}
  </div>
);

export default function DashboardStock() {
  const { isDark } = useTheme();
  const [period, setPeriod] = useState<'Jour' | 'Semaine' | 'Mensuel' | 'Annuel'>('Mensuel');
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const { loading, refreshing, stats, chartsData, loadData } = useDashboardData();

  const chiffreAffaires = safeNumber(stats?.chiffreAffaires);
  const depenses = safeNumber(stats?.depenses);
  const salairesPayes = safeNumber(stats?.salairesPayes);

  // ⭐ FIX: Bénéfice Net NÉGATIF (tsy Math.max(0,...))
  const beneficeNet = chiffreAffaires - depenses - salairesPayes;

  const commandes = safeNumber(stats?.commandesTotal);
  const produitsStock = safeNumber(stats?.stockTotal);
  
  // ⭐ PANIER MOYEN = CA / Commandes
  const panierMoyen = commandes > 0 ? chiffreAffaires / commandes : 0;

  void produitsStock; void refreshing; void loadData;

  // ⭐ KPI 1-5 (Row 1: 5 colonnes - MISY PANIER MOYEN)
  const kpis1to5 = useMemo(() => [
    { label: 'Chiffre d’affaires', value: chiffreAffaires, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/10', money: true, negative: false },
    { label: 'Bénéfice net', value: beneficeNet, icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10', money: true, negative: beneficeNet < 0 },
    { label: 'Dépenses', value: depenses, icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-500/10', money: true, negative: true },
    { label: 'Salaires payés', value: salairesPayes, icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10', money: true, negative: true },
    { label: 'Panier moyen', value: panierMoyen, icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-500/10', money: true, negative: false },
  ], [chiffreAffaires, beneficeNet, depenses, salairesPayes, panierMoyen]);

  // ⭐ KPI 6-10 (Row 2: 5 colonnes - MISY RUPTURE STOCK)
  const kpis6to10 = useMemo(() => [
    { label: 'Cmd. attente', value: stats?.commandesEnAttente || 0, icon: Package, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: '+2.5%', trendUp: true },
    { label: 'Clients actifs', value: stats?.clientsActifs || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '+5.2%', trendUp: true },
    { label: 'Stock faible', value: stats?.alertesStock || 0, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10', trend: '-1.2%', trendUp: false },
    { label: 'Valeur stock', value: stats?.stockValue || 0, icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: '+3.8%', trendUp: true },
    { label: 'Rupture stock', value: stats?.ruptureStock || 0, icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', trend: '-0.8%', trendUp: false },
  ], [stats]);

  const lastTwoMonths = useMemo(() => {
    const sorted = [...(chartsData.ventesParMois || [])].sort((a, b) => Number(a.mois) - Number(b.mois));
    return sorted.length >= 2 ? { current: sorted[sorted.length - 1], previous: sorted[sorted.length - 2] } : null;
  }, [chartsData.ventesParMois]);

  const getVariation = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number(((current - previous) / previous) * 100).toFixed(1);
  };

  const caVariation = useMemo(() => lastTwoMonths ? getVariation(safeNumber(lastTwoMonths.current.total_ventes), safeNumber(lastTwoMonths.previous.total_ventes)) : 0, [lastTwoMonths]);
  const commandesVariation = useMemo(() => lastTwoMonths ? getVariation(safeNumber(lastTwoMonths.current.nb_commandes), safeNumber(lastTwoMonths.previous.nb_commandes)) : 0, [lastTwoMonths]);
  void commandesVariation;
  const beneficeVariation = caVariation;
  const stockVariation = 0;
  void stockVariation;

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
  const dateRangeLabel = `${startOfMonth.toLocaleDateString('fr-FR', dateOptions)} - ${today.toLocaleDateString('fr-FR', dateOptions)}`;

  const revenueTrend = useMemo(() => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const source = chartsData.ventesParMois || [];
    return Array.isArray(source) && source.length > 0
      ? source.map((item: any) => ({ label: months[Number(item.mois) - 1] || `Mois ${item.mois}`, value: safeNumber(item.total_ventes) }))
      : [{ label: '01 Mai', value: 0 }, { label: '15 Mai', value: 0 }, { label: '31 Mai', value: 0 }];
  }, [chartsData.ventesParMois]);

  const lineData = useMemo(() => ({
    labels: revenueTrend.map(i => i.label),
    datasets: [{
      label: 'Chiffre d’affaires',
      data: revenueTrend.map(i => i.value),
      borderColor: '#635BFF',
      borderWidth: 2.5,
      pointRadius: 3.5,
      pointHoverRadius: 6,
      pointBackgroundColor: '#635BFF',
      pointBorderColor: '#A99EFF',
      pointBorderWidth: 2,
      tension: 0.42,
      fill: true,
      backgroundColor: (context: any) => {
        const { ctx, chartArea } = context.chart;
        if (!chartArea) return 'rgba(99,91,255,0.15)';
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, isDark ? 'rgba(99,91,255,0.42)' : 'rgba(99,91,255,0.28)');
        gradient.addColorStop(0.45, 'rgba(99,91,255,0.16)');
        gradient.addColorStop(1, isDark ? 'rgba(99,91,255,0)' : 'rgba(99,91,255,0.02)');
        return gradient;
      }
    }]
  }), [revenueTrend, isDark]);

  const tooltipColors = useMemo(() => ({
    backgroundColor: isDark ? '#101A2D' : '#FFFFFF',
    titleColor: isDark ? '#CBD5E1' : '#1E293B',
    bodyColor: isDark ? '#FFFFFF' : '#0F172A',
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  }), [isDark]);

  const lineOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipColors.backgroundColor,
        titleColor: tooltipColors.titleColor,
        bodyColor: tooltipColors.bodyColor,
        borderColor: tooltipColors.borderColor,
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (items: any[]) => items?.[0]?.label || '',
          label: (ctx: any) => ` ${formatAriary(ctx.parsed.y)}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        border: { display: false },
        ticks: { color: isDark ? '#71809A' : '#94A3B8', font: { size: 10 }, maxTicksLimit: 7 }
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: isDark ? 'rgba(148,163,184,0.055)' : 'rgba(148,163,184,0.15)', drawBorder: false },
        ticks: { color: isDark ? '#71809A' : '#94A3B8', font: { size: 10 }, padding: 8, callback: (v: any) => formatCompactAriary(Number(v)) }
      }
    }
  };

  const salesDistribution = useMemo(() => {
    const source = chartsData.topProduits || [];
    if (!Array.isArray(source) || source.length === 0) {
      return { data: [{ label: 'Aucune vente', value: 0 }], total: 0 };
    }
    let formatted = source.map((item: any) => ({
      label: item.nom || item.produit_nom || item.name || 'Produit inconnu',
      value: safeNumber(item.total_ventes ?? item.total_ca ?? item.ventes ?? item.sales)
    })).filter(item => item.value > 0).sort((a, b) => b.value - a.value);
    if (formatted.length === 0) return { data: [{ label: 'Aucune vente', value: 0 }], total: 0 };
    const totalAllItems = formatted.reduce((sum, item) => sum + item.value, 0);
    const MAX_CATEGORIES = 5;
    if (formatted.length > MAX_CATEGORIES) {
      const topItems = formatted.slice(0, MAX_CATEGORIES);
      const othersSum = formatted.slice(MAX_CATEGORIES).reduce((sum, item) => sum + item.value, 0);
      if (othersSum > 0) topItems.push({ label: 'Autres', value: othersSum });
      formatted = topItems;
    }
    return { data: formatted, total: totalAllItems };
  }, [chartsData.topProduits]);

  const doughnutData = useMemo(() => ({
    labels: salesDistribution.data.map(item => item.label),
    datasets: [{
      data: salesDistribution.data.map(item => item.value),
      backgroundColor: ['#6256F4', '#1683F5', '#18B879', '#F3A712', '#E76464', isDark ? '#4B5563' : '#9CA3AF'],
      borderWidth: 0,
      hoverOffset: 5,
      spacing: 2,
      borderRadius: 3
    }]
  }), [salesDistribution.data, isDark]);

  const doughnutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    animation: { duration: 700, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipColors.backgroundColor,
        titleColor: tooltipColors.titleColor,
        bodyColor: tooltipColors.bodyColor,
        borderColor: tooltipColors.borderColor,
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx: any) => {
            const total = salesDistribution.total;
            const value = safeNumber(ctx.parsed);
            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return ` ${ctx.label}: ${formatAriary(value)} (${pct}%)`;
          }
        }
      }
    }
  };

  const doughnutCenterPlugin = useMemo(() => ({
    id: 'dashboardDoughnutCenter',
    afterDraw(chart: any) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      const x = (chartArea.left + chartArea.right) / 2;
      const y = (chartArea.top + chartArea.bottom) / 2;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isDark ? '#FFFFFF' : '#0F172A';
      ctx.font = '700 17px Inter, system-ui, sans-serif';
      ctx.fillText(formatCompactAriary(chiffreAffaires), x, y - 7);
      ctx.fillStyle = '#64748B';
      ctx.font = '500 11px Inter, system-ui, sans-serif';
      ctx.fillText('Total', x, y + 15);
      ctx.restore();
    }
  }), [chiffreAffaires, isDark]);

  const topProducts = useMemo(() => {
    const source = chartsData.topProduits || [];
    return Array.isArray(source) && source.length > 0 ? source.slice(0, 5) : [{ nom: 'Aucun produit vendu', total_vendu: 0, total_ventes: 0, evolution: 0 }];
  }, [chartsData.topProduits]);

  const productIconClasses = ['bg-violet-500 text-violet-200', 'bg-amber-500 text-amber-100', 'bg-emerald-500 text-emerald-100', 'bg-red-500 text-red-100', 'bg-blue-500 text-blue-100'];

  const alerts = useMemo(() => {
    const list: { type: string; title: string; message: string; time: string }[] = [];
    if (stats.alertesStock > 0) list.push({ type: 'stock', title: 'Alerte stock bas', message: `${stats.alertesStock} produit(s) ont un stock bas.`, time: 'Maintenant' });
    if (stats.ruptureStock > 0) list.push({ type: 'stock', title: 'Rupture de stock', message: `${stats.ruptureStock} produit(s) sont en rupture.`, time: 'Maintenant' });
    if (stats.commandesEnAttente > 0) list.push({ type: 'commande', title: 'Commandes en attente', message: `${stats.commandesEnAttente} commande(s) sont en attente.`, time: 'Maintenant' });
    return list.length > 0 ? list : [{ type: 'client', title: 'Système opérationnel', message: 'Aucune alerte pour le moment.', time: 'À jour' }];
  }, [stats]);

  const getAlertClass = (type?: string) => {
    switch (type) {
      case 'stock': return 'bg-red-500/10 text-red-600 dark:text-red-400';
      case 'commande': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'paiement': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'client': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      default: return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400';
    }
  };

  const caSparkline = (chartsData.ventesParMois || []).map((v: any) => safeNumber(v.total_ventes)).slice(0, 12);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFC] p-10 text-slate-900 dark:bg-[#0A1222] dark:text-white">
        <div className="flex flex-col items-center gap-4">
          <img src="./images/logo.png" alt="Life's Art" className="h-12 w-12 rounded-xl object-contain animate-pulse" />
          <div className="mt-1 flex flex-col items-center gap-2">
            <span className="text-[16px] font-medium text-slate-500 dark:text-slate-400">Chargement du tableau de bord...</span>
            <RefreshCw size={24} className="animate-spin text-indigo-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full bg-[#F8FAFC] text-slate-900 transition-colors duration-200 dark:bg-[#0A1222] dark:text-white">
      <div className="mx-auto w-full max-w-[1500px] px-2 py-5 sm:px-2 lg:px-2 xl:px-4">

        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img src="./images/logo.png" alt="Life's Art" className="h-10 w-10 rounded-lg object-contain" />
            <div>
              <h1 className="text-[23px] font-bold tracking-tight text-slate-900 dark:text-white">Tableau de bord</h1>
              <p className="mt-0.5 text-[14px] font-medium text-slate-500">Vue d’ensemble de votre activité</p>
            </div>
          </div>

          <button type="button" className="flex h-10 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.08] dark:bg-[#0E182A] dark:text-slate-300 dark:hover:border-white/[0.14] dark:hover:bg-[#131F34]">
            <CalendarDays size={15} className="text-slate-400" />
            <span>{dateRangeLabel}</span>
            <ChevronDown size={14} className="ml-1 text-slate-500" />
          </button>
        </div>

        {/* KPI 1-5 (Row 1: 5 colonnes - MISY PANIER MOYEN) */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {kpis1to5.map((kpi, index) => (
            <KpiCard
              key={index}
              title={kpi.label}
              value={kpi.value}
              variation={0}
              money={kpi.money}
              negative={kpi.negative}
              sparklineColor={kpi.color === 'text-indigo-500' ? '#6366F1' : kpi.color === 'text-emerald-500' ? '#10B981' : kpi.color === 'text-rose-500' ? '#F43F5E' : kpi.color === 'text-amber-500' ? '#F59E0B' : '#3B82F6'}
              sparkline={[0]}
              icon={kpi.icon}
              iconColor={kpi.color}
              iconBg={kpi.bg}
            />
          ))}
        </div>

        {/* KPI 6-10 (Row 2: 5 colonnes - MISY RUPTURE STOCK) */}
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {kpis6to10.map((kpi, index) => (
            <KpiCard
              key={index}
              title={kpi.label}
              value={kpi.value}
              variation={kpi.trendUp ? 2.5 : -1.2}
              money={kpi.label === 'Valeur stock'}
              sparklineColor={kpi.color === 'text-amber-500' ? '#F59E0B' : kpi.color === 'text-blue-500' ? '#3B82F6' : kpi.color === 'text-rose-500' ? '#EF4444' : kpi.color === 'text-red-500' ? '#EF4444' : '#10B981'}
              sparkline={[0]}
              icon={kpi.icon}
              iconColor={kpi.color}
              iconBg={kpi.bg}
            />
          ))}
        </div>

        {/* CHARTS */}
        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[1.55fr_1fr]">

          <SectionCard className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">Évolution du chiffre d’affaires</h2>
              <div className="relative">
                <button type="button" onClick={() => setShowPeriodMenu(v => !v)} className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/[0.07] dark:bg-[#152138] dark:text-slate-300 dark:hover:bg-[#192640]">
                  {period}
                  <ChevronDown size={13} className="text-slate-500" />
                </button>
                {showPeriodMenu && (
                  <div className="absolute right-0 top-10 z-50 w-28 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-xl dark:border-white/[0.08] dark:bg-[#101A2D] dark:shadow-2xl">
                    {['Jour', 'Semaine', 'Mensuel', 'Annuel'].map(item => (
                      <button type="button" key={item} onClick={() => { setPeriod(item as any); setShowPeriodMenu(false); }} className={`flex w-full rounded-md px-2.5 py-2 text-left text-[13px] ${period === item ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/[0.04]'}`}>
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="h-[280px] w-full">
              <Line data={lineData} options={lineOptions} />
            </div>
          </SectionCard>

          <SectionCard className="p-4">
            <div className="mb-3">
              <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">Répartition des ventes</h2>
            </div>

            <div className="flex min-h-[280px] items-center gap-5">
              <div className="relative h-[220px] w-[220px] shrink-0">
                <Doughnut key={JSON.stringify(doughnutData)} data={doughnutData} options={doughnutOptions} plugins={[doughnutCenterPlugin]} redraw />
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                {salesDistribution.data.map((item, index) => {
                  const colors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-400', 'bg-gray-500'];
                  const total = salesDistribution.total;
                  const percentage = total > 0 ? (item.value / total) * 100 : 0;
                  return (
                    <div key={`${item.label}-${index}`} className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2.5">
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-[2px] ${colors[index % colors.length]}`} />
                        <span className="truncate text-[14px] text-slate-700 dark:text-slate-300" title={item.label}>{item.label}</span>
                      </div>
                      <span className="shrink-0 text-[14px] font-medium text-slate-500 dark:text-slate-300">{percentage.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* TOP PRODUCTS + ALERTS */}
        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[1fr_1fr]">

          <SectionCard>
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5 dark:border-white/[0.055]">
              <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">Top 5 produits</h2>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[650px]">
                <div className="grid grid-cols-[minmax(180px,1.4fr)_80px_125px_75px] gap-2 border-b border-slate-200 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-white/[0.045] dark:text-slate-500">
                  <span>Produit</span>
                  <span className="text-right">Quantité</span>
                  <span className="text-right">Ventes</span>
                  <span className="text-right">Évolution</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-white/[0.035]">
                  {topProducts.map((product: any, index) => {
                    const name = product.nom ?? product.name ?? 'Produit';
                    const quantity = safeNumber(product.total_vendu ?? product.quantite ?? product.quantity);
                    const sales = safeNumber(product.total_ventes ?? product.total_ca ?? product.ventes ?? product.sales);
                    const evolution = safeNumber(product.evolution);
                    return (
                      <div key={`${name}-${index}`} className="grid grid-cols-[minmax(180px,1.4fr)_80px_125px_75px] gap-2 border-b border-slate-100 px-4 py-2.5 last:border-b-0 hover:bg-slate-50 dark:border-white/[0.035] dark:hover:bg-white/[0.03]">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${productIconClasses[index % productIconClasses.length]}`}>{index + 1}</div>
                          <span className="truncate text-[14px] font-medium text-slate-800 dark:text-slate-300">{name}</span>
                        </div>
                        <span className="self-center text-right text-[14px] text-slate-500 dark:text-slate-400">{formatNumber(quantity)}</span>
                        <span className="self-center text-right text-[14px] text-slate-500 dark:text-slate-400">{formatAriary(sales)}</span>
                        <span className={`self-center text-right text-[14px] font-semibold ${evolution >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {evolution >= 0 ? '+' : ''}{evolution.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5 dark:border-white/[0.055]">
              <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">Alertes & Notifications</h2>
              <button type="button" className="flex items-center gap-1 text-[10px] font-medium text-violet-600 transition hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">Voir tout</button>
            </div>

            <div>
              {alerts.map((alert, index) => (
                <div key={`${alert.title}-${index}`} className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50 dark:border-white/[0.035] dark:hover:bg-white/[0.03]">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${getAlertClass(alert.type)}`}>!</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-200">{alert.title}</p>
                    <p className="mt-0.5 text-[13px] text-slate-500">{alert.message}</p>
                  </div>
                  <span className="shrink-0 text-[13px] text-slate-500 dark:text-slate-600">{alert.time}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="h-5" />
      </div>
    </div>
  );
}