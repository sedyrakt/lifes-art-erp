// src/pages/Categories.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, List, Grid, ArrowUpDown, X, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useCategoriesData } from '../hooks/useCategoriesData';
import CategoriesStats from '../components/categories/CategoriesStats';
import CategoriesTable from '../components/categories/CategoriesTable';
import CategoriesGrid from '../components/categories/CategoriesGrid';
import CategoriesPagination from '../components/categories/CategoriesPagination';
import CategoriesModalForm from '../components/categories/CategoriesModalForm';
import CategoriesViewModal from '../components/categories/CategoriesViewModal';
import ConfirmModal from '../components/common/ConfirmModal';
import SuccessModal from '../components/common/SuccessModal';
import ErrorModal from '../components/common/ErrorModal';

const SORT_OPTIONS = [{ value: 'Nom (A-Z)', label: 'Nom (A-Z)' }, { value: 'Nom (Z-A)', label: 'Nom (Z-A)' }, { value: 'Plus récent', label: 'Plus récent' }, { value: 'Plus ancien', label: 'Plus ancien' }];

const Categories: React.FC = () => {
  const { isDark } = useTheme();
  const { categories, loading, refreshing, totalItems, totalPages, currentPage, setCurrentPage, searchTerm, setSearchTerm, sortOption, setSortOption, loadData, createCategorie, updateCategorie, deleteCategorie, bulkDelete, getCategoryColor, ITEMS_PER_PAGE } = useCategoriesData();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const showSuccess = useCallback((title: string, message: string) => { setSuccessTitle(title); setSuccessMessage(message); setShowSuccessModal(true); }, []);
  const showError = useCallback((title: string, message: string) => { setErrorTitle(title); setErrorMessage(message); setShowErrorModal(true); }, []);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const handleSelectAll = useCallback((checked: boolean) => {
    if (!checked) { setSelectedIds(new Set()); return; }
    setSelectedIds(prev => { const next = new Set(prev); categories.forEach(category => { const id = Number(category.id); if (Number.isFinite(id) && id > 0) next.add(id); }); return next; });
  }, [categories]);
  const handleSelectOne = useCallback((id: number, checked: boolean) => { setSelectedIds(prev => { const next = new Set(prev); if (checked) next.add(id); else next.delete(id); return next; }); }, []);

  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteTargetIds, setBulkDeleteTargetIds] = useState<number[]>([]);
  const handleBulkDelete = useCallback((ids: number[]) => {
    const validIds = ids.map(Number).filter(id => Number.isFinite(id) && id > 0);
    if (!validIds.length) { showError('Sélection vide', 'Veuillez sélectionner au moins une catégorie.'); return; }
    setBulkDeleteTargetIds(validIds); setShowBulkDeleteModal(true);
  }, [showError]);
  const handleConfirmBulkDelete = useCallback(async () => {
    if (!bulkDeleteTargetIds.length) return;
    const count = bulkDeleteTargetIds.length;
    try {
      const result = await bulkDelete(bulkDeleteTargetIds);
      const deletedCount = Number(result?.data?.deletedCount || 0);
      const errorCount = Number(result?.data?.errorCount || 0);
      setSelectedIds(new Set());
      if (errorCount > 0 && deletedCount === 0) {
        const firstError = result?.data?.errors?.[0]?.error || 'Impossible de supprimer les catégories.';
        showError('Suppression impossible', firstError);
      } else if (errorCount > 0) {
        showSuccess('Suppression terminée', `${deletedCount} catégorie(s) supprimée(s), ${errorCount} impossible(s) à supprimer.`);
      } else {
        showSuccess('Suppression en lot', `${deletedCount || count} catégorie(s) supprimée(s).`);
      }
      await refreshAll();
    } catch (error: any) { showError('Erreur', error?.message || 'Impossible de supprimer les catégories.'); }
    finally { setShowBulkDeleteModal(false); setBulkDeleteTargetIds([]); }
  }, [bulkDelete, bulkDeleteTargetIds, showError, showSuccess]);

  const [reelStats, setReelStats] = useState({ total: 0, avecDescription: 0, totalProduits: 0 });
  const [statsLoading, setStatsLoading] = useState(false);
  const fetchStats = useCallback(async () => {
    if (!window.api?.categories?.getStats) return;
    setStatsLoading(true);
    try {
      const result = await window.api.categories.getStats();
      if (result?.success) { setReelStats({ total: Number(result.data?.total || 0), avecDescription: Number(result.data?.avecDescription || 0), totalProduits: Number(result.data?.totalProduits || 0) }); }
    } catch (error) { console.error('❌ Erreur catégories stats:', error); } finally { setStatsLoading(false); }
  }, []);

  const categoriesWithCounts = useMemo(() => categories.map(category => ({ ...category, produits_count: Number((category as any).produits_count || 0) })), [categories]);
  const tauxCompletion = useMemo(() => { if (reelStats.total <= 0) return 0; return Math.round((reelStats.avecDescription / reelStats.total) * 100); }, [reelStats]);

  const refreshAll = useCallback(async () => { await Promise.allSettled([loadData(), fetchStats()]); }, [loadData, fetchStats]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState<any>(null);
  const [editingCategorie, setEditingCategorie] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const handleOpenAddModal = useCallback(() => { setEditingCategorie(null); setShowModal(true); }, []);
  const handleCloseModal = useCallback(() => { setShowModal(false); setEditingCategorie(null); }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget; const formData = new FormData(form);
    const nom = String(formData.get('nom') || '').trim(); const description = String(formData.get('description') || '').trim();
    if (!nom) { showError('Champ requis', 'Le nom de la catégorie est obligatoire.'); return; }
    try {
      if (editingCategorie) { await updateCategorie(editingCategorie.id, { nom, description }); showSuccess('Catégorie modifiée', `"${nom}" a été mise à jour avec succès.`); }
      else { await createCategorie({ nom, description }); showSuccess('Catégorie ajoutée', `"${nom}" a été ajoutée avec succès.`); }
      setShowModal(false); setEditingCategorie(null); setSelectedIds(new Set()); await refreshAll();
    } catch (error: any) { showError('Erreur', error?.message || 'Une erreur est survenue lors de l’opération.'); }
  }, [editingCategorie, createCategorie, updateCategorie, refreshAll, showError, showSuccess]);

  const handleDeleteClick = useCallback((categorie: any) => { setDeleteTarget(categorie); setShowDeleteModal(true); }, []);
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try { await deleteCategorie(deleteTarget.id); setSelectedIds(prev => { const next = new Set(prev); next.delete(Number(deleteTarget.id)); return next; }); showSuccess('Catégorie supprimée', `"${deleteTarget.nom}" a été supprimée avec succès.`); await refreshAll(); }
    catch (error: any) { showError('Suppression impossible', error?.message || 'Impossible de supprimer cette catégorie.'); }
    finally { setShowDeleteModal(false); setDeleteTarget(null); }
  }, [deleteTarget, deleteCategorie, refreshAll, showError, showSuccess]);

  const handleViewCategorie = useCallback((categorie: any) => { setSelectedCategorie(categorie); setShowViewModal(true); }, []);
  const handleEditCategorie = useCallback((categorie: any) => { setEditingCategorie(categorie); setShowModal(true); }, []);
  const hasSearch = searchTerm.trim().length > 0;

  return (<main className="min-h-full w-full transition-colors duration-200" style={{ background: isDark ? '#0A1222' : '#F8FAFC' }}><div className="mx-auto w-full max-w-[1600px] px-4 py-5 lg:px-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex items-center gap-2"><h1 className="text-[22px] font-semibold tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Catégories</h1>{!loading && (<span className="inline-flex min-w-[28px] items-center justify-center rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">{totalItems}</span>)}</div><p className="mt-1 text-[13px]" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Gérez et organisez les catégories de vos produits.</p></div><button type="button" onClick={handleOpenAddModal} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-[13px] font-semibold text-white shadow-sm shadow-indigo-600/10 transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"><Plus size={17} />Nouvelle catégorie</button></header>
      <div className="mt-5"><CategoriesStats total={reelStats.total || totalItems} avecDescription={reelStats.avecDescription} tauxCompletion={tauxCompletion} categories={categoriesWithCounts} totalProduits={reelStats.totalProduits} evolutionTotal={0} evolutionAvecDescription={0} evolutionTauxCompletion={0} /></div>
      <div className="mt-5 flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-0 flex-1"><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" /><input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher une catégorie..." className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-[13px] text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-[#0F172A] dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-700" />{hasSearch && (<button type="button" onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300" aria-label="Effacer la recherche"><X size={14} /></button>)}</div>
        <div className="flex items-center gap-2"><div className="relative"><ArrowUpDown size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" /><select value={sortOption} onChange={e => { setSortOption(e.target.value); setSelectedIds(new Set()); }} className="h-10 min-w-[150px] cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-[13px] font-medium text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-[#0F172A] dark:text-slate-200 dark:hover:border-slate-700">{SORT_OPTIONS.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}</select></div><div className="flex h-10 items-center rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-[#0F172A]"><button type="button" onClick={() => setViewMode('table')} className={`flex h-8 w-8 items-center justify-center rounded-md transition-all ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300'}`} aria-label="Vue tableau"><List size={17} /></button><button type="button" onClick={() => setViewMode('grid')} className={`flex h-8 w-8 items-center justify-center rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300'}`} aria-label="Vue grille"><Grid size={17} /></button></div></div>
      </div>
      <section className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] dark:border-slate-800 dark:bg-[#0F172A]">
        {loading && categories.length === 0 ? (<div className="flex min-h-[360px] items-center justify-center"><div className="flex flex-col items-center gap-3"><RefreshCw size={30} className="animate-spin text-indigo-500" /><span className="text-[14px] font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Chargement des catégories...</span></div></div>) : (<>
          {(refreshing || statsLoading) && (<div className="flex items-center justify-end gap-2 border-b border-slate-100 px-4 py-2 text-[11px] font-medium text-indigo-500 dark:border-slate-800"><RefreshCw size={13} className="animate-spin" />Actualisation...</div>)}
          {!loading && categories.length === 0 ? (<div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center"><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400"><Search size={24} /></div><h3 className="text-[15px] font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{hasSearch ? 'Aucune catégorie trouvée' : 'Aucune catégorie'}</h3><p className="mt-1 max-w-md text-[13px]" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{hasSearch ? `Aucun résultat pour "${searchTerm}".` : 'Commencez par créer votre première catégorie.'}</p>{hasSearch ? (<button type="button" onClick={() => setSearchTerm('')} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><X size={14} />Effacer la recherche</button>) : (<button type="button" onClick={handleOpenAddModal} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-3 text-[12px] font-semibold text-white hover:bg-indigo-700"><Plus size={14} />Nouvelle catégorie</button>)}</div>) : viewMode === 'table' ? (<CategoriesTable categories={categoriesWithCounts} onView={handleViewCategorie} onEdit={handleEditCategorie} onDelete={handleDeleteClick} onAdd={handleOpenAddModal} getCategoryColor={getCategoryColor} selectedIds={selectedIds} onSelectAll={handleSelectAll} onSelectOne={handleSelectOne} onBulkDelete={handleBulkDelete} />) : (<CategoriesGrid categories={categoriesWithCounts} onView={handleViewCategorie} onEdit={handleEditCategorie} onDelete={handleDeleteClick} onAdd={handleOpenAddModal} getCategoryColor={getCategoryColor} />)}
        </>)}
      </section>
      <CategoriesPagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} onPageChange={page => { setSelectedIds(new Set()); setCurrentPage(page); }} />
    </div>
    <CategoriesModalForm isOpen={showModal} onClose={handleCloseModal} onSubmit={handleSubmit} editingCategorie={editingCategorie} isDark={isDark} />
    {showViewModal && selectedCategorie && (<CategoriesViewModal categorie={selectedCategorie} onClose={() => { setShowViewModal(false); setSelectedCategorie(null); }} onEdit={() => { setShowViewModal(false); handleEditCategorie(selectedCategorie); }} getCategoryColor={getCategoryColor} isDark={isDark} />)}
    <ConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }} onConfirm={handleConfirmDelete} title="Suppression" message={`Supprimer "${deleteTarget?.nom || ''}" ?`} confirmText="Supprimer" cancelText="Annuler" confirmColor="red" isDark={isDark} />
    <ConfirmModal isOpen={showBulkDeleteModal} onClose={() => { setShowBulkDeleteModal(false); setBulkDeleteTargetIds([]); }} onConfirm={handleConfirmBulkDelete} title="Suppression en lot" message={`Voulez-vous supprimer ${bulkDeleteTargetIds.length} catégorie(s) ?`} confirmText="Supprimer" cancelText="Annuler" confirmColor="red" isDark={isDark} />
    <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title={successTitle} message={successMessage} buttonText="OK" autoCloseDelay={3000} />
    <ErrorModal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title={errorTitle} message={errorMessage} buttonText="OK" autoCloseDelay={4000} />
  </main>);
};
export default Categories;