// ============================================================
// src/hooks/useEntreesData.ts - KEYSET PREV/NEXT (SANS APPEND)
// ⭐ FIX: Cache image mba tsy hisy boucle
// ⭐ FIX: Dependency stable
// ⭐ FIX: Hooks rehetra eo an-tampon'ny hook
// ============================================================
import { useState, useEffect, useCallback, useRef } from 'react';
import { EntreeStock } from '../types/entrees';

const ITEMS_PER_PAGE = 8;

export const useEntreesData = () => {
  // ✅ FIX: HOOKS REHETRA ETO AMBONY (TSY MISY CONDITION)
  const isMounted = useRef(true); 
  const fetchLock = useRef(false);
  const imagesLoaded = useRef<Set<number>>(new Set()); // ✅ FIX: Afindra eto
  const cursorHistory = useRef<(number | null)[]>([null]);
  
  const [loading, setLoading] = useState(true); 
  const [refreshing, setRefreshing] = useState(false);
  const [totalItems, setTotalItems] = useState(0); 
  const [totalPages, setTotalPages] = useState(1);
  const [entrees, setEntrees] = useState<EntreeStock[]>([]); 
  const [produits, setProduits] = useState<any[]>([]); 
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [filterFournisseur, setFilterFournisseur] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('date-desc');
  const [lastId, setLastId] = useState<number | null>(null); 
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageUrls, setImageUrls] = useState<Record<number, string | null>>({}); 
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  useEffect(() => { const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300); return () => clearTimeout(timer); }, [searchTerm]);
  useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; fetchLock.current = false; }; }, []);

  const loadImageForEntree = useCallback(async (entree: EntreeStock) => {
    if (!entree.produit_id || !window.api?.images?.getUrl) return;
    
    // ✅ FIX: Mampiasa ny imagesLoaded ref (avy any ambony)
    if (imagesLoaded.current.has(entree.id)) return;
    
    try {
      const productResult = await window.api.products.getById(entree.produit_id);
      if (!productResult?.success || !productResult.data?.image) {
        if (isMounted.current) {
          setImageErrors(prev => ({ ...prev, [entree.id]: true }));
          imagesLoaded.current.add(entree.id); // ✅ FIX
        }
        return;
      }
      const urlResult = await window.api.images.getUrl(productResult.data.image);
      let url = urlResult?.success ? urlResult.data : null;
      if (url) url = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`;
      if (isMounted.current) {
        if (url) {
          setImageUrls(prev => ({ ...prev, [entree.id]: url }));
          imagesLoaded.current.add(entree.id); // ✅ FIX
        } else {
          setImageErrors(prev => ({ ...prev, [entree.id]: true }));
          imagesLoaded.current.add(entree.id); // ✅ FIX
        }
      }
    } catch (_) { 
      if (isMounted.current) {
        setImageErrors(prev => ({ ...prev, [entree.id]: true }));
        imagesLoaded.current.add(entree.id); // ✅ FIX
      }
    }
  }, []);

  const loadPage = useCallback(async (direction: 'next' | 'prev' | 'refresh') => {
    if (fetchLock.current) return; fetchLock.current = true;
    try {
      if (direction === 'refresh') { 
        setCurrentPage(1); 
        cursorHistory.current = [null]; 
        setLastId(null); 
        setEntrees([]); 
        setHasMore(true); 
        setTotalItems(0); 
        setTotalPages(1);
        imagesLoaded.current.clear(); // ✅ FIX: Clear cache rehefa refresh
      }
      let targetLastId: number | null = null;
      if (direction === 'next') targetLastId = lastId;
      else if (direction === 'prev') targetLastId = cursorHistory.current[currentPage - 2] || null;

      if (!window.api?.stock?.getEntrees) throw new Error('API stock.getEntrees non disponible');

      let sortBy = 'date_entree';
      let sortOrder: 'ASC' | 'DESC' = 'DESC';
      switch (sortOption) {
        case 'date-asc': sortBy = 'date_entree'; sortOrder = 'ASC'; break;
        case 'quantite-desc': sortBy = 'quantite'; sortOrder = 'DESC'; break;
        case 'quantite-asc': sortBy = 'quantite'; sortOrder = 'ASC'; break;
        default: sortBy = 'date_entree'; sortOrder = 'DESC'; break;
      }

      const result = await window.api.stock.getEntrees({
        lastId: targetLastId, limit: ITEMS_PER_PAGE, search: debouncedSearch,
        fournisseurId: filterFournisseur ? parseInt(filterFournisseur) : undefined,
        sortBy, sortOrder
      });

      if (result?.success && isMounted.current) {
        const data = result.data || []; const newLastId = data.length > 0 ? data[data.length - 1].id : null;
        setTotalItems(result.pagination?.total || 0);
        setTotalPages(Math.ceil((result.pagination?.total || 0) / ITEMS_PER_PAGE));
        setEntrees(data); 
        if (direction === 'next') { if (lastId !== null) cursorHistory.current[currentPage] = lastId; setCurrentPage(prev => prev + 1); } 
        else if (direction === 'prev') { setCurrentPage(prev => prev - 1); }
        setLastId(newLastId); setHasMore(data.length === ITEMS_PER_PAGE && data.length > 0);
        setImageErrors({}); 
        // ✅ FIX: Clear cache rehefa misy page vaovao
        imagesLoaded.current.clear();
        data.forEach(e => loadImageForEntree(e));
      }
      if (window.api?.products?.getAll) window.api.products.getAll({ limit: 50, status: 'actif' }).then(pr => { if (pr?.success && isMounted.current) setProduits(pr.data || []); }).catch(() => {});
      if (window.api?.fournisseurs?.getAll) window.api.fournisseurs.getAll({ limit: 50 }).then(fr => { if (fr?.success && isMounted.current) setFournisseurs(fr.data || []); }).catch(() => {});
    } catch (err: any) { if (isMounted.current) { setEntrees([]); setHasMore(false); setTotalItems(0); } }
    finally { if (isMounted.current) { setLoading(false); setRefreshing(false); } fetchLock.current = false; }
  }, [debouncedSearch, filterFournisseur, sortOption, lastId, currentPage, loadImageForEntree]);

  useEffect(() => { loadPage('refresh'); }, [debouncedSearch, filterFournisseur, sortOption]);
  const handleNextPage = useCallback(() => { if (hasMore && !loading) loadPage('next'); }, [hasMore, loading, loadPage]);
  const handlePrevPage = useCallback(() => { if (currentPage > 1 && !loading) loadPage('prev'); }, [currentPage, loading, loadPage]);

  const handleSelectAll = useCallback((checked: boolean) => setSelectedIds(checked ? new Set(entrees.map(e => e.id)) : new Set()), [entrees]);
  const handleSelectOne = useCallback((id: number, checked: boolean) => { const n = new Set(selectedIds); checked ? n.add(id) : n.delete(id); setSelectedIds(n); }, [selectedIds]);
  const createEntree = useCallback(async (data: any) => { if (!window.api?.stock?.createEntree) throw new Error('API indisponible'); const result = await window.api.stock.createEntree(data); if (!result?.success) throw new Error(result?.error || 'Erreur création'); await loadPage('refresh'); return result.data; }, [loadPage]);
  const bulkDeleteEntrees = useCallback(async (ids: number[]) => { if (!window.api?.stock?.bulkDeleteEntrees) throw new Error('API bulkDeleteEntrees indisponible'); const result = await window.api.stock.bulkDeleteEntrees(ids); if (!result?.success) throw new Error(result?.error || 'Erreur suppression en lot'); await loadPage('refresh'); return result; }, [loadPage]);

  return { 
    entrees, produits, fournisseurs, 
    loading, refreshing, setRefreshing, 
    totalItems, totalPages, 
    currentPage, 
    searchTerm, setSearchTerm, 
    filterFournisseur, setFilterFournisseur, 
    sortOption, setSortOption, 
    createEntree, ITEMS_PER_PAGE, 
    selectedIds, setSelectedIds, 
    handleSelectAll, handleSelectOne, 
    bulkDeleteEntrees, 
    imageUrls, imageErrors, loadImageForEntree, 
    hasMore, handleNextPage, handlePrevPage 
  };
};