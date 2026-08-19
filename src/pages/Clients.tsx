import React, { useState, useCallback, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useClientsData } from '../hooks/useClientsData';
import ClientsStats from '../components/clients/ClientsStats';
import ClientsTable from '../components/clients/ClientsTable';
import ClientsGrid from '../components/clients/ClientsGrid';
import ClientsPagination from '../components/clients/ClientsPagination';
import ClientsModalForm from '../components/clients/ClientsModalForm';
import ClientsViewModal from '../components/clients/ClientsViewModal';
import ClientsSearchBar from '../components/clients/ClientsSearchBar';
import ConfirmModal from '../components/common/ConfirmModal';
import SuccessModal from '../components/common/SuccessModal';
import ErrorModal from '../components/common/ErrorModal';

const Clients: React.FC = () => {
  const { isDark } = useTheme();
  const {
    clients, loading, refreshing, totalItems, totalPages, currentPage, setCurrentPage,
    filters, setFilters, sortOption, setSortOption, refresh, loadData, getStats,
    getTypeColor, getTypeIcon, ITEMS_PER_PAGE, imageUrls, imageErrors, imagePreview,
    setImagePreview, imagePath, uploadingImage, fileInputRef, resetImageState,
    loadImageUrl, handleImageError, uploadImage, deleteImage, createClient,
    updateClient, deleteClient, bulkDelete, bulkUpdateType,
  } = useClientsData();

  const [reelStats, setReelStats] = useState({ total: 0, particuliers: 0, entreprises: 0, avec_telephone: 0 });
  const fetchReelStats = useCallback(async () => {
    try { const data = await getStats(); if (data) setReelStats({ total: Number(data.total) || 0, particuliers: Number(data.particuliers) || 0, entreprises: Number(data.entreprises) || 0, avec_telephone: Number(data.avec_telephone) || 0 }); }
    catch (err) { console.error('❌ Stats:', err); setReelStats({ total: 0, particuliers: 0, entreprises: 0, avec_telephone: 0 }); }
  }, [getStats]);
  useEffect(() => { if (!loading) fetchReelStats(); }, [loading, clients, fetchReelStats]);
  const tauxContact = reelStats.total > 0 ? Math.round((reelStats.avec_telephone / reelStats.total) * 100) : 0;

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkTargetIds, setBulkTargetIds] = useState<number[]>([]);
  const [bulkActionType, setBulkActionType] = useState<'delete' | 'update_type'>('delete');
  const [bulkTargetType, setBulkTargetType] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const showSuccess = useCallback((t: string, m: string) => { setSuccessTitle(t); setSuccessMessage(m); setShowSuccessModal(true); }, []);
  const showError = useCallback((t: string, m: string) => { setErrorTitle(t); setErrorMessage(m); setShowErrorModal(true); }, []);

  const handleSelectAll = useCallback((checked: boolean) => { setSelectedIds(checked ? new Set(clients.map((c: any) => c.id)) : new Set()); }, [clients]);
  const handleSelectOne = useCallback((id: number, checked: boolean) => { setSelectedIds(prev => { const n = new Set(prev); if (checked) n.add(id); else n.delete(id); return n; }); }, []);
  const handleViewClient = useCallback((client: any) => { setSelectedClient(client); setShowViewModal(true); }, []);
  const handleEditClient = useCallback(async (client: any) => {
    try { 
      setEditingClient(client); 
      resetImageState(); 
      setUploadError(null); 
      setUploadProgress(0); 
      if (client.image) try { await loadImageUrl(client); } catch {} 
      setShowModal(true); 
    }
    catch (err) { showError('Erreur', "Impossible d'ouvrir la fiche."); }
  }, [resetImageState, loadImageUrl, showError]);
  const handleDeleteClick = useCallback((client: any) => { setDeleteTarget(client); setShowDeleteModal(true); }, []);
  const handleOpenAddModal = useCallback(() => { setEditingClient(null); resetImageState(); setUploadError(null); setUploadProgress(0); setShowModal(true); }, [resetImageState]);
  const handleCloseModal = useCallback(() => { setShowModal(false); setEditingClient(null); resetImageState(); setUploadError(null); setUploadProgress(0); }, [resetImageState]);

  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadError(null); setUploadProgress(0);
    if (!['image/png','image/jpeg','image/jpg','image/gif','image/webp'].includes(file.type)) { showError('Format', 'PNG, JPEG, GIF ou WebP.'); return; }
    if (file.size > 10 * 1024 * 1024) { showError('Fichier trop volumineux', 'Max 10MB.'); return; }
    try {
      const base64 = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = () => rej(new Error()); r.readAsDataURL(file); });
      setImagePreview(base64);
      const path = await uploadImage(base64); 
      if (!path) throw new Error("Échec upload.");
    } catch (err: any) { console.error('❌ Upload:', err); setUploadError(err.message); setImagePreview(null); showError("Erreur d'upload", err.message); resetImageState(); } finally { setUploadProgress(0); }
  }, [uploadImage, resetImageState, showError]);

  const handleRemoveImage = useCallback(async () => { try { if (imagePath) try { await deleteImage(imagePath); } catch {} } finally { resetImageState(); } }, [imagePath, deleteImage, resetImageState]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement);
    const data: any = { nom: String(fd.get('nom') || '').trim(), email: String(fd.get('email') || '').trim(), telephone: String(fd.get('telephone') || '').trim(), adresse: String(fd.get('adresse') || '').trim(), ville: String(fd.get('ville') || '').trim(), code_postal: String(fd.get('code_postal') || '').trim(), pays: String(fd.get('pays') || '').trim() || 'Madagascar', type: String(fd.get('type') || '').trim() || 'Particulier' };
    if (!data.nom) { showError('Champ requis', 'Le nom est obligatoire.'); return; }
    if (imagePath) data.image = imagePath; else if (editingClient?.image && !imagePreview && !imagePath) data.image = editingClient.image;
    try {
      if (editingClient) { if (editingClient.image && editingClient.image !== data.image) try { await deleteImage(editingClient.image); } catch {} await updateClient(editingClient.id, data); showSuccess('Client modifié', `"${data.nom}" mis à jour.`); }
      else { await createClient(data); showSuccess('Client créé', `"${data.nom}" enregistré.`); }
      setShowModal(false); setEditingClient(null); resetImageState(); setUploadError(null); await fetchReelStats();
    } catch (err: any) { showError('Erreur', err.message); }
  }, [editingClient, imagePath, imagePreview, deleteImage, updateClient, createClient, resetImageState, showSuccess, showError, fetchReelStats]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try { if (deleteTarget.image) try { await deleteImage(deleteTarget.image); } catch {} await deleteClient(deleteTarget.id); showSuccess('Client supprimé', `"${deleteTarget.nom}" supprimé.`); setShowDeleteModal(false); setDeleteTarget(null); setSelectedIds(new Set()); await fetchReelStats(); }
    catch (err: any) { showError('Erreur', err.message); }
  }, [deleteTarget, deleteImage, deleteClient, showSuccess, showError, fetchReelStats]);

  const handleBulkUpdateType = useCallback((ids: number[], newType: string) => { if (ids.length) { setBulkTargetIds(ids); setBulkTargetType(newType); setBulkActionType('update_type'); setShowBulkConfirmModal(true); } }, []);
  const handleBulkDelete = useCallback((ids: number[]) => { if (ids.length) { setBulkTargetIds(ids); setBulkActionType('delete'); setShowBulkConfirmModal(true); } }, []);
  const handleConfirmBulkAction = useCallback(async () => {
    if (!bulkTargetIds.length) return;
    try {
      if (bulkActionType === 'delete') { const selected = clients.filter((c: any) => bulkTargetIds.includes(c.id)); for (const c of selected) if (c.image) try { await deleteImage(c.image); } catch {} await bulkDelete(bulkTargetIds); setSelectedIds(new Set()); showSuccess('Suppression en lot', `${bulkTargetIds.length} client(s) supprimé(s).`); }
      else if (bulkActionType === 'update_type') { await bulkUpdateType(bulkTargetIds, bulkTargetType); setSelectedIds(new Set()); showSuccess('Mise à jour en lot', `${bulkTargetIds.length} client(s) changé(s) en "${bulkTargetType}".`); }
      await fetchReelStats();
    } catch (err: any) { showError("Erreur", err.message); } finally { setShowBulkConfirmModal(false); setBulkTargetIds([]); setBulkTargetType(''); setBulkActionType('delete'); }
  }, [bulkTargetIds, bulkActionType, bulkTargetType, clients, deleteImage, bulkDelete, bulkUpdateType, showSuccess, showError, fetchReelStats]);

  const handleRefresh = useCallback(async () => { try { await refresh(); await fetchReelStats(); } catch (err) { console.error('❌ Refresh:', err); } }, [refresh, fetchReelStats]);

  return (
    <main className="min-h-full w-full px-0 py-5 transition-colors duration-200 sm:px-0 lg:px-4" style={{ background: isDark ? '#0A1222' : '#F8FAFC' }}>
      <div className="mx-auto w-full max-w-[1600px] space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[23px] font-semibold tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Clients</h1>
              {!loading && <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">{reelStats.total}</span>}
            </div>
            <p className="mt-1 text-[13px]" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Gérez votre carnet d'adresses clients.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleRefresh} disabled={refreshing} title="Actualiser" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-150 hover:bg-slate-50 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"><RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} /></button>
            <button type="button" onClick={handleOpenAddModal} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-[13px] font-semibold text-white shadow-sm shadow-indigo-600/10 transition-all duration-150 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-600/15 active:scale-[0.98]"><Plus size={17} />Nouveau client</button>
          </div>
        </header>
        <div className="mt-5"><ClientsStats totalClients={reelStats.total} particuliers={reelStats.particuliers} entreprises={reelStats.entreprises} tauxContact={tauxContact} refreshing={refreshing} /></div>
        <div className="mt-5"><ClientsSearchBar searchTerm={filters.searchTerm} onSearchChange={(v) => setFilters({ searchTerm: v })} filterType={filters.filterType} onFilterTypeChange={(v) => setFilters({ filterType: v })} sortOption={sortOption} onSortChange={setSortOption} viewMode={viewMode} onViewModeChange={setViewMode} filterDateFrom={filters.filterDateFrom} onFilterDateFromChange={(v) => setFilters({ filterDateFrom: v })} /></div>
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-[#0F172A]">
          {loading && clients.length === 0 ? (
            <div className="flex min-h-[360px] items-center justify-center"><div className="flex flex-col items-center gap-3"><RefreshCw size={30} className="animate-spin text-indigo-500" /><span className="text-[14px] font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Chargement des clients...</span></div></div>
          ) : (viewMode === 'table' ? (
            <ClientsTable clients={clients} imageUrls={imageUrls} imageErrors={imageErrors} onView={handleViewClient} onEdit={handleEditClient} onDelete={handleDeleteClick} onAdd={handleOpenAddModal} getTypeColor={getTypeColor} getTypeIcon={getTypeIcon} handleImageError={handleImageError} selectedIds={selectedIds} onSelectAll={handleSelectAll} onSelectOne={handleSelectOne} onBulkDelete={handleBulkDelete} onBulkUpdateType={handleBulkUpdateType} />
          ) : (
            <ClientsGrid clients={clients} imageUrls={imageUrls} imageErrors={imageErrors} onView={handleViewClient} onEdit={handleEditClient} onDelete={handleDeleteClick} getTypeColor={getTypeColor} getTypeIcon={getTypeIcon} handleImageError={handleImageError} isDark={isDark} />
          ))}
        </section>
        {totalPages > 0 && totalItems > 0 && (
          <div className="flex justify-center px-1 pt-0.5"><ClientsPagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} onPageChange={setCurrentPage} /></div>
        )}
        {!loading && totalItems > 0 && (
          <div className="flex justify-center pb-1"><span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalItems)} – {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} sur {totalItems} clients</span></div>
        )}
      </div>
      <ClientsModalForm isOpen={showModal} onClose={handleCloseModal} onSubmit={handleSubmit} editingClient={editingClient} isDark={isDark} imagePreview={imagePreview} uploadingImage={uploadingImage} onImageChange={handleImageChange} onRemoveImage={handleRemoveImage} fileInputRef={fileInputRef} error={uploadError} uploadProgress={uploadProgress} />
      {showViewModal && selectedClient && (<ClientsViewModal client={selectedClient} imageUrl={imageUrls[selectedClient.id] || null} onClose={() => setShowViewModal(false)} onEdit={() => { setShowViewModal(false); handleEditClient(selectedClient); }} getTypeColor={getTypeColor} getTypeIcon={getTypeIcon} handleImageError={handleImageError} isDark={isDark} />)}
      <ConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }} onConfirm={handleConfirmDelete} title="Suppression" message={`Supprimer "${deleteTarget?.nom || ''}" ?`} confirmText="Supprimer" cancelText="Annuler" confirmColor="red" isDark={isDark} />
      <ConfirmModal isOpen={showBulkConfirmModal} onClose={() => { setShowBulkConfirmModal(false); setBulkTargetIds([]); setBulkTargetType(''); setBulkActionType('delete'); }} onConfirm={handleConfirmBulkAction} title="Opération en lot" message={bulkActionType === 'delete' ? `Supprimer ${bulkTargetIds.length} client(s) ?` : `Changer ${bulkTargetIds.length} client(s) en "${bulkTargetType}" ?`} confirmText="Confirmer" cancelText="Annuler" confirmColor={bulkActionType === 'delete' ? 'red' : 'green'} isDark={isDark} />
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title={successTitle} message={successMessage} buttonText="OK" autoCloseDelay={3000} />
      <ErrorModal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title={errorTitle} message={errorMessage} buttonText="OK" autoCloseDelay={4000} />
    </main>
  );
};
export default Clients;