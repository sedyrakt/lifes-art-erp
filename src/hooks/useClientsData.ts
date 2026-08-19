import { useCallback, useEffect, useRef, useState, createElement } from 'react';
import { Building, User } from 'lucide-react';

const ITEMS_PER_PAGE = 8;
const SORT_MAP = {
  'Nom (A-Z)': { field: 'nom', direction: 'ASC' },
  'Nom (Z-A)': { field: 'nom', direction: 'DESC' },
  'Date (Récent)': { field: 'created_at', direction: 'DESC' },
  'Date (Ancien)': { field: 'created_at', direction: 'ASC' },
} as const;

export interface ClientData {
  id: number; nom: string; email?: string | null; telephone?: string | null;
  adresse?: string | null; ville?: string | null; code_postal?: string | null;
  pays?: string | null; type?: string | null; image?: string | null;
  created_at?: string; updated_at?: string;
  total_achats?: number;
  nombre_commandes?: number;
}
export interface ClientFilters {
  searchTerm: string; filterType: string; filterVille: string;
  filterPays: string; filterDateFrom: string; filterDateTo: string;
}
interface ClientStats { total: number; particuliers: number; entreprises: number; avec_telephone: number; }

export const useClientsData = () => {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortOption, setSortOption] = useState<keyof typeof SORT_MAP>('Nom (A-Z)');
  const [filters, setFilters] = useState<ClientFilters>({ searchTerm: '', filterType: 'Tous', filterVille: '', filterPays: '', filterDateFrom: '', filterDateTo: '' });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isMounted = useRef(true);
  const fetchLock = useRef(false);
  const firstLoadDone = useRef(false);
  const loadDataRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; fetchLock.current = false; }; }, []);
  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(filters.searchTerm.trim()), 300); return () => clearTimeout(t); }, [filters.searchTerm]);

  const loadClients = useCallback(async (isRefresh = false) => {
    if (fetchLock.current) return;
    fetchLock.current = true;
    try {
      if (isRefresh) setRefreshing(true); else if (!firstLoadDone.current) setLoading(true);
      if (!window.api?.clients?.getAll) throw new Error('API clients.getAll tsy hita');
      const sort = SORT_MAP[sortOption];
      const params = {
        page: currentPage, limit: ITEMS_PER_PAGE, search: debouncedSearch || undefined,
        sortBy: sort.field, sortOrder: sort.direction,
        type: filters.filterType !== 'Tous' ? filters.filterType : undefined,
        ville: filters.filterVille || undefined, pays: filters.filterPays || undefined,
        dateFrom: filters.filterDateFrom || undefined, dateTo: filters.filterDateTo || undefined,
      };
      const result = await window.api.clients.getAll(params);
      if (!isMounted.current) return;
      if (!result?.success) throw new Error(result?.error || 'Erreur chargement');
      const data = (result.data || []).filter((item, idx, self) => self.findIndex(t => t.id === item.id) === idx);
      setClients(data);
      const total = Number(result.pagination?.total || 0);
      setTotalItems(total);
      setTotalPages(Number(result.pagination?.totalPages) > 0 ? Number(result.pagination?.totalPages) : Math.ceil(total / ITEMS_PER_PAGE));
      firstLoadDone.current = true;
    } catch (err) { console.error('❌ loadClients:', err); if (isMounted.current) setClients([]); }
    finally { if (isMounted.current) { setLoading(false); setRefreshing(false); } fetchLock.current = false; }
  }, [currentPage, debouncedSearch, sortOption, filters]);

  useEffect(() => { loadDataRef.current = loadClients; }, [loadClients]);
  useEffect(() => { if (isMounted.current) { setCurrentPage(1); loadDataRef.current(true); } }, [debouncedSearch, sortOption, filters.filterType, filters.filterVille, filters.filterPays, filters.filterDateFrom, filters.filterDateTo]);
  useEffect(() => { if (isMounted.current && firstLoadDone.current) loadDataRef.current(false); }, [currentPage]);

  const loadData = useCallback(async () => { setCurrentPage(1); }, []);
  const refresh = useCallback(async () => { await loadDataRef.current(true); }, []);

  const resetImageState = useCallback(() => { setImagePreview(null); setImagePath(null); setUploadingImage(false); setImageErrors({}); if (fileInputRef.current) fileInputRef.current.value = ''; }, []);

  // ⭐ FIX: Maka ny sary amin'ny alalan'ny images.getUrl (tahaka ny produits)
  const loadImageUrl = useCallback(async (client: ClientData) => {
    if (!client?.image || imageUrls[client.id]) return null;
    const path = String(client.image).trim();
    if (!path) return null;
    try {
      if (window.api?.images?.getUrl) {
        const result = await window.api.images.getUrl(path);
        const url = result?.success ? result.data : null;
        if (url) { setImageUrls(prev => ({ ...prev, [client.id]: url })); return url; }
      }
      if (path.startsWith('data:') || path.startsWith('http')) { setImageUrls(prev => ({ ...prev, [client.id]: path })); return path; }
      return path;
    } catch (err) { console.error('❌ loadImageUrl:', err); setImageErrors(prev => ({ ...prev, [client.id]: true })); return null; }
  }, [imageUrls]);

  useEffect(() => { let cancelled = false; (async () => { if (!Array.isArray(clients) || clients.length === 0) return; for (const c of clients) { if (cancelled || !c?.image || imageUrls[c.id]) continue; await loadImageUrl(c); } })(); return () => { cancelled = true; }; }, [clients, imageUrls, loadImageUrl]);

  const handleImageError = useCallback((id: number) => { setImageErrors(prev => ({ ...prev, [id]: true })); setImageUrls(prev => { const n = { ...prev }; delete n[id]; return n; }); }, []);
  
  const uploadImage = useCallback(async (base64: string) => {
    if (!base64) throw new Error('Aucune image.');
    if (!window.api?.images?.upload) throw new Error('API images.upload tsy hita.');
    setUploadingImage(true);
    try {
      const result = await window.api.images.upload(base64, 'clients');
      if (!result || !result.success) throw new Error(result?.error || "Impossible d'enregistrer.");
      const p = result.path || result.data || result.imagePath;
      if (!p) throw new Error("Chemin d'image non retourné.");
      setImagePath(p); 
      return p;
    } finally { setUploadingImage(false); }
  }, []);

  const deleteImage = useCallback(async (path: string) => {
    if (!path) return;
    try { if (window.api?.images?.delete) await window.api.images.delete(path); } finally { setImagePath(p => p === path ? null : p); setImagePreview(null); }
  }, []);

  const createClient = useCallback(async (data: Partial<ClientData>) => {
    if (!window.api?.clients?.create) throw new Error('API clients.create tsy hita.');
    const r = await window.api.clients.create(data);
    if (!r?.success) throw new Error(r?.error || 'Erreur création.');
    await loadDataRef.current(true); return r.data;
  }, []);
  const updateClient = useCallback(async (id: number, data: Partial<ClientData>) => {
    if (!window.api?.clients?.update) throw new Error('API clients.update tsy hita.');
    const r = await window.api.clients.update(id, data);
    if (!r?.success) throw new Error(r?.error || 'Erreur mise à jour.');
    await loadDataRef.current(true); return r.data;
  }, []);
  const deleteClient = useCallback(async (id: number) => {
    if (!window.api?.clients?.delete) throw new Error('API clients.delete tsy hita.');
    const r = await window.api.clients.delete(id);
    if (!r?.success) throw new Error(r?.error || 'Erreur suppression.');
    await loadDataRef.current(true); return r;
  }, []);
  const bulkDelete = useCallback(async (ids: number[]) => {
    if (!window.api?.clients?.bulkDelete) throw new Error('API clients.bulkDelete tsy hita.');
    const v = ids.filter(id => Number.isInteger(id) && id > 0).slice(0, 50);
    if (!v.length) throw new Error('Aucun ID valide.');
    const r = await window.api.clients.bulkDelete(v);
    if (!r?.success) throw new Error(r?.error || 'Erreur suppression lot.');
    await loadDataRef.current(true); return r;
  }, []);
  const bulkUpdateType = useCallback(async (ids: number[], newType: string) => {
    if (!window.api?.clients?.bulkUpdateType) throw new Error('API clients.bulkUpdateType tsy hita.');
    if (!['Particulier', 'Entreprise'].includes(newType)) throw new Error('Type invalide.');
    const v = ids.filter(id => Number.isInteger(id) && id > 0).slice(0, 50);
    if (!v.length) throw new Error('Aucun ID valide.');
    const r = await window.api.clients.bulkUpdateType(v, newType);
    if (!r?.success) throw new Error(r?.error || 'Erreur mise à jour lot.');
    await loadDataRef.current(true); return r;
  }, []);
  const getStats = useCallback(async (): Promise<ClientStats> => {
    if (!window.api?.clients?.getStats) throw new Error('API clients.getStats tsy hita.');
    const r = await window.api.clients.getStats();
    if (!r?.success) throw new Error(r?.error || 'Erreur stats.');
    return { total: Number(r.data?.total || 0), particuliers: Number(r.data?.particuliers || 0), entreprises: Number(r.data?.entreprises || 0), avec_telephone: Number(r.data?.avec_telephone || 0) };
  }, []);

  const getTypeColor = useCallback((type?: string | null) => type === 'Entreprise' ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300', []);
  const getTypeIcon = useCallback((type?: string | null) => type === 'Entreprise' ? createElement(Building, { size: 14, className: 'shrink-0' }) : createElement(User, { size: 14, className: 'shrink-0' }), []);

  return {
    clients, loading, refreshing, setRefreshing, currentPage, setCurrentPage, totalItems, totalPages, ITEMS_PER_PAGE,
    filters, setFilters, sortOption, setSortOption, refresh, loadData,
    getStats, getTypeColor, getTypeIcon,
    createClient, updateClient, deleteClient, bulkDelete, bulkUpdateType,
    imageUrls, imageErrors, imagePreview, setImagePreview, imagePath, uploadingImage, fileInputRef,
    resetImageState, loadImageUrl, handleImageError, uploadImage, deleteImage,
  };
};