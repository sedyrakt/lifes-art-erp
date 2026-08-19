// ============================================================
// src/pages/SortiesStock.tsx - KEYSET PREV/NEXT UI (PREMIUM)
// ⭐ FIX: Nampidirina ny Loading State sy Empty State (tahaka ny Commandes & Produits)
// ⭐ FIX: Background Dark namboarina ho #0A1222 (mitovy amin'ny DashboardStock)
// ============================================================
import React, { useState, useCallback, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext'; 
import { useSortiesData } from "../hooks/useSortiesData";
// ⭐ Nampidirina ny RefreshCw sy Search
import { Plus, Search, List, Grid, ArrowUpDown, Package, X, RefreshCw } from 'lucide-react';
import SortiesStats from '../components/sorties/SortiesStats'; 
import SortiesTable from '../components/sorties/SortiesTable';
import SortiesGrid from '../components/sorties/SortiesGrid'; 
import SortiesPagination from '../components/sorties/SortiesPagination';
import SortiesModalForm from '../components/sorties/SortiesModalForm'; 
import SortiesViewModal from '../components/sorties/SortiesViewModal';
import ConfirmModal from '../components/common/ConfirmModal'; 
import SuccessModal from '../components/common/SuccessModal'; 
import ErrorModal from '../components/common/ErrorModal';

const SortiesStock: React.FC = () => {
  const { isDark } = useTheme(); 
  const { 
    sorties, produits, loading, refreshing, totalItems, currentPage, 
    searchTerm, setSearchTerm, filterProduit, setFilterProduit, sortOption, 
    setSortOption, createSortie, ITEMS_PER_PAGE, selectedIds, setSelectedIds, 
    handleSelectAll, handleSelectOne, bulkDeleteSorties, imageUrls, loadImageForSortie, 
    hasMore, handleNextPage, handlePrevPage 
  } = useSortiesData();

  const [reelStats, setReelStats] = useState({ 
    totalSorties: 0, totalQuantite: 0, totalValeur: 0, destinations: 0 
  });
  
  const fetchReelStats = useCallback(async () => {
    try { 
      if (!window.api?.stock?.getSortiesStats) return; 
      const result = await window.api.stock.getSortiesStats(); 
      if (result?.success) { 
        setReelStats({ 
          totalSorties: result.data?.total || 0, 
          totalQuantite: result.data?.quantite_totale || 0, 
          totalValeur: result.data?.valeur_totale || 0, 
          destinations: result.data?.nb_destinations || 0 
        }); 
      } 
    } catch (error) { console.error('❌ Erreur fetchReelStats Sorties:', error); }
  }, []);
  
  useEffect(() => { if (!loading) fetchReelStats(); }, [loading, sorties, fetchReelStats]);

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table'); 
  const [showModal, setShowModal] = useState(false); 
  const [showViewModal, setShowViewModal] = useState(false); 
  const [selectedSortie, setSelectedSortie] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [deleteTarget, setDeleteTarget] = useState<number[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successTitle, setSuccessTitle] = useState(''); 
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false); 
  const [errorTitle, setErrorTitle] = useState(''); 
  const [errorMessage, setErrorMessage] = useState('');
  
  const showSuccess = useCallback((title: string, message: string) => { 
    setSuccessTitle(title); 
    setSuccessMessage(message); 
    setShowSuccessModal(true); 
  }, []);
  
  const showError = useCallback((title: string, message: string) => { 
    setErrorTitle(title); 
    setErrorMessage(message); 
    setShowErrorModal(true); 
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    const form = e.currentTarget; 
    const fd = new FormData(form);
    const produitId = Number(fd.get('produit_id')); 
    const quantite = Number(fd.get('quantite')); 
    const prixUnitaire = Number(fd.get('prix_unitaire')) || 0;
    const destination = String(fd.get('destination') || '').trim() || 'Client';
    const reference = String(fd.get('reference') || '').trim() || `SOR-${Date.now().toString().slice(-6)}`;
    const observation = String(fd.get('observation') || '').trim();
    
    if (!produitId || Number.isNaN(produitId)) { 
      showError('Produit manquant', 'Sélectionnez un produit.'); 
      return; 
    }
    if (!quantite || quantite <= 0 || Number.isNaN(quantite)) { 
      showError('Quantité invalide', 'La quantité doit être supérieure à 0.'); 
      return; 
    }
    const produit = produits.find(p => p.id === produitId); 
    if (!produit) { 
      showError('Produit introuvable', "Ce produit n'existe pas."); 
      return; 
    }
    try { 
      await createSortie({ 
        produit_id: produitId, 
        quantite, 
        prix_unitaire: prixUnitaire, 
        destination, 
        reference, 
        observation 
      }); 
      showSuccess('Sortie enregistrée', `${quantite} × ${produit.nom} retiré du stock.`); 
      setShowModal(false); 
      fetchReelStats(); 
    } catch (error: any) { 
      showError('Erreur', error?.message || 'Une erreur est survenue.'); 
    }
  }, [produits, createSortie, showSuccess, showError, fetchReelStats]);

  const handleViewSortie = useCallback((sortie: any) => { 
    setSelectedSortie(sortie); 
    setShowViewModal(true); 
  }, []);
  
  const handleAddSortie = useCallback(() => { 
    setShowModal(true); 
  }, []);
  
  const handleBulkDelete = useCallback(() => { 
    const ids = Array.from(selectedIds); 
    if (!ids.length) return; 
    setDeleteTarget(ids); 
    setShowDeleteModal(true); 
  }, [selectedIds]);
  
  const handleConfirmBulkDelete = useCallback(async () => { 
    try { 
      await bulkDeleteSorties(deleteTarget); 
      setSelectedIds(new Set()); 
      showSuccess('Suppression terminée', `${deleteTarget.length} sortie(s) supprimée(s).`); 
      fetchReelStats(); 
    } catch (error: any) { 
      showError('Erreur', error?.message || 'Impossible de supprimer les sorties.'); 
    } finally { 
      setShowDeleteModal(false); 
      setDeleteTarget([]); 
    } 
  }, [deleteTarget, bulkDeleteSorties, setSelectedIds, showSuccess, showError, fetchReelStats]);

  return (
    <div 
      className="min-h-full w-full px-0 py-5 transition-colors duration-200 sm:px-0 lg:px-4 "
      style={{ background: isDark ? '#0A1222' : '#F8FAFC' }}
    >
      <div className="mx-auto w-full max-w-[1600px] space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <Package size={19} />
              </div>
              <div>
                <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Sorties stock</h1>
                <p className="mt-0.5 text-[13px]" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Gérez les sorties et retraits de stock.</p>
              </div>
            </div>
          </div>
          <button type="button" onClick={handleAddSortie} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-[13px] font-semibold text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 active:scale-[0.98]">
            <Plus size={17} />Nouvelle sortie
          </button>
        </header>
        <div className="mt-5">
          <SortiesStats 
            totalSorties={reelStats.totalSorties} 
            totalQuantite={reelStats.totalQuantite} 
            totalValeur={reelStats.totalValeur} 
            destinations={reelStats.destinations} 
            refreshing={refreshing} 
            previousTotalSorties={0} 
            previousTotalQuantite={0} 
            previousTotalValeur={0} 
            previousDestinations={0} 
          />
        </div>
        <div className="mt-5 flex flex-col gap-2.5 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher une sortie..." className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-[13px] text-slate-900 outline-none placeholder:text-slate-400 transition-all duration-150 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-[#0F172A] dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-700" />
            {searchTerm && (<button type="button" onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"><X size={14} /></button>)}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 xl:shrink-0">
            <div className="relative shrink-0">
              <Package size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <select value={filterProduit} onChange={e => setFilterProduit(e.target.value)} className="h-10 min-w-[145px] cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-[13px] font-medium text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-[#0F172A] dark:text-slate-200 dark:hover:border-slate-700">
                <option value="">Tous les produits</option>
                {produits.map(p => (<option key={p.id} value={String(p.id)}>{p.nom}</option>))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">▾</div>
            </div>
            <div className="relative shrink-0">
              <ArrowUpDown size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <select value={sortOption} onChange={e => setSortOption(e.target.value)} className="h-10 min-w-[155px] cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-[13px] font-medium text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-[#0F172A] dark:text-slate-200 dark:hover:border-slate-700">
                <option value="date-desc">Plus récent</option>
                <option value="date-asc">Plus ancien</option>
                <option value="quantite-desc">Quantité décroissante</option>
                <option value="quantite-asc">Quantité croissante</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">▾</div>
            </div>
            <div className="flex h-10 shrink-0 items-center rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-[#0F172A]">
              <button type="button" onClick={() => setViewMode('table')} className={`flex h-8 w-8 items-center justify-center rounded-md transition-all ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}>
                <List size={17} />
              </button>
              <button type="button" onClick={() => setViewMode('grid')} className={`flex h-8 w-8 items-center justify-center rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}>
                <Grid size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* ⭐ TABLE / GRID SECTION - MISY NY LOADING SY EMPTY STATE */}
        <section className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-[#0F172A]">
          
          {loading && sorties.length === 0 ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw size={30} className="animate-spin text-indigo-500" />
                <span className="text-[14px] font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  Chargement des sorties...
                </span>
              </div>
            </div>
          ) : (
            <>
              {viewMode === 'table' ? (
                <SortiesTable 
                  sorties={sorties} 
                  onView={handleViewSortie} 
                  onAdd={handleAddSortie} 
                  isDark={isDark} 
                  selectedIds={selectedIds} 
                  onSelectAll={handleSelectAll} 
                  onSelectOne={handleSelectOne} 
                  onBulkDelete={handleBulkDelete} 
                  imageUrls={imageUrls} 
                  loadImageForSortie={loadImageForSortie} 
                />
              ) : (
                <SortiesGrid 
                  sorties={sorties} 
                  onView={handleViewSortie} 
                  isDark={isDark} 
                  imageUrls={imageUrls} 
                  loadImageForSortie={loadImageForSortie} 
                />
              )}
            </>
          )}
        </section>
        
        <div className="flex justify-center">
          <SortiesPagination 
            currentPage={currentPage} 
            totalItems={totalItems} 
            hasMore={hasMore} 
            onNext={handleNextPage} 
            onPrevious={handlePrevPage} 
          />
        </div>
      </div>
      <SortiesModalForm isOpen={showModal} onClose={() => setShowModal(false)} onSubmit={handleSubmit} produits={produits} isDark={isDark} />
      {showViewModal && selectedSortie && (<SortiesViewModal sortie={selectedSortie} onClose={() => setShowViewModal(false)} isDark={isDark} imageUrls={imageUrls} loadImageForSortie={loadImageForSortie} />)}
      <ConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteTarget([]); }} onConfirm={handleConfirmBulkDelete} title="Suppression en lot" message={`Voulez-vous supprimer ${deleteTarget.length} sortie(s) ?`} confirmText="Supprimer" cancelText="Annuler" confirmColor="red" isDark={isDark} />
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title={successTitle} message={successMessage} buttonText="OK" autoCloseDelay={3000} />
      <ErrorModal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title={errorTitle} message={errorMessage} buttonText="OK" autoCloseDelay={4000} />
    </div>
  );
};
export default SortiesStock;