// ============================================================
// src/components/dashboard/DashboardTopProducts.tsx - CORRIGÉ
// ⭐ FIX: Nampidirina ny useMemo sy useRef mba tsy hiverimberina ilay loop
// ⭐ FANITSARA LEHIBE: Nampidirina ny sary produit (avec API getUrl)
// ⭐ FANITSARA VAOVAO: Nampidirina ny Vente (Total) sy Evolution ao ankavanana
// ============================================================

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Trophy, ImageOff } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';

interface DashboardTopProductsProps {
  products: any[];
}

// ⭐ Helper ho an'ny sandan'ny isa
const safeNumber = (value: any): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const DashboardTopProducts: React.FC<DashboardTopProductsProps> = ({ products }) => {
  const { isDark } = useTheme();

  // ⭐ State ho an'ny sary
  const [imageUrls, setImageUrls] = useState<Record<number, string | null>>({});
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // ⭐ Ref mba hanara-maso ny ID efa nalaina sary
  const loadedIdsRef = useRef<Set<number>>(new Set());

  // ⭐ FANITSARA: Ampiasao ny useMemo mba tsy hiova isaky ny render ny filteredProducts
  const filteredProducts = useMemo(() => {
    return (products || []).filter(p => (p.total_vendu || 0) > 0);
  }, [products]);

  // ⭐ Kajy ny total max mba ho an'ny progress bar
  const maxVendu = filteredProducts.length > 0
    ? Math.max(...filteredProducts.map(p => p.total_vendu || 0))
    : 1;

  // ⭐ Maka ny sary ho an'ny produits (misy protection amin'ny loop)
  useEffect(() => {
    if (!filteredProducts.length) return;

    const loadImages = async () => {
      const newUrls: Record<number, string | null> = {};
      const newErrors: Record<number, boolean> = {};
      let hasChanges = false;

      for (const p of filteredProducts) {
        // ⭐ Raha efa nampidirina ny sary dia tsy mbola averina
        if (loadedIdsRef.current.has(p.id)) continue;
        if (!p.image) continue;

        try {
          if (window.api?.images?.getUrl) {
            const result = await window.api.images.getUrl(p.image);
            if (result?.success && result.data) {
              newUrls[p.id] = result.data;
              loadedIdsRef.current.add(p.id);
              hasChanges = true;
            } else {
              newErrors[p.id] = true;
              loadedIdsRef.current.add(p.id);
              hasChanges = true;
            }
          }
        } catch (_) {
          newErrors[p.id] = true;
          loadedIdsRef.current.add(p.id);
          hasChanges = true;
        }
      }

      // ⭐ Raha misy vaovao dia manao update state tokana
      if (hasChanges) {
        setImageUrls(prev => ({ ...prev, ...newUrls }));
        setImageErrors(prev => ({ ...prev, ...newErrors }));
      }
    };

    loadImages();
  }, [filteredProducts]);

  // ⭐ Helper raha tsy misy sary
  const getInitial = (nom: string) => nom?.charAt(0)?.toUpperCase() || '?';

  return (
    <div
      className="rounded-xl border shadow-sm overflow-hidden transition-colors duration-200"
      style={{
        background: isDark ? '#0F172A' : '#F8FAFC',
        borderColor: isDark ? '#334155' : '#E2E8F0'
      }}
    >
      <div className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-50 dark:bg-amber-500/10">
            <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-base font-medium" style={{ color: isDark ? '#F3F4F6' : '#111827' }}>Top Produits</h2>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: isDark ? '#1E293B' : '#F1F5F9' }}>
              <Trophy className="w-6 h-6" style={{ color: isDark ? '#64748B' : '#94A3B8' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Aucun produit vendu</p>
            <p className="text-xs" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>Les ventes apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {filteredProducts.map((p, index) => {
              const nom = p.nom || p.produit_nom || 'N/A';
              const totalVendu = safeNumber(p.total_vendu || p.quantite_vendue || 0);
              const prix = safeNumber(p.prix_vente || p.prix || 0);
              // ⭐ VAOVAO: Kajy ny Vente Total sy ny Evolution
              const totalVente = prix * totalVendu;
              const evolution = safeNumber(p.evolution || 0);
              
              const percentage = (totalVendu / maxVendu) * 100;
              const imageUrl = imageUrls[p.id] || null;
              const hasError = imageErrors[p.id] || false;
              const initial = getInitial(nom);

              return (
                <div
                  key={p.id || index}
                  className="flex items-center gap-3 p-3 rounded-lg border transition-colors"
                  style={{
                    background: isDark ? '#0F172A' : '#FFFFFF',
                    borderColor: isDark ? '#334155' : '#E2E8F0'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark ? '#1E293B' : '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isDark ? '#0F172A' : '#FFFFFF';
                  }}
                >
                  {/* ⭐ AVATAR AVEC IMAGE / INITIALES */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                    {imageUrl && !hasError ? (
                      <img
                        src={imageUrl}
                        alt={nom}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={() => setImageErrors(prev => ({ ...prev, [p.id]: true }))}
                      />
                    ) : (
                      <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        {initial}
                      </span>
                    )}
                  </div>

                  {/* ⭐ RANG BADGE + NOM + QUANTITE */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium text-white shadow-sm ${
                          index === 0 ? 'bg-amber-500' :
                          index === 1 ? 'bg-slate-400' :
                          index === 2 ? 'bg-amber-700' :
                          'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <p className="text-sm font-medium truncate" style={{ color: isDark ? '#F3F4F6' : '#111827' }}>
                        {nom}
                      </p>
                    </div>

                    {/* ⭐ PROGRESS BAR VISUAL CUE MIARAKA AMIN'NY QUANTITÉ */}
                    <div className="flex items-center gap-2 mt-1.5 ml-7">
                      <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: isDark ? '#334155' : '#E2E8F0' }}>
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                        {totalVendu} vendu{totalVendu > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* ⭐ VENTE TOTAL (Chiffre d'affaires) + EVOLUTION + PRIX UNITAIRE */}
                  <div className="text-right ml-2 flex flex-col justify-center items-end">
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {/* VENTE TOTAL (Misy loko Indigo) */}
                      <p className="text-sm font-semibold whitespace-nowrap text-indigo-600 dark:text-indigo-400">
                        {formatMoney(totalVente)}
                      </p>
                      {/* EVOLUTION (Badge kely miloko) */}
                      {evolution !== 0 && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          evolution > 0 
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' 
                            : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20'
                        }`}>
                          {evolution > 0 ? '+' : ''}{evolution.toFixed(1)}%
                        </span>
                      )}
                    </div>
                    {/* PRIX UNITAIRE (Kely kokoa eo ambany) */}
                    <p className="text-[11px] mt-0.5" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                      {formatMoney(prix)} / unité
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ⭐ CUSTOM SCROLLBAR */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.2);
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.4);
        }
      `}</style>
    </div>
  );
};

export default DashboardTopProducts;