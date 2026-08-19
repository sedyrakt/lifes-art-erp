import React, { useMemo } from 'react';
import { TrendingUp, Package, Boxes, Trophy, PieChart, Users, DollarSign, ShoppingCart, Activity, CheckCircle, AlertCircle, XCircle, BarChart3 } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';
import { useTheme } from '../../contexts/ThemeContext';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatMoney, formatMoneyShort } from '../../lib/formatMoney';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

type Granularity = 'jour' | 'semaine' | 'mois' | 'annee';
type ChartTab = 'ventes' | 'stock' | 'top' | 'categories' | 'clients' | 'depenses' | 'commandes';

interface DashboardChartsProps {
  ventesParMois?: any[];
  topProduits?: any[];
  categorieRepartition?: any[];
  selectedDate: Date;
  granularity: Granularity;
  isDark?: boolean;
  activeTab?: ChartTab;
  entreesStock?: any[];
  sortiesStock?: any[];
  topClients?: any[];
  depensesParCategorie?: any[];
  commandesStatut?: any[];
  stockStatus?: { en_stock: number; stock_bas: number; rupture: number; };
}

const toNumber = (value: any): number => { const n = Number(value); return Number.isFinite(n) ? n : 0; };
const formatNumber = (value: any): string => new Intl.NumberFormat('fr-FR').format(toNumber(value));
const getProductName = (product: any): string => product?.nom || product?.produit_nom || product?.name || 'Produit inconnu';

const COLORS = {
  bg: '#0B1220', card: '#111B2E', cardHover: '#15223A', border: '#1F2D45', borderLight: '#263753',
  text: '#F8FAFC', muted: '#94A3B8', subtle: '#64748B',
  indigo: '#6366F1', indigoLight: '#818CF8',
  emerald: '#10B981', emeraldLight: '#34D399',
  amber: '#F59E0B', amberLight: '#FBBF24',
  cyan: '#06B6D4', cyanLight: '#22D3EE',
  rose: '#F43F5E', blue: '#3B82F6',
};

const DashboardCharts: React.FC<DashboardChartsProps> = ({
  ventesParMois = [], topProduits = [], categorieRepartition = [], selectedDate, granularity, isDark: propIsDark,
  entreesStock = [], sortiesStock = [], topClients = [], depensesParCategorie = [], commandesStatut = [],
  stockStatus = { en_stock: 0, stock_bas: 0, rupture: 0 },
}) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : themeIsDark;

  const normalizedProducts = useMemo(() => (topProduits || [])
    .map((item: any) => ({ 
      id: item.id, 
      nom: item.nom || 'Produit inconnu', 
      valeur_vente: toNumber(item.total_ventes)
    }))
    .filter((item: any) => item.valeur_vente > 0), [topProduits]);

  const totalVentesParProduit = useMemo(() => 
    normalizedProducts.reduce((sum: number, item: any) => sum + item.valeur_vente, 0), 
    [normalizedProducts]);

  const totalCA = useMemo(() => (ventesParMois || []).reduce((sum: number, item: any) => sum + toNumber(item?.total_ventes), 0), [ventesParMois]);
  const totalCommandes = useMemo(() => {
    const fromSales = (ventesParMois || []).reduce((sum: number, item: any) => sum + toNumber(item?.nb_commandes), 0);
    if (fromSales > 0) return fromSales;
    return (commandesStatut || []).reduce((sum: number, item: any) => sum + toNumber(item?.nb), 0);
  }, [ventesParMois, commandesStatut]);

  const totalStock = useMemo(() => {
    if (stockStatus.en_stock || stockStatus.stock_bas || stockStatus.rupture)
      return toNumber(stockStatus.en_stock) + toNumber(stockStatus.stock_bas) + toNumber(stockStatus.rupture);
    return (categorieRepartition || []).reduce((sum: number, item: any) => sum + toNumber(item?.total_stock), 0);
  }, [stockStatus, categorieRepartition]);

  const totalProduits = useMemo(() => (categorieRepartition || []).reduce((sum: number, item: any) => sum + toNumber(item?.total_produits), 0), [categorieRepartition]);

  const salesChart = useMemo(() => {
    const labels: string[] = []; const values: number[] = [];
    (ventesParMois || []).forEach((item: any) => {
      let label = '';
      if (granularity === 'jour' || granularity === 'semaine') {
        try {
          const dateValue = item.jour || item.date || item.created_at;
          const parsed = parseISO(String(dateValue));
          if (isValid(parsed)) label = granularity === 'semaine' ? format(parsed, 'dd MMM', { locale: fr }) : format(parsed, 'dd MMM', { locale: fr });
        } catch { label = 'N/A'; }
      } else {
        const monthNumber = toNumber(item.mois);
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        label = months[monthNumber - 1] || String(item.mois || item.month || '');
      }
      labels.push(label || 'N/A');
      values.push(toNumber(item.total_ventes));
    });
    if (!labels.length) return { labels: [format(selectedDate, 'MMMM', { locale: fr })], values: [0] };
    return { labels, values };
  }, [ventesParMois, granularity, selectedDate]);

  const productChart = useMemo(() => ({
    labels: normalizedProducts.length > 0 ? normalizedProducts.map((item: any) => item.nom) : ['Aucune vente'],
    data: normalizedProducts.length > 0 ? normalizedProducts.map((item: any) => item.valeur_vente) : [1],
  }), [normalizedProducts]);

  const categoryColors = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#06B6D4'];

  const lineData = {
    labels: salesChart.labels,
    datasets: [{
      label: "Chiffre d'affaires", data: salesChart.values,
      borderColor: COLORS.indigoLight, borderWidth: 2.5, tension: 0.42,
      pointRadius: 3.5, pointHoverRadius: 6, pointBackgroundColor: COLORS.indigoLight,
      pointBorderColor: COLORS.card, pointBorderWidth: 2, fill: true,
      backgroundColor: (context: any) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return 'rgba(99,102,241,0.15)';
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(99,102,241,0.34)');
        gradient.addColorStop(0.55, 'rgba(99,102,241,0.12)');
        gradient.addColorStop(1, 'rgba(99,102,241,0.01)');
        return gradient;
      },
    }],
  };

  const doughnutData = {
    labels: productChart.labels,
    datasets: [{ data: productChart.data, backgroundColor: categoryColors, borderColor: COLORS.card, borderWidth: 3, hoverOffset: 5 }],
  };

  const lineOptions: any = {
    responsive: true, maintainAspectRatio: false,
    animation: { duration: 900, easing: 'easeOutQuart' },
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#020617', titleColor: '#F8FAFC', bodyColor: '#CBD5E1', borderColor: '#334155', borderWidth: 1, padding: 11, displayColors: false, callbacks: { label: (context: any) => ` ${formatMoney(context.parsed.y)}` } },
    },
    scales: {
      x: { border: { display: false }, grid: { display: false }, ticks: { color: COLORS.subtle, font: { size: 11 }, maxRotation: 0 } },
      y: { beginAtZero: true, border: { display: false }, grid: { color: 'rgba(148,163,184,0.07)', drawTicks: false }, ticks: { color: COLORS.subtle, padding: 8, font: { size: 11 }, callback: (value: any) => formatMoneyShort(value) } },
    },
  };

  const doughnutOptions: any = {
    responsive: true, maintainAspectRatio: false, cutout: '67%',
    animation: { duration: 800 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#020617', titleColor: '#F8FAFC', bodyColor: '#CBD5E1', borderColor: '#334155', borderWidth: 1, padding: 11,
        callbacks: {
          label: (context: any) => {
            const value = toNumber(context.raw);
            const total = productChart.data.reduce((sum: number, current: any) => sum + toNumber(current), 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return ` ${formatMoney(value)} · ${percentage}%`;
          },
        },
      },
    },
  };

  // ⭐ Mise à jour des tailles de police (passage à 14.5px / 15px / 18px / 19px)
  const kpis = [
    { label: "CHIFFRE D'AFFAIRES", value: formatMoney(totalCA), icon: TrendingUp, color: COLORS.indigo, change: '+12.5%' },
    { label: 'BÉNÉFICE NET', value: formatMoney(Math.max(totalCA * 0.22, 0)), icon: DollarSign, color: COLORS.emerald, change: '+8.2%' },
    { label: 'COMMANDES', value: formatNumber(totalCommandes), icon: ShoppingCart, color: COLORS.amber, change: '+15.3%' },
    { label: 'PRODUITS EN STOCK', value: formatNumber(totalStock), icon: Package, color: COLORS.blue, change: '-2.1%' },
  ];

  const DashboardCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`rounded-xl border overflow-hidden transition-all duration-200 ${className}`} style={{ background: COLORS.card, borderColor: COLORS.border, boxShadow: '0 4px 18px rgba(0,0,0,0.12)' }}>
      {children}
    </div>
  );

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map((item, index) => {
          const Icon = item.icon;
          const negative = item.change.startsWith('-');
          return (
            <div key={index} className="group relative overflow-hidden rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5" style={{ background: COLORS.card, borderColor: COLORS.border }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                    <Icon size={21} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    {/* ⭐ text-[9px] -> text-[11px] */}
                    <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: COLORS.subtle }}>{item.label}</p>
                    {/* ⭐ text-[17px] -> text-[19px] */}
                    <p className="mt-1 truncate text-[19px] font-bold tracking-tight" style={{ color: COLORS.text }}>{item.value}</p>
                    {/* ⭐ text-[9px] -> text-[11px] */}
                    <div className={`mt-1 flex items-center gap-1 text-[11px] font-medium ${negative ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {negative ? <XCircle size={10} /> : <TrendingUp size={10} />}
                      <span>{item.change}</span>
                      <span style={{ color: COLORS.subtle }}>vs mois dernier</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute bottom-0 right-0 h-12 w-28 opacity-60" style={{ color: item.color }}>
                <svg viewBox="0 0 120 40" className="h-full w-full" preserveAspectRatio="none">
                  <path d="M0 32 C15 26 17 35 30 25 C42 15 45 31 58 22 C72 12 79 25 90 14 C101 4 108 16 120 7" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_1fr]">
        <DashboardCard>
          <div className="flex items-start justify-between px-4 pt-4">
            <div>
              {/* ⭐ text-[13px] -> text-[14.5px] */}
              <h2 className="text-[14.5px] font-semibold" style={{ color: COLORS.text }}>Évolution du chiffre d'affaires</h2>
              {/* ⭐ text-[10px] -> text-[12px] */}
              <p className="mt-0.5 text-[12px]" style={{ color: COLORS.muted }}>Performance des ventes</p>
            </div>
            {/* ⭐ text-[10px] -> text-[12px] */}
            <div className="rounded-lg border px-2.5 py-1.5 text-[12px]" style={{ borderColor: COLORS.borderLight, color: COLORS.muted, background: '#0D1729' }}>
              {granularity === 'jour' ? 'Journalier' : granularity === 'semaine' ? 'Hebdomadaire' : granularity === 'annee' ? 'Annuel' : 'Mensuel'}
            </div>
          </div>
          <div className="px-3 pb-3 pt-2"><div className="h-[260px]"><Line data={lineData} options={lineOptions} /></div></div>
        </DashboardCard>

        <DashboardCard>
          <div className="px-4 pt-4">
            {/* ⭐ text-[13px] -> text-[14.5px] */}
            <h2 className="text-[14.5px] font-semibold" style={{ color: COLORS.text }}>Répartition des ventes</h2>
            {/* ⭐ text-[10px] -> text-[12px] */}
            <p className="mt-0.5 text-[12px]" style={{ color: COLORS.muted }}>Meilleurs produits</p>
          </div>
          <div className="grid grid-cols-[170px_1fr] items-center gap-2 px-3 pb-4 pt-2">
            <div className="relative h-[210px]">
              <Doughnut key={JSON.stringify(doughnutData)} data={doughnutData} options={doughnutOptions} redraw={true} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                {/* ⭐ text-[16px] -> text-[18px] */}
                <span className="text-[18px] font-bold" style={{ color: COLORS.text }}>{formatMoney(totalVentesParProduit)}</span>
                {/* ⭐ text-[9px] -> text-[11px] */}
                <span className="mt-0.5 text-[11px]" style={{ color: COLORS.subtle }}>Ventes</span>
              </div>
            </div>
            <div className="space-y-2">
              {normalizedProducts.slice(0, 6).map((product: any, index: number) => {
                const percentage = totalVentesParProduit > 0 ? ((product.valeur_vente / totalVentesParProduit) * 100).toFixed(1) : '0.0';
                return (
                  <div key={product.id || index} className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: categoryColors[index % categoryColors.length] }} />
                      {/* ⭐ text-[10px] -> text-[12px] */}
                      <span className="truncate text-[12px]" style={{ color: COLORS.muted }}>{product.nom}</span>
                    </div>
                    {/* ⭐ text-[9px] -> text-[11px] */}
                    <span className="shrink-0 text-[11px]" style={{ color: COLORS.muted }}>{percentage}%</span>
                  </div>
                );
              })}
              {/* ⭐ text-[11px] -> text-[13px] */}
              {!normalizedProducts.length && <div className="text-center text-[13px]" style={{ color: COLORS.subtle }}>Aucune vente</div>}
            </div>
          </div>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Produits', value: totalProduits, icon: Package, color: COLORS.indigo },
          { label: 'Stock total', value: totalStock, icon: Boxes, color: COLORS.blue },
          { label: 'Stock bas', value: stockStatus.stock_bas, icon: AlertCircle, color: COLORS.amber },
          { label: 'Ruptures', value: stockStatus.rupture, icon: XCircle, color: COLORS.rose },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center gap-3 rounded-lg border px-3 py-2.5" style={{ background: COLORS.card, borderColor: COLORS.border }}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${item.color}18`, color: item.color }}>
                <Icon size={15} />
              </div>
              <div className="min-w-0">
                {/* ⭐ text-[9px] -> text-[11px] */}
                <p className="text-[11px] uppercase tracking-wide" style={{ color: COLORS.subtle }}>{item.label}</p>
                {/* ⭐ text-[14px] -> text-[15px] */}
                <p className="text-[15px] font-semibold" style={{ color: COLORS.text }}>{formatNumber(item.value)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardCharts;