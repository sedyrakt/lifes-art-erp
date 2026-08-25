// src/pages/Rapports.tsx - COMPACT VERSION
// ⭐ FIX: ESRINA NY ICON REHETRA AFA-TSY NY BOUTON
// ⭐ FIX: NAMPIANA NY FONTSIZE AO AMIN'NY TAB BAR
import React, { useState, useEffect } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { formatMoney } from '../lib/formatMoney';
import { useRapportsData } from '../hooks/useRapportsData';
import { RapportsHeader, RapportsCharts, RapportsCommandes, RapportsSummary, RapportsFooter } from '../components/rapports';

type ChartTab = 'ventes' | 'stock' | 'top' | 'categories' | 'clients' | 'depenses' | 'commandes';

const Rapports: React.FC = () => {
  const { isDark } = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [granularity, setGranularity] = useState<'jour' | 'semaine' | 'mois' | 'annee'>('mois');
  const [activeTab, setActiveTab] = useState<ChartTab>('ventes');

  const { loading, refreshing, stats, commandesRecentes, ventesParMois, topProduits, categorieRepartition, stockValue, entreesStock, sortiesStock, topClients, depensesParCategorie, commandesStatut, stockStatus, refresh, handleExportStats, handleExportTopProduits, handleExportCommandes, handleExportPDF, handleExportCSV } = useRapportsData();

  useEffect(() => {
    if (!loading && !refreshing) {
      const hasData = Object.keys(stats).length > 0 || ventesParMois.length > 0 || topProduits.length > 0 || commandesRecentes.length > 0;
      if (!hasData) refresh();
    }
  }, [loading, refreshing, stats, ventesParMois, topProduits, commandesRecentes, refresh]);

  // ⭐ FIX: ESORINA NY ICON AO AMIN'NY TABS
  const tabItems = [
    { id: 'ventes' as const, label: 'Ventes' },
    { id: 'stock' as const, label: 'Mouvements stock' },
    { id: 'top' as const, label: 'Top produits' },
    { id: 'categories' as const, label: 'Catégories' },
    { id: 'clients' as const, label: 'Top clients' },
    { id: 'depenses' as const, label: 'Dépenses' },
    { id: 'commandes' as const, label: 'Commandes' },
  ];

  const bgColor = isDark ? '#0F172A' : '#F8FAFC';

  return (
    <div className="min-h-screen font-sans transition-colors duration-300" style={{ background: bgColor }}>
      <div className="min-h-screen p-0 md:p-4 space-y-6">
        {loading && stats.total === 0 ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={30} className="animate-spin text-indigo-500" />
              <span className="text-[14px] font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Chargement des rapports...</span>
            </div>
          </div>
        ) : (
          <>
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 dark:bg-indigo-500"><BarChart3 className="h-5 w-5" strokeWidth={2} /></div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="truncate text-[22px] font-bold tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Rapports & Analyses</h1>
                    {loading && <span className="hidden rounded-md bg-indigo-50 px-2 py-1 text-[13px] font-medium text-indigo-600 sm:inline-flex dark:bg-indigo-500/10 dark:text-indigo-400">Chargement...</span>}
                  </div>
                  <p className="mt-1 text-[14px] font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Tableau de bord financier et suivi des performances globales</p>
                </div>
              </div>
              <button type="button" onClick={() => { if (!loading && !refreshing) refresh(); }} disabled={loading || refreshing} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3.5 text-[14px] font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50/40 hover:text-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 md:self-auto dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-300 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300">
                <RefreshCw className={`h-4 w-4 text-indigo-600 dark:text-indigo-400 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Actualisation...' : 'Rafraîchir'}</span>
              </button>
            </header>

            <section><RapportsHeader selectedDate={selectedDate} granularity={granularity} onDateChange={setSelectedDate} onGranularityChange={setGranularity} onToday={() => setSelectedDate(new Date())} onRefresh={() => { if (!loading && !refreshing) refresh(); }} onExportStats={() => handleExportStats(formatMoney)} onExportPDF={() => handleExportPDF(formatMoney)} onExportCSV={() => handleExportCSV(formatMoney)} onExportTopProduits={() => handleExportTopProduits(formatMoney)} onExportCommandes={handleExportCommandes} isLoading={loading} isRefreshing={refreshing} /></section>

            {/* ⭐ TAB BAR - NAMPIANA FONTSIZE */}
            <section className="rounded-xl border border-slate-200 bg-white p-1 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-[#0F172A]">
              <div className="flex w-full items-center gap-1 overflow-x-auto scrollbar-hide">
                {tabItems.map(tab => {
                  const isActive = activeTab === tab.id;
                  return (<button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`group relative flex h-10 shrink-0 items-center gap-2 rounded-lg px-4 text-[15px] font-medium whitespace-nowrap transition-all duration-200 ${isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200'}`}>
                    {/* ⭐ FIX: ESORINA NY ICON */}
                    <span>{tab.label}</span>
                    {isActive && <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
                  </button>);
                })}
              </div>
            </section>

            <section><RapportsCharts ventesParMois={ventesParMois} topProduits={topProduits} categorieRepartition={categorieRepartition} selectedDate={selectedDate} granularity={granularity} isDark={isDark} activeTab={activeTab} entreesStock={entreesStock} sortiesStock={sortiesStock} topClients={topClients} depensesParCategorie={depensesParCategorie} commandesStatut={commandesStatut} stockStatus={stockStatus} /></section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <RapportsSummary stats={stats} formatMoney={formatMoney} />
              <RapportsCommandes commandes={commandesRecentes} />
            </section>

            <section><RapportsFooter totalProduits={stockValue?.total_produits || 0} chiffreAffaires={stats.chiffreAffaires} totalVentes={stats.nbCommandes} formatMoney={formatMoney} isDark={isDark} /></section>
          </>
        )}
      </div>
    </div>
  );
};

export default Rapports;