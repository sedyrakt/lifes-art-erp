// ============================================================
// src/pages/Ventes.tsx
// LIFE'S ART ERP - VENTES
// ⭐ FIX: Bulk Actions (Select All, Bulk Delete)
// ⭐ FIX: Pagination
// ⭐ FIX: View Details (Devis & Facture)
// ============================================================
import React, { useCallback, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Plus, Search, RefreshCw, FileText } from 'lucide-react';
import { VentesTable, VentesModalForm, VentesViewModal, VentesPagination } from '../components/ventes';
import ConfirmModal from '../components/common/ConfirmModal';
import SuccessModal from '../components/common/SuccessModal';
import { useVentesData } from '../hooks/useVentesData';
import { downloadVentePDF } from '../lib/ventesPDFService';

interface SelectedProduct {
  id: number;
  quantite: number;
  prix_unitaire: number;
  total: number;
}

const Ventes: React.FC = () => {
  const { isDark } = useTheme();

  const {
    devisList,
    factures,
    clients,
    produits,
    loading,
    refreshing,
    searchTerm,
    setSearchTerm,
    totalDevis,
    totalFactures,
    
    // ⭐ FIX: Pagination States
    currentPage,
    setCurrentPage,
    totalPages,
    
    // ⭐ FIX: View Details States
    viewItem,
    setViewItem,
    viewDetails,
    setViewDetails,
    loadingDetails,
    setLoadingDetails,
    
    refresh,
    createDevis,
    createFacture,
    convertDevisToFacture,
    deleteDevis,
    deleteFacture,
  } = useVentesData();

  const [activeTab, setActiveTab] = useState<'devis' | 'factures'>('devis');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // ⭐ FIX: Bulk Actions States
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteTargetIds, setBulkDeleteTargetIds] = useState<number[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedProduits, setSelectedProduits] = useState<SelectedProduct[]>([]);

  const [formData, setFormData] = useState({
    reference: '',
    observation: '',
    validite_jours: 30,
  });

  // ============================================================
  // PRODUITS
  // ============================================================

  const handleAddProduit = useCallback(
    (id: number, quantite: number, prix_unitaire: number) => {
      setSelectedProduits(prev => {
        const existing = prev.find(item => item.id === id);

        if (existing) {
          const newQuantite = existing.quantite + quantite;

          return prev.map(item =>
            item.id === id
              ? {
                  ...item,
                  quantite: newQuantite,
                  total: newQuantite * item.prix_unitaire,
                }
              : item
          );
        }

        return [
          ...prev,
          {
            id,
            quantite,
            prix_unitaire,
            total: quantite * prix_unitaire,
          },
        ];
      });
    },
    []
  );

  const handleUpdateQuantite = useCallback(
    (id: number, quantite: number) => {
      setSelectedProduits(prev =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                quantite,
                total: quantite * item.prix_unitaire,
              }
            : item
        )
      );
    },
    []
  );

  const handleRemoveProduit = useCallback((id: number) => {
    setSelectedProduits(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleClearPanier = useCallback(() => {
    setSelectedProduits([]);
  }, []);

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = useCallback(() => {
    setSelectedClientId(null);
    setSelectedProduits([]);
    setFormData({
      reference: '',
      observation: '',
      validite_jours: 30,
    });
  }, []);

  // ============================================================
  // NORMALISATION DETAILS
  // ⭐ IMPORTANT: id frontend -> produit_id backend
  // ============================================================

  const buildDetails = useCallback(() => {
    return selectedProduits
      .filter(item => Number(item.id) > 0 && Number(item.quantite) > 0)
      .map(item => ({
        produit_id: Number(item.id),
        quantite: Number(item.quantite),
        prix_unitaire: Number(item.prix_unitaire) || 0,
        total:
          Number(item.total) ||
          Number(item.quantite) * Number(item.prix_unitaire || 0),
      }));
  }, [selectedProduits]);

  // ============================================================
  // CREATE DEVIS
  // ============================================================

  const handleCreateDevis = async () => {
    try {
      const details = buildDetails();

      if (details.length === 0) {
        alert('Veuillez ajouter au moins un produit');
        return;
      }

      if (!selectedClientId) {
        alert('Veuillez sélectionner un client');
        return;
      }

      const client = clients.find(c => Number(c.id) === Number(selectedClientId));

      if (!client) {
        alert('Client introuvable');
        return;
      }

      const totalHT = details.reduce(
        (sum, detail) => sum + Number(detail.total || 0),
        0
      );

      const totalTTC = totalHT * 1.2;

      const data = {
        client_id: Number(selectedClientId),
        client_nom: client.nom || '',
        reference: formData.reference.trim(),
        total_ht: totalHT,
        total_ttc: totalTTC,
        observation: formData.observation.trim(),
        validite_jours: Number(formData.validite_jours) || 30,
        details,
      };

      console.log('[VENTES] CREATE DEVIS:', data);

      const result = await createDevis(data);

      if (result?.success) {
        setShowFormModal(false);
        resetForm();
        setShowSuccessModal(true);
        await refresh();
      } else {
        alert(result?.error || 'Erreur création devis');
      }
    } catch (err: any) {
      console.error('[VENTES] Erreur création devis:', err);
      alert(err?.message || 'Erreur création devis');
    }
  };

  // ============================================================
  // CREATE FACTURE
  // ============================================================

  const handleCreateFacture = async () => {
    try {
      const details = buildDetails();

      if (details.length === 0) {
        alert('Veuillez ajouter au moins un produit');
        return;
      }

      if (!selectedClientId) {
        alert('Veuillez sélectionner un client');
        return;
      }

      const client = clients.find(c => Number(c.id) === Number(selectedClientId));

      if (!client) {
        alert('Client introuvable');
        return;
      }

      const totalHT = details.reduce(
        (sum, detail) => sum + Number(detail.total || 0),
        0
      );

      const totalTTC = totalHT * 1.2;

      const data = {
        client_id: Number(selectedClientId),
        client_nom: client.nom || '',
        reference: formData.reference.trim(),
        total_ht: totalHT,
        total_ttc: totalTTC,
        observation: formData.observation.trim(),
        details,
      };

      console.log('[VENTES] CREATE FACTURE:', data);

      const result = await createFacture(data);

      if (result?.success) {
        setShowFormModal(false);
        resetForm();
        setShowSuccessModal(true);
        await refresh();
      } else {
        alert(result?.error || 'Erreur création facture');
      }
    } catch (err: any) {
      console.error('[VENTES] Erreur création facture:', err);
      alert(err?.message || 'Erreur création facture');
    }
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'devis') {
      void handleCreateDevis();
    } else {
      void handleCreateFacture();
    }
  };

  // ============================================================
  // CONVERT DEVIs -> FACTURE
  // ============================================================

  const handleConvertDevisToFacture = async (devis: any) => {
    try {
      if (!devis?.id) {
        alert('Devis invalide');
        return;
      }

      const result = await convertDevisToFacture(Number(devis.id));

      if (result?.success) {
        setShowViewModal(false);
        setShowSuccessModal(true);
        await refresh();
      } else {
        alert(result?.error || 'Erreur conversion devis');
      }
    } catch (err: any) {
      console.error('[VENTES] Erreur conversion:', err);
      alert(err?.message || 'Erreur conversion devis');
    }
  };

  // ============================================================
  // VIEW DETAILS
  // ============================================================

  const handleView = useCallback(async (item: any) => {
    try {
      if (!item?.id) return;

      setViewItem(item);
      setViewDetails([]);
      setShowViewModal(true);
      setLoadingDetails(true);

      const result =
        activeTab === 'devis'
          ? await window.api.ventes.getDevisDetails(Number(item.id))
          : await window.api.ventes.getFactureDetails(Number(item.id));

      console.log('[VENTES] DETAILS:', result);

      if (result?.success && Array.isArray(result.data?.details)) {
        setViewDetails(result.data.details);
      } else {
        setViewDetails([]);
      }
    } catch (err) {
      console.error('[VENTES] Erreur chargement details:', err);
      setViewDetails([]);
    } finally {
      setLoadingDetails(false);
    }
  }, [activeTab, setViewItem, setViewDetails, setLoadingDetails]);

  // ============================================================
  // PDF FACTURE
  // ============================================================

  const handleDownloadPDF = async (facture: any) => {
    try {
      if (!facture?.id) return;

      const result = await window.api.ventes.getFactureDetails(
        Number(facture.id)
      );

      if (!result?.success) {
        console.error(
          '[VENTES] Impossible charger facture:',
          result?.error
        );
        return;
      }

      const { facture: f, details: d } = result.data;

      const pdfOptions = {
        vente: {
          id: f.id,
          reference: f.reference,
          client_nom: f.client_nom,
          client_email: '',
          client_telephone: '',
          total_ht: f.total_ht,
          total_ttc: f.total_ttc,
          date_facture: f.date_facture,
          statut: f.statut || 'Payée',
          products: Array.isArray(d) ? d : [],
        },
        type: 'factures' as const,
        clientName: f.client_nom || 'Client',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        companyName: "Life's Art",
        companyAddress: '',
        companyEmail: '',
        companyPhone: '',
        paymentMethod: 'Espèces',
        paymentTerms: 'Sous 30 jours',
      };

      const resultDownload = await downloadVentePDF(
        pdfOptions,
        isDark
      );

      if (!resultDownload.success) {
        console.error(
          '[VENTES] Erreur téléchargement PDF:',
          resultDownload.error
        );
      }
    } catch (err) {
      console.error('[VENTES] Erreur PDF:', err);
    }
  };

  // ============================================================
  // PDF DEVIS
  // ============================================================

  const handleDownloadDevisPDF = async (devis: any) => {
    try {
      if (!devis?.id) return;

      const result = await window.api.ventes.getDevisDetails(
        Number(devis.id)
      );

      if (!result?.success) {
        console.error(
          '[VENTES] Impossible charger devis:',
          result?.error
        );
        return;
      }

      const { devis: dv, details: d } = result.data;

      const pdfOptions = {
        vente: {
          id: dv.id,
          reference: dv.reference,
          client_nom: dv.client_nom,
          client_email: '',
          client_telephone: '',
          total_ht: dv.total_ht,
          total_ttc: dv.total_ttc,
          date_devis: dv.date_devis,
          statut: dv.statut || 'En attente',
          products: Array.isArray(d) ? d : [],
        },
        type: 'devis' as const,
        clientName: dv.client_nom || 'Client',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        companyName: "Life's Art",
        companyAddress: '',
        companyEmail: '',
        companyPhone: '',
        paymentMethod: 'Espèces',
        paymentTerms: 'Sous 30 jours',
      };

      const resultDownload = await downloadVentePDF(
        pdfOptions,
        isDark
      );

      if (!resultDownload.success) {
        console.error(
          '[VENTES] Erreur téléchargement Devis PDF:',
          resultDownload.error
        );
      }
    } catch (err) {
      console.error('[VENTES] Erreur Devis PDF:', err);
    }
  };

  // ============================================================
  // BULK ACTIONS
  // ============================================================

  const handleSelectAll = useCallback((checked: boolean) => {
    setSelectedIds(checked ? new Set((activeTab === 'devis' ? devisList : factures).map(i => i.id)) : new Set());
  }, [activeTab, devisList, factures]);

  const handleSelectOne = useCallback((id: number, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleBulkDelete = useCallback((ids: number[]) => {
    setBulkDeleteTargetIds(ids);
    setShowBulkDeleteModal(true);
  }, []);

  const handleConfirmBulkDelete = useCallback(async () => {
    try {
      if (!bulkDeleteTargetIds.length) return;

      if (activeTab === 'devis') {
        for (const id of bulkDeleteTargetIds) {
          await deleteDevis(id);
        }
      } else {
        for (const id of bulkDeleteTargetIds) {
          await deleteFacture(id);
        }
      }

      setSelectedIds(new Set());
      setBulkDeleteTargetIds([]);
      setShowBulkDeleteModal(false);
      setShowSuccessModal(true);
      await refresh();
    } catch (err: any) {
      console.error('[VENTES] Bulk delete error:', err);
      alert(err?.message || 'Erreur suppression en lot');
    }
  }, [activeTab, bulkDeleteTargetIds, deleteDevis, deleteFacture, refresh]);

  // ============================================================
  // UI
  // ============================================================

  return (
    <div
      className="min-h-full w-full px-4 py-6"
      style={{
        background: isDark ? '#0F172A' : '#F8FAFC',
      }}
    >
      <div className="mx-auto max-w-[1600px]">
        {/* HEADER */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <FileText size={20} />
            </div>

            <div>
              <h1 className="text-[22px] font-bold text-slate-900 dark:text-white">
                Ventes
              </h1>
              <p className="text-[14px] text-slate-500 dark:text-slate-400">
                Gestion des devis et factures
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowFormModal(true);
            }}
            className="flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-[14px] font-semibold text-white hover:bg-indigo-700"
          >
            <Plus size={18} />
            {activeTab === 'devis'
              ? 'Nouveau devis'
              : 'Nouvelle facture'}
          </button>
        </header>

        {/* SEARCH */}
        <div className="mt-6 flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`h-10 w-full rounded-lg border pl-10 pr-4 text-[14px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 ${
                isDark
                  ? 'border-slate-700 bg-[#0F172A] text-slate-100'
                  : 'border-gray-300 bg-white text-slate-900'
              }`}
            />
          </div>

          <button
            type="button"
            onClick={() => void refresh()}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-[#111c30]"
          >
            <RefreshCw
              size={16}
              className={`text-slate-500 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
          </button>
        </div>

        {/* TABS */}
        <div className="mt-6 flex gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-[#111c30]">
          <button
            type="button"
            onClick={() => setActiveTab('devis')}
            className={`flex-1 rounded-md px-4 py-2 text-[14px] font-semibold ${
              activeTab === 'devis'
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Devis ({totalDevis})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('factures')}
            className={`flex-1 rounded-md px-4 py-2 text-[14px] font-semibold ${
              activeTab === 'factures'
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Factures ({totalFactures})
          </button>
        </div>

        {/* TABLE */}
        <div className="mt-4">
          <VentesTable
            data={activeTab === 'devis' ? devisList : factures}
            type={activeTab}
            loading={loading}
            onView={handleView}
            onDelete={item => {
              setDeleteTarget(item);
              setShowDeleteModal(true);
            }}
            onAdd={() => {
              resetForm();
              setShowFormModal(true);
            }}
            onConvertDevisToFacture={handleConvertDevisToFacture}
            onDownloadFacture={handleDownloadPDF}
            onDownloadDevisPDF={handleDownloadDevisPDF}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onBulkDelete={handleBulkDelete}
          />
        </div>

        {/* ⭐ FIX: Pagination */}
        {totalPages > 0 && (
          <VentesPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={activeTab === 'devis' ? totalDevis : totalFactures}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* FORM MODAL */}
      <VentesModalForm
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        type={activeTab}
        clients={clients}
        produits={produits}
        selectedClientId={selectedClientId}
        onClientChange={setSelectedClientId}
        selectedProduits={selectedProduits}
        onAddProduit={handleAddProduit}
        onUpdateQuantite={handleUpdateQuantite}
        onRemoveProduit={handleRemoveProduit}
        onClearPanier={handleClearPanier}
        formData={formData}
        setFormData={setFormData}
        isDark={isDark}
      />

      {/* VIEW MODAL */}
      {showViewModal && (
        <VentesViewModal
          item={viewItem}
          type={activeTab}
          details={viewDetails}
          loading={loadingDetails}
          onClose={() => setShowViewModal(false)}
          onConvertDevisToFacture={() =>
            handleConvertDevisToFacture(viewItem)
          }
          onDownloadFacture={() =>
            handleDownloadPDF(viewItem)
          }
          onDownloadDevisPDF={() =>
            handleDownloadDevisPDF(viewItem)
          }
          isDark={isDark}
        />
      )}

      {/* DELETE */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          try {
            if (!deleteTarget?.id) return;

            const result =
              activeTab === 'devis'
                ? await deleteDevis(Number(deleteTarget.id))
                : await deleteFacture(Number(deleteTarget.id));

            if (result?.success !== false) {
              setShowDeleteModal(false);
              setDeleteTarget(null);
              setShowSuccessModal(true);
              await refresh();
            } else {
              alert(result?.error || 'Erreur suppression');
            }
          } catch (err: any) {
            console.error('[VENTES] Delete error:', err);
            alert(err?.message || 'Erreur suppression');
          }
        }}
        title="Suppression"
        message={`Supprimer "${deleteTarget?.reference || ''}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmColor="red"
        isDark={isDark}
      />

      {/* BULK DELETE */}
      <ConfirmModal
        isOpen={showBulkDeleteModal}
        onClose={() => { setShowBulkDeleteModal(false); setBulkDeleteTargetIds([]); }}
        onConfirm={handleConfirmBulkDelete}
        title="Suppression en lot"
        message={`Supprimer ${bulkDeleteTargetIds.length} élément(s) ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmColor="red"
        isDark={isDark}
      />

      {/* SUCCESS */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Succès"
        message="Opération réussie !"
        buttonText="OK"
        autoCloseDelay={3000}
      />
    </div>
  );
};

export default Ventes;