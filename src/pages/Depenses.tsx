// ============================================================
// src/pages/Depenses.tsx - CORRIGÉ (loadData → loadDepenses)
// ============================================================
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Package, Truck, Wrench, Zap, Users, Megaphone, Home, Tag, Plus, Search, List, Grid, ArrowUpDown, CreditCard, X, RotateCw, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useDepensesData } from '../hooks/useDepensesData';
import DepensesStats from '../components/depenses/DepensesStats';
import { DepensesTable, DepensesGrid, DepensesPagination, DepensesModalForm, DepensesViewModal } from '../components/depenses';
import ConfirmModal from '../components/common/ConfirmModal';
import SuccessModal from '../components/common/SuccessModal';
import ErrorModal from '../components/common/ErrorModal';

const CATEGORIES = ['Achat stock', 'Transport', 'Maintenance', 'Utilités', 'Salaire', 'Marketing', 'Loyer', 'Autre'];
const MODES_PAIEMENT = ['Espèces', 'Chèque', 'Carte bancaire', 'Virement', 'Mobile Money', 'Autre'];
const categoryIcons: Record<string, any> = { 'Achat stock': Package, Transport: Truck, Maintenance: Wrench, Utilités: Zap, Salaire: Users, Marketing: Megaphone, Loyer: Home, Autre: Tag };
const categoryColors = (cat: string) => {
  const colors: Record<string, { light: string; dark: string; text: string; }> = {
    'Achat stock': { light: 'bg-indigo-50 border-indigo-200', dark: 'dark:bg-indigo-500/10 dark:border-indigo-500/20', text: 'text-indigo-700 dark:text-indigo-300' },
    Transport: { light: 'bg-amber-50 border-amber-200', dark: 'dark:bg-amber-500/10 dark:border-amber-500/20', text: 'text-amber-700 dark:text-amber-300' },
    Maintenance: { light: 'bg-slate-50 border-slate-200', dark: 'dark:bg-slate-800/60 dark:border-slate-700', text: 'text-slate-700 dark:text-slate-300' },
    Utilités: { light: 'bg-violet-50 border-violet-200', dark: 'dark:bg-violet-500/10 dark:border-violet-500/20', text: 'text-violet-700 dark:text-violet-300' },
    Salaire: { light: 'bg-emerald-50 border-emerald-200', dark: 'dark:bg-emerald-500/10 dark:border-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300' },
    Marketing: { light: 'bg-rose-50 border-rose-200', dark: 'dark:bg-rose-500/10 dark:border-rose-500/20', text: 'text-rose-700 dark:text-rose-300' },
    Loyer: { light: 'bg-indigo-50 border-indigo-200', dark: 'dark:bg-indigo-500/10 dark:border-indigo-500/20', text: 'text-indigo-700 dark:text-indigo-300' },
    Autre: { light: 'bg-slate-50 border-slate-200', dark: 'dark:bg-slate-800/60 dark:border-slate-700', text: 'text-slate-700 dark:text-slate-300' },
  };
  return colors[cat] || { light: 'bg-slate-50 border-slate-200', dark: 'dark:bg-slate-800/60 dark:border-slate-700', text: 'text-slate-700 dark:text-slate-300' };
};

const Depenses: React.FC = () => {
  const { isDark } = useTheme();

  // ⭐ FIX: Nesorina ny loadData, mampiasa loadDepenses fotsiny
  const {
    depenses,
    fournisseurs,
    loading,
    refreshing,
    setRefreshing,
    totalItems,
    currentPage,
    setCurrentPage,
    filters,
    setFilters,
    loadDepenses,
    stats,
    createDepense,
    updateDepense,
    deleteDepense,
    bulkDelete,
    ITEMS_PER_PAGE,
  } = useDepensesData();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteTargetIds, setBulkDeleteTargetIds] = useState<number[]>([]);
  const [reelStats, setReelStats] = useState({ total: 0, nb: 0, moyenne: 0, nbFournisseurs: 0 });
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDepense, setSelectedDepense] = useState<any>(null);
  const [editingDepense, setEditingDepense] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const retryAttempted = useRef(false);

  const safeDepenses = depenses || [];

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

  const handleSelectAll = useCallback((checked: boolean) => {
    setSelectedIds(checked ? new Set(safeDepenses.map(d => d.id)) : new Set());
  }, [safeDepenses]);

  const handleSelectOne = useCallback((id: number, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  }, []);

  const handleBulkDelete = useCallback((ids: number[]) => {
    setBulkDeleteTargetIds(ids);
    setShowBulkDeleteModal(true);
  }, []);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (!bulkDeleteTargetIds.length) return;
    try {
      await bulkDelete(bulkDeleteTargetIds);
      setSelectedIds(new Set());
      showSuccess('Suppression en lot', `${bulkDeleteTargetIds.length} dépense(s) supprimée(s).`);
    } catch (error: any) {
      showError('Erreur de suppression', error?.message || 'Impossible de supprimer.');
    } finally {
      setShowBulkDeleteModal(false);
      setBulkDeleteTargetIds([]);
    }
  }, [bulkDeleteTargetIds, bulkDelete, showSuccess, showError]);

  const fetchReelStats = useCallback(async () => {
    try {
      if (window.api?.expenses?.getStats) {
        const result = await window.api.expenses.getStats();
        if (result?.success) {
          setReelStats({
            total: result.data?.total || 0,
            nb: result.data?.nb || 0,
            moyenne: result.data?.moyenne || 0,
            nbFournisseurs: result.data?.nbFournisseurs || 0,
          });
          return;
        }
      }
      setReelStats({ total: 0, nb: 0, moyenne: 0, nbFournisseurs: 0 });
    } catch (error) {
      console.error('❌ Erreur fetchReelStats Depenses:', error);
    }
  }, []);

  useEffect(() => {
    if (!loading) fetchReelStats();
  }, [loading, depenses, fetchReelStats]);

  // ⭐ FIX: Mampiasa loadDepenses fa tsy loadData
  useEffect(() => {
    if (!loading && safeDepenses.length === 0 && totalItems === 0 && !retryAttempted.current) {
      retryAttempted.current = true;
      loadDepenses();
    }
    if (safeDepenses.length > 0 || totalItems > 0) {
      retryAttempted.current = false;
    }
  }, [loading, safeDepenses.length, totalItems, loadDepenses]);

  const handleOpenAddModal = useCallback(() => {
    setEditingDepense(null);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingDepense(null);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const depenseData = {
      categorie: (formData.get('categorie') as string) || '',
      description: (formData.get('description') as string) || '',
      montant: parseFloat(formData.get('montant') as string) || 0,
      date_depense: (formData.get('date_depense') as string) || new Date().toISOString().split('T')[0],
      mode_paiement: (formData.get('mode_paiement') as string) || 'Espèces',
      reference: (formData.get('reference') as string) || `DEP-${Date.now().toString().slice(-4)}`,
      fournisseur_id: parseInt(formData.get('fournisseur_id') as string) || null,
      observation: (formData.get('observation') as string) || '',
    };
    if (!depenseData.categorie) {
      showError('Catégorie manquante', 'Veuillez sélectionner une catégorie.');
      return;
    }
    if (depenseData.montant <= 0) {
      showError('Montant invalide', 'Le montant doit être supérieur à 0.');
      return;
    }
    if (!depenseData.date_depense) {
      showError('Date manquante', 'Veuillez sélectionner une date.');
      return;
    }
    try {
      if (editingDepense) {
        await updateDepense(editingDepense.id, depenseData);
        showSuccess('Dépense modifiée', 'La dépense a été modifiée avec succès.');
      } else {
        await createDepense(depenseData);
        showSuccess('Dépense ajoutée', 'La dépense a été enregistrée avec succès.');
      }
      setShowModal(false);
      setEditingDepense(null);
    } catch (error: any) {
      showError("Erreur lors de l'opération", error?.message || 'Une erreur inattendue est survenue.');
    }
  }, [editingDepense, createDepense, updateDepense, showSuccess, showError]);

  const handleDeleteClick = useCallback((id: number) => {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteDepense(deleteTarget);
      showSuccess('Dépense supprimée', 'La dépense a été supprimée avec succès.');
    } catch (error: any) {
      showError('Erreur de suppression', error?.message || 'Impossible de supprimer cette dépense.');
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteDepense, showSuccess, showError]);

  const handleViewDepense = useCallback((depense: any) => {
    setSelectedDepense(depense);
    setShowViewModal(true);
  }, []);

  const handleEditDepense = useCallback((depense: any) => {
    setEditingDepense(depense);
    setShowModal(true);
  }, []);

  const handleRefresh = useCallback(() => {
    if (!refreshing) loadDepenses(true);
  }, [loadDepenses, refreshing]);

  const handleResetFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      filterCategorie: '',
      filterMode: '',
      filterDate: '',
      sortOption: 'Date (Récent)',
    });
    setCurrentPage(1);
  }, [setFilters, setCurrentPage]);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <div
      className="min-h-full w-full px-0 py-5 transition-colors duration-300 sm:px-0 lg:px-4"
      style={{ background: isDark ? '#0A1222' : '#F8FAFC' }}
    >
      <div className="mx-auto w-full max-w-[1600px] space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <CreditCard size={18} />
              </div>
              <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Dépenses</h1>
            </div>
            <p className="mt-1.5 text-[13px]" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Suivez et gérez les dépenses de votre entreprise.</p>
          </div>
          <button type="button" onClick={handleOpenAddModal} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-[13px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-indigo-500 dark:hover:bg-indigo-400">
            <Plus size={17} strokeWidth={2.2} />Nouvelle dépense
          </button>
        </header>
       <div className="mt-5"><DepensesStats total={reelStats.total} nb={reelStats.nb} moyenne={reelStats.moyenne} nbFournisseurs={reelStats.nbFournisseurs} totalItems={totalItems} refreshing={refreshing} evolutionTotal={0} evolutionNb={0} evolutionMoyenne={0} evolutionFournisseurs={0} /></div>
        <div className="mt-0 flex flex-col gap-2.5 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Search size={17} className="text-slate-400 dark:text-slate-500" /></div>
            <input type="text" placeholder="Rechercher une dépense..." value={filters.searchTerm} onChange={e => setFilters({ searchTerm: e.target.value })} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-9 text-[13px] text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-[#111c30] dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:bg-[#020617]" />
            {filters.searchTerm && <button type="button" onClick={() => setFilters({ searchTerm: '' })} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200" title="Effacer"><X size={14} /></button>}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 xl:shrink-0">
            <div className="relative shrink-0"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5"><SlidersHorizontal size={14} className="text-slate-400" /></div><select value={filters.filterCategorie} onChange={e => setFilters({ filterCategorie: e.target.value })} className="h-10 min-w-[125px] cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white pl-8 pr-7 text-[13px] text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-[#111c30] dark:text-slate-200"><option value="">Catégorie</option>{CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
            <div className="relative shrink-0"><CreditCard size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><select value={filters.filterMode} onChange={e => setFilters({ filterMode: e.target.value })} className="h-10 min-w-[155px] cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-[13px] text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-[#111c30] dark:text-slate-200"><option value="">Mode de paiement</option>{MODES_PAIEMENT.map(mode => <option key={mode} value={mode}>{mode}</option>)}</select></div>
            <div className="relative shrink-0"><ArrowUpDown size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><select value={filters.sortOption} onChange={e => setFilters({ sortOption: e.target.value })} className="h-10 min-w-[135px] cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-[13px] text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-[#111c30] dark:text-slate-200"><option value="Date (Récent)">Date (Récent)</option><option value="Date (Ancien)">Date (Ancien)</option><option value="Montant (Croissant)">Montant ↑</option><option value="Montant (Décroissant)">Montant ↓</option></select></div>
            <button type="button" onClick={handleRefresh} disabled={refreshing} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-[#111c30] dark:text-slate-400 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400" title="Actualiser"><RotateCw size={16} className={refreshing ? 'animate-spin' : ''} /></button>
            <div className="flex shrink-0 items-center rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-[#111c30]"><button type="button" onClick={() => setViewMode('table')} className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium transition-all ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`} title="Vue tableau"><List size={15} /><span className="hidden 2xl:inline">Tableau</span></button><button type="button" onClick={() => setViewMode('grid')} className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`} title="Vue grille"><Grid size={15} /><span className="hidden 2xl:inline">Grille</span></button></div>
          </div>
        </div>

        <section className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] dark:border-slate-800 dark:bg-[#0F172A]">
          {loading && safeDepenses.length === 0 ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw size={30} className="animate-spin text-indigo-500" />
                <span className="text-[14px] font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  Chargement des dépenses...
                </span>
              </div>
            </div>
          ) : (
            <>
              {viewMode === 'table' ? (
                <DepensesTable depenses={safeDepenses} onView={handleViewDepense} onEdit={handleEditDepense} onDelete={handleDeleteClick} onAdd={handleOpenAddModal} categoryIcons={categoryIcons} categoryColors={categoryColors} isDark={isDark} selectedIds={selectedIds} onSelectAll={handleSelectAll} onSelectOne={handleSelectOne} onBulkDelete={handleBulkDelete} />
              ) : (
                <DepensesGrid depenses={safeDepenses} onView={handleViewDepense} onEdit={handleEditDepense} onDelete={handleDeleteClick} categoryIcons={categoryIcons} categoryColors={categoryColors} isDark={isDark} />
              )}
            </>
          )}
        </section>
        {totalPages > 0 && <div className="flex justify-center"><DepensesPagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} onPageChange={setCurrentPage} /></div>}
        <DepensesModalForm isOpen={showModal} onClose={handleCloseModal} onSubmit={handleSubmit} editingDepense={editingDepense} fournisseurs={fournisseurs} categories={CATEGORIES} modesPaiement={MODES_PAIEMENT} isDark={isDark} />
        {showViewModal && selectedDepense && <DepensesViewModal depense={selectedDepense} onClose={() => setShowViewModal(false)} onEdit={() => { setShowViewModal(false); setEditingDepense(selectedDepense); setShowModal(true); }} categoryIcons={categoryIcons} categoryColors={categoryColors} isDark={isDark} />}
        <ConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }} onConfirm={handleConfirmDelete} title="Suppression de la dépense" message="Êtes-vous sûr de vouloir supprimer cette dépense ?" confirmText="Supprimer" cancelText="Annuler" confirmColor="red" isDark={isDark} />
        <ConfirmModal isOpen={showBulkDeleteModal} onClose={() => { setShowBulkDeleteModal(false); setBulkDeleteTargetIds([]); }} onConfirm={handleConfirmBulkDelete} title="Suppression en lot" message={`Voulez-vous vraiment supprimer définitivement ${bulkDeleteTargetIds.length} dépense(s) ? Cette action est irréversible.`} confirmText="Supprimer" cancelText="Annuler" confirmColor="red" isDark={isDark} />
        <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title={successTitle} message={successMessage} buttonText="OK" autoCloseDelay={3000} />
        <ErrorModal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title={errorTitle} message={errorMessage} buttonText="OK" autoCloseDelay={4000} />
      </div>
    </div>
  );
};

export default Depenses;