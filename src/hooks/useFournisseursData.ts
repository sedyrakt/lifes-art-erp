import { useState, useEffect, useCallback, useRef } from 'react';

const ITEMS_PER_PAGE = 8;

const SORT_MAP = {
  'Nom (A-Z)': { field: 'nom', direction: 'ASC' },
  'Nom (Z-A)': { field: 'nom', direction: 'DESC' },
  'Plus récent': { field: 'created_at', direction: 'DESC' },
  'Plus ancien': { field: 'created_at', direction: 'ASC' },
} as const;

export interface FournisseurFilters {
  searchTerm: string;
  email: string;
  telephone: string;
  dateFrom: string;
  dateTo: string;
}

export interface FournisseurStats {
  total: number;
  avec_contact: number;
  avec_email: number;
}

export const useFournisseursData = () => {
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortOption, setSortOption] = useState<keyof typeof SORT_MAP>('Nom (A-Z)');
  const [filters, setFilters] = useState<FournisseurFilters>({ searchTerm: '', email: '', telephone: '', dateFrom: '', dateTo: '' });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const isMounted = useRef(true);
  const fetchLock = useRef(false);
  const firstLoadDone = useRef(false);
  const loadDataRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; fetchLock.current = false; }; }, []);
  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(filters.searchTerm.trim()), 300); return () => clearTimeout(t); }, [filters.searchTerm]);

  const loadFournisseurs = useCallback(async (isRefresh = false) => {
    if (fetchLock.current) return;
    fetchLock.current = true;
    try {
      if (isRefresh) setRefreshing(true);
      else if (!firstLoadDone.current) setLoading(true);

      if (!window.api?.fournisseurs?.getAll) throw new Error('API fournisseurs.getAll tsy hita');

      const sort = SORT_MAP[sortOption];
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch || undefined,
        sortBy: sort.field,
        sortOrder: sort.direction,
        ...filters,
      };
      const result = await window.api.fournisseurs.getAll(params);

      if (!isMounted.current) return;
      if (!result?.success) throw new Error(result?.error || 'Erreur chargement');

      const data = (result.data || []).filter((item, idx, self) => self.findIndex(t => t.id === item.id) === idx);
      setFournisseurs(data);
      const total = Number(result.pagination?.total || 0);
      setTotalItems(total);
      setTotalPages(Number(result.pagination?.totalPages) > 0 ? Number(result.pagination?.totalPages) : Math.ceil(total / ITEMS_PER_PAGE));
      firstLoadDone.current = true;
    } catch (err) { console.error('❌ loadFournisseurs:', err); if (isMounted.current) setFournisseurs([]); }
    finally { if (isMounted.current) { setLoading(false); setRefreshing(false); } fetchLock.current = false; }
  }, [currentPage, debouncedSearch, sortOption, filters]);

  useEffect(() => { loadDataRef.current = loadFournisseurs; }, [loadFournisseurs]);
  useEffect(() => { if (isMounted.current) { setCurrentPage(1); loadDataRef.current(true); } }, [debouncedSearch, sortOption, filters.email, filters.telephone, filters.dateFrom, filters.dateTo]);
  useEffect(() => { if (isMounted.current && firstLoadDone.current) loadDataRef.current(false); }, [currentPage]);

  const loadData = useCallback(async () => { setCurrentPage(1); }, []);
  const refresh = useCallback(async () => { await loadDataRef.current(true); }, []);

  const createFournisseur = useCallback(async (data: any) => {
    if (!window.api?.fournisseurs?.create) throw new Error('API fournisseurs.create indisponible');
    const r = await window.api.fournisseurs.create(data);
    if (!r?.success) throw new Error(r?.error || 'Erreur création');
    await loadDataRef.current(true);
    return r.data;
  }, []);

  const updateFournisseur = useCallback(async (id: number, data: any) => {
    if (!window.api?.fournisseurs?.update) throw new Error('API fournisseurs.update indisponible');
    const r = await window.api.fournisseurs.update(id, data);
    if (!r?.success) throw new Error(r?.error || 'Erreur mise à jour');
    await loadDataRef.current(true);
    return r.data;
  }, []);

  const deleteFournisseur = useCallback(async (id: number) => {
    if (!window.api?.fournisseurs?.delete) throw new Error('API fournisseurs.delete indisponible');
    const r = await window.api.fournisseurs.delete(id);
    if (!r?.success) throw new Error(r?.error || 'Erreur suppression');
    await loadDataRef.current(true);
    return r;
  }, []);

  const bulkDelete = useCallback(async (ids: number[]) => {
    if (!window.api?.fournisseurs?.bulkDelete) throw new Error('API fournisseurs.bulkDelete indisponible');
    const v = ids.filter(id => Number.isInteger(id) && id > 0);
    if (!v.length) throw new Error('Aucun ID valide');
    const r = await window.api.fournisseurs.bulkDelete(v);
    if (!r?.success) throw new Error(r?.error || 'Erreur suppression lot');
    await loadDataRef.current(true);
    return r;
  }, []);

  const getStats = useCallback(async (): Promise<FournisseurStats> => {
    if (!window.api?.fournisseurs?.getStats) throw new Error('API fournisseurs.getStats indisponible');
    try {
      const r = await window.api.fournisseurs.getStats();
      if (!r?.success) throw new Error(r?.error || 'Erreur stats');
      return { total: Number(r.data?.total || 0), avec_contact: Number(r.data?.avec_contact || 0), avec_email: Number(r.data?.avec_email || 0) };
    } catch (err) { console.error('❌ getStats:', err); throw err; }
  }, []);

  return {
    fournisseurs, loading, refreshing, setRefreshing,
    currentPage, setCurrentPage, totalItems, totalPages, ITEMS_PER_PAGE,
    filters, setFilters, sortOption, setSortOption,
    refresh, loadData,
    createFournisseur, updateFournisseur, deleteFournisseur, bulkDelete, getStats,
  };
};

