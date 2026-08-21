// src/pages/Commandes.tsx
import React, { useState, useCallback } from 'react';
import { Plus, Clock, CheckCircle, Truck, XCircle, RefreshCw, Search } from 'lucide-react'; 
import { useTheme } from '../contexts/ThemeContext';
import { useCommandesData } from '../hooks/useCommandesData';
import { useClientsData } from '../hooks/useClientsData';
import { useCompany } from '../contexts/CompanyContext';
import { STATUS } from '../types/commandes';
import { CommandesStats } from '../components/commandes';
import CommandesTable from '../components/commandes/CommandesTable';
import CommandesGrid from '../components/commandes/CommandesGrid';
import CommandesPagination from '../components/commandes/CommandesPagination';
import CommandesModalForm from '../components/commandes/CommandesModalForm';
import { CommandesDetailsModal } from '../components/commandes';
import ConfirmModal from '../components/common/ConfirmModal';
import SuccessModal from '../components/common/SuccessModal';
import ErrorModal from '../components/common/ErrorModal';
import CommandesSearchBar from '../components/commandes/CommandesSearchBar';
import CompanySettingsModal from '../components/company/CompanySettingsModal'; 
import { downloadPDF } from '../lib/pdfService';

const SORT_OPTIONS = [
  { value: 'Date (Récent)', label: 'Date ↓' },
  { value: 'Date (Ancien)', label: 'Date ↑' },
  { value: 'Total (Décroissant)', label: 'Total ↓' },
  { value: 'Total (Croissant)', label: 'Total ↑' },
  { value: 'Client (A-Z)', label: 'Client (A-Z)' },
  { value: 'Client (Z-A)', label: 'Client (Z-A)' }
];

const STATUT_OPTIONS = [
  'Tous',
  STATUS.PENDING,
  STATUS.CONFIRMED,
  STATUS.SHIPPED,
  STATUS.DELIVERED,
  STATUS.CANCELLED
];

const Commandes: React.FC = () => {
  const { isDark } = useTheme();
  const { company } = useCompany();
  
  const {
    commandes,
    clients,
    produits,
    loading,
    refreshing,
    totalItems,
    totalPages,
    currentPage,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
    filterStatut,
    setFilterStatut,
    sortOption,
    setSortOption,
    filterDateFrom,
    setFilterDateFrom,
    filterDateTo,
    setFilterDateTo,
    filterMontantMin,
    setFilterMontantMin,
    filterMontantMax,
    setFilterMontantMax,
    filterModePaiement,
    setFilterModePaiement,
    stats,
    loadData,
    createCommande,
    deleteCommande,
    executeUpdateStatus,
    generateFacture,
    bulkDelete,
    bulkUpdateStatus,
    selectedClientId,
    setSelectedClientId,
    selectedProduits,
    handleAddProduit,
    handleUpdateQuantite,
    handleRemoveProduit,
    clearPanier,
    refreshReferences,
    ITEMS_PER_PAGE,
    details,
    loadDetails,
  } = useCommandesData();
  
  const {
    imageUrls: clientImageUrls,
    imageErrors: clientImageErrors,
    handleImageError: handleClientImageError
  } = useClientsData({ limit: 1000 });
  
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const getStatusColor = useCallback((status: string) => {
    const colors: Record<string, string> = {
      'En attente': 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
      'Confirmée': 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
      'Expédiée': 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
      'Livrée': 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
      'Annulée': 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
    };
    return colors[status] || 'bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800';
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    const icons: Record<string, React.ReactNode> = {
      'En attente': <Clock className="w-3.5 h-3.5" />,
      'Confirmée': <CheckCircle className="w-3.5 h-3.5" />,
      'Expédiée': <Truck className="w-3.5 h-3.5" />,
      'Livrée': <CheckCircle className="w-3.5 h-3.5" />,
      'Annulée': <XCircle className="w-3.5 h-3.5" />,
    };
    return icons[status] || <Clock className="w-3.5 h-3.5" />;
  }, []);

  // ============================================================
  // ÉTATS DES MODALES
  // ============================================================
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  // ⭐ États pour la génération de facture
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [commandeForInvoice, setCommandeForInvoice] = useState<any>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // ============================================================
  // FONCTIONS UTILITAIRES
  // ============================================================
  const showSuccess = useCallback((t: string, m: string) => {
    setSuccessTitle(t);
    setSuccessMessage(m);
    setShowSuccessModal(true);
  }, []);

  const showError = useCallback((t: string, m: string) => {
    setErrorTitle(t);
    setErrorMessage(m);
    setShowErrorModal(true);
  }, []);

  const handleSelectAll = useCallback((c: boolean) => {
    setSelectedIds(c ? new Set(commandes.map(o => o.id)) : new Set());
  }, [commandes]);

  const handleSelectOne = useCallback((id: number, c: boolean) => {
    setSelectedIds(p => {
      const n = new Set(p);
      c ? n.add(id) : n.delete(id);
      return n;
    });
  }, []);

  // ============================================================
  // ACTIONS EN LOT (BULK)
  // ============================================================
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteTargetIds, setBulkDeleteTargetIds] = useState<number[]>([]);
  
  const handleBulkDelete = useCallback((ids: number[]) => {
    setBulkDeleteTargetIds(ids);
    setShowBulkDeleteModal(true);
  }, []);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (bulkDeleteTargetIds.length === 0) return;
    try {
      await bulkDelete(bulkDeleteTargetIds);
      setSelectedIds(new Set());
      showSuccess(
        'Suppression en lot',
        `${bulkDeleteTargetIds.length} commande(s) supprimée(s).`
      );
    } catch (error: any) {
      showError('Erreur', error.message);
    } finally {
      setShowBulkDeleteModal(false);
      setBulkDeleteTargetIds([]);
    }
  }, [bulkDeleteTargetIds, bulkDelete, showSuccess, showError]);

  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [bulkStatusTargetIds, setBulkStatusTargetIds] = useState<number[]>([]);
  const [bulkStatusNewStatus, setBulkStatusNewStatus] = useState<string>('');
  
  const handleBulkUpdateStatus = useCallback((ids: number[], newStatus: string) => {
    setBulkStatusTargetIds(ids);
    setBulkStatusNewStatus(newStatus);
    setShowBulkStatusModal(true);
  }, []);

  const handleConfirmBulkStatus = useCallback(async () => {
    if (bulkStatusTargetIds.length === 0) return;
    try {
      await bulkUpdateStatus(bulkStatusTargetIds, bulkStatusNewStatus);
      setSelectedIds(new Set());
      showSuccess(
        'Mise à jour en lot',
        `${bulkStatusTargetIds.length} commande(s) passée(s) en "${bulkStatusNewStatus}".`
      );
    } catch (error: any) {
      showError('Erreur', error.message);
    } finally {
      setShowBulkStatusModal(false);
      setBulkStatusTargetIds([]);
      setBulkStatusNewStatus('');
    }
  }, [bulkStatusTargetIds, bulkStatusNewStatus, bulkUpdateStatus, showSuccess, showError]);

  // ============================================================
  // ACTIONS INDIVIDUELLES
  // ============================================================
  const handleDeleteClick = useCallback((c: any) => {
    setDeleteTarget(c);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteCommande(deleteTarget.id);
      showSuccess('Commande supprimée', `"${deleteTarget.numero}" supprimée.`);
    } catch (error: any) {
      showError('Erreur', error.message);
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteCommande, showSuccess, showError]);

  const handleViewCommande = useCallback((c: any) => {
    setSelectedCommande(c);
    loadDetails(c.id);
    setShowViewModal(true);
  }, [loadDetails]);

  // ============================================================
  // GESTION DU FORMULAIRE DE COMMANDE
  // ============================================================
  const handleOpenAddModal = useCallback(async () => {
    try {
      await refreshReferences();
      setShowModal(true);
    } catch (error: any) {
      showError(
        'Erreur de chargement',
        error?.message || 'Impossible de charger les données des clients ou produits.'
      );
    }
  }, [refreshReferences, showError]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    clearPanier();
    setSelectedClientId(null);
  }, [clearPanier, setSelectedClientId]);

  const handleSubmitCommande = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedClientId) {
      showError('Client requis', 'Veuillez sélectionner un client.');
      return;
    }
    
    if (!selectedProduits || selectedProduits.length === 0) {
      showError('Panier vide', 'Veuillez ajouter au moins un produit.');
      return;
    }
    
    try {
      await createCommande(selectedClientId, selectedProduits);
      showSuccess('Commande créée', 'Commande enregistrée avec succès.');
      setShowModal(false);
      clearPanier();
      setSelectedClientId(null);
    } catch (error: any) {
      showError('Erreur', error.message);
    }
  }, [selectedClientId, selectedProduits, createCommande, clearPanier, setSelectedClientId, showSuccess, showError]);

  // ============================================================
  // ⭐ GESTION DE LA FACTURE
  // ============================================================
  const handleGenerateInvoiceClick = useCallback(async (commande: any) => {
    try {
      console.log('🔄 Chargement des détails de la commande pour facture...');
      const produitsDetails = await loadDetails(commande.id);
      console.log('📦 Produits récupérés:', produitsDetails);
      
      const commandeWithProducts = {
        ...commande,
        products: produitsDetails || []
      };
      
      setCommandeForInvoice(commandeWithProducts);
      setShowCompanyModal(true);
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des produits:', error);
      showError('Erreur', `Impossible de charger les produits de la commande: ${error.message}`);
    }
  }, [loadDetails, showError]);

  // ⭐ Io no tena GENERATION SY ENREGISTRER SOUS
  const handleCompanyModalGenerate = useCallback(async (dataFromModal?: any) => {
    if (!commandeForInvoice) return;
    
    setGeneratingPDF(true);
    
    try {
      const companyData = dataFromModal || company;
      
      const pdfOptions = {
        order: commandeForInvoice,
        clientName: commandeForInvoice.client_nom || 'Client',
        clientEmail: commandeForInvoice.client_email || '',
        clientPhone: commandeForInvoice.client_telephone || '',
        clientAddress: '',
        companyName: companyData?.name || company?.name || "Life's Art",
        companyLogo: companyData?.logo || company?.logo || '',
        companyAddress: companyData?.address || company?.address || '',
        companyPhone: companyData?.phone || company?.phone || '',
        companyEmail: companyData?.email || company?.email || '',
        companySiret: companyData?.siret || company?.siret || '',
        companyImage: companyData?.image || company?.image || '',
        companyTaxId: companyData?.taxId || company?.taxId || '',
        companyRcs: companyData?.rcs || company?.rcs || '',
        companyVatNumber: companyData?.vatNumber || company?.vatNumber || '',
        paymentMethod: commandeForInvoice.paymentMethod || 'Espèces',
        paymentTerms: commandeForInvoice.paymentTerms || 'Sous 30 jours',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      // ⭐ ILAY "ENREGISTRER SOUS" DIALOG NO MIVOAKA ETO
      const pdfResult = await downloadPDF(pdfOptions);
      console.log('📄 Résultat de downloadPDF:', pdfResult);

      if (pdfResult && pdfResult.canceled) {
        console.log('📄 Enregistrement du PDF annulé par l\'utilisateur');
        showSuccess('Génération annulée', 'Vous avez annulé l\'enregistrement du PDF.');
      } else if (pdfResult && pdfResult.success) {
        console.log(`✅ PDF enregistré avec succès: ${pdfResult.filePath}`);
        showSuccess('Facture générée', `La facture a été enregistrée avec succès.`);
      } else {
        console.error('❌ Erreur lors de l\'enregistrement du PDF:', pdfResult?.error);
        showError('Erreur', `Erreur lors de l'enregistrement du PDF: ${pdfResult?.error || 'Erreur inconnue'}`);
      }
    } catch (error: any) {
      console.error('❌ Erreur génération facture:', error);
      showError('Erreur', error.message || 'Erreur lors de la génération de la facture');
    } finally {
      setGeneratingPDF(false);
      setShowCompanyModal(false);
      setCommandeForInvoice(null);
    }
  }, [commandeForInvoice, company, showSuccess, showError]);

  // ============================================================
  // RENDU PRINCIPAL
  // ============================================================
  return (
    <div 
      className="min-h-full w-full px-0 py-5 transition-colors duration-200 sm:px-0 lg:px-4" 
      style={{ background: isDark ? '#0A1222' : '#F8FAFC' }}
    >
      <div className="mx-auto w-full max-w-[1600px] space-y-5">
        
        {/* ========== HEADER ========== */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[23px] font-semibold tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Commandes
              </h1>
              {!loading && (
                <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  {stats.total}
                </span>
              )}
            </div>
            <p className="mt-1 text-[13px]" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              Gérez et suivez vos commandes clients.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-[13px] font-semibold text-white shadow-sm shadow-indigo-600/10 transition-all duration-150 hover:bg-indigo-700 active:scale-[0.98]"
          >
            <Plus size={17} />
            Nouvelle commande
          </button>
        </header>

        {/* ========== STATS ========== */}
        <div className="mt-5">
          <CommandesStats {...stats} totalItems={totalItems} refreshing={refreshing} />
        </div>

        {/* ========== SEARCH BAR ========== */}
        <CommandesSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatut={filterStatut}
          onFilterStatutChange={setFilterStatut}
          sortOption={sortOption}
          onSortChange={setSortOption}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filterDateFrom={filterDateFrom}
          onFilterDateFromChange={setFilterDateFrom}
          filterDateTo={filterDateTo}
          onFilterDateToChange={setFilterDateTo}
          isLoading={loading}
        />

        {/* ========== TABLE / GRID ========== */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-[#0F172A]">
          {loading && commandes.length === 0 ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw size={30} className="animate-spin text-indigo-500" />
                <span className="text-[14px] font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  Chargement des commandes...
                </span>
              </div>
            </div>
          ) : (
            viewMode === 'table' ? (
              <CommandesTable
                commandes={commandes}
                onView={handleViewCommande}
                onDelete={handleDeleteClick}
                onGenerateFacture={handleGenerateInvoiceClick}
                onConfirmStatus={executeUpdateStatus}
                selectedIds={selectedIds}
                onSelectAll={handleSelectAll}
                onSelectOne={handleSelectOne}
                onBulkDelete={handleBulkDelete}
                onBulkConfirmStatus={handleBulkUpdateStatus}
                loading={loading}
                totalItems={totalItems}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                clientImageUrls={clientImageUrls}
                clientImageErrors={clientImageErrors}
                handleClientImageError={handleClientImageError}
                generating={generatingPDF}
                onAdd={handleOpenAddModal}
              />
            ) : (
              <CommandesGrid
                commandes={commandes}
                onView={handleViewCommande}
                onGenerateFacture={handleGenerateInvoiceClick}
                onUpdateStatus={executeUpdateStatus}
                onDelete={handleDeleteClick}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                clientImageUrls={clientImageUrls}
                clientImageErrors={clientImageErrors}
                handleClientImageError={handleClientImageError}
                isDark={isDark}
              />
            )
          )}
        </section>

        {/* ========== PAGINATION ========== */}
        {totalPages > 0 && (
          <CommandesPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* ============================================================
           MODALES
      ============================================================ */}

      <CommandesModalForm
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitCommande}
        clients={clients}
        produits={produits}
        selectedClientId={selectedClientId}
        onClientChange={setSelectedClientId}
        selectedProduits={selectedProduits}
        onAddProduit={handleAddProduit}
        onUpdateQuantite={handleUpdateQuantite}
        onRemoveProduit={handleRemoveProduit}
        onClearPanier={clearPanier}
        isDark={isDark}
      />

      {showViewModal && selectedCommande && (
        <CommandesDetailsModal
          commande={selectedCommande}
          details={details}
          onClose={() => setShowViewModal(false)}
          onGenerateFacture={() => handleGenerateInvoiceClick(selectedCommande)}
          clientImageUrl={clientImageUrls[selectedCommande.client_id]}
          clientImageError={clientImageErrors[selectedCommande.client_id]}
        />
      )}

      <CompanySettingsModal
        isOpen={showCompanyModal}
        onClose={() => {
          setShowCompanyModal(false);
          setCommandeForInvoice(null);
        }}
        onSave={() => {
          setShowCompanyModal(false);
          setCommandeForInvoice(null);
        }}
        onGenerate={handleCompanyModalGenerate}
        mode="generate"
        isDark={isDark}
        commandeForInvoice={commandeForInvoice}
        initialData={company}
        onPDFGenerated={(success, filePath) => {
          if (success) {
            console.log(`✅ Facture enregistrée: ${filePath}`);
          } else {
            console.log('📄 Enregistrement annulé ou échoué');
          }
        }}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Suppression"
        message={`Supprimer "${deleteTarget?.numero || ''}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmColor="red"
        isDark={isDark}
      />

      <ConfirmModal
        isOpen={showBulkDeleteModal}
        onClose={() => {
          setShowBulkDeleteModal(false);
          setBulkDeleteTargetIds([]);
        }}
        onConfirm={handleConfirmBulkDelete}
        title="Suppression en lot"
        message={`Supprimer ${bulkDeleteTargetIds.length} commande(s) ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmColor="red"
        isDark={isDark}
      />

      <ConfirmModal
        isOpen={showBulkStatusModal}
        onClose={() => {
          setShowBulkStatusModal(false);
          setBulkStatusTargetIds([]);
          setBulkStatusNewStatus('');
        }}
        onConfirm={handleConfirmBulkStatus}
        title="Mise à jour en lot"
        message={`Changer ${bulkStatusTargetIds.length} commande(s) en "${bulkStatusNewStatus}" ?`}
        confirmText="Confirmer"
        cancelText="Annuler"
        confirmColor="green"
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

export default Commandes;