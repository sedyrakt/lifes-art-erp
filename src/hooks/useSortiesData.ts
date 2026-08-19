// ============================================================
// src/hooks/useSortiesData.ts - KEYSET PREV/NEXT (SANS APPEND)
// ⭐ FIX: Maka ny sary amin'ny alalan'ny getById (tahaka ny modal)
// ============================================================
import { useState, useEffect, useCallback, useRef } from 'react';
import { SortieStock } from '../types/sorties';

const ITEMS_PER_PAGE = 8;

export const useSortiesData = () => {
  const isMounted = useRef(true); const fetchLock = useRef(false);
  const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false);
  const [totalItems, setTotalItems] = useState(0); const [totalPages, setTotalPages] = useState(1);
  const [sorties, setSorties] = useState<SortieStock[]>([]); const [produits, setProduits] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(''); const [filterProduit, setFilterProduit] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('date-desc');
  const [lastId, setLastId] = useState<number | null>(null); const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const cursorHistory = useRef<(number | null)[]>([null]); 
  const [imageUrls, setImageUrls] = useState<Record<number, string | null>>({}); const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  useEffect(() => { const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300); return () => clearTimeout(timer); }, [searchTerm]);
  useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; fetchLock.current = false; }; }, []);

  const loadImageForSortie = useCallback(async (sortie: SortieStock) => {
    if (!sortie.produit_id || !window.api?.images?.getUrl) return;
    try {
      const productResult = await window.api.products.getById(sortie.produit_id);
      if (!productResult?.success || !productResult.data?.image) {
        if (isMounted.current) setImageErrors(prev => ({ ...prev, [sortie.id]: true }));
        return;
      }
      const urlResult = await window.api.images.getUrl(productResult.data.image);
      let url = urlResult?.success ? urlResult.data : null;
      if (url) url = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`;
      if (isMounted.current) {
        if (url) setImageUrls(prev => ({ ...prev, [sortie.id]: url }));
        else setImageErrors(prev => ({ ...prev, [sortie.id]: true }));
      }
    } catch (_) { if (isMounted.current) setImageErrors(prev => ({ ...prev, [sortie.id]: true })); }
  }, []);

  const loadPage = useCallback(async (direction: 'next' | 'prev' | 'refresh') => {
    if (fetchLock.current) return; fetchLock.current = true;
    try {
      if (direction === 'refresh') { setCurrentPage(1); cursorHistory.current = [null]; setLastId(null); setSorties([]); setHasMore(true); setTotalItems(0); setTotalPages(1); }
      let targetLastId: number | null = null;
      if (direction === 'next') targetLastId = lastId;
      else if (direction === 'prev') targetLastId = cursorHistory.current[currentPage - 2] || null;

      if (!window.api?.stock?.getSorties) throw new Error('API stock.getSorties non disponible');

      let sortBy = 'date_sortie';
      let sortOrder: 'ASC' | 'DESC' = 'DESC';
      switch (sortOption) {
        case 'date-asc': sortBy = 'date_sortie'; sortOrder = 'ASC'; break;
        case 'quantite-desc': sortBy = 'quantite'; sortOrder = 'DESC'; break;
        case 'quantite-asc': sortBy = 'quantite'; sortOrder = 'ASC'; break;
        default: sortBy = 'date_sortie'; sortOrder = 'DESC'; break;
      }

      const result = await window.api.stock.getSorties({
        lastId: targetLastId, limit: ITEMS_PER_PAGE, search: debouncedSearch,
        produitId: filterProduit ? parseInt(filterProduit) : undefined,
        sortBy, sortOrder
      });
      if (result?.success && isMounted.current) {
        const data = result.data || []; const newLastId = data.length > 0 ? data[data.length - 1].id : null;
        setTotalItems(result.pagination?.total || 0);
        setTotalPages(Math.ceil((result.pagination?.total || 0) / ITEMS_PER_PAGE));
        setSorties(data); 
        if (direction === 'next') { if (lastId !== null) cursorHistory.current[currentPage] = lastId; setCurrentPage(prev => prev + 1); } 
        else if (direction === 'prev') { setCurrentPage(prev => prev - 1); }
        setLastId(newLastId); setHasMore(data.length === ITEMS_PER_PAGE && data.length > 0);
        setImageErrors({}); data.forEach(s => loadImageForSortie(s));
      }
      if (window.api?.products?.getAll) window.api.products.getAll({ limit: 50, status: 'actif' }).then(pr => { if (pr?.success && isMounted.current) setProduits((pr.data || []).filter((p: any) => p.quantite_stock > 0)); }).catch(() => {});
    } catch (err: any) { if (isMounted.current) { setSorties([]); setHasMore(false); setTotalItems(0); } }
    finally { if (isMounted.current) { setLoading(false); setRefreshing(false); } fetchLock.current = false; }
  }, [debouncedSearch, filterProduit, sortOption, lastId, currentPage, loadImageForSortie]);

  useEffect(() => { loadPage('refresh'); }, [debouncedSearch, filterProduit, sortOption]);
  const handleNextPage = useCallback(() => { if (hasMore && !loading) loadPage('next'); }, [hasMore, loading, loadPage]);
  const handlePrevPage = useCallback(() => { if (currentPage > 1 && !loading) loadPage('prev'); }, [currentPage, loading, loadPage]);

  const handleSelectAll = useCallback((checked: boolean) => setSelectedIds(checked ? new Set(sorties.map(s => s.id)) : new Set()), [sorties]);
  const handleSelectOne = useCallback((id: number, checked: boolean) => { const n = new Set(selectedIds); checked ? n.add(id) : n.delete(id); setSelectedIds(n); }, [selectedIds]);
  const createSortie = useCallback(async (data: any) => { if (!window.api?.stock?.createSortie) throw new Error('API indisponible'); const result = await window.api.stock.createSortie(data); if (!result?.success) throw new Error(result?.error || 'Erreur création'); await loadPage('refresh'); return result.data; }, [loadPage]);
  const bulkDeleteSorties = useCallback(async (ids: number[]) => { if (!window.api?.stock?.bulkDeleteSorties) throw new Error('API bulkDeleteSorties indisponible'); const result = await window.api.stock.bulkDeleteSorties(ids); if (!result?.success) throw new Error(result?.error || 'Erreur suppression en lot'); await loadPage('refresh'); return result; }, [loadPage]);

  return { 
    sorties, produits, loading, refreshing, setRefreshing, 
    totalItems, totalPages, currentPage, searchTerm, setSearchTerm, filterProduit, setFilterProduit, 
    sortOption, setSortOption, createSortie, ITEMS_PER_PAGE, selectedIds, setSelectedIds, 
    handleSelectAll, handleSelectOne, bulkDeleteSorties, imageUrls, imageErrors, loadImageForSortie, 
    hasMore, handleNextPage, handlePrevPage 
  };
};