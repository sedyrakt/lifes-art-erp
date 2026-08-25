// src/pages/Employes.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Plus, Search, List, Grid, ArrowUpDown, X, Users, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useEmployesData } from '../hooks/useEmployesData';
import EmployesStats from '../components/employes/EmployesStats';
import EmployesTable from '../components/employes/EmployesTable';
import EmployesGrid from '../components/employes/EmployesGrid';
import EmployesPagination from '../components/employes/EmployesPagination';
import EmployesModalForm from '../components/employes/EmployesModalForm';
import EmployesViewModal from '../components/employes/EmployesViewModal';
import EmployesPaiementModal from '../components/employes/EmployesPaiementModal';
import EmployesHistoriqueModal from '../components/employes/EmployesHistoriqueModal';
import ConfirmModal from '../components/common/ConfirmModal';
import SuccessModal from '../components/common/SuccessModal';
import ErrorModal from '../components/common/ErrorModal';

const moisLabels = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const moisLabelsCourt = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];

const Employes: React.FC = () => {
  const { isDark } = useTheme();
  const { 
    employes, loading, refreshing, totalItems, totalPages, currentPage, setCurrentPage, 
    searchTerm, setSearchTerm, filterStatus, setFilterStatus, sortOption, setSortOption, 
    imageUrls, imageErrors, imagePreview, setImagePreview, imagePath, uploadingImage, 
    resetImageState, handleImageError, uploadImage, deleteImage, 
    paiementCounts, historiquePaiements, loadPaiementsEmploye, createPaiement, deletePaiement, 
    loadData, stats, getEmployeById, createEmploye, updateEmploye, deleteEmploye, 
    getStatusColor, getStatusIcon, ITEMS_PER_PAGE, refreshPaiementCounts, bulkUpdateStatus, bulkDelete 
  } = useEmployesData();

  const retryAttempted = useRef(false);
  useEffect(() => { 
    if (!loading && employes.length === 0 && totalItems === 0 && !retryAttempted.current) { retryAttempted.current = true; loadData(); } 
    if (employes.length > 0 || totalItems > 0) retryAttempted.current = false; 
  }, [loading, employes.length, totalItems, loadData]);

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showModal, setShowModal] = useState(false); 
  const [showViewModal, setShowViewModal] = useState(false); 
  const [showPaiementModal, setShowPaiementModal] = useState(false); 
  const [showHistoriqueModal, setShowHistoriqueModal] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState<any>(null); 
  const [editingEmploye, setEditingEmploye] = useState<any>(null);
  const [paiementMois, setPaiementMois] = useState(new Date().getMonth() + 1); 
  const [paiementAnnee, setPaiementAnnee] = useState(new Date().getFullYear()); 
  const [paiementMontant, setPaiementMontant] = useState(0);
  const [anneeCalendrier, setAnneeCalendrier] = useState(new Date().getFullYear()); 
  const [selectedMoisDetail, setSelectedMoisDetail] = useState<number | null>(null); 
  const [selectedMoisDetailAnnee, setSelectedMoisDetailAnnee] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successTitle, setSuccessTitle] = useState(''); 
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false); 
  const [errorTitle, setErrorTitle] = useState(''); 
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; img?: string; nom: string; } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set()); 
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false); 
  const [bulkActionType, setBulkActionType] = useState<'delete' | 'status'>('delete'); 
  const [bulkTargetIds, setBulkTargetIds] = useState<number[]>([]); 
  const [bulkTargetStatus, setBulkTargetStatus] = useState('');

  const showSuccess = useCallback((title: string, message: string) => { setSuccessTitle(title); setSuccessMessage(message); setShowSuccessModal(true); }, []);
  const showError = useCallback((title: string, message: string) => { setErrorTitle(title); setErrorMessage(message); setShowErrorModal(true); }, []);
  const handleSelectAll = useCallback((checked: boolean) => { setSelectedIds(checked ? new Set(employes.map(e => e.id)) : new Set()); }, [employes]);
  const handleSelectOne = useCallback((id: number, checked: boolean) => { setSelectedIds(prev => { const next = new Set(prev); checked ? next.add(id) : next.delete(id); return next; }); }, []);
  const handleBulkUpdateStatus = useCallback((ids: number[], newStatus: string) => { setBulkTargetIds(ids); setBulkTargetStatus(newStatus); setBulkActionType('status'); setShowBulkConfirmModal(true); }, []);
  const handleBulkDelete = useCallback((ids: number[]) => { setBulkTargetIds(ids); setBulkActionType('delete'); setShowBulkConfirmModal(true); }, []);
  const handleConfirmBulkAction = useCallback(async () => { 
    if (bulkTargetIds.length === 0) return; 
    try { 
      if (bulkActionType === 'delete') { await bulkDelete(bulkTargetIds); setSelectedIds(new Set()); showSuccess('Suppression en lot', `${bulkTargetIds.length} employé(s) supprimé(s).`); } 
      if (bulkActionType === 'status') { await bulkUpdateStatus(bulkTargetIds, bulkTargetStatus); setSelectedIds(new Set()); const statusLabel = bulkTargetStatus === 'actif' ? 'Actif' : bulkTargetStatus === 'inactif' ? 'Inactif' : 'En congé'; showSuccess('Mise à jour en lot', `${bulkTargetIds.length} employé(s) sont maintenant "${statusLabel}".`); } 
    } catch (error: any) { showError('Erreur', error?.message || 'Impossible d’effectuer cette opération.'); } 
    finally { setShowBulkConfirmModal(false); setBulkTargetIds([]); setBulkTargetStatus(''); } 
  }, [bulkTargetIds, bulkActionType, bulkTargetStatus, bulkDelete, bulkUpdateStatus, showSuccess, showError]);

  const handleOpenAddModal = useCallback(() => { setEditingEmploye(null); resetImageState(); setShowModal(true); }, [resetImageState]);
  const handleCloseModal = useCallback(() => { setShowModal(false); setEditingEmploye(null); resetImageState(); }, [resetImageState]);
  const handleViewEmploye = useCallback(async (id: number) => { 
    try { const employe = await getEmployeById(id); if (!employe) { showError('Employé introuvable', 'Cet employé n’existe plus.'); return; } setSelectedEmploye(employe); setShowViewModal(true); } 
    catch (error: any) { showError('Erreur', error?.message || 'Impossible de charger les informations.'); } 
  }, [getEmployeById, showError]);
  const handleEditEmploye = useCallback((employe: any) => { setEditingEmploye(employe); resetImageState(); if (employe.image) { const url = imageUrls[employe.id]; if (url) setImagePreview(url); } setShowModal(true); }, [resetImageState, imageUrls, setImagePreview]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    const form = e.currentTarget; 
    const fd = new FormData(form);
    const statusValue = (fd.get('status') as string) || 'Actif'; 
    const dbStatus = statusValue === 'Actif' ? 'actif' : statusValue === 'Inactif' ? 'inactif' : statusValue === 'En congé' ? 'en_conge' : 'actif';
    const salaire = parseFloat((fd.get('salaire') as string) || '0') || 0;
    const data: any = { nom: fd.get('nom'), prenom: fd.get('prenom'), email: fd.get('email'), telephone: fd.get('telephone'), poste: fd.get('poste'), departement: fd.get('departement'), date_embauche: fd.get('date_embauche'), salaire, status: dbStatus };
    if (!data.nom || !data.prenom) { showError('Champs requis', 'Le nom et le prénom sont obligatoires.'); return; }
    if (!data.email) { showError('Champ requis', 'L’adresse email est obligatoire.'); return; }
    if (!data.date_embauche) { showError('Champ requis', 'La date d’embauche est obligatoire.'); return; }
    if (data.salaire <= 0) { showError('Valeur invalide', 'Le salaire doit être supérieur à 0.'); return; }
    if (imagePath) data.image = imagePath; 
    else if (editingEmploye?.image && !imagePreview && !imagePath) data.image = editingEmploye.image;
    try {
      if (editingEmploye) { if (editingEmploye.image && editingEmploye.image !== data.image) try { await deleteImage(editingEmploye.image); } catch {} await updateEmploye(editingEmploye.id, data); showSuccess('Employé modifié', `Les informations de ${data.prenom} ${data.nom} ont été mises à jour.`); } 
      else { await createEmploye(data); showSuccess('Employé créé', `L’employé ${data.prenom} ${data.nom} a été enregistré.`); }
      setShowModal(false); setEditingEmploye(null); resetImageState();
    } catch (error: any) { showError('Erreur', error?.message || 'Impossible d’enregistrer l’employé.'); }
  }, [editingEmploye, imagePath, imagePreview, deleteImage, updateEmploye, createEmploye, resetImageState, showSuccess, showError]);

  const handleDeleteClick = useCallback((id: number, image?: string) => { const employe = employes.find(item => item.id === id); setDeleteTarget({ id, img: image, nom: employe ? `${employe.prenom} ${employe.nom}` : '' }); setShowDeleteModal(true); }, [employes]);
  const handleConfirmDelete = useCallback(async () => { 
    if (!deleteTarget) return; 
    try { if (deleteTarget.img) try { await deleteImage(deleteTarget.img); } catch {} await deleteEmploye(deleteTarget.id); setSelectedIds(prev => { const next = new Set(prev); next.delete(deleteTarget.id); return next; }); showSuccess('Employé supprimé', `L’employé "${deleteTarget.nom}" a été supprimé.`); } 
    catch (error: any) { showError('Erreur', error?.message || 'Impossible de supprimer cet employé.'); } 
    finally { setShowDeleteModal(false); setDeleteTarget(null); } 
  }, [deleteTarget, deleteImage, deleteEmploye, showSuccess, showError]);

  const handlePaiement = useCallback((employe: any) => { setSelectedEmploye(employe); setPaiementMontant(employe.salaire || 0); setPaiementMois(new Date().getMonth() + 1); setPaiementAnnee(new Date().getFullYear()); setShowPaiementModal(true); }, []);
  const handlePayerPaiement = useCallback(async (mois: number, annee: number, montant: number, mode: string, obs: string) => {
    if (!selectedEmploye) return; 
    const estPaye = historiquePaiements.some(p => p.mois === mois && p.annee === annee);
    if (estPaye) { showError('Déjà payé', `${moisLabels[mois - 1]} ${annee} est déjà réglé.`); return; }
    if (!montant || montant <= 0) { showError('Montant invalide', 'Veuillez saisir un montant supérieur à 0.'); return; }
    try {
      const paiementData = { employe_id: selectedEmploye.id, mois, annee, montant, mode_paiement: mode, reference: `PAY-${selectedEmploye.id}-${annee}${String(mois).padStart(2, '0')}`, observation: obs };
      await createPaiement(paiementData);
      showSuccess(`Salaire ${moisLabels[mois - 1]} ${annee} payé`, 'Le paiement a été enregistré avec succès.');
      setShowPaiementModal(false); await loadPaiementsEmploye(selectedEmploye.id); await refreshPaiementCounts();
    } catch (error: any) { showError('Erreur paiement', error?.message || 'Impossible d’enregistrer le paiement.'); }
  }, [selectedEmploye, historiquePaiements, createPaiement, loadPaiementsEmploye, refreshPaiementCounts, showSuccess, showError]);

  const handleHistorique = useCallback(async (employe: any) => { setSelectedEmploye(employe); await loadPaiementsEmploye(employe.id); setAnneeCalendrier(new Date().getFullYear()); setSelectedMoisDetail(null); setSelectedMoisDetailAnnee(null); setShowHistoriqueModal(true); }, [loadPaiementsEmploye]);
  const handleAnnulerPaiement = useCallback(async (paiementId: number) => { 
    try { await deletePaiement(paiementId); showSuccess('Paiement annulé', 'Le paiement a été annulé.'); if (selectedEmploye) await loadPaiementsEmploye(selectedEmploye.id); await refreshPaiementCounts(); } 
    catch (error: any) { showError('Erreur annulation', error?.message || 'Impossible d’annuler le paiement.'); } 
  }, [selectedEmploye, deletePaiement, loadPaiementsEmploye, refreshPaiementCounts, showSuccess, showError]);

  const getMoisPourAnnee = useCallback((_dateEmbauche: string, annee: number, labels: string[] = moisLabelsCourt) => { 
    const moisList: { mois: number; annee: number; label: string; }[] = []; 
    for (let mois = 1; mois <= 12; mois++) moisList.push({ mois, annee, label: `${labels[mois - 1]} ${annee}` }); 
    return moisList; 
  }, []);

  const cardBackground = isDark ? '#111c30' : '#FFFFFF'; 
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.055)' : '#E2E8F0';

  return (
    <div className="min-h-full w-full transition-colors duration-200" style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}>
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-0 lg:px-4 py-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="min-w-0">
            <h1 className="text-[24px] leading-tight font-semibold tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Employés</h1>
            <p className="mt-1 text-[14px] leading-5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Gérez vos ressources humaines et vos paiements.</p>
          </div>
          <button onClick={handleOpenAddModal} className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-[14px] font-medium text-white transition-all hover:bg-indigo-600 active:scale-[0.98] shadow-sm" style={{ backgroundColor: '#6366F1' }}><Plus size={18} />Nouvel employé</button>
        </header>
        <div className="mb-5"><EmployesStats totalItems={totalItems} totalSalaire={stats.totalSalaire} actifs={stats.actifs} tauxActif={stats.tauxActif} evolutionTotal={0} evolutionSalaire={0} evolutionActifs={0} evolutionTaux={0} /></div>
        
        {/* ⭐ SEARCH & FILTERS */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 w-full min-w-[200px]">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher un employé..." className="w-full h-10 pl-10 pr-10 rounded-lg border text-[14px] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" style={{ backgroundColor: cardBackground, borderColor, color: isDark ? '#F8FAFC' : '#0F172A' }} />
            {searchTerm && (<button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"><X size={15} /></button>)}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-10 min-w-[120px] px-3 rounded-lg border text-[14px] outline-none cursor-pointer transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" style={{ backgroundColor: cardBackground, borderColor, color: isDark ? '#E2E8F0' : '#334155' }}><option value="">Statut</option><option value="actif">Actif</option><option value="inactif">Inactif</option><option value="en_conge">En congé</option></select>
            <div className="relative"><ArrowUpDown size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" /><select value={sortOption} onChange={e => setSortOption(e.target.value)} className="h-10 min-w-[155px] pl-9 pr-3 rounded-lg border text-[14px] outline-none cursor-pointer transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" style={{ backgroundColor: cardBackground, borderColor, color: isDark ? '#E2E8F0' : '#334155' }}><option value="nom-asc">Nom (A-Z)</option><option value="nom-desc">Nom (Z-A)</option><option value="salaire-asc">Salaire ↑</option><option value="salaire-desc">Salaire ↓</option><option value="date-desc">Date (Récent)</option><option value="date-asc">Date (Ancien)</option></select></div>
            <div className="flex items-center h-10 p-1 rounded-lg border" style={{ backgroundColor: cardBackground, borderColor }}>
              <button onClick={() => setViewMode('table')} className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${viewMode === 'table' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}><List size={18} /></button>
              <button onClick={() => setViewMode('grid')} className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}><Grid size={18} /></button>
            </div>
          </div>
        </div>

        <section className="rounded-xl border overflow-hidden" style={{ backgroundColor: cardBackground, borderColor }}>
          {loading && employes.length === 0 ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw size={30} className="animate-spin text-indigo-500" />
                <span className="text-[14px] font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  Chargement des employés...
                </span>
              </div>
            </div>
          ) : (
            <>
              {viewMode === 'table' ? (
                <EmployesTable 
                  employes={employes} 
                  imageUrls={imageUrls} 
                  imageErrors={imageErrors} 
                  paiementCounts={paiementCounts} 
                  onView={handleViewEmploye} 
                  onEdit={handleEditEmploye} 
                  onDelete={handleDeleteClick} 
                  onPaiement={handlePaiement} 
                  onHistorique={handleHistorique} 
                  onAdd={handleOpenAddModal} 
                  getStatusColor={getStatusColor} 
                  getStatusIcon={getStatusIcon} 
                  handleImageError={handleImageError} 
                  selectedIds={selectedIds} 
                  onSelectAll={handleSelectAll} 
                  onSelectOne={handleSelectOne} 
                  onBulkUpdateStatus={handleBulkUpdateStatus} 
                  onBulkDelete={handleBulkDelete} 
                />
              ) : (
                <EmployesGrid 
                  employes={employes} 
                  imageUrls={imageUrls} 
                  imageErrors={imageErrors} 
                  onView={handleViewEmploye} 
                  onEdit={handleEditEmploye} 
                  onDelete={handleDeleteClick} 
                  onPaiement={handlePaiement} 
                  onHistorique={handleHistorique} 
                  onAdd={handleOpenAddModal} 
                  getStatusColor={getStatusColor} 
                  getStatusIcon={getStatusIcon} 
                  handleImageError={handleImageError} 
                  isDark={isDark} 
                />
              )}

              {!loading && !refreshing && employes.length === 0 && searchTerm !== '' && (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center border-t" style={{ borderColor: borderColor }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 mb-4"><Users size={24} className="text-slate-400 dark:text-slate-500" /></div>
                  <h3 className="text-[16px] font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Aucun employé trouvé</h3>
                  <p className="mt-1 text-[14px] max-w-sm" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Aucun employé ne correspond aux critères de recherche.</p>
                </div>
              )}
            </>
          )}
        </section>
        {totalPages > 0 && <div className="flex justify-center pt-1"><EmployesPagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} onPageChange={setCurrentPage} /></div>}
      </div>

      <EmployesModalForm isOpen={showModal} onClose={handleCloseModal} onSubmit={handleSubmit} editingEmploye={editingEmploye} isDark={isDark} imagePreview={imagePreview} uploadingImage={uploadingImage} onImageChange={e => { const file = e.target.files?.[0]; if (file) uploadImage(file); }} onRemoveImage={() => { if (imagePath) deleteImage(imagePath); resetImageState(); }} uploadProgress={uploadingImage ? 50 : 0} imageError={null} />
      {showViewModal && selectedEmploye && <EmployesViewModal employe={selectedEmploye} imageUrl={imageUrls[selectedEmploye.id] || null} onClose={() => setShowViewModal(false)} onEdit={() => { setShowViewModal(false); handleEditEmploye(selectedEmploye); }} onHistorique={() => { setShowViewModal(false); handleHistorique(selectedEmploye); }} getStatusColor={getStatusColor} getStatusIcon={getStatusIcon} isDark={isDark} />}
      {showPaiementModal && selectedEmploye && <EmployesPaiementModal isOpen={showPaiementModal} onClose={() => setShowPaiementModal(false)} employe={selectedEmploye} historiquePaiements={historiquePaiements} imageUrl={imageUrls[selectedEmploye.id] || null} paiementMois={paiementMois} paiementAnnee={paiementAnnee} paiementMontant={paiementMontant} paiementMode="Espèces" paiementObservation="" onMoisChange={setPaiementMois} onAnneeChange={setPaiementAnnee} onMontantChange={setPaiementMontant} onPayer={handlePayerPaiement} getMoisPourAnnee={getMoisPourAnnee} moisLabels={moisLabels} moisLabelsCourt={moisLabelsCourt} isDark={isDark} />}
      {showHistoriqueModal && selectedEmploye && <EmployesHistoriqueModal isOpen={showHistoriqueModal} onClose={() => setShowHistoriqueModal(false)} employe={selectedEmploye} historiquePaiements={historiquePaiements} imageUrl={imageUrls[selectedEmploye.id] || null} anneeCalendrier={anneeCalendrier} selectedMoisDetail={selectedMoisDetail} selectedMoisDetailAnnee={selectedMoisDetailAnnee} onAnneeChange={setAnneeCalendrier} onMoisDetailSelect={(mois, annee) => { setSelectedMoisDetail(mois); setSelectedMoisDetailAnnee(annee); }} onPayer={() => { setShowHistoriqueModal(false); handlePaiement(selectedEmploye); }} onAnnulerPaiement={handleAnnulerPaiement} getMoisPourAnnee={getMoisPourAnnee} moisLabels={moisLabels} moisLabelsCourt={moisLabelsCourt} isDark={isDark} />}
      <ConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }} onConfirm={handleConfirmDelete} title="Supprimer l’employé" message={`Êtes-vous sûr de vouloir supprimer définitivement "${deleteTarget?.nom || ''}" ?`} confirmText="Supprimer" cancelText="Annuler" confirmColor="red" isDark={isDark} />
      
      <ConfirmModal isOpen={showBulkConfirmModal} onClose={() => { setShowBulkConfirmModal(false); setBulkTargetIds([]); setBulkTargetStatus(''); }} onConfirm={handleConfirmBulkAction} title="Confirmation de l’opération" message={bulkActionType === 'delete' ? `Voulez-vous vraiment supprimer définitivement ${bulkTargetIds.length} employé(s) ?` : `Voulez-vous vraiment changer le statut de ${bulkTargetIds.length} employé(s) ?`} confirmText="Confirmer" cancelText="Annuler" confirmColor={bulkActionType === 'delete' ? 'red' : 'green'} isDark={isDark} />
      
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title={successTitle} message={successMessage} buttonText="OK" autoCloseDelay={3000} />
      <ErrorModal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title={errorTitle} message={errorMessage} buttonText="OK" autoCloseDelay={4000} />
    </div>
  );
};
export default Employes;