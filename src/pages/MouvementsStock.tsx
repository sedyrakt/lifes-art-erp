// src/pages/MouvementsStock.tsx
import React, { useCallback, useState, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import useMouvementsData from '../hooks/useMouvementsData';
import { RefreshCw, Search, List, Grid, ArrowUpDown, Filter, Calendar, X } from 'lucide-react';
import MouvementsStats from '../components/mouvements/MouvementsStats';
import MouvementsTable from '../components/mouvements/MouvementsTable';
import MouvementsGrid from '../components/mouvements/MouvementsGrid';
import MouvementsPagination from '../components/mouvements/MouvementsPagination';
import SuccessModal from '../components/common/SuccessModal';
import ErrorModal from '../components/common/ErrorModal';
import ConfirmModal from '../components/common/ConfirmModal';

const TYPE_OPTIONS = [
  { value: '', label: 'Tous les types' },
  { value: 'ENTREE', label: 'Entrées' },
  { value: 'SORTIE', label: 'Sorties' },
  { value: 'AJUSTEMENT', label: 'Ajustements' },
] as const;

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Date récente' },
  { value: 'date-asc', label: 'Date ancienne' },
  { value: 'quantite-desc', label: 'Quantité ↓' },
  { value: 'quantite-asc', label: 'Quantité ↑' },
] as const;

const MouvementsStock: React.FC = () => {
  const { isDark } = useTheme();
  const {
    mouvements, loading, refreshing, setRefreshing, totalItems, currentPage,
    searchTerm, setSearchTerm, filterType, setFilterType, filterDate, setFilterDate,
    sortOption, setSortOption, statsData, loadMouvements, getTypeColor, getTypeLabel,
    getTypeIcon, ITEMS_PER_PAGE, selectedIds, setSelectedIds, handleSelectAll,
    handleSelectOne, bulkDelete, imageUrls, loadImageForMouvement, hasMore,
    handleNextPage, handlePrevPage,
  } = useMouvementsData();

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number[]>([]);

  const showSuccess = useCallback((title: string, message: string) => { setSuccessTitle(title); setSuccessMessage(message); setShowSuccessModal(true); }, []);
  const showError = useCallback((title: string, message: string) => { setErrorTitle(title); setErrorMessage(message); setShowErrorModal(true); }, []);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try { await loadMouvements(true); } catch (error: any) { showError('Erreur', error?.message || 'Impossible de charger les mouvements.'); }
    finally { setRefreshing(false); }
  }, [refreshing, setRefreshing, loadMouvements, showError]);

  const handleBulkDelete = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setDeleteTarget(ids);
    setShowDeleteModal(true);
  }, [selectedIds]);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (deleteTarget.length === 0) return;
    try {
      await bulkDelete(deleteTarget);
      setSelectedIds(new Set());
      showSuccess('Suppression en lot', `${deleteTarget.length} mouvement(s) supprimé(s).`);
    } catch (error: any) { showError('Erreur de suppression', error?.message || 'Impossible de supprimer les mouvements.'); }
    finally { setShowDeleteModal(false); setDeleteTarget([]); }
  }, [deleteTarget, bulkDelete, setSelectedIds, showSuccess, showError]);

  const resetFilters = useCallback(() => { setSearchTerm(''); setFilterType(''); setFilterDate(''); setSortOption('date-desc'); }, [setSearchTerm, setFilterType, setFilterDate, setSortOption]);

  const hasActiveFilters = Boolean(searchTerm) || Boolean(filterType) || Boolean(filterDate) || sortOption !== 'date-desc';

  // ⭐ FANADIOVANA NY DUPLICATE ID mba tsy hisy ilay erreur "same key"
  const uniqueMouvements = useMemo(() => {
    const seen = new Set();
    return mouvements.filter(m => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [mouvements]);

  return (
    <div className="min-h-full w-full transition-colors duration-300" style={{ background: isDark ? '#0A1222' : '#F8FAFC' }}>
      <div className="mx-auto w-full max-w-[1600px] px-0 py-5 sm:px-0 lg:px-4">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><ArrowUpDown size={18} /></div>
              <div>
                <h1 className="text-[21px] font-semibold tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Mouvements de stock</h1>
                <p className="mt-0.5 text-[13px]" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Suivez les entrées, sorties et ajustements.</p>
              </div>
            </div>
          </div>
          <button type="button" onClick={handleRefresh} disabled={refreshing} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-[13px] font-medium text-white shadow-sm shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Actualisation...' : 'Actualiser'}</span>
          </button>
        </header>

        <div className="mt-5"><MouvementsStats total={statsData.total} entrees={statsData.entrees} sorties={statsData.sorties} ajustements={statsData.ajustements} quantiteEntree={statsData.quantiteEntree} quantiteSortie={statsData.quantiteSortie} refreshing={refreshing} onRefresh={handleRefresh} filtreActif={filterType} onSelectFiltre={setFilterType} /></div>

        <div className="mt-5 flex flex-col gap-2.5 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input type="text" placeholder="Rechercher un mouvement..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-[13px] text-slate-900 outline-none placeholder:text-slate-400 transition-all duration-150 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-[#0F172A] dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-700" />
            {searchTerm && <button type="button" onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"><X size={14} /></button>}
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:shrink-0">
            <div className="relative">
              <Filter size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="h-10 min-w-[145px] appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-[13px] font-medium text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-[#0F172A] dark:text-slate-200 dark:hover:border-slate-700">
                {TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>

            <div className="relative">
              <Calendar size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="h-10 w-[145px] rounded-lg border border-slate-200 bg-white pl-9 pr-2 text-[13px] text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-[#0F172A] dark:text-slate-200 dark:hover:border-slate-700" />
            </div>

            <div className="relative">
              <ArrowUpDown size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="h-10 min-w-[140px] appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-[13px] font-medium text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-[#0F172A] dark:text-slate-200 dark:hover:border-slate-700">
                {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>

            {hasActiveFilters && <button type="button" onClick={resetFilters} className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#0F172A] dark:text-slate-300 dark:hover:bg-slate-800"><X size={14} /> Réinitialiser</button>}

            <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-[#0F172A]">
              <button type="button" onClick={() => setViewMode('table')} className={`flex h-8 w-8 items-center justify-center rounded-md transition-all ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}><List size={17} /></button>
              <button type="button" onClick={() => setViewMode('grid')} className={`flex h-8 w-8 items-center justify-center rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}><Grid size={17} /></button>
            </div>
          </div>
        </div>

        <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-[#0F172A]">
          {loading && mouvements.length === 0 ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <div className="flex flex-col items-center gap-3"><RefreshCw size={25} className="animate-spin text-indigo-500" /><span className="text-[13px] text-slate-500 dark:text-slate-400">Chargement des mouvements...</span></div>
            </div>
          ) : viewMode === 'table' ? (
            <MouvementsTable 
              mouvements={uniqueMouvements} 
              getTypeColor={getTypeColor} 
              getTypeLabel={getTypeLabel} 
              getTypeIcon={getTypeIcon} 
              isDark={isDark} 
              selectedIds={selectedIds} 
              onSelectAll={handleSelectAll} 
              onSelectOne={handleSelectOne} 
              onBulkDelete={handleBulkDelete} 
              imageUrls={imageUrls} 
              loadImageForMouvement={loadImageForMouvement} 
            />
          ) : (
            <MouvementsGrid 
              mouvements={uniqueMouvements} 
              getTypeColor={getTypeColor} 
              getTypeLabel={getTypeLabel} 
              getTypeIcon={getTypeIcon} 
              isDark={isDark} 
              imageUrls={imageUrls} 
              loadImageForMouvement={loadImageForMouvement} 
            />
          )}
        </section>

        <div className="mt-4 flex justify-center">
          <MouvementsPagination 
            currentPage={currentPage} 
            totalItems={totalItems} 
            hasMore={hasMore} 
            onNext={handleNextPage} 
            onPrevious={handlePrevPage} 
          />
        </div>
      </div>

      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title={successTitle} message={successMessage} buttonText="OK" autoCloseDelay={3000} />
      <ErrorModal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title={errorTitle} message={errorMessage} buttonText="OK" autoCloseDelay={4000} />
      <ConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteTarget([]); }} onConfirm={handleConfirmBulkDelete} title="Suppression en lot" message={`Voulez-vous supprimer ${deleteTarget.length} mouvement(s) ?`} confirmText="Supprimer" cancelText="Annuler" confirmColor="red" isDark={isDark} />
    </div>
  );
};

export default MouvementsStock;