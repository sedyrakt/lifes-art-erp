// ============================================================
// src/pages/Paiements.tsx
// ⭐ FIX: Mampiseho mivantana ny PaiementsModalForm
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Users, ShoppingCart, FileText, CreditCard, RefreshCw, Search } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmModal from '../components/common/ConfirmModal';
import SuccessModal from '../components/common/SuccessModal';
import ErrorModal from '../components/common/ErrorModal';
import PaiementsStats from '../components/paiements/PaiementsStats';
import PaiementsHeader from '../components/paiements/PaiementsHeader';
import PaiementsModalForm from '../components/paiements/PaiementsModalForm';
import PaiementsViewModal from '../components/paiements/PaiementsViewModal';
import PaiementsHistoriqueModal from '../components/paiements/PaiementsHistoriqueModal';
import { usePaiementCounts } from '../hooks/usePaiementCounts';
import PaiementsEmployesTab from '../components/paiements/PaiementsEmployesTab';
import PaiementsCommandesTab from '../components/paiements/PaiementsCommandesTab';
import PaiementsFacturesTab from '../components/paiements/PaiementsFacturesTab';
import { ITEMS_PER_PAGE, TabId, DeleteType, SortField, SortDirection, safeNumber, safeString, normalizeText, formatDate, getStatusClass, moisLabels, annees } from '../components/paiements/PaiementsUtils';

interface StatusModalState { isOpen: boolean; title: string; message: string; }

const Paiements: React.FC = () => {
  const { isDark } = useTheme();

  const tableBackground = isDark ? 'bg-[#111c30]' : 'bg-white';
  const tableSecondaryBackground = isDark ? 'bg-[#0f192b]' : 'bg-slate-50/70';
  const borderColor = isDark ? 'border-white/[0.14]' : 'border-slate-200';
  const pageBackground = isDark ? 'bg-[#0A1222]' : 'bg-[#F8FAFC]';

  const [activeTab, setActiveTab] = useState<TabId>('employes');
  const [paiements, setPaiements] = useState<any[]>([]);
  const [employes, setEmployes] = useState<any[]>([]);
  const [commandes, setCommandes] = useState<any[]>([]);
  const [factures, setFactures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchHistorique, setSearchHistorique] = useState('');
  const [filterEmploye, setFilterEmploye] = useState('');
  const [filterMois, setFilterMois] = useState(new Date().getMonth() + 1);
  const [filterAnnee, setFilterAnnee] = useState(new Date().getFullYear());
  const [sortOption, setSortOption] = useState('date-desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [successModal, setSuccessModal] = useState<StatusModalState>({ isOpen: false, title: '', message: '' });
  const [errorModal, setErrorModal] = useState<StatusModalState>({ isOpen: false, title: '', message: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number[]>([]);
  const [deleteType, setDeleteType] = useState<DeleteType>('commande');
  const [selectedPaiement, setSelectedPaiement] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingPaiement, setEditingPaiement] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showHistorique, setShowHistorique] = useState(false);
  const [historiqueEmploye, setHistoriqueEmploye] = useState<number | null>(null);
  const [historiqueData, setHistoriqueData] = useState<any[]>([]);
  const [employeTotals, setEmployeTotals] = useState<Record<number, number>>({});
  const isMounted = useRef(false);

  const { paiementCounts, refreshPaiementCounts } = usePaiementCounts({ employes });
  const [globalStats, setGlobalStats] = useState({ total_paiements: 0, total_montant: 0, employes: 0 });

  const tabs = [
    { id: 'employes' as TabId, label: 'Détails employés', activeClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', activeBar: 'bg-indigo-500' },
    { id: 'commande' as TabId, label: 'Commandes', activeClass: 'bg-violet-500/10 text-violet-600 dark:text-violet-400', activeBar: 'bg-violet-500' },
    { id: 'facture' as TabId, label: 'Factures', activeClass: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400', activeBar: 'bg-cyan-500' },
  ];

  // ⭐ FIX: Console.log mba hahitana ny showModal
  useEffect(() => {
    console.log('🟢 showModal:', showModal);
  }, [showModal]);

  const fetchEmployeTotals = useCallback(async (employesList: any[]) => {
    if (!employesList.length) return;
    const totals: Record<number, number> = {};
    await Promise.all(employesList.map(async (emp) => {
      try {
        const result = await window.api.payments.getEmployeStats(emp.id);
        if (result?.success) totals[emp.id] = result.data?.total || 0;
      } catch (_) {}
    }));
    if (isMounted.current) setEmployeTotals(totals);
  }, []);

  const loadGlobalStats = useCallback(async () => {
    try {
      const result = await window.api.payments.getStats();
      if (result?.success && isMounted.current) {
        setGlobalStats({
          total_paiements: result.data?.total_paiements || 0,
          total_montant: result.data?.total_montant || 0,
          employes: result.data?.employes || 0
        });
      }
    } catch (err) { console.error('Erreur loadGlobalStats:', err); }
  }, []);

  const loadPaiements = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      if (!window.api?.payments?.getAll) throw new Error('API payments.getAll indisponible');
      const result = await window.api.payments.getAll({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchHistorique,
        employeId: filterEmploye || undefined,
        mois: filterMois || undefined,
        annee: filterAnnee || undefined,
        sort: { field: sortOption === 'date-desc' ? 'date_paiement' : sortOption === 'date-asc' ? 'date_paiement' : 'montant', direction: sortOption.includes('desc') || sortOption.includes('croissant') ? 'DESC' : 'ASC' }
      });
      if (result?.success && isMounted.current) {
        setPaiements(result.data || []);
        setTotalItems(result.pagination?.total || 0);
        setTotalPages(Math.ceil((result.pagination?.total || 0) / ITEMS_PER_PAGE));
      }
    } catch (err) { console.error('Erreur loadPaiements:', err); if (isMounted.current) setPaiements([]); }
    finally { if (isMounted.current) setLoading(false); }
  }, [currentPage, searchHistorique, filterEmploye, filterMois, filterAnnee, sortOption]);

  const loadEmployes = useCallback(async () => {
    try {
      const result = await window.api.employes.getAll({ limit: 500, status: 'actif' });
      if (result?.success && isMounted.current) {
        setEmployes(result.data || []);
        await fetchEmployeTotals(result.data || []);
      }
    } catch (err) { console.error('Erreur loadEmployes:', err); }
  }, [fetchEmployeTotals]);

  const loadCommandes = useCallback(async () => {
    try {
      const result = await window.api.orders.getAll({ limit: 500, status: 'Tous' });
      if (result?.success && isMounted.current) setCommandes(result.data || []);
    } catch (err) { console.error('Erreur loadCommandes:', err); }
  }, []);

  const loadFactures = useCallback(async () => {
    try {
      if (window.api?.factures?.getAll) {
        const result = await window.api.factures.getAll({ limit: 500 });
        if (result?.success && isMounted.current) setFactures(result.data || []);
      } else {
        setFactures([]);
      }
    } catch (err) { console.error('Erreur loadFactures:', err); setFactures([]); }
  }, []);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    await Promise.allSettled([loadPaiements(false), loadEmployes(), loadCommandes(), loadFactures(), loadGlobalStats()]);
    if (isMounted.current) setLoading(false);
  }, [loadPaiements, loadEmployes, loadCommandes, loadFactures, loadGlobalStats]);

  useEffect(() => { isMounted.current = true; loadData(true); return () => { isMounted.current = false; }; }, [loadData]);
  useEffect(() => { if (!isMounted.current) return; loadPaiements(false); loadGlobalStats(); }, [currentPage, searchHistorique, filterEmploye, filterMois, filterAnnee, sortOption, loadPaiements, loadGlobalStats]);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (deleteTarget.length === 0) return;
    try {
      if (deleteType === 'commande') await window.api.orders.bulkDelete(deleteTarget);
      else if (deleteType === 'facture') {
        if (window.api?.factures?.bulkDelete) await window.api.factures.bulkDelete(deleteTarget);
      }
      setSuccessModal({ isOpen: true, title: 'Suppression terminée', message: `${deleteTarget.length} élément(s) supprimé(s).` });
      setDeleteTarget([]); setShowDeleteModal(false);
      await loadData(false);
    } catch (error: any) {
      setErrorModal({ isOpen: true, title: 'Erreur de suppression', message: error?.message || 'Impossible de supprimer.' });
    }
  }, [deleteTarget, deleteType, loadData]);

  const handleDeleteSingle = useCallback(async (id: number, type: string) => {
    try {
      if (type === 'commande') await window.api.orders.delete(id);
      else if (type === 'facture') {
        if (window.api?.factures?.delete) await window.api.factures.delete(id);
      }
      setSuccessModal({ isOpen: true, title: 'Suppression réussie', message: `L'élément a été supprimé.` });
      await loadData(false);
    } catch (error: any) {
      setErrorModal({ isOpen: true, title: 'Erreur de suppression', message: error?.message || 'Impossible de supprimer.' });
    }
  }, [loadData]);

  const handleViewHistorique = useCallback(async (employeeId: number) => {
    setHistoriqueEmploye(employeeId);
    try {
      const result = await window.api.payments.getHistorique(employeeId);
      if (result?.success && isMounted.current) {
        setHistoriqueData(result.data || []);
        setShowHistorique(true);
      }
    } catch (err) { console.error('Erreur historique:', err); }
  }, []);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const paiementData = {
      employe_id: Number(formData.get('employe_id')),
      mois: formData.get('mois') ? Number(formData.get('mois')) : new Date().getMonth() + 1,
      annee: formData.get('annee') ? Number(formData.get('annee')) : new Date().getFullYear(),
      montant: Number(formData.get('montant')) || 0,
      mode_paiement: String(formData.get('mode_paiement') || 'Espèces'),
      reference: String(formData.get('reference') || ''),
      observation: String(formData.get('observation') || '')
    };
    try {
      await window.api.payments.create(paiementData);
      setSuccessModal({ isOpen: true, title: 'Paiement enregistré', message: 'Le paiement a été ajouté avec succès.' });
      await loadData(false);
      await refreshPaiementCounts();
      await fetchEmployeTotals(employes);
    } catch (error: any) {
      setErrorModal({ isOpen: true, title: 'Erreur d\'enregistrement', message: error?.message || 'Une erreur est survenue.' });
    }
  }, [loadData, refreshPaiementCounts, fetchEmployeTotals, employes]);

  return (
    <>
      <SuccessModal isOpen={successModal.isOpen} onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })} title={successModal.title} message={successModal.message} buttonText="OK" autoCloseDelay={3000} />
      <ErrorModal isOpen={errorModal.isOpen} onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })} title={errorModal.title} message={errorModal.message} buttonText="OK" autoCloseDelay={4000} />

      <div className={`min-h-screen p-5 font-sans transition-colors duration-300 xl:p-6 ${pageBackground}`}>
        <div className="mb-5"><PaiementsHeader onAddPaiement={() => setShowModal(true)} /></div>
        <div className="mb-5"><PaiementsStats totalPaiements={globalStats.total_montant || 0} nbPaiements={globalStats.total_paiements || 0} employesPayes={globalStats.employes || 0} /></div>

        {/* TABS */}
        <div className="mb-4 overflow-x-auto">
          <div className="flex min-w-max items-center gap-1">
            {tabs.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-[13px] font-semibold transition ${active ? tab.activeClass : isDark ? 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>
                  {tab.label}
                  {active && <span className={`absolute bottom-[-1px] left-3 right-3 h-0.5 rounded-full ${tab.activeBar}`} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB CONTENT */}
        {activeTab === 'employes' && (
          loading && employes.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw size={28} className="animate-spin text-indigo-500" />
                <span className="text-[13px] font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Chargement des paiements...</span>
              </div>
            </div>
          ) : (
            <PaiementsEmployesTab isDark={isDark} employes={employes} paiementCounts={paiementCounts} employeTotals={employeTotals} onViewHistorique={handleViewHistorique} />
          )
        )}

        {activeTab === 'commande' && (
          loading && commandes.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw size={28} className="animate-spin text-indigo-500" />
                <span className="text-[13px] font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Chargement des commandes...</span>
              </div>
            </div>
          ) : (
            <PaiementsCommandesTab
              isDark={isDark}
              commandes={commandes}
              onView={(data) => setSuccessModal({ isOpen: true, title: 'Détails', message: `Commande #${data.id}` })}
              onEdit={(data) => setSuccessModal({ isOpen: true, title: 'Modifier', message: `Commande #${data.id}` })}
              onDelete={handleDeleteSingle}
              onBulkDelete={(type) => { setDeleteType(type); setDeleteTarget(commandes.map(c => c.id)); setShowDeleteModal(true); }}
            />
          )
        )}

        {activeTab === 'facture' && (
          loading && factures.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw size={28} className="animate-spin text-indigo-500" />
                <span className="text-[13px] font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Chargement des factures...</span>
              </div>
            </div>
          ) : (
            <PaiementsFacturesTab
              isDark={isDark}
              factures={factures}
              onView={(data) => setSuccessModal({ isOpen: true, title: 'Détails', message: `Facture #${data.id}` })}
              onEdit={(data) => setSuccessModal({ isOpen: true, title: 'Modifier', message: `Facture #${data.id}` })}
              onDelete={handleDeleteSingle}
              onBulkDelete={(type) => { setDeleteType(type); setDeleteTarget(factures.map(f => f.id)); setShowDeleteModal(true); }}
            />
          )
        )}

        {/* MODALS */}
        {showViewModal && selectedPaiement && (
          <PaiementsViewModal paiement={selectedPaiement} moisLabels={moisLabels} onClose={() => setShowViewModal(false)} onViewHistorique={() => { setShowViewModal(false); handleViewHistorique(selectedPaiement.employe_id); }} />
        )}
        {showHistorique && historiqueEmploye && (
          <PaiementsHistoriqueModal isOpen={showHistorique} onClose={() => setShowHistorique(false)} onAddPaiement={() => { setShowHistorique(false); setShowModal(true); }} historiqueData={historiqueData} moisLabels={moisLabels} />
        )}

        {/* ⭐ FIX: Mampiseho mivantana ny PaiementsModalForm */}
        {showModal && (
          <PaiementsModalForm
            isOpen={showModal}
            onClose={() => { setShowModal(false); setEditingPaiement(null); }}
            onSubmit={handleSubmit}
            editingPaiement={editingPaiement}
            employes={employes}
            moisOptions={moisLabels.map((l, i) => ({ value: i + 1, label: l }))}
            annees={annees}
            isDark={isDark}
          />
        )}

        <ConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteTarget([]); }} onConfirm={handleConfirmBulkDelete} title="Suppression en lot" message={`Voulez-vous vraiment supprimer ${deleteTarget.length} élément(s) ?`} confirmText="Supprimer" cancelText="Annuler" confirmColor="red" isDark={isDark} />
      </div>
    </>
  );
};

export default Paiements;