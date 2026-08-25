// src/hooks/useEmployesData.ts
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserCheck, UserX, Clock, User } from 'lucide-react';
import { Employe, Paiement, EmployesStats } from '../types/employes';

const ITEMS_PER_PAGE = 8;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export const useEmployesData = () => {
  const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); const [totalItems, setTotalItems] = useState(0); const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState(''); const [filterStatus, setFilterStatus] = useState('Tous');
  const [sortOption, setSortOption] = useState('ID (Récent)'); const [filterDepartement, setFilterDepartement] = useState('');
  const [filterSalaireMin, setFilterSalaireMin] = useState(''); const [filterSalaireMax, setFilterSalaireMax] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState(''); const [filterDateTo, setFilterDateTo] = useState('');
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<number, string | null>>({}); const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null); const [imagePath, setImagePath] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [paiementCounts, setPaiementCounts] = useState<Record<number, number>>({});
  const [historiquePaiements, setHistoriquePaiements] = useState<Paiement[]>([]);
  const [paiementLoading, setPaiementLoading] = useState(false);
  const [stats, setStats] = useState<EmployesStats>({ totalEmployes: 0, actifs: 0, enConge: 0, inactifs: 0, totalSalaire: 0, moyenne: 0, postes: [], statsParPoste: [], tauxActif: 0 });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const isMounted = useRef(true); const fetchLock = useRef(false); const firstLoadDone = useRef(false);
  const loadDataRef = useRef<(isRefresh?: boolean) => Promise<void>>(async () => {}); const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; fetchLock.current = false; }; }, []);
  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300); return () => clearTimeout(t); }, [searchTerm]);

  // ⭐ FIX: Mampiasa images.getUrl hamaha ny sary
  const loadImageUrl = useCallback(async (emp: Employe) => {
    if (!emp?.image || !window.api?.images?.getUrl) return;
    try {
      const result = await window.api.images.getUrl(emp.image);
      let url = result?.success ? result.data : null;
      if (url) url = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`;
      if (isMounted.current) setImageUrls((prev) => ({ ...prev, [emp.id]: url || null }));
      else if (isMounted.current) setImageErrors((prev) => ({ ...prev, [emp.id]: true }));
    } catch { if (isMounted.current) setImageErrors((prev) => ({ ...prev, [emp.id]: true })); }
  }, []);

  const loadStats = useCallback(async () => {
    try { 
      const result = await window.api.employes.getStats(); 
      if (result?.success && isMounted.current) { 
        const d = result.data; 
        setStats({ 
          totalEmployes: Number(d.total || 0), 
          actifs: Number(d.actifs || 0), 
          enConge: Number(d.en_conge || 0), 
          inactifs: Number(d.inactifs || 0), 
          totalSalaire: Number(d.total_salaires || 0), 
          moyenne: Number(d.salaire_moyen || 0), 
          postes: [], 
          statsParPoste: [], 
          tauxActif: (Number(d.total || 0) > 0) ? (Number(d.actifs || 0) / Number(d.total || 0)) : 0 
        }); 
      } 
    } catch (err) { console.error('❌ loadStats:', err); }
  }, []);

  const loadEmployes = useCallback(async (isRefresh = false) => {
    if (fetchLock.current) return; fetchLock.current = true;
    try {
      if (isRefresh) setRefreshing(true); else if (!firstLoadDone.current) setLoading(true);
      if (!window.api?.employes?.getAll) throw new Error('API employes.getAll non disponible');
      let sortField = 'id', sortDirection: 'ASC' | 'DESC' = 'DESC';
      if (sortOption === 'Nom (A-Z)') { sortField = 'nom'; sortDirection = 'ASC'; }
      else if (sortOption === 'Nom (Z-A)') { sortField = 'nom'; sortDirection = 'DESC'; }
      else if (sortOption === 'Salaire (Croissant)') { sortField = 'salaire'; sortDirection = 'ASC'; }
      else if (sortOption === 'Salaire (Décroissant)') { sortField = 'salaire'; sortDirection = 'DESC'; }
      else if (sortOption === 'Date (Ancien)') { sortField = 'date_embauche'; sortDirection = 'ASC'; }
      else if (sortOption === 'Date (Récent)') { sortField = 'date_embauche'; sortDirection = 'DESC'; }
      
      const result = await window.api.employes.getAll({
        page: currentPage, limit: ITEMS_PER_PAGE, search: debouncedSearch,
        status: filterStatus !== 'Tous' ? filterStatus : undefined,
        departement: filterDepartement || undefined, salaireMin: filterSalaireMin !== '' ? parseFloat(filterSalaireMin) : undefined,
        salaireMax: filterSalaireMax !== '' ? parseFloat(filterSalaireMax) : undefined,
        dateFrom: filterDateFrom || undefined, dateTo: filterDateTo || undefined,
        sort: { field: sortField, direction: sortDirection }
      });
      if (!isMounted.current) return; if (!result?.success) throw new Error(result?.error || 'Erreur chargement');
      setEmployes(result.data || []); setTotalItems(result.pagination?.total || 0); setTotalPages(result.pagination?.totalPages || 1);
      setImageErrors({}); (result.data || []).forEach((emp) => loadImageUrl(emp));
      if (!firstLoadDone.current) await loadStats(); firstLoadDone.current = true;
    } catch (err) { console.error('❌ loadEmployes:', err); if (isMounted.current) setEmployes([]); }
    finally { if (isMounted.current) { setLoading(false); setRefreshing(false); } fetchLock.current = false; }
  }, [currentPage, debouncedSearch, filterStatus, sortOption, filterDepartement, filterSalaireMin, filterSalaireMax, filterDateFrom, filterDateTo, loadStats, loadImageUrl]);

  useEffect(() => { loadDataRef.current = loadEmployes; }, [loadEmployes]);
  useEffect(() => { if (isMounted.current) { setCurrentPage(1); loadDataRef.current(true); } }, [debouncedSearch, filterStatus, sortOption, filterDepartement, filterSalaireMin, filterSalaireMax, filterDateFrom, filterDateTo]);
  useEffect(() => { if (isMounted.current && firstLoadDone.current) loadDataRef.current(false); }, [currentPage]);

  const fetchPaiementCounts = useCallback(async (listeEmployes: Employe[]) => {
    if (!listeEmployes.length) return; const ids = listeEmployes.map((e) => e.id);
    try { const result = await window.api.employes.getPaiementCountsBatch(ids); if (result?.success && isMounted.current) { const map: Record<number, number> = {}; result.data.forEach((row: any) => { map[row.employe_id] = row.count; }); setPaiementCounts(map); } } catch (err) { console.error('❌ fetchPaiementCounts:', err); }
  }, []);
  const refreshPaiementCounts = useCallback(async () => { if (employes.length) await fetchPaiementCounts(employes); }, [employes, fetchPaiementCounts]);
  useEffect(() => { if (employes.length) fetchPaiementCounts(employes); }, [employes, fetchPaiementCounts]);

  const handleImageError = useCallback((id: number) => setImageErrors((prev) => ({ ...prev, [id]: true })), []);
  const uploadImage = useCallback(async (file: File) => {
    try { setUploadingImage(true); if (file.size > MAX_IMAGE_SIZE) throw new Error('Fichier trop volumineux'); const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']; if (!allowed.includes(file.type)) throw new Error('Format non supporté'); const base64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = (e) => resolve(e.target?.result as string); reader.onerror = () => reject(new Error('Erreur lecture')); reader.readAsDataURL(file); }); if (!isMounted.current) return null; const result = await window.api.images.upload(base64, 'employes'); const path = result?.success ? result.data : null; if (!path) throw new Error('Chemin image invalide'); setImagePath(path); if (window.api?.images?.getUrl) { const urlResult = await window.api.images.getUrl(path); let url = urlResult?.success ? urlResult.data : null; if (url) url = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`; if (url && isMounted.current) setImagePreview(url); } return path; } finally { if (isMounted.current) setUploadingImage(false); }
  }, []);
  const deleteImage = useCallback(async (path: string) => { if (window.api?.images?.delete) await window.api.images.delete(path); }, []);
  const resetImageState = useCallback(() => { if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview); setImagePreview(null); setImagePath(null); if (fileInputRef.current) fileInputRef.current.value = ''; }, [imagePreview]);

  const createEmploye = useCallback(async (data: any) => { const r = await window.api.employes.create(data); if (!r?.success) throw new Error(r?.error || 'Erreur création'); await loadDataRef.current(true); return r.data; }, []);
  const updateEmploye = useCallback(async (id: number, data: any) => { const r = await window.api.employes.update(id, data); if (!r?.success) throw new Error(r?.error || 'Erreur mise à jour'); await loadDataRef.current(true); return r.data; }, []);
  const deleteEmploye = useCallback(async (id: number) => { const r = await window.api.employes.delete(id); if (!r?.success) throw new Error(r?.error || 'Erreur suppression'); await loadDataRef.current(true); return r; }, []);
  const getEmployeById = useCallback(async (id: number) => { const r = await window.api.employes.getById(id); if (!r?.success) throw new Error(r?.error || 'Employé non trouvé'); return r.data; }, []);
  const loadPaiementsEmploye = useCallback(async (employeId: number) => { try { setPaiementLoading(true); if (!window.api?.payments?.getHistorique) return []; const r = await window.api.payments.getHistorique(employeId); const data = r?.success ? r.data || [] : []; if (isMounted.current) setHistoriquePaiements(data); return data; } finally { if (isMounted.current) setPaiementLoading(false); } }, []);
  const createPaiement = useCallback(async (data: any) => { const r = await window.api.payments.create(data); if (!r?.success) throw new Error(r?.error || 'Erreur paiement'); await loadDataRef.current(true); return r.data; }, []);
  const deletePaiement = useCallback(async (id: number) => { const r = await window.api.payments.delete(id); if (!r?.success) throw new Error(r?.error || 'Erreur annulation'); return r; }, []);
  const bulkUpdateStatus = useCallback(async (ids: number[], newStatus: string) => { const r = await window.api.employes.bulkUpdateStatus(ids, newStatus); if (!r?.success) throw new Error(r?.error || 'Erreur mise à jour en lot'); await loadDataRef.current(true); return r; }, []);
  const bulkDelete = useCallback(async (ids: number[]) => { const r = await window.api.employes.bulkDelete(ids); if (!r?.success) throw new Error(r?.error || 'Erreur suppression en lot'); await loadDataRef.current(true); return r; }, []);
  const getStatusColor = useCallback((s: string) => { const n = s?.toLowerCase() || ''; const colors: Record<string, string> = { actif: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800', inactif: 'bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800', en_conge: 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800' }; return colors[n] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'; }, []);
  const getStatusIcon = useCallback((s: string) => { const n = s?.toLowerCase() || ''; const className = 'w-3.5 h-3.5'; if (n === 'actif') return React.createElement(UserCheck, { className }); if (n === 'inactif') return React.createElement(UserX, { className }); if (n === 'en_conge') return React.createElement(Clock, { className }); return React.createElement(User, { className }); }, []);
  const loadData = useCallback(() => loadDataRef.current(false), []);

  return { employes, loading, refreshing, setRefreshing, totalItems, totalPages, currentPage, setCurrentPage, searchTerm, setSearchTerm, filterStatus, setFilterStatus, sortOption, setSortOption, filterDepartement, setFilterDepartement, filterSalaireMin, setFilterSalaireMin, filterSalaireMax, setFilterSalaireMax, filterDateFrom, setFilterDateFrom, filterDateTo, setFilterDateTo, imageUrls, imageErrors, imagePreview, setImagePreview, imagePath, uploadingImage, fileInputRef, resetImageState, handleImageError, uploadImage, deleteImage, paiementCounts, historiquePaiements, paiementLoading, loadPaiementsEmploye, createPaiement, deletePaiement, refreshPaiementCounts, loadData, loadEmployes, stats, getEmployeById, createEmploye, updateEmploye, deleteEmploye, getStatusColor, getStatusIcon, ITEMS_PER_PAGE, bulkUpdateStatus, bulkDelete };
};