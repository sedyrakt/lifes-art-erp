// ============================================================
// src/hooks/usePaiementCounts.ts
// ⭐ FIX: Mampiasa ny employes:get-paiement-counts-batch mba tsy hanao 150 calls
// ============================================================
import { useState, useEffect, useCallback } from 'react';

interface Employe { id: number; }
interface UsePaiementCountsProps { employes: Employe[]; }

export const usePaiementCounts = ({ employes }: UsePaiementCountsProps) => {
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = useCallback(async () => {
    // Raha tsy misy employés na tsy misy ilay API batch
    if (!Array.isArray(employes) || employes.length === 0 || !window.api?.employes?.getPaiementCountsBatch) {
      setCounts({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ⭐ ZAVA-DEHIBE: Batch call tokana ihany, fa tsy 150 calls
      const ids = employes.map(e => Number(e.id)).filter(id => Number.isFinite(id) && id > 0);
      if (ids.length === 0) {
        setCounts({});
        return;
      }

      const result = await window.api.employes.getPaiementCountsBatch(ids);
      
      if (result?.success) {
        const newCounts: Record<number, number> = {};
        // Ny backend dia mamerina andalana: { employe_id: ..., count: ... }
        (result.data || []).forEach((row: any) => {
          newCounts[row.employe_id] = Number(row.count || 0);
        });
        setCounts(newCounts);
      } else {
        throw new Error(result?.error || 'Erreur serveur');
      }
    } catch (err: any) {
      console.error('[usePaiementCounts] Erreur batch:', err);
      setError(err?.message || 'Erreur lors du chargement des compteurs de paiement');
      setCounts({});
    } finally {
      setLoading(false);
    }
  }, [employes]);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  return {
    paiementCounts: counts,
    loading,
    error,
    // ⭐ ZAVA-DEHIBE : Refresh rehefa misy create/update/delete paiement
    refreshPaiementCounts: fetchCounts,
  };
};

