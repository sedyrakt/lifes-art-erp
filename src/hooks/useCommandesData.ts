// ============================================================
// src/hooks/useCommandesData.ts - 20M READY (PAGE-BASED)
// ⭐ FIX: LIMIT clients augmentée à 1000 pour afficher tout le carnet
// ⭐ FIX: Nampidirina ny Déduplication ID mba tsy hisy doublon
// ============================================================
import { useState, useEffect, useCallback, useRef } from 'react';
import { Commande, Client, Produit, DetailCommande, STATUS } from '../types/commandes';
import { downloadPDF } from '../lib/pdfService';
import { CompanyData } from '../components/company';

const ITEMS_PER_PAGE = 8;

export const useCommandesData = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('Tous');
  const [sortOption, setSortOption] = useState('Date (Récent)');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterMontantMin, setFilterMontantMin] = useState('');
  const [filterMontantMax, setFilterMontantMax] = useState('');
  const [filterModePaiement, setFilterModePaiement] = useState('');
  const [details, setDetails] = useState<DetailCommande[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedProduits, setSelectedProduits] = useState<{ id: number; quantite: number }[]>([]);
  const [stats, setStats] = useState({ total: 0, enAttente: 0, confirmees: 0, livrees: 0, annulees: 0, totalCA: 0, totalHT: 0, moyennePanier: 0, clientsUniques: 0 });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const isMounted = useRef(true);
  const fetchLock = useRef(false);
  const firstLoadDone = useRef(false);
  const loadDataRef = useRef<(isRefresh?: boolean) => Promise<void>>(async () => {});
  const clientsLoaded = useRef(false);
  const produitsLoaded = useRef(false);

  useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; fetchLock.current = false; }; }, []);
  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300); return () => clearTimeout(t); }, [searchTerm]);

  const loadStats = useCallback(async () => {
    try {
      const result = await window.api.orders.getStats();
      if (result?.success && isMounted.current) {
        const d = result.data;
        setStats({ total: Number(d.total || 0), enAttente: Number(d.en_attente || 0), confirmees: Number(d.confirmees || 0), livrees: Number(d.livrees || 0), annulees: Number(d.annulees || 0), totalCA: Number(d.total_ca || 0), totalHT: Number(d.total_ht || 0), moyennePanier: Number(d.total_commandes || 0) > 0 ? Number(d.total_ca || 0) / Number(d.total_commandes) : 0, clientsUniques: 0 });
      }
    } catch (err) { console.error('❌ loadStats:', err); }
  }, []);

  const loadClientsAndProduits = useCallback(async () => {
    if (!clientsLoaded.current) {
      const r = await window.api.clients.getAll({ limit: 1000 });
      if (r?.success && isMounted.current) {
        setClients(r.data || []);
        clientsLoaded.current = true;
      }
    }
    if (!produitsLoaded.current) {
      const r = await window.api.products.getAll({ status: 'actif', limit: 500 });
      if (r?.success && isMounted.current) {
        setProduits(r.data || []);
        produitsLoaded.current = true;
      }
    }
  }, []);

  const loadCommandes = useCallback(async (isRefresh = false) => {
    if (fetchLock.current) return;
    fetchLock.current = true;
    try {
      if (isRefresh) setRefreshing(true);
      else if (!firstLoadDone.current) { setLoading(true); await loadClientsAndProduits(); }
      if (!window.api?.orders?.getAll) throw new Error('API orders.getAll non disponible');
      let sortField = 'id', sortDirection: 'ASC' | 'DESC' = 'DESC';
      if (sortOption === 'Date (Récent)') { sortField = 'date_commande'; sortDirection = 'DESC'; }
      else if (sortOption === 'Date (Ancien)') { sortField = 'date_commande'; sortDirection = 'ASC'; }
      else if (sortOption === 'Total (Croissant)') { sortField = 'total_ttc'; sortDirection = 'ASC'; }
      else if (sortOption === 'Total (Décroissant)') { sortField = 'total_ttc'; sortDirection = 'DESC'; }
      else if (sortOption === 'Client (A-Z)') { sortField = 'client_nom'; sortDirection = 'ASC'; }
      else if (sortOption === 'Client (Z-A)') { sortField = 'client_nom'; sortDirection = 'DESC'; }
      
      const result = await window.api.orders.getAll({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch,
        statut: filterStatut !== 'Tous' ? filterStatut : undefined,
        sort: { field: sortField, direction: sortDirection },
        startDate: filterDateFrom || undefined,
        endDate: filterDateTo || undefined,
        montantMin: filterMontantMin || undefined,
        montantMax: filterMontantMax || undefined,
        modePaiement: filterModePaiement || undefined,
      });
      if (!isMounted.current) return;
      if (!result?.success) throw new Error(result?.error || 'Erreur chargement');
      
      const data = (result.data || []).map(c => ({ ...c, numero: `CMD-${String(c.id).padStart(6,'0')}` }));
      
      // ⭐ FIX: Déduplication des commandes basée sur l'ID
      const uniqueData = data.filter((item, index, self) => 
        self.findIndex(t => t.id === item.id) === index
      );

      setCommandes(uniqueData);
      setTotalItems(Number(result.pagination?.total || 0));
      setTotalPages(Number(result.pagination?.totalPages || 1));
      await loadStats();
      firstLoadDone.current = true;
    } catch (err) { console.error('❌ loadCommandes:', err); if (isMounted.current) { setCommandes([]); } }
    finally { if (isMounted.current) { setLoading(false); setRefreshing(false); } fetchLock.current = false; }
  }, [currentPage, debouncedSearch, filterStatut, sortOption, filterDateFrom, filterDateTo, filterMontantMin, filterMontantMax, filterModePaiement, loadClientsAndProduits, loadStats]);

  useEffect(() => { loadDataRef.current = loadCommandes; }, [loadCommandes]);
  useEffect(() => { if (isMounted.current) { setCurrentPage(1); loadDataRef.current(true); } }, [debouncedSearch, filterStatut, sortOption, filterDateFrom, filterDateTo, filterMontantMin, filterMontantMax, filterModePaiement]);
  useEffect(() => { if (isMounted.current && firstLoadDone.current) loadDataRef.current(false); }, [currentPage]);

  const loadDetails = useCallback(async (commandeId: number) => {
    try { const result = await window.api.orders.getDetails(commandeId); if (result?.success) { setDetails(result.data || []); return result.data; } return []; } catch { return []; }
  }, []);

  const handleAddProduit = useCallback((id: number, quantite: number) => {
    const existing = selectedProduits.find(p => p.id === id);
    if (existing) return;
    const produit = produits.find(p => p.id === id);
    if (!produit || quantite > produit.quantite_stock) return;
    setSelectedProduits(prev => [...prev, { id, quantite }]);
  }, [selectedProduits, produits]);

  const handleUpdateQuantite = useCallback((id: number, quantite: number) => {
    if (quantite <= 0) { setSelectedProduits(prev => prev.filter(p => p.id !== id)); return; }
    const produit = produits.find(p => p.id === id);
    if (produit && quantite > produit.quantite_stock) return;
    setSelectedProduits(prev => prev.map(p => p.id === id ? { ...p, quantite } : p));
  }, [produits]);

  const handleRemoveProduit = useCallback((id: number) => setSelectedProduits(prev => prev.filter(p => p.id !== id)), []);
  const clearPanier = useCallback(() => setSelectedProduits([]), []);

  const createCommande = useCallback(async (clientId: number, products: { id: number; quantite: number }[]) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) throw new Error('Client non trouvé');
    let totalHT = 0;
    const productDetails = products.map(item => {
      const p = produits.find(pr => pr.id === item.id);
      if (!p) throw new Error(`Produit ${item.id} non trouvé`);
      const totalLigne = item.quantite * p.prix_vente;
      totalHT += totalLigne;
      return { id: p.id, name: p.nom, price: p.prix_vente, quantity: item.quantite };
    });
    const result = await window.api.orders.create({ client_nom: client.nom, client_id: client.id, products: productDetails, total_ht: totalHT, total_ttc: totalHT * 1.2, statut: STATUS.PENDING });
    if (!result?.success) throw new Error(result?.error || 'Erreur création');
    await loadDataRef.current(true);
    return result.data;
  }, [clients, produits]);

  const executeUpdateStatus = useCallback(async (id: number, newStatus: string) => {
    const result = await window.api.orders.updateStatus(id, newStatus);
    if (!result?.success) throw new Error(result?.error || 'Erreur mise à jour statut');
    await loadDataRef.current(true);
    return result;
  }, []);

  const deleteCommande = useCallback(async (id: number) => {
    const result = await window.api.orders.delete(id);
    if (!result?.success) throw new Error(result?.error || 'Erreur suppression');
    await loadDataRef.current(true);
    return result;
  }, []);

  const generateFacture = useCallback(async (commande: Commande, companyInfo: CompanyData) => {
    try {
      let products = commande.products;
      if (!products || products.length === 0) {
        const fullDetails = await loadDetails(commande.id);
        if (fullDetails && fullDetails.length > 0) products = fullDetails;
        else products = [];
      }
      return await downloadPDF({ order: { ...commande, products }, clientName: commande.client_nom, clientEmail: commande.client_email, clientPhone: commande.client_telephone, clientAddress: commande.client_address, companyName: companyInfo.name, companyLogo: companyInfo.logo, companyAddress: companyInfo.address, companyPhone: companyInfo.phone, companyEmail: companyInfo.email, companySiret: companyInfo.siret, companyImage: companyInfo.image, companyTaxId: companyInfo.taxId, companyRcs: companyInfo.rcs, companyVatNumber: companyInfo.vatNumber, paymentMethod: companyInfo.paymentMethod, paymentTerms: companyInfo.paymentTerms });
    } catch (error: any) { return { success: false, error: error.message }; }
  }, [loadDetails]);

  const bulkUpdateStatus = useCallback(async (ids: number[], newStatus: string) => {
    const result = await window.api.orders.bulkUpdateStatus(ids, newStatus);
    if (!result?.success) throw new Error(result?.error || 'Erreur mise à jour en lot');
    await loadDataRef.current(false);
    return result;
  }, []);

  const bulkDelete = useCallback(async (ids: number[]) => {
    const result = await window.api.orders.bulkDelete(ids);
    if (!result?.success) throw new Error(result?.error || 'Erreur suppression en lot');
    await loadDataRef.current(false);
    return result;
  }, []);

  const refreshReferences = useCallback(async () => { clientsLoaded.current = false; produitsLoaded.current = false; await loadClientsAndProduits(); }, [loadClientsAndProduits]);

  return { commandes, clients, produits, loading, refreshing, setRefreshing, totalItems, totalPages, currentPage, setCurrentPage, searchTerm, setSearchTerm, filterStatut, setFilterStatut, sortOption, setSortOption, filterDateFrom, setFilterDateFrom, filterDateTo, setFilterDateTo, filterMontantMin, setFilterMontantMin, filterMontantMax, setFilterMontantMax, filterModePaiement, setFilterModePaiement, details, selectedClientId, setSelectedClientId, selectedProduits, loadData: () => loadDataRef.current(false), loadDetails, stats, handleAddProduit, handleUpdateQuantite, handleRemoveProduit, clearPanier, createCommande, executeUpdateStatus, deleteCommande, generateFacture, bulkUpdateStatus, bulkDelete, ITEMS_PER_PAGE, refreshReferences };
};
