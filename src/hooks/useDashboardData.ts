// ============================================================
// src/hooks/useDashboardData.ts - 20M READY (PROGRESSIVE LOADING)
// ⭐ CORRIGÉ: Nampidirina ny data rehetra ho an'ny DashboardCharts
// ⭐ FIX: Interface misy charts rehetra, loadData mangataka avokoa
// ⭐ FIX: Nampitomboina ny `limit` ho 20 (avy amin'ny 5) mba hahafahan'ilay "Autres" miseho tsara ao amin'ny Donut
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';

export interface DashboardChartsData {
  ventesParMois: any[];
  topProduits: any[];
  categorieRepartition: any[];
  stockStatus: { en_stock: number; stock_bas: number; rupture: number };
  // ⭐ VAOVAO
  entreesStock: any[];
  sortiesStock: any[];
  topClients: any[];
  depensesParCategorie: any[];
  commandesStatut: any[];
}

export const useDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState<any>({
    totalProduits: 0,
    stockTotal: 0,
    alertesStock: 0,
    ruptureStock: 0,
    commandesTotal: 0,
    commandesEnAttente: 0,
    totalClients: 0,
    chiffreAffaires: 0,
    beneficeNet: 0,
    totalPaiements: 0,
  });

  // ⭐ VAOVAO: Charts data misy ny rehetra
  const [chartsData, setChartsData] = useState<DashboardChartsData>({
    ventesParMois: [],
    topProduits: [],
    categorieRepartition: [],
    stockStatus: { en_stock: 0, stock_bas: 0, rupture: 0 },
    entreesStock: [],
    sortiesStock: [],
    topClients: [],
    depensesParCategorie: [],
    commandesStatut: [],
  });

  const isMounted = useRef(true);
  const fetchLock = useRef(false);
  const firstLoadDone = useRef(false);
  const loadDataRef = useRef<(isRefresh?: boolean) => Promise<void>>(async () => {});

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      fetchLock.current = false;
    };
  }, []);

  const getData = (r: any, fallback: any = []) => {
    return r.status === 'fulfilled' && r.value?.success ? r.value.data : fallback;
  };

  const loadData = useCallback(async (isRefresh = false) => {
    if (fetchLock.current) return;
    fetchLock.current = true;

    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const statsRes = await window.api.dashboard.getStats();
      if (statsRes?.success && isMounted.current) {
        setStats(statsRes.data);
      }

      const year = new Date().getFullYear();

      // ⭐ VAOVAO: Mangataka ny data rehetra ilain'ny DashboardCharts
      // ⭐ FIX MAJEUR: Nampitomboina ny limit ho 20 mba hahafahan'ilay Donut mamorona ny "Autres" tsara
      const [topRes, catRes, ventesRes, stockRes, entreesRes, sortiesRes, clientsRes, depensesRes, commandesRes] = await Promise.allSettled([
        window.api.dashboard.getChartData({ type: 'top-produits', limit: 20 }), // ⭐ 20 no alefa mba hahazoana vokatra mihoatra ny 5
        window.api.dashboard.getChartData({ type: 'repartition-categories' }),
        window.api.dashboard.getChartData({ type: 'ventes-par-mois', year }),
        window.api.dashboard.getChartData({ type: 'stock-status' }),
        window.api.dashboard.getChartData({ type: 'entrees-stock' }),
        window.api.dashboard.getChartData({ type: 'sorties-stock' }),
        window.api.dashboard.getChartData({ type: 'top-clients' }),
        window.api.dashboard.getChartData({ type: 'depenses-categorie' }),
        window.api.dashboard.getChartData({ type: 'commandes-statut' }),
      ]);

      if (isMounted.current) {
        const topData = getData(topRes, []);
        const catData = getData(catRes, []);
        const ventesData = getData(ventesRes, []);
        const stockData = getData(stockRes, { en_stock: 0, stock_bas: 0, rupture: 0 });
        const entreesData = getData(entreesRes, []);
        const sortiesData = getData(sortiesRes, []);
        const clientsData = getData(clientsRes, []);
        const depensesData = getData(depensesRes, []);
        const commandesData = getData(commandesRes, []);

        setChartsData({
          ventesParMois: ventesData,
          topProduits: topData,
          categorieRepartition: catData,
          stockStatus: stockData,
          entreesStock: entreesData,
          sortiesStock: sortiesData,
          topClients: clientsData,
          depensesParCategorie: depensesData,
          commandesStatut: commandesData,
        });

        firstLoadDone.current = true;
      }
    } catch (err: any) {
      console.error('❌ Erreur chargement dashboard:', err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
        fetchLock.current = false;
      }
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      if (isMounted.current && !fetchLock.current) {
        loadDataRef.current(true);
      }
    };

    const unsubscribers: (() => void)[] = [];

    if (window.api?.financial?.onChanged) {
      unsubscribers.push(window.api.financial.onChanged(handler));
    }
    if (window.api?.orders?.onChanged) {
      unsubscribers.push(window.api.orders.onChanged(handler));
    }
    if (window.api?.stock?.onMouvementAdded) {
      unsubscribers.push(window.api.stock.onMouvementAdded(handler));
    }
    if (window.api?.reports?.onChanged) {
      unsubscribers.push(window.api.reports.onChanged(handler));
    }

    return () => {
      unsubscribers.forEach((fn) => {
        if (typeof fn === 'function') fn();
      });
    };
  }, []);

  useEffect(() => {
    loadDataRef.current = loadData;
  }, [loadData]);

  useEffect(() => {
    if (!firstLoadDone.current) {
      loadData(false);
    }
  }, [loadData]);

  return {
    loading,
    refreshing,
    stats,
    chartsData,
    loadData,
  };
};

