// src/hooks/useVentesData.ts
import { useState, useEffect, useCallback, useRef } from 'react';

export interface Vente {
  id: number;
  reference: string | null;
  client_id: number | null;
  client_nom: string;
  date_devis?: string;
  date_facture?: string;
  total_ht: number;
  total_ttc: number;
  statut: string;
  observation?: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

export const useVentesData = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [devisList, setDevisList] = useState<Vente[]>([]);
  const [factures, setFactures] = useState<Vente[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [produits, setProduits] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalDevis, setTotalDevis] = useState(0);
  const [totalFactures, setTotalFactures] = useState(0);

  // ⭐ FIX: Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ⭐ FIX: Misy ny viewDetails mivantana
  const [viewItem, setViewItem] = useState<any>(null);
  const [viewDetails, setViewDetails] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ⭐ Load Clients & Produits
  const loadReferences = useCallback(async () => {
    try {
      const [clientsResult, produitsResult] = await Promise.all([
        window.api.clients.getAll({ limit: 1000 }),
        window.api.products.getAll({ limit: 1000 }),
      ]);
      if (clientsResult?.success && isMounted.current) setClients(clientsResult.data || []);
      if (produitsResult?.success && isMounted.current) setProduits(produitsResult.data || []);
    } catch (err) {
      console.error('Erreur chargement références:', err);
    }
  }, []);

  // ⭐ Load Devis (Misy pagination)
  const loadDevis = useCallback(async () => {
    try {
      const result = await window.api.ventes.getDevis({ search: searchTerm });
      if (result?.success && isMounted.current) {
        setDevisList(result.data || []);
        setTotalDevis(result.data?.length || 0);
        
        // ⭐ FIX: Calcul ny totalPages
        const total = result.data?.length || 0;
        const pages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
        setTotalPages(pages);
        if (currentPage > pages) setCurrentPage(1);
      }
    } catch (err) {
      console.error('Erreur chargement devis:', err);
    }
  }, [searchTerm, currentPage]);

  // ⭐ Load Factures (Misy pagination)
  const loadFactures = useCallback(async () => {
    try {
      const result = await window.api.ventes.getFactures({ search: searchTerm });
      if (result?.success && isMounted.current) {
        setFactures(result.data || []);
        setTotalFactures(result.data?.length || 0);
        
        // ⭐ FIX: Calcul ny totalPages
        const total = result.data?.length || 0;
        const pages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
        setTotalPages(pages);
        if (currentPage > pages) setCurrentPage(1);
      }
    } catch (err) {
      console.error('Erreur chargement factures:', err);
    }
  }, [searchTerm, currentPage]);

  // ⭐ FIX: Get Devis Details (mampiasa ny API)
  const getDevisDetails = useCallback(async (item: any) => {
    setViewItem(item);
    setLoadingDetails(true);
    try {
      const result = await window.api.ventes.getDevisDetails(item.id);
      if (result?.success && Array.isArray(result.data?.details)) {
        setViewDetails(result.data.details || []);
      } else {
        setViewDetails([]);
      }
    } catch (err) {
      setViewDetails([]);
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  // ⭐ FIX: Get Facture Details (mampiasa ny API)
  const getFactureDetails = useCallback(async (item: any) => {
    setViewItem(item);
    setLoadingDetails(true);
    try {
      const result = await window.api.ventes.getFactureDetails(item.id);
      if (result?.success && Array.isArray(result.data?.details)) {
        setViewDetails(result.data.details || []);
      } else {
        setViewDetails([]);
      }
    } catch (err) {
      setViewDetails([]);
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  // ⭐ Initial Load (Mampihena ny loading)
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadReferences(), loadDevis(), loadFactures()]);
      if (isMounted.current) setLoading(false);
    };
    loadAll();
  }, [loadReferences, loadDevis, loadFactures]);

  // ⭐ Re-load rehefa miova ny searchTerm
  useEffect(() => {
    if (!searchTerm) return; // Tsy mi-load indray raha banga
    const timer = setTimeout(() => {
      setCurrentPage(1); // ⭐ FIX: Reset page rehefa search
      loadDevis();
      loadFactures();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, loadDevis, loadFactures]);

  // ⭐ Re-Load (Refresh)
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadReferences(), loadDevis(), loadFactures()]);
    if (isMounted.current) setRefreshing(false);
  }, [loadReferences, loadDevis, loadFactures]);

  // ⭐ CRUD Actions
  const createDevis = useCallback(async (data: any) => {
    const result = await window.api.ventes.createDevis(data);
    if (result?.success) {
      await loadDevis();
      return result;
    }
    return result;
  }, [loadDevis]);

  const createFacture = useCallback(async (data: any) => {
    const result = await window.api.ventes.createFacture(data);
    if (result?.success) {
      await loadFactures();
      return result;
    }
    return result;
  }, [loadFactures]);

  const convertDevisToFacture = useCallback(async (devisId: number) => {
    const result = await window.api.ventes.convertDevisToFacture(devisId);
    if (result?.success) {
      await Promise.all([loadDevis(), loadFactures()]);
      return result;
    }
    return result;
  }, [loadDevis, loadFactures]);

  const deleteDevis = useCallback(async (id: number) => {
    const result = await window.api.ventes.deleteDevis(id);
    if (result?.success) {
      await loadDevis();
      return result;
    }
    return result;
  }, [loadDevis]);

  const deleteFacture = useCallback(async (id: number) => {
    const result = await window.api.ventes.deleteFacture(id);
    if (result?.success) {
      await loadFactures();
      return result;
    }
    return result;
  }, [loadFactures]);

  return {
    devisList,
    factures,
    clients,
    produits,
    loading,
    refreshing,
    searchTerm,
    setSearchTerm,
    totalDevis,
    totalFactures,
    ITEMS_PER_PAGE,
    
    // ⭐ FIX: Pagination
    currentPage,
    setCurrentPage,
    totalPages,
    
    loadReferences,
    loadDevis,
    loadFactures,
    refresh,
    createDevis,
    createFacture,
    convertDevisToFacture,
    deleteDevis,
    deleteFacture,
    
    // ⭐ FIX: View Details States
    viewItem,
    setViewItem,
    viewDetails,
    setViewDetails,
    loadingDetails,
    setLoadingDetails,
    getDevisDetails,
    getFactureDetails
  };
};

export default useVentesData;