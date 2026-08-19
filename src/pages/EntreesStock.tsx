// ============================================================
// src/pages/EntreesStock.tsx
// ⭐ FIX: Compacté (Nesorina ny saut de ligne be loatra)
// ============================================================
import React, { useState, useCallback, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useEntreesData } from "../hooks/useEntreesData";
import { Plus, Search, List, Grid, ArrowUpDown, Package, X, RefreshCw } from 'lucide-react';
import EntreesStats from '../components/entrees/EntreesStats';
import EntreesTable from '../components/entrees/EntreesTable';
import EntreesGrid from '../components/entrees/EntreesGrid';
import EntreesPagination from '../components/entrees/EntreesPagination';
import EntreesModalForm from '../components/entrees/EntreesModalForm';
import EntreesViewModal from '../components/entrees/EntreesViewModal';
import ConfirmModal from '../components/common/ConfirmModal';
import SuccessModal from '../components/common/SuccessModal';
import ErrorModal from '../components/common/ErrorModal';

const EntreesStock: React.FC = () => {
  const { isDark } = useTheme();
  const { entrees, produits, fournisseurs, loading, refreshing, totalItems, currentPage, searchTerm, setSearchTerm, filterFournisseur, setFilterFournisseur, sortOption, setSortOption, createEntree, ITEMS_PER_PAGE, selectedIds, setSelectedIds, handleSelectAll, handleSelectOne, bulkDeleteEntrees, imageUrls, loadImageForEntree, hasMore, handleNextPage, handlePrevPage } = useEntreesData();
  const [reelStats, setReelStats] = useState({ totalEntrees: 0, totalQuantite: 0, totalValeur: 0, fournisseurs: 0 });
  const fetchReelStats = useCallback(async () => {
    try { if (!window.api?.stock?.getEntreesStats) return; const result = await window.api.stock.getEntreesStats(); if (result?.success) { setReelStats({ totalEntrees: Number(result.data?.total || 0), totalQuantite: Number(result.data?.quantite_totale || 0), totalValeur: Number(result.data?.valeur_totale || 0), fournisseurs: Number(result.data?.nb_fournisseurs || 0) }); } } catch (error) { console.error('❌ Erreur fetchReelStats Entrees:', error); }
  }, []);
  useEffect(() => { if (!loading) fetchReelStats(); }, [loading, entrees, fetchReelStats]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEntree, setSelectedEntree] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const showSuccess = useCallback((title: string, message: string) => { setSuccessTitle(title); setSuccessMessage(message); setShowSuccessModal(true); }, []);
  const showError = useCallback((title: string, message: string) => { setErrorTitle(title); setErrorMessage(message); setShowErrorModal(true); }, []);
  const handleAddEntree = useCallback(() => { setSelectedProductId(null); setShowModal(true); }, []);
  const handleProductChange = useCallback((id: number | null) => { setSelectedProductId(id); }, []);
  const handleCloseModal = useCallback(() => { setShowModal(false); setSelectedProductId(null); }, []);
  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget; const formData = new FormData(form);
    const produitId = Number(formData.get('produit_id'));
    const quantite = Number(formData.get('quantite'));
    const prixUnitaire = Number(formData.get('prix_unitaire')) || 0;
    const fournisseurIdRaw = String(formData.get('fournisseur_id') || '').trim();
    const fournisseurId = fournisseurIdRaw ? Number(fournisseurIdRaw) : null;
    const reference = String(formData.get('reference') || '').trim() || `ENT-${Date.now().toString().slice(-6)}`;
    const observation = String(formData.get('observation') || '').trim();
    if (!produitId || Number.isNaN(produitId)) { showError('Produit manquant', 'Sélectionnez un produit avant d’enregistrer l’entrée.'); return; }
    if (!quantite || quantite <= 0 || Number.isNaN(quantite)) { showError('Quantité invalide', 'La quantité doit être supérieure à 0.'); return; }
    const produit = (produits || []).find((product) => Number(product?.id) === Number(produitId));
    try {
      await createEntree({ produit_id: produitId, quantite, prix_unitaire: prixUnitaire, fournisseur_id: Number.isInteger(fournisseurId) && fournisseurId > 0 ? fournisseurId : null, reference, observation });
      showSuccess('Entrée enregistrée', `${quantite} × ${produit?.nom || 'Produit'} ajouté au stock.`);
      setShowModal(false); setSelectedProductId(null); await fetchReelStats();
    } catch (error: any) { showError('Erreur', error?.message || 'Une erreur est survenue.'); }
  }, [produits, createEntree, showSuccess, showError, fetchReelStats]);
  const handleViewEntree = useCallback((entree: any) => { setSelectedEntree(entree); setShowViewModal(true); }, []);
  const handleBulkDelete = useCallback(() => { const ids = Array.from(selectedIds); if (!ids.length) return; setDeleteTarget(ids); setShowDeleteModal(true); }, [selectedIds]);
  const handleConfirmBulkDelete = useCallback(async () => {
    try { await bulkDeleteEntrees(deleteTarget); setSelectedIds(new Set()); showSuccess('Suppression terminée', `${deleteTarget.length} entrée(s) supprimée(s).`); await fetchReelStats(); } catch (error: any) { showError('Erreur', error?.message || 'Impossible de supprimer les entrées.'); } finally { setShowDeleteModal(false); setDeleteTarget([]); }
  }, [deleteTarget, bulkDeleteEntrees, setSelectedIds, showSuccess, showError, fetchReelStats]);

  return (<div className="min-h-full w-full px-0 py-5 transition-colors duration-200 sm:px-0 lg:px-4" style={{ background: isDark ? '#0A1222' : '#F8FAFC' }}><div className="mx-auto w-full max-w-[1600px] space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex items-center gap-2.5"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><Package size={19} /></div><div><h1 className="text-[22px] font-semibold tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Entrées stock</h1><p className="mt-0.5 text-[13px]" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Gérez les entrées et réceptions de stock.</p></div></div></div><button type="button" onClick={handleAddEntree} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-[13px] font-semibold text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 active:scale-[0.98]"><Plus size={17} />Nouvelle entrée</button></header>
      <div className="mt-5"><EntreesStats totalEntrees={reelStats.totalEntrees} totalQuantite={reelStats.totalQuantite} totalValeur={reelStats.totalValeur} fournisseurs={reelStats.fournisseurs} refreshing={refreshing} previousTotalEntrees={0} previousTotalQuantite={0} previousTotalValeur={0} previousFournisseurs={0} /></div>
      <div className="mt-5 flex flex-col gap-2.5 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1"><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" /><input type="text" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Rechercher une entrée..." className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-[13px] text-slate-900 outline-none placeholder:text-slate-400 transition-all duration-150 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-[#0F172A] dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-700" />{searchTerm && (<button type="button" onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"><X size={14} /></button>)}</div>
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 xl:shrink-0">
          <div className="relative shrink-0"><select value={filterFournisseur} onChange={(event) => setFilterFournisseur(event.target.value)} className="h-10 min-w-[170px] cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-[13px] font-medium text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-[#0F172A] dark:text-slate-200 dark:hover:border-slate-700"><option value="">Tous les fournisseurs</option>{(fournisseurs || []).map((fournisseur) => (<option key={fournisseur.id} value={String(fournisseur.id)}>{fournisseur.nom}</option>))}</select><div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">▾</div></div>
          <div className="relative shrink-0"><ArrowUpDown size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" /><select value={sortOption} onChange={(event) => setSortOption(event.target.value)} className="h-10 min-w-[155px] cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-[13px] font-medium text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-[#0F172A] dark:text-slate-200 dark:hover:border-slate-700"><option value="date-desc">Plus récent</option><option value="date-asc">Plus ancien</option><option value="quantite-desc">Quantité décroissante</option><option value="quantite-asc">Quantité croissante</option></select><div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">▾</div></div>
          <div className="flex h-10 shrink-0 items-center rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-[#0F172A]"><button type="button" onClick={() => setViewMode('table')} className={`flex h-8 w-8 items-center justify-center rounded-md transition-all ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}><List size={17} /></button><button type="button" onClick={() => setViewMode('grid')} className={`flex h-8 w-8 items-center justify-center rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}><Grid size={17} /></button></div>
        </div>
      </div>
      <section className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-[#0F172A]">
        {loading && entrees.length === 0 ? (<div className="flex min-h-[360px] items-center justify-center"><div className="flex flex-col items-center gap-3"><RefreshCw size={30} className="animate-spin text-indigo-500" /><span className="text-[14px] font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Chargement des entrées...</span></div></div>) : (<>{viewMode === 'table' ? (<EntreesTable entrees={entrees} onView={handleViewEntree} onAdd={handleAddEntree} isDark={isDark} selectedIds={selectedIds} onSelectAll={handleSelectAll} onSelectOne={handleSelectOne} onBulkDelete={handleBulkDelete} imageUrls={imageUrls} loadImageForEntree={loadImageForEntree} />) : (<EntreesGrid entrees={entrees} onView={handleViewEntree} isDark={isDark} imageUrls={imageUrls} loadImageForEntree={loadImageForEntree} />)}</>)}
      </section>
      <div className="flex justify-center"><EntreesPagination currentPage={currentPage} totalItems={totalItems} hasMore={hasMore} onNext={handleNextPage} onPrevious={handlePrevPage} /></div>
    </div>
    <EntreesModalForm isOpen={showModal} onClose={handleCloseModal} onSubmit={handleSubmit} produits={produits} fournisseurs={fournisseurs} isDark={isDark} selectedProductId={selectedProductId} onProductChange={handleProductChange} />
    {showViewModal && selectedEntree && (<EntreesViewModal entree={selectedEntree} onClose={() => setShowViewModal(false)} isDark={isDark} imageUrls={imageUrls} loadImageForEntree={loadImageForEntree} />)}
    <ConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteTarget([]); }} onConfirm={handleConfirmBulkDelete} title="Suppression en lot" message={`Voulez-vous supprimer ${deleteTarget.length} entrée(s) ?`} confirmText="Supprimer" cancelText="Annuler" confirmColor="red" isDark={isDark} />
    <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title={successTitle} message={successMessage} buttonText="OK" autoCloseDelay={3000} />
    <ErrorModal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title={errorTitle} message={errorMessage} buttonText="OK" autoCloseDelay={4000} />
  </div>);
};
export default EntreesStock;