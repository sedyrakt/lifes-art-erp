// src/hooks/useProduitsData.ts
import { useState, useEffect, useCallback, useRef } from 'react';

const ITEMS_PER_PAGE = 8;

const SORT_MAP = {
  'Nom (A-Z)': { field: 'nom', direction: 'ASC' },
  'Nom (Z-A)': { field: 'nom', direction: 'DESC' },
  'Prix (Croissant)': { field: 'prix_vente', direction: 'ASC' },
  'Prix (Décroissant)': { field: 'prix_vente', direction: 'DESC' },
  'Stock (Croissant)': { field: 'quantite_stock', direction: 'ASC' },
  'Stock (Décroissant)': { field: 'quantite_stock', direction: 'DESC' },
} as const;

type SortOption = keyof typeof SORT_MAP;

interface ProduitFilters {
  searchTerm: string;
  filterCategorie: string;
  filterStatus: string;
  prixMin: string;
  prixMax: string;
  dateFrom: string;
  dateTo: string;
}

interface ApiResponse { success?: boolean; data?: any; pagination?: any; error?: string; }

export const useProduitsData = () => {
  // ✅ FIX: HOOKS REHETRA ETO AMBONY (TSY MISY CONDITION)
  const isMounted = useRef(true);
  const fetchLock = useRef(false);
  const firstLoadDone = useRef(false);
  const referencesLoaded = useRef(false);
  const loadDataRef = useRef<() => Promise<void>>(async () => {});
  const loadedImageIds = useRef<Set<number>>(new Set());
  const imageLoadingIds = useRef<Set<number>>(new Set());

  const [produits, setProduits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // ⭐ FIX: Ny filters dia manana valeur par défaut
  const [filters, setFilters] = useState<ProduitFilters>({
    searchTerm: '',
    filterCategorie: '',
    filterStatus: '',
    prixMin: '',
    prixMax: '',
    dateFrom: '',
    dateTo: '',
  });

  const [sortOption, setSortOption] = useState<SortOption>('Nom (A-Z)');
  const [imageUrls, setImageUrls] = useState<Record<number, string | null>>({});
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      fetchLock.current = false;
    };
  }, []);

  // ⭐ FIX: Miaro amin'ny undefined
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMounted.current) {
        const searchTerm = filters?.searchTerm || ''; // ⭐ FIX
        setDebouncedSearch(searchTerm.trim());
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [filters?.searchTerm]);

  // Normalisation
  const normalizeCategory = useCallback((item: any): { id: number; nom: string } | null => {
    if (!item) return null;
    const id = Number(item.id);
    if (!Number.isInteger(id) || id <= 0) return null;
    const nom = String(item.nom || item.name || item.libelle || item.label || '').trim();
    return { id, nom };
  }, []);

  const normalizeFournisseur = useCallback((item: any): { id: number; nom: string } | null => {
    if (!item) return null;
    const id = Number(item.id);
    if (!Number.isInteger(id) || id <= 0) return null;
    const nom = String(item.nom || item.name || item.raison_sociale || item.libelle || item.label || '').trim();
    return { id, nom };
  }, []);

  // Extraction de tableau depuis la réponse API
  const extractArray = useCallback((response: ApiResponse | null | undefined, specificKey?: string): any[] => {
    if (!response) return [];
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data?.data)) return response.data.data;
    if (Array.isArray(response.data?.rows)) return response.data.rows;
    if (specificKey && Array.isArray(response.data?.[specificKey])) return response.data[specificKey];
    if (specificKey && Array.isArray(response[specificKey as keyof ApiResponse])) return response[specificKey as keyof ApiResponse] as any[];
    return [];
  }, []);

  // Chargement des références
  const loadReferences = useCallback(async (force = false) => {
    if (referencesLoaded.current && !force) return;
    try {
      // Catégories
      if (window.api?.categories?.getAll) {
        try {
          const result = await window.api.categories.getAll({ page: 1, limit: 10000 });
          if (result?.success) {
            const rawData = extractArray(result, 'categories');
            const normalized = rawData.map(normalizeCategory).filter((item): item is { id: number; nom: string } => item !== null);
            const unique = normalized.filter((item, idx, arr) => arr.findIndex(x => x.id === item.id) === idx);
            unique.sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }));
            if (isMounted.current) setCategories(unique);
          } else {
            if (isMounted.current) setCategories([]);
          }
        } catch (err) {
          console.error('❌ [Produits] Erreur catégories:', err);
          if (isMounted.current) setCategories([]);
        }
      } else {
        if (isMounted.current) setCategories([]);
      }

      // Fournisseurs
      if (window.api?.fournisseurs?.getAll) {
        try {
          const result = await window.api.fournisseurs.getAll({ page: 1, limit: 10000 });
          if (result?.success) {
            const rawData = extractArray(result, 'fournisseurs');
            const normalized = rawData.map(normalizeFournisseur).filter((item): item is { id: number; nom: string } => item !== null);
            const unique = normalized.filter((item, idx, arr) => arr.findIndex(x => x.id === item.id) === idx);
            unique.sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }));
            if (isMounted.current) setFournisseurs(unique);
          } else {
            if (isMounted.current) setFournisseurs([]);
          }
        } catch (err) {
          console.error('❌ [Produits] Erreur fournisseurs:', err);
          if (isMounted.current) setFournisseurs([]);
        }
      } else {
        if (isMounted.current) setFournisseurs([]);
      }

      referencesLoaded.current = true;
    } catch (error) {
      console.error('❌ [Produits] ERREUR loadReferences:', error);
    }
  }, [extractArray, normalizeCategory, normalizeFournisseur]);

  // Chargement initial des références
  useEffect(() => {
    let cancelled = false;
    const loadInitial = async () => { if (!cancelled) await loadReferences(false); };
    loadInitial();
    return () => { cancelled = true; };
  }, [loadReferences]);

  // Chargement des produits
  const loadProduits = useCallback(async (isRefresh = false) => {
    if (fetchLock.current) return;
    fetchLock.current = true;
    try {
      if (isRefresh) {
        if (isMounted.current) setRefreshing(true);
      } else if (!firstLoadDone.current) {
        if (isMounted.current) setLoading(true);
      }

      if (!referencesLoaded.current) await loadReferences(false);
      if (!window.api?.products?.getAll) throw new Error('API products.getAll tsy hita');

      const sort = SORT_MAP[sortOption] || SORT_MAP['Nom (A-Z)'];
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch || undefined,
        sortBy: sort.field,
        sortOrder: sort.direction,
        status: filters?.filterStatus || undefined,
        categorieId: filters?.filterCategorie || undefined,
        prixMin: filters?.prixMin || undefined,
        prixMax: filters?.prixMax || undefined,
        dateFrom: filters?.dateFrom || undefined,
        dateTo: filters?.dateTo || undefined,
      };

      const result = await window.api.products.getAll(params);
      if (!isMounted.current) return;
      if (!result?.success) throw new Error(result?.error || 'Erreur chargement produits');

      const rawData = Array.isArray(result.data) ? result.data : (Array.isArray(result.data?.data) ? result.data.data : []);
      const data = rawData.filter((item: any, idx: number, self: any[]) => self.findIndex((t: any) => t.id === item.id) === idx);
      setProduits(data);

      const total = Number(result.pagination?.total || 0);
      setTotalItems(total);
      const backendTotalPages = Number(result.pagination?.totalPages);
      setTotalPages(backendTotalPages > 0 ? backendTotalPages : Math.ceil(total / ITEMS_PER_PAGE));

      firstLoadDone.current = true;
    } catch (error) {
      console.error('❌ [Produits] loadProduits:', error);
      if (isMounted.current) { setProduits([]); setTotalItems(0); setTotalPages(0); }
    } finally {
      if (isMounted.current) { setLoading(false); setRefreshing(false); }
      fetchLock.current = false;
    }
  }, [currentPage, debouncedSearch, sortOption, filters?.filterStatus, filters?.filterCategorie, filters?.prixMin, filters?.prixMax, filters?.dateFrom, filters?.dateTo, loadReferences]);

  useEffect(() => { loadDataRef.current = loadProduits; }, [loadProduits]);

  useEffect(() => {
    if (!isMounted.current) return;
    setCurrentPage(1);
    loadDataRef.current(true);
  }, [debouncedSearch, sortOption, filters?.filterStatus, filters?.filterCategorie, filters?.prixMin, filters?.prixMax, filters?.dateFrom, filters?.dateTo]);

  useEffect(() => {
    if (isMounted.current && firstLoadDone.current) loadDataRef.current(false);
  }, [currentPage]);

  // Images
  const loadImageUrl = useCallback(async (produit: any) => {
    if (!produit?.id || !produit?.image) return;
    if (loadedImageIds.current.has(produit.id) || imageLoadingIds.current.has(produit.id)) return;
    imageLoadingIds.current.add(produit.id);
    try {
      if (!window.api?.images?.getUrl) return;
      const result = await window.api.images.getUrl(produit.image);
      const url = result?.success && typeof result.data === 'string' ? result.data : null;
      if (!url) {
        if (isMounted.current) setImageErrors(prev => ({ ...prev, [produit.id]: true }));
        return;
      }
      if (!isMounted.current) return;
      setImageUrls(prev => ({ ...prev, [produit.id]: url }));
      setImageErrors(prev => { const next = { ...prev }; delete next[produit.id]; return next; });
      loadedImageIds.current.add(produit.id);
    } catch (error) {
      console.error('❌ [Produits] loadImageUrl:', error);
      if (isMounted.current) setImageErrors(prev => ({ ...prev, [produit.id]: true }));
    } finally {
      imageLoadingIds.current.delete(produit.id);
    }
  }, []);

  const handleImageError = useCallback((id: number) => {
    loadedImageIds.current.delete(id);
    imageLoadingIds.current.delete(id);
    setImageErrors(prev => ({ ...prev, [id]: true }));
    setImageUrls(prev => { const next = { ...prev }; delete next[id]; return next; });
  }, []);

  // Stats
  const getStats = useCallback(async () => {
    if (!window.api?.products?.getStats) throw new Error('API products.getStats tsy hita');
    const result = await window.api.products.getStats();
    if (!result?.success) throw new Error(result?.error || 'Erreur stats');
    return result.data || {};
  }, []);

  // Actions
  const loadData = useCallback(async () => { setCurrentPage(1); }, []);
  const refresh = useCallback(async () => {
    await loadReferences(true);
    await loadDataRef.current(true);
  }, [loadReferences]);

  const generateCode = useCallback(() => {
    const t = Date.now().toString(36).toUpperCase();
    const r = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `PRD-${t}-${r}`;
  }, []);

  // CRUD
  const createProduit = useCallback(async (data: any) => {
    if (!window.api?.products?.create) throw new Error('API products.create indisponible');
    const result = await window.api.products.create(data);
    if (!result?.success) throw new Error(result?.error || 'Erreur création produit');
    await loadDataRef.current(true);
    return result.data;
  }, []);

  const updateProduit = useCallback(async (id: number, data: any) => {
    if (!window.api?.products?.update) throw new Error('API products.update indisponible');
    const result = await window.api.products.update(id, data);
    if (!result?.success) throw new Error(result?.error || 'Erreur mise à jour produit');
    loadedImageIds.current.delete(id);
    imageLoadingIds.current.delete(id);
    setImageUrls(prev => { const next = { ...prev }; delete next[id]; return next; });
    setImageErrors(prev => { const next = { ...prev }; delete next[id]; return next; });
    await loadDataRef.current(true);
    return result.data;
  }, []);

  const deleteProduit = useCallback(async (id: number) => {
    if (!window.api?.products?.delete) throw new Error('API products.delete indisponible');
    const result = await window.api.products.delete(id);
    if (!result?.success) throw new Error(result?.error || 'Erreur suppression produit');
    loadedImageIds.current.delete(id);
    imageLoadingIds.current.delete(id);
    setImageUrls(prev => { const next = { ...prev }; delete next[id]; return next; });
    setImageErrors(prev => { const next = { ...prev }; delete next[id]; return next; });
    await loadDataRef.current(true);
    return result;
  }, []);

  const bulkDelete = useCallback(async (ids: number[]) => {
    if (!window.api?.products?.bulkDelete) throw new Error('API products.bulkDelete indisponible');
    const validIds = ids.filter(id => Number.isInteger(id) && id > 0);
    if (!validIds.length) throw new Error('Aucun produit valide');
    const result = await window.api.products.bulkDelete(validIds);
    if (!result?.success) throw new Error(result?.error || 'Erreur suppression lot');
    validIds.forEach(id => { loadedImageIds.current.delete(id); imageLoadingIds.current.delete(id); });
    setImageUrls(prev => { const next = { ...prev }; validIds.forEach(id => delete next[id]); return next; });
    setImageErrors(prev => { const next = { ...prev }; validIds.forEach(id => delete next[id]); return next; });
    await loadDataRef.current(true);
    return result;
  }, []);

  const bulkUpdateStatus = useCallback(async (ids: number[], newStatus: string) => {
    if (!window.api?.products?.bulkUpdateStatus) throw new Error('API products.bulkUpdateStatus indisponible');
    const validIds = ids.filter(id => Number.isInteger(id) && id > 0);
    if (!validIds.length) throw new Error('Aucun produit valide');
    const status = String(newStatus).trim().toLowerCase();
    if (status !== 'actif' && status !== 'inactif') throw new Error('Statut invalide');
    const result = await window.api.products.bulkUpdateStatus(validIds, status);
    if (!result?.success) throw new Error(result?.error || 'Erreur mise à jour lot');
    await loadDataRef.current(true);
    return result;
  }, []);

  // Images upload/delete
  const uploadImage = useCallback(async (base64: string) => {
    if (!window.api?.images?.upload) throw new Error('API images.upload indisponible');
    if (!base64) throw new Error('Image invalide');
    const result = await window.api.images.upload(base64, 'produits');
    if (!result?.success) throw new Error(result?.error || 'Erreur upload image');
    return result.data;
  }, []);

  const deleteImage = useCallback(async (path: string) => {
    if (!window.api?.images?.delete) throw new Error('API images.delete indisponible');
    if (!path) return null;
    const result = await window.api.images.delete(path);
    if (!result?.success) throw new Error(result?.error || 'Erreur suppression image');
    return result;
  }, []);

  const getProduitById = useCallback(async (id: number) => {
    if (!window.api?.products?.getById) throw new Error('API products.getById indisponible');
    if (!Number.isInteger(id) || id <= 0) throw new Error('ID invalide');
    const result = await window.api.products.getById(id);
    if (!result?.success) throw new Error(result?.error || 'Produit non trouvé');
    return result.data;
  }, []);

  return {
    produits,
    loading,
    refreshing,
    setRefreshing,
    currentPage,
    setCurrentPage,
    totalItems,
    totalPages,
    ITEMS_PER_PAGE,
    filters,
    setFilters,
    sortOption,
    setSortOption,
    categories,
    fournisseurs,
    loadReferences,
    refresh,
    loadData,
    imageUrls,
    imageErrors,
    loadImageUrl,
    handleImageError,
    getStats,
    generateCode,
    createProduit,
    updateProduit,
    deleteProduit,
    bulkDelete,
    bulkUpdateStatus,
    uploadImage,
    deleteImage,
    getProduitById,
  };
};