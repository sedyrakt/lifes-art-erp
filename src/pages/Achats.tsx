// src/pages/Achats.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Search, RefreshCw, Eye, Edit, Trash2, List, Grid, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAchatsData } from '../hooks/useAchatsData';
import { AchatsTable, AchatsGrid, AchatsPagination, AchatsModalForm, AchatsViewModal } from '../components/achats';
import ConfirmModal from '../components/common/ConfirmModal';
import SuccessModal from '../components/common/SuccessModal';
import ErrorModal from '../components/common/ErrorModal';

// ⭐ Interfaces ho an'ny SelectedProduct
interface SelectedProduct { id: number; quantite: number; }

const Achats: React.FC = () => {
  const { isDark } = useTheme();
  
  const {
    achats,
    fournisseurs,
    produits,
    loading,
    refreshing,
    totalItems,
    totalPages,
    currentPage,
    setCurrentPage,
    loadAchats,
    createAchat,
    updateAchat,
    updateAchatStatus,
    deleteAchat,
    bulkDelete,
    ITEMS_PER_PAGE,
  } = useAchatsData();

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedAchat, setSelectedAchat] = useState<any>(null);
  const [editingAchat, setEditingAchat] = useState<any>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteTargetIds, setBulkDeleteTargetIds] = useState<number[]>([]);

  const [loadingDetails, setLoadingDetails] = useState(false);

  // ⭐ FIX: State ho an'ny Formulaire (AchatsModalForm)
  const [searchInput, setSearchInput] = useState('');
  const [selectedFournisseurId, setSelectedFournisseurId] = useState<number | null>(null);
  const [selectedProduits, setSelectedProduits] = useState<SelectedProduct[]>([]);

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
    setSelectedIds(checked ? new Set(achats.map(a => a.id)) : new Set());
  }, [achats]);

  const handleSelectOne = useCallback((id: number, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  }, []);

  const handleConfirmStatus = useCallback(async (id: number, statut: string) => {
    try {
      await updateAchatStatus(id, statut);
      showSuccess('Statut mis à jour', `L'achat a été marqué comme "${statut}".`);
    } catch (error: any) {
      showError('Erreur', error?.message || 'Impossible de modifier le statut.');
    }
  }, [updateAchatStatus, showSuccess, showError]);

  const handleBulkConfirmStatus = useCallback(async (ids: number[], statut: string) => {
    try {
      for (const id of ids) {
        await updateAchatStatus(id, statut);
      }
      setSelectedIds(new Set());
      showSuccess('Statut mis à jour', `${ids.length} achat(s) marqué(s) comme "${statut}".`);
    } catch (error: any) {
      showError('Erreur', error?.message || 'Impossible de modifier les statuts.');
    }
  }, [updateAchatStatus, showSuccess, showError]);

  const handleBulkDelete = useCallback((ids: number[]) => {
    setBulkDeleteTargetIds(ids);
    setShowBulkDeleteModal(true);
  }, []);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (!bulkDeleteTargetIds.length) return;
    try {
      await bulkDelete(bulkDeleteTargetIds);
      setSelectedIds(new Set());
      showSuccess('Suppression en lot', `${bulkDeleteTargetIds.length} achat(s) supprimé(s).`);
    } catch (error: any) {
      showError('Erreur', error?.message || 'Impossible de supprimer.');
    } finally {
      setShowBulkDeleteModal(false);
      setBulkDeleteTargetIds([]);
    }
  }, [bulkDeleteTargetIds, bulkDelete, showSuccess, showError]);

  const handleViewAchat = useCallback((achat: any) => {
    setSelectedAchat(achat);
    setShowViewModal(true);
  }, []);

  const handleEditAchat = useCallback((achat: any) => {
    setEditingAchat(achat);
    setShowFormModal(true);
  }, []);

  const handleDeleteClick = useCallback((achat: any) => {
    setDeleteTarget(achat);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteAchat(deleteTarget.id);
      showSuccess('Achat supprimé', 'L\'achat a été supprimé avec succès.');
    } catch (error: any) {
      showError('Erreur', error?.message || 'Impossible de supprimer.');
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteAchat, showSuccess, showError]);

  const openDetailsModal = useCallback(async (achat: any) => {
    try {
      setLoadingDetails(true);
      setShowViewModal(true);

      const result = await window.api.achats.getDetails(achat.id);

      if (!result?.success) {
        throw new Error(result?.error || 'Impossible de charger les détails');
      }

      setSelectedAchat({
        ...achat,
        ...result.data.achat,
        details: result.data.details || [],
      });
    } catch (err) {
      console.error('Erreur chargement détails:', err);
      setSelectedAchat({
        ...achat,
        details: [],
      });
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  const handleOpenAddModal = useCallback(() => {
    setEditingAchat(null);
    setSelectedFournisseurId(null);
    setSelectedProduits([]);
    setShowFormModal(true);
  }, []);

  const handleCloseFormModal = useCallback(() => {
    setShowFormModal(false);
    setEditingAchat(null);
    setSelectedFournisseurId(null);
    setSelectedProduits([]);
  }, []);

  const handleAddProduit = useCallback((id: number, quantite: number) => {
    setSelectedProduits(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) return prev.map(item => item.id === id ? { ...item, quantite: item.quantite + quantite } : item);
      return [...prev, { id, quantite }];
    });
  }, []);

  const handleUpdateQuantite = useCallback((id: number, quantite: number) => {
    setSelectedProduits(prev => prev.map(item => item.id === id ? { ...item, quantite } : item));
  }, []);

  const handleRemoveProduit = useCallback((id: number) => {
    setSelectedProduits(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleClearPanier = useCallback(() => {
    setSelectedProduits([]);
  }, []);

  // ⭐ FIX: Submit miaraka amin'ny calcul des totaux + Designation
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedFournisseurId || selectedProduits.length === 0) return;

    const totalHT = selectedProduits.reduce((sum, item) => {
      const product = produits.find((p) => p.id === item.id);
      return sum + (product ? product.prix_achat * item.quantite : 0);
    }, 0);
    
    const totalTTC = totalHT * 1.2;

    const designation = selectedProduits.map(item => {
      const product = produits.find((p) => p.id === item.id);
      return product ? product.nom : '';
    }).filter(Boolean).join(', ');

    const data = {
      fournisseur_id: selectedFournisseurId,
      date_achat: new Date().toISOString().split('T')[0],
      reference: '', // ⭐ FIX: Avela banga, ny backend no mamorona azy (ACH-0001, sns)
      total_ht: totalHT,
      total_ttc: totalTTC,
      designation,
      nombre_produits: selectedProduits.length,
      statut: 'En attente',
      details: selectedProduits.map(item => {
        const product = produits.find((p) => p.id === item.id);
        return {
          produit_id: item.id,
          quantite: item.quantite,
          prix_unitaire: product?.prix_achat || 0,
          total: (product?.prix_achat || 0) * item.quantite
        };
      })
    };

    try {
      if (editingAchat) {
        await updateAchat(editingAchat.id, data);
        showSuccess('Achat modifié', 'L\'achat a été modifié avec succès.');
      } else {
        await createAchat(data);
        showSuccess('Achat créé', 'L\'achat a été enregistré avec succès.');
      }
      setShowFormModal(false);
      setEditingAchat(null);
      setSelectedFournisseurId(null);
      setSelectedProduits([]);
    } catch (error: any) {
      showError('Erreur', error?.message || 'Une erreur est survenue.');
    }
  }, [editingAchat, selectedFournisseurId, selectedProduits, produits, createAchat, updateAchat, showSuccess, showError]);

  return (
    <div className="min-h-full w-full px-0 py-5 sm:px-0 lg:px-4" style={{ background: isDark ? '#0A1222' : '#F8FAFC' }}>
      <div className="mx-auto w-full max-w-[1600px] space-y-5">
        
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[23px] font-semibold tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Achats</h1>
              {!loading && (
                <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  {totalItems}
                </span>
              )}
            </div>
            <p className="mt-1 text-[13px]" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              Gérez vos achats de produits auprès de vos fournisseurs.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
          >
            <Plus size={17} />
            Nouvel achat
          </button>
        </header>

        {/* Search Bar */}
        <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={17} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un achat..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-9 text-[13px] outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-[#111c30] dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:bg-[#020617]"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadAchats(true)}
              disabled={refreshing}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 dark:border-slate-700 dark:bg-[#111c30] dark:text-slate-400"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-[#111c30]">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium transition-all ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}
              >
                <List size={15} />
                <span className="hidden 2xl:inline">Tableau</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}
              >
                <Grid size={15} />
                <span className="hidden 2xl:inline">Grille</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table / Grid */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-[#0F172A]">
          {loading && achats.length === 0 ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw size={30} className="animate-spin text-indigo-500" />
                <span className="text-[14px] font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  Chargement des achats...
                </span>
              </div>
            </div>
          ) : viewMode === 'table' ? (
            <AchatsTable
              achats={achats}
              onView={openDetailsModal}
              onEdit={handleEditAchat}
              onDelete={handleDeleteClick}
              onAdd={handleOpenAddModal}
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onSelectOne={handleSelectOne}
              onBulkDelete={handleBulkDelete}
              onConfirmStatus={handleConfirmStatus}
              onBulkConfirmStatus={handleBulkConfirmStatus}
            />
          ) : (
            <AchatsGrid
              achats={achats}
              onView={openDetailsModal}
              onEdit={handleEditAchat}
              onDelete={handleDeleteClick}
              onAdd={handleOpenAddModal}
            />
          )}
        </section>

        {/* Pagination */}
        {totalPages > 0 && (
          <AchatsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Modals */}
      <AchatsModalForm
        isOpen={showFormModal}
        onClose={handleCloseFormModal}
        onSubmit={handleSubmit}
        editingAchat={editingAchat}
        fournisseurs={fournisseurs}
        produits={produits}
        isDark={isDark}
        selectedFournisseurId={selectedFournisseurId}
        onFournisseurChange={setSelectedFournisseurId}
        selectedProduits={selectedProduits}
        onAddProduit={handleAddProduit}
        onUpdateQuantite={handleUpdateQuantite}
        onRemoveProduit={handleRemoveProduit}
        onClearPanier={handleClearPanier}
      />

      {showViewModal && selectedAchat && (
        <AchatsViewModal
          achat={selectedAchat}
          loadingDetails={loadingDetails}
          onClose={() => setShowViewModal(false)}
          onEdit={() => {
            setShowViewModal(false);
            handleEditAchat(selectedAchat);
          }}
          isDark={isDark}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
        onConfirm={handleConfirmDelete}
        title="Suppression"
        message={`Supprimer "${deleteTarget?.reference || ''}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmColor="red"
        isDark={isDark}
      />

      <ConfirmModal
        isOpen={showBulkDeleteModal}
        onClose={() => { setShowBulkDeleteModal(false); setBulkDeleteTargetIds([]); }}
        onConfirm={handleConfirmBulkDelete}
        title="Suppression en lot"
        message={`Supprimer ${bulkDeleteTargetIds.length} achat(s) ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmColor="red"
        isDark={isDark}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successTitle}
        message={successMessage}
        buttonText="OK"
        autoCloseDelay={3000}
      />

      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={errorTitle}
        message={errorMessage}
        buttonText="OK"
        autoCloseDelay={4000}
      />
    </div>
  );
};

export default Achats;