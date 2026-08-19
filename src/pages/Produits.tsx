import React, { useState, useRef, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, Plus, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useProduitsData } from '../hooks/useProduitsData';
import { useCommandesData } from '../hooks/useCommandesData';
import { revokeBlobUrl, validateImageFile, fileToBase64 } from '../utils/imageHelpers';
import ProduitsStats from '../components/produits/ProduitsStats';
import ProduitsTable from '../components/produits/ProduitsTable';
import ProduitsGrid from '../components/produits/ProduitsGrid';
import ProduitsPagination from '../components/produits/ProduitsPagination';
import ProduitsModalForm from '../components/produits/ProduitsModalForm';
import ProduitsViewModal from '../components/produits/ProduitsViewModal';
import CommandesModalForm from '../components/commandes/CommandesModalForm';
import ConfirmModal from '../components/common/ConfirmModal';
import SuccessModal from '../components/common/SuccessModal';
import ErrorModal from '../components/common/ErrorModal';
import ProduitsSearchBar from '../components/produits/ProduitsSearchBar';

const Produits: React.FC = () => {
  const { isDark } = useTheme();
  const {
    produits, categories, fournisseurs, loadReferences,
    loading, refreshing, setRefreshing, totalItems, totalPages,
    currentPage, setCurrentPage, imageUrls, imageErrors, filters, setFilters,
    sortOption, setSortOption, loadImageUrl, handleImageError, generateCode,
    createProduit, updateProduit, deleteProduit, getProduitById, uploadImage,
    deleteImage, bulkUpdateStatus, bulkDelete, getStats, loadData
  } = useProduitsData();

  const {
    clients: commandeClients, produits: commandeProduits, selectedClientId,
    setSelectedClientId, selectedProduits: commandeSelectedProduits,
    handleAddProduit: commandeAddProduit, handleUpdateQuantite: commandeUpdateQuantite,
    handleRemoveProduit: commandeRemoveProduit, clearPanier: commandeClearPanier,
    createCommande, refreshReferences
  } = useCommandesData();

  const [reelStats, setReelStats] = useState({ totalItems: 0, totalStock: 0, alertes: 0, totalValeur: 0 });
  const fetchReelStats = useCallback(async () => {
    try {
      const data = await getStats();
      if (!data) return;
      setReelStats({
        totalItems: Number(data.total) || 0,
        totalStock: Number(data.totalStock) || 0,
        alertes: Number(data.alerte) || 0,
        totalValeur: Number(data.valeur_totale) || 0
      });
    } catch (err) { console.error('❌ [Produits] Erreur stats:', err); }
  }, [getStats]);

  useEffect(() => { if (!loading) fetchReelStats(); }, [loading, fetchReelStats]);
  useEffect(() => {
    if (loading || !Array.isArray(produits) || produits.length === 0) return;
    produits.forEach((p: any) => { if (p?.image) loadImageUrl(p); });
  }, [produits, loading, loadImageUrl]);

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCommandeModal, setShowCommandeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState<any>(null);
  const [editingProduit, setEditingProduit] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [bulkStatusData, setBulkStatusData] = useState<{ ids: number[]; newStatus: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showSuccess = useCallback((t: string, m: string) => { setSuccessTitle(t); setSuccessMessage(m); setShowSuccessModal(true); }, []);
  const showError = useCallback((t: string, m: string) => { setErrorTitle(t); setErrorMessage(m); setShowErrorModal(true); }, []);
  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);
  const handleSelectAll = useCallback((checked: boolean) => {
    if (!checked) { clearSelection(); return; }
    const ids = produits.map((p: any) => Number(p.id)).filter((id: number) => Number.isInteger(id) && id > 0);
    setSelectedIds(new Set(ids));
  }, [produits, clearSelection]);
  const handleSelectOne = useCallback((id: number, checked: boolean) => {
    setSelectedIds(prev => { const n = new Set(prev); if (checked) n.add(id); else n.delete(id); return n; });
  }, []);
  const handleBulkUpdateStatus = useCallback((ids: number[], newStatus: string) => {
    const v = ids.map(Number).filter(id => Number.isInteger(id) && id > 0);
    if (!v.length) { showError('Sélection invalide', 'Aucun produit valide.'); return; }
    setBulkStatusData({ ids: v, newStatus });
    setShowBulkStatusModal(true);
  }, [showError]);
  const handleConfirmBulkStatusUpdate = useCallback(async () => {
    if (!bulkStatusData) return;
    try {
      await bulkUpdateStatus(bulkStatusData.ids, bulkStatusData.newStatus);
      clearSelection();
      showSuccess('Mise à jour terminée', `${bulkStatusData.ids.length} produit(s) en statut "${bulkStatusData.newStatus === 'actif' ? 'Actif' : 'Inactif'}".`);
      await loadData();
      await fetchReelStats();
    } catch (err: any) { showError('Erreur', err?.message || 'Erreur lors de la mise à jour.'); }
    finally { setShowBulkStatusModal(false); setBulkStatusData(null); }
  }, [bulkStatusData, bulkUpdateStatus, clearSelection, showError, showSuccess, loadData, fetchReelStats]);
  const handleBulkDelete = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    setDeleteTarget({ type: 'bulk', ids });
    setShowDeleteModal(true);
  }, [selectedIds]);
  const handleConfirmBulkDelete = useCallback(async () => {
    if (!deleteTarget || deleteTarget.type !== 'bulk') return;
    try {
      await bulkDelete(deleteTarget.ids);
      clearSelection();
      showSuccess('Suppression terminée', `${deleteTarget.ids.length} produit(s) supprimé(s).`);
      await loadData();
      await fetchReelStats();
    } catch (err: any) { showError('Erreur', err?.message || 'Erreur lors de la suppression.'); }
    finally { setShowDeleteModal(false); setDeleteTarget(null); }
  }, [deleteTarget, bulkDelete, clearSelection, showError, showSuccess, loadData, fetchReelStats]);

  const handleNewCommande = useCallback(async (produit: any) => {
    if (!produit?.id) return;
    try {
      await refreshReferences();
      commandeAddProduit(Number(produit.id), 1);
      setShowCommandeModal(true);
    } catch (err: any) { showError('Erreur de chargement', err?.message || 'Impossible de charger les clients et produits.'); }
  }, [refreshReferences, commandeAddProduit, showError]);
  const handleSubmitCommande = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClientId) { showError('Client requis', 'Sélectionnez un client.'); return; }
    if (!commandeSelectedProduits || commandeSelectedProduits.length === 0) { showError('Panier vide', 'Ajoutez au moins un produit.'); return; }
    try {
      await createCommande(selectedClientId, commandeSelectedProduits);
      showSuccess('Commande créée', 'Commande enregistrée.');
      setShowCommandeModal(false);
      commandeClearPanier();
      setSelectedClientId(null);
    } catch (err: any) { showError('Erreur', err?.message || 'Impossible de créer la commande.'); }
  }, [selectedClientId, commandeSelectedProduits, createCommande, commandeClearPanier, setSelectedClientId, showError, showSuccess]);

  const resetImageState = useCallback(() => {
    setImagePreview(prev => { if (prev) try { revokeBlobUrl(prev); } catch {} return null; });
    setImagePath(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);
  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const v = validateImageFile(file);
    if (!v.valid) { showError('Format', v.error || 'Format non supporté.'); if (fileInputRef.current) fileInputRef.current.value = ''; return; }
    try {
      setUploadingImage(true);
      const base64 = await fileToBase64(file);
      setImagePreview(base64);
      const path = await uploadImage(base64);
      setImagePath(path);
    } catch (err: any) { console.error('❌ [Produits] Upload:', err); setImagePreview(null); setImagePath(null); showError('Erreur upload', err?.message || 'Impossible de charger l’image.'); }
    finally { setUploadingImage(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  }, [uploadImage, showError]);
  const handleRemoveImage = useCallback(async () => {
    try { if (imagePath) await deleteImage(imagePath); } catch {} finally { resetImageState(); }
  }, [imagePath, deleteImage, resetImageState]);

  const handleViewProduit = useCallback(async (id: number) => {
    if (!Number.isInteger(id) || id <= 0) return;
    try {
      const produit = await getProduitById(id);
      if (!produit) throw new Error('Produit introuvable.');
      if (produit.image) await loadImageUrl(produit);
      setSelectedProduit(produit);
      setShowViewModal(true);
    } catch (err: any) { showError('Erreur chargement', err?.message || 'Impossible de charger le produit.'); }
  }, [getProduitById, loadImageUrl, showError]);

  const handleEditProduit = useCallback(async (produit: any) => {
    if (!produit?.id) return;
    try {
      console.log('🔄 [Produits] Chargement des références avant EDIT...');
      await loadReferences(true);
      setEditingProduit(produit);
      resetImageState();
      if (produit.image) {
        try {
          if (window.api?.images?.getUrl) {
            const result = await window.api.images.getUrl(produit.image);
            const url = result?.success ? result.data : null;
            if (url) setImagePreview(url);
            setImagePath(produit.image);
          }
        } catch (imageError) { console.error('❌ [Produits] Image edit:', imageError); }
      }
      setShowModal(true);
    } catch (err: any) { console.error('❌ [Produits] Erreur ouverture edit:', err); showError('Erreur', err?.message || 'Impossible de charger les catégories et fournisseurs.'); }
  }, [loadReferences, resetImageState, showError]);

  const handleNewProduit = useCallback(async () => {
    try {
      console.log('🔄 [Produits] Chargement des références avant CREATE...');
      await loadReferences(true);
      setEditingProduit(null);
      resetImageState();
      setShowModal(true);
    } catch (err: any) { console.error('❌ [Produits] Erreur ouverture create:', err); showError('Erreur', err?.message || 'Impossible de charger les catégories et fournisseurs.'); }
  }, [loadReferences, resetImageState, showError]);

  const handleDeleteClick = useCallback((produit: any) => {
    if (!produit?.id) return;
    setDeleteTarget({ type: 'single', produit });
    setShowDeleteModal(true);
  }, []);

  const handleConfirmSingleDelete = useCallback(async () => {
    if (!deleteTarget || deleteTarget.type !== 'single') return;
    const produit = deleteTarget.produit;
    if (!produit?.id) { setShowDeleteModal(false); setDeleteTarget(null); return; }
    try {
      if (produit.image) try { await deleteImage(produit.image); } catch {}
      await deleteProduit(Number(produit.id));
      showSuccess('Produit supprimé', `"${produit.nom}" supprimé.`);
      await loadData();
      await fetchReelStats();
    } catch (err: any) { showError('Erreur', err?.message || 'Erreur suppression produit.'); }
    finally { setShowDeleteModal(false); setDeleteTarget(null); }
  }, [deleteTarget, deleteImage, deleteProduit, showError, showSuccess, loadData, fetchReelStats]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const code = String(fd.get('code') || '').trim();
    const nom = String(fd.get('nom') || '').trim();
    const description = String(fd.get('description') || '').trim();
    const categorieRaw = String(fd.get('categorie_id') || '');
    const fournisseurRaw = String(fd.get('fournisseur_id') || '');
    const prixAchat = Number(fd.get('prix_achat') || 0);
    const prixVente = Number(fd.get('prix_vente') || 0);
    const quantiteStock = Number(fd.get('quantite_stock') || 0);
    const quantiteMinimale = Number(fd.get('quantite_minimale') || 5);
    const unite = String(fd.get('unite') || 'pièce').trim();
    const status = String(fd.get('status') || 'actif').trim();
    const categorieId = categorieRaw ? Number(categorieRaw) : null;
    const fournisseurId = fournisseurRaw ? Number(fournisseurRaw) : null;
    if (!nom) { showError('Champ requis', 'Le nom est obligatoire.'); return; }
    if (!code) { showError('Champ requis', 'Le code est obligatoire.'); return; }
    if (!Number.isFinite(prixVente) || prixVente <= 0) { showError('Valeur invalide', 'Prix de vente > 0.'); return; }
    const data = {
      code, nom, description,
      categorie_id: Number.isInteger(categorieId) ? categorieId : null,
      fournisseur_id: Number.isInteger(fournisseurId) ? fournisseurId : null,
      prix_achat: Number.isFinite(prixAchat) ? prixAchat : 0,
      prix_vente: prixVente,
      quantite_stock: Math.max(0, quantiteStock),
      quantite_minimale: Math.max(0, quantiteMinimale),
      unite: unite || 'pièce',
      status: status || 'actif',
      image: imagePath || null
    };
    try {
      if (editingProduit) { await updateProduit(Number(editingProduit.id), data); showSuccess('Produit modifié', `"${data.nom}" mis à jour.`); }
      else { await createProduit(data); showSuccess('Produit créé', `"${data.nom}" ajouté.`); }
      setShowModal(false);
      resetImageState();
      setEditingProduit(null);
      await loadData();
      await fetchReelStats();
    } catch (err: any) { showError('Erreur sauvegarde', err?.message || 'Impossible de sauvegarder le produit.'); }
  }, [editingProduit, imagePath, createProduit, updateProduit, resetImageState, showError, showSuccess, loadData, fetchReelStats]);

  const getStockLevel = useCallback((stock: number, minimum: number) => {
    const s = Number(stock) || 0;
    const m = Number(minimum) || 0;
    const ratio = m > 0 ? s / m : 999;
    if (ratio <= 1) return { level: 'critique', color: 'text-rose-500', bg: 'bg-rose-500' };
    if (ratio <= 2) return { level: 'faible', color: 'text-amber-500', bg: 'bg-amber-500' };
    if (ratio <= 5) return { level: 'moyen', color: 'text-indigo-500', bg: 'bg-indigo-500' };
    return { level: 'élevé', color: 'text-emerald-500', bg: 'bg-emerald-500' };
  }, []);
  const getStatusColor = useCallback((status: string) =>
    status === 'actif'
      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
      : 'bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800', []);
  const getStatusIcon = useCallback((status: string) =>
    status === 'actif' ? <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />, []);
  const safeTotalItems = Number.isFinite(Number(totalItems)) ? Number(totalItems) : 0;
  const safeTotalPages = Number.isFinite(Number(totalPages)) ? Math.max(1, Number(totalPages)) : 1;
  const handlePageChange = useCallback((page: number) => {
    const nextPage = Math.max(1, Math.min(Number(page) || 1, safeTotalPages));
    if (nextPage === currentPage) return;
    setCurrentPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, setCurrentPage, safeTotalPages]);
  const hasActiveFilters = Boolean(filters.searchTerm || filters.filterCategorie || filters.filterStatus || filters.prixMin || filters.prixMax || filters.dateFrom || filters.dateTo);
  const handleResetFilters = useCallback(() => {
    setFilters({ searchTerm: '', filterCategorie: '', filterStatus: '', prixMin: '', prixMax: '', dateFrom: '', dateTo: '' });
    setCurrentPage(1);
    clearSelection();
  }, [setFilters, setCurrentPage, clearSelection]);
  const deleteModalTitle = deleteTarget?.type === 'bulk' ? 'Suppression en lot' : 'Suppression du produit';
  const deleteModalMessage = deleteTarget?.type === 'bulk' ? `Supprimer ${deleteTarget.ids.length} produit(s) ?` : `Supprimer "${deleteTarget?.produit?.nom || ''}" ?`;
  const handleCloseProductModal = useCallback(() => {
    setShowModal(false);
    resetImageState();
    setEditingProduit(null);
  }, [resetImageState]);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 px-1 py-6 transition-colors duration-300 sm:px-0 lg:px-4" style={{ background: isDark ? '#0A1222' : '#F8FAFC' }}>
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Produits</h1>
          {refreshing && <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-500 dark:text-indigo-400"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />Actualisation...</span>}
        </div>
        <button type="button" onClick={handleNewProduit} disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"><Plus size={18} />Nouveau produit</button>
      </header>
      <ProduitsStats totalItems={reelStats.totalItems} totalStock={reelStats.totalStock} alertes={reelStats.alertes} totalValeur={reelStats.totalValeur} refreshing={refreshing} />
      <ProduitsSearchBar searchTerm={filters.searchTerm} onSearchChange={(v) => { setFilters({ searchTerm: v }); setCurrentPage(1); }} sortOption={sortOption} onSortChange={(v) => { setSortOption(v); setCurrentPage(1); }} viewMode={viewMode} onViewModeChange={setViewMode} filterCategorie={filters.filterCategorie} onFilterCategorieChange={(v) => { setFilters({ filterCategorie: v }); setCurrentPage(1); }} filterStatus={filters.filterStatus} onFilterStatusChange={(v) => { setFilters({ filterStatus: v }); setCurrentPage(1); }} categories={categories} onResetFilters={handleResetFilters} hasActiveFilters={hasActiveFilters} />
      <section className="relative overflow-hidden rounded-xl border shadow-sm" style={{ background: isDark ? '#0F172A' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }}>
        {refreshing && <div className="absolute left-0 right-0 top-0 z-20 h-0.5 overflow-hidden bg-transparent"><div className="h-full w-1/3 animate-[loading_1.2s_ease-in-out_infinite] bg-indigo-500" /></div>}
        {loading && produits.length === 0 ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <div className="flex flex-col items-center gap-3"><RefreshCw size={30} className="animate-spin text-indigo-500" /><span className="text-[14px] font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Chargement des produits...</span></div>
          </div>
        ) : viewMode === 'table' ? (
          <ProduitsTable produits={produits} imageUrls={imageUrls} imageErrors={imageErrors} onView={handleViewProduit} onEdit={handleEditProduit} onDelete={handleDeleteClick} onAdd={handleNewProduit} onNewCommande={handleNewCommande} getStockLevel={getStockLevel} getStatusColor={getStatusColor} getStatusIcon={getStatusIcon} handleImageError={handleImageError} totalStats={{ total: reelStats.totalItems, rupture: 0, alerte: reelStats.alertes, valeur_totale: reelStats.totalValeur }} totalItems={safeTotalItems} selectedIds={selectedIds} onSelectAll={handleSelectAll} onSelectOne={handleSelectOne} onBulkDelete={handleBulkDelete} onBulkUpdateStatus={handleBulkUpdateStatus} />
        ) : (
          <ProduitsGrid produits={produits} imageUrls={imageUrls} imageErrors={imageErrors} onView={handleViewProduit} onEdit={handleEditProduit} onDelete={handleDeleteClick} onNewCommande={handleNewCommande} getStockLevel={getStockLevel} handleImageError={handleImageError} isDark={isDark} />
        )}
      </section>
      {!loading && safeTotalItems > 0 && <ProduitsPagination currentPage={currentPage} totalPages={safeTotalPages} totalItems={safeTotalItems} onPageChange={handlePageChange} />}
      <ProduitsModalForm isOpen={showModal} onClose={handleCloseProductModal} onSubmit={handleSubmit} editingProduit={editingProduit} categories={categories} fournisseurs={fournisseurs} generateCode={generateCode} isDark={isDark} imagePreview={imagePreview} imagePath={imagePath} uploadingImage={uploadingImage} onImageChange={handleImageChange} onRemoveImage={handleRemoveImage} fileInputRef={fileInputRef} />
      {showViewModal && selectedProduit && <ProduitsViewModal produit={selectedProduit} imageUrl={imageUrls[selectedProduit.id] || null} onClose={() => setShowViewModal(false)} onEdit={() => { setShowViewModal(false); handleEditProduit(selectedProduit); }} onNewCommande={() => { setShowViewModal(false); handleNewCommande(selectedProduit); }} getStatusColor={getStatusColor} getStatusIcon={getStatusIcon} isDark={isDark} />}
      <ConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }} onConfirm={() => deleteTarget?.type === 'bulk' ? handleConfirmBulkDelete() : handleConfirmSingleDelete()} title={deleteModalTitle} message={deleteModalMessage} confirmText="Supprimer" cancelText="Annuler" confirmColor="red" isDark={isDark} />
      <ConfirmModal isOpen={showBulkStatusModal} onClose={() => { setShowBulkStatusModal(false); setBulkStatusData(null); }} onConfirm={handleConfirmBulkStatusUpdate} title="Mise à jour en lot" message={`Changer ${bulkStatusData?.ids?.length || 0} produit(s) en "${bulkStatusData?.newStatus === 'actif' ? 'Actif' : 'Inactif'}" ?`} confirmText="Confirmer" cancelText="Annuler" confirmColor="green" isDark={isDark} />
      <CommandesModalForm isOpen={showCommandeModal} onClose={() => { setShowCommandeModal(false); commandeClearPanier(); setSelectedClientId(null); }} onSubmit={handleSubmitCommande} clients={commandeClients} produits={commandeProduits} selectedClientId={selectedClientId} onClientChange={setSelectedClientId} selectedProduits={commandeSelectedProduits} onAddProduit={commandeAddProduit} onUpdateQuantite={commandeUpdateQuantite} onRemoveProduit={commandeRemoveProduit} onClearPanier={commandeClearPanier} isDark={isDark} />
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title={successTitle} message={successMessage} buttonText="OK" autoCloseDelay={3000} />
      <ErrorModal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title={errorTitle} message={errorMessage} buttonText="OK" autoCloseDelay={4000} />
    </div>
  );
};

export default Produits;