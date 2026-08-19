import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useFournisseursData } from '../hooks/useFournisseursData';
import FournisseursStats from '../components/fournisseurs/FournisseursStats';
import FournisseursSearchBar from '../components/fournisseurs/FournisseursSearchBar';
import { FournisseursTable, FournisseursPagination, FournisseursGrid, FournisseursModalForm, FournisseursViewModal } from '../components/fournisseurs';
import ConfirmModal from '../components/common/ConfirmModal';
import SuccessModal from '../components/common/SuccessModal';
import ErrorModal from '../components/common/ErrorModal';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const INITIAL_STATS = { total: 0, avecContact: 0, avecEmail: 0 };

const Fournisseurs: React.FC = () => {
  const { isDark } = useTheme();
  const {
    fournisseurs, loading, refreshing, totalItems, totalPages, currentPage, setCurrentPage,
    filters, setFilters, createFournisseur, updateFournisseur, deleteFournisseur,
    bulkDelete, getStats, loadData
  } = useFournisseursData();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetImageState = useCallback(() => {
    setImagePreview((prev) => { if (prev?.startsWith('blob:')) try { URL.revokeObjectURL(prev); } catch {} return null; });
    setImagePath(null); setImageError(null); setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setImageError('Format non supporté.'); if (fileInputRef.current) fileInputRef.current.value = ''; return; }
    if (file.size > MAX_IMAGE_SIZE) { setImageError(`Fichier trop volumineux (max ${MAX_IMAGE_SIZE / (1024 * 1024)} MB).`); if (fileInputRef.current) fileInputRef.current.value = ''; return; }
    setUploadingImage(true); setImageError(null); setUploadProgress(10);
    const localUrl = URL.createObjectURL(file); setImagePreview(localUrl);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => { if (typeof reader.result !== 'string') reject(new Error('Format invalide')); else resolve(reader.result); };
        reader.onerror = () => reject(new Error('Erreur lecture'));
        reader.readAsDataURL(file);
      });
      setUploadProgress(45);
      if (!window.api?.images?.upload) throw new Error('API images.upload indisponible');
      const result = await window.api.images.upload(base64, 'fournisseurs');
      if (!result?.success) throw new Error(result?.error || 'Erreur upload');
      setUploadProgress(100);
      setImagePath(typeof result.data === 'string' ? result.data : null);
    } catch (error: any) {
      console.error('❌ Upload:', error); setImageError(error.message); setImagePreview(null); setImagePath(null);
    } finally {
      setUploadingImage(false); setUploadProgress(0); if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  const handleRemoveImage = useCallback(async () => {
    try { if (imagePath && window.api?.images?.delete) await window.api.images.delete(imagePath); } catch {} finally { resetImageState(); }
  }, [imagePath, resetImageState]);

  const [reelStats, setReelStats] = useState(INITIAL_STATS);
  const fetchReelStats = useCallback(async () => {
    try { const data = await getStats(); setReelStats({ total: Number(data?.total || 0), avecContact: Number(data?.avec_contact || 0), avecEmail: Number(data?.avec_email || 0) }); }
    catch (err) { console.error('❌ Stats:', err); setReelStats(INITIAL_STATS); }
  }, [getStats]);

  useEffect(() => { if (!loading) fetchReelStats(); }, [loading, fournisseurs, fetchReelStats]);

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState<any>(null);
  const [editingFournisseur, setEditingFournisseur] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [bulkDeleteTargetIds, setBulkDeleteTargetIds] = useState<number[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const showSuccess = useCallback((t: string, m: string) => { setSuccessTitle(t); setSuccessMessage(m); setShowSuccessModal(true); }, []);
  const showError = useCallback((t: string, m: string) => { setErrorTitle(t); setErrorMessage(m); setShowErrorModal(true); }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (!checked) { setSelectedIds(new Set()); return; }
    setSelectedIds(new Set(fournisseurs.map((f: any) => Number(f.id)).filter(id => Number.isInteger(id) && id > 0)));
  }, [fournisseurs]);

  const handleSelectOne = useCallback((id: number, checked: boolean) => {
    setSelectedIds(prev => { const n = new Set(prev); if (checked) n.add(id); else n.delete(id); return n; });
  }, []);

  const handleBulkDelete = useCallback((ids: number[]) => {
    const v = ids.filter(id => Number.isInteger(id) && id > 0);
    if (!v.length) { showError('Sélection invalide', 'Aucun ID valide.'); return; }
    setBulkDeleteTargetIds(v); setShowBulkDeleteModal(true);
  }, [showError]);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (!bulkDeleteTargetIds.length) return;
    try {
      await bulkDelete(bulkDeleteTargetIds);
      setSelectedIds(new Set());
      showSuccess('Suppression en lot', `${bulkDeleteTargetIds.length} fournisseur(s) supprimé(s).`);
      await loadData(); await fetchReelStats();
    } catch (err: any) { showError('Erreur', err.message); }
    finally { setShowBulkDeleteModal(false); setBulkDeleteTargetIds([]); }
  }, [bulkDeleteTargetIds, bulkDelete, loadData, fetchReelStats, showSuccess, showError]);

  const handleAddClick = useCallback(() => { resetImageState(); setEditingFournisseur(null); setShowModal(true); }, [resetImageState]);

  const handleEditFournisseur = useCallback(async (fournisseur: any) => {
    if (!fournisseur?.id) return;
    resetImageState(); setEditingFournisseur(fournisseur);
    if (fournisseur.image) {
      try {
        if (window.api?.images?.getUrl) {
          const r = await window.api.images.getUrl(fournisseur.image);
          const url = r?.success ? r.data : typeof r === 'string' ? r : null;
          if (url) { setImagePreview(url); setImagePath(fournisseur.image); }
        }
      } catch {}
    }
    setShowModal(true);
  }, [resetImageState]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nom = String(fd.get('nom') || '').trim();
    if (!nom) { showError('Champ requis', 'Le nom est obligatoire.'); return; }
    const data: any = { nom, contact: String(fd.get('contact') || '').trim(), telephone: String(fd.get('telephone') || '').trim(), email: String(fd.get('email') || '').trim(), adresse: String(fd.get('adresse') || '').trim() };
    if (imagePath) data.image = imagePath;
    else if (editingFournisseur?.image && imagePreview) data.image = editingFournisseur.image;
    else data.image = null;
    try {
      if (editingFournisseur) {
        const old = editingFournisseur.image;
        if (old && old !== data.image && window.api?.images?.delete) try { await window.api.images.delete(old); } catch {}
        await updateFournisseur(Number(editingFournisseur.id), data);
        showSuccess('Fournisseur modifié', `"${nom}" mis à jour.`);
      } else {
        await createFournisseur(data);
        showSuccess('Fournisseur ajouté', `"${nom}" enregistré.`);
      }
      setShowModal(false); setEditingFournisseur(null); resetImageState();
      await loadData(); await fetchReelStats();
    } catch (err: any) { showError('Erreur', err.message); }
  }, [editingFournisseur, imagePath, imagePreview, createFournisseur, updateFournisseur, resetImageState, loadData, fetchReelStats, showSuccess, showError]);

  const handleViewFournisseur = useCallback((fournisseur: any) => { if (fournisseur?.id) { setSelectedFournisseur(fournisseur); setShowViewModal(true); } }, []);
  const handleDeleteClick = useCallback((fournisseur: any) => { if (fournisseur?.id) { setDeleteTarget(fournisseur); setShowDeleteModal(true); } }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget?.id) return;
    try {
      if (deleteTarget.image && window.api?.images?.delete) try { await window.api.images.delete(deleteTarget.image); } catch {}
      await deleteFournisseur(Number(deleteTarget.id));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(Number(deleteTarget.id)); return n; });
      showSuccess('Fournisseur supprimé', `"${deleteTarget.nom}" supprimé.`);
      await loadData(); await fetchReelStats();
    } catch (err: any) { showError('Erreur', err.message); }
    finally { setShowDeleteModal(false); setDeleteTarget(null); }
  }, [deleteTarget, deleteFournisseur, loadData, fetchReelStats, showSuccess, showError]);

  const safeTotalPages = Math.max(1, Number(totalPages || 1));
  const handlePageChange = useCallback((page: number) => {
    const p = Math.max(1, Math.min(Number(page) || 1, safeTotalPages));
    if (p === currentPage) return;
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, setCurrentPage, safeTotalPages]);

  const tauxContact = reelStats.total > 0 ? Math.round((reelStats.avecContact / reelStats.total) * 100) : 0;

  return (
    <div className="min-h-full w-full px-0 py-5 transition-colors duration-300 sm:px-0 lg:px-4" style={{ background: isDark ? '#0A1222' : '#F8FAFC' }}>
      <div className="mx-auto w-full max-w-[1600px] space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] font-semibold tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Fournisseurs</h1>
              <span className="hidden rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 sm:inline-flex dark:bg-indigo-500/10 dark:text-indigo-400">{reelStats.total}</span>
              {refreshing && <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-500 dark:text-indigo-400"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />Actualisation...</span>}
            </div>
            <p className="mt-1 text-[13px] font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Gérez vos fournisseurs et leurs informations de contact.</p>
          </div>
          <button type="button" onClick={handleAddClick} disabled={loading} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-[13px] font-semibold text-white shadow-sm shadow-indigo-600/15 transition-all duration-200 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-600/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
            <Plus size={17} />Nouveau fournisseur
          </button>
        </header>

        <div className="mt-5"><FournisseursStats total={reelStats.total} avecContact={reelStats.avecContact} avecEmail={reelStats.avecEmail} tauxContact={tauxContact} /></div>

        <div className="mt-5">
          <FournisseursSearchBar
            searchTerm={filters.searchTerm}
            onSearchChange={(value) => { setFilters({ searchTerm: value }); setCurrentPage(1); setSelectedIds(new Set()); }}
            sortOption={filters.sortOption}
            onSortChange={(value) => { setFilters({ sortOption: value }); setCurrentPage(1); }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        <section className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-[#0F172A]">
          {refreshing && <div className="absolute left-0 right-0 top-0 z-30 h-0.5 overflow-hidden"><div className="h-full w-1/3 animate-[loading_1.2s_ease-in-out_infinite] bg-indigo-500" /></div>}
          {loading && fournisseurs.length === 0 ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <div className="flex flex-col items-center gap-3"><RefreshCw size={30} className="animate-spin text-indigo-500" /><span className="text-[14px] font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Chargement des fournisseurs...</span></div>
            </div>
          ) : (
            <>
              {viewMode === 'table' ? (
                <FournisseursTable fournisseurs={fournisseurs} onView={handleViewFournisseur} onEdit={handleEditFournisseur} onDelete={handleDeleteClick} onAdd={handleAddClick} isDark={isDark} selectedIds={selectedIds} onSelectAll={handleSelectAll} onSelectOne={handleSelectOne} onBulkDelete={handleBulkDelete} />
              ) : (
                <FournisseursGrid fournisseurs={fournisseurs} onView={handleViewFournisseur} onEdit={handleEditFournisseur} onDelete={handleDeleteClick} isDark={isDark} />
              )}
            </>
          )}
        </section>

        {!loading && Number(totalItems || 0) > 0 && safeTotalPages > 1 && (
          <div className="flex justify-center pb-1">
            <FournisseursPagination currentPage={Math.max(1, Math.min(Number(currentPage || 1), safeTotalPages))} totalPages={safeTotalPages} totalItems={Number(totalItems || 0)} onPageChange={handlePageChange} />
          </div>
        )}
      </div>

      <FournisseursModalForm isOpen={showModal} onClose={() => { setShowModal(false); resetImageState(); setEditingFournisseur(null); }} onSubmit={handleSubmit} editingFournisseur={editingFournisseur} isDark={isDark} imagePreview={imagePreview} uploadingImage={uploadingImage} uploadProgress={uploadProgress} imageError={imageError} onImageChange={handleImageChange} onRemoveImage={handleRemoveImage} />
      {showViewModal && selectedFournisseur && (<FournisseursViewModal fournisseur={selectedFournisseur} onClose={() => setShowViewModal(false)} onEdit={() => { setShowViewModal(false); handleEditFournisseur(selectedFournisseur); }} isDark={isDark} />)}
      <ConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }} onConfirm={handleConfirmDelete} title="Suppression" message={`Supprimer "${deleteTarget?.nom || ''}" ?`} confirmText="Supprimer" cancelText="Annuler" confirmColor="red" isDark={isDark} />
      <ConfirmModal isOpen={showBulkDeleteModal} onClose={() => { setShowBulkDeleteModal(false); setBulkDeleteTargetIds([]); }} onConfirm={handleConfirmBulkDelete} title="Suppression en lot" message={`Voulez-vous supprimer ${bulkDeleteTargetIds.length} fournisseur(s) ?`} confirmText="Supprimer" cancelText="Annuler" confirmColor="red" isDark={isDark} />
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title={successTitle} message={successMessage} buttonText="OK" autoCloseDelay={3000} />
      <ErrorModal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title={errorTitle} message={errorMessage} buttonText="OK" autoCloseDelay={4000} />
    </div>
  );
};

export default Fournisseurs;