import React, { useEffect } from 'react';
import { History, X, Receipt, Plus, Calendar as CalendarIcon, Wallet, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';

interface Paiement { id: number; employe_id: number; nom: string; prenom: string; poste: string; mois: number; annee: number; montant: number; mode_paiement: string; date_paiement: string; reference: string; observation: string; }
interface PaiementsHistoriqueModalProps { isOpen: boolean; onClose: () => void; onAddPaiement: () => void; historiqueData: Paiement[]; moisLabels: string[]; }

const PaiementsHistoriqueModal: React.FC<PaiementsHistoriqueModalProps> = ({ isOpen, onClose, onAddPaiement, historiqueData, moisLabels }) => {
  const { isDark } = useTheme();
  // ⭐ FANITSIA MAJOR : Border Class (gray-300 / slate-700)
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-300';

  useEffect(() => { if (!isOpen) return; const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, [isOpen, onClose]);
  if (!isOpen) return null;
  const totalPaye = historiqueData.reduce((sum, p) => sum + Number(p.montant || 0), 0);
  const first = historiqueData[0];
  const formatDate = (value?: string) => { if (!value) return '—'; const date = new Date(value); if (Number.isNaN(date.getTime())) return '—'; return date.toLocaleDateString('fr-FR'); };

  return (<div className="fixed inset-0 z-[99990] flex items-center justify-center bg-black/50 dark:bg-black/75 p-4 sm:p-6 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className={`flex w-full max-w-[820px] max-h-[90vh] flex-col overflow-hidden rounded-2xl border bg-white dark:bg-[#111c30] shadow-[0_24px_70px_rgba(0,0,0,0.28)] ${borderClass} animate-[paiementHistoryIn_180ms_ease-out]`} onMouseDown={(e) => e.stopPropagation()}>
      
      <div className={`flex shrink-0 items-center justify-between border-b px-5 py-4 ${borderClass}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"><History size={19} /></div>
          <div>
            <h2 className="text-[17px] font-semibold text-slate-900 dark:text-slate-100">Historique des paiements</h2>
            <p className="mt-0.5 text-[14px] text-slate-500 dark:text-slate-400">Historique complet des rémunérations</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"><X size={18} /></button>
      </div>

      <div className="custom-history-scrollbar flex-1 overflow-y-auto p-5">
        {historiqueData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10"><Receipt size={30} className="text-indigo-500 dark:text-indigo-400" /></div>
            <h3 className="text-[17px] font-semibold text-slate-900 dark:text-slate-100">Aucun paiement</h3>
            <p className="mt-1 max-w-sm text-[14.5px] text-slate-500 dark:text-slate-400">Aucun paiement trouvé pour cet employé.</p>
            <button type="button" onClick={onAddPaiement} className="mt-5 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-[14.5px] font-medium text-white transition-colors hover:bg-indigo-700"><Plus size={15} />Ajouter un paiement</button>
          </div>
        ) : (
          <>
            <div className={`mb-4 flex items-center justify-between gap-4 rounded-xl border p-4 bg-indigo-50/70 dark:bg-indigo-500/[0.07] ${borderClass}`}>
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"><User size={18} /></div>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-slate-900 dark:text-slate-100">{first?.prenom} {first?.nom}</p>
                  <p className="mt-0.5 truncate text-[14px] text-slate-500 dark:text-slate-400">{first?.poste || 'Poste non renseigné'}</p>
                </div>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-[13px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Total payé</p>
                <p className="text-[18px] font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(totalPaye)}</p>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
              <div className={`rounded-xl border p-3.5 bg-emerald-50/60 dark:bg-emerald-500/[0.07] ${borderClass}`}>
                <div className="flex items-center gap-2"><Wallet size={15} className="text-emerald-600 dark:text-emerald-400" /><span className="text-[13px] text-slate-500 dark:text-slate-400">Total payé</span></div>
                <p className="mt-1.5 text-[18px] font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(totalPaye)}</p>
              </div>
              <div className={`rounded-xl border p-3.5 bg-indigo-50/60 dark:bg-indigo-500/[0.07] ${borderClass}`}>
                <div className="flex items-center gap-2"><Receipt size={15} className="text-indigo-600 dark:text-indigo-400" /><span className="text-[13px] text-slate-500 dark:text-slate-400">Paiements</span></div>
                <p className="mt-1.5 text-[18px] font-bold text-indigo-600 dark:text-indigo-400">{historiqueData.length}</p>
              </div>
              <div className={`col-span-2 rounded-xl border p-3.5 bg-amber-50/60 dark:bg-amber-500/[0.07] lg:col-span-1 ${borderClass}`}>
                <div className="flex items-center gap-2"><CalendarIcon size={15} className="text-amber-600 dark:text-amber-400" /><span className="text-[13px] text-slate-500 dark:text-slate-400">Dernier paiement</span></div>
                <p className="mt-1.5 text-[15px] font-bold text-amber-600 dark:text-amber-400">{first ? formatDate(first.date_paiement) : '—'}</p>
              </div>
            </div>

            <div className={`overflow-hidden rounded-xl border ${borderClass}`}>
              <div className="custom-table-scrollbar overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse text-left">
                  <thead className="bg-slate-50 dark:bg-[#0F172A]">
                    <tr className="text-[13px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className={`border px-3 py-2.5 ${borderClass}`}>Période</th>
                      <th className={`border px-3 py-2.5 ${borderClass}`}>Montant</th>
                      <th className={`border px-3 py-2.5 ${borderClass}`}>Mode</th>
                      <th className={`border px-3 py-2.5 ${borderClass}`}>Date</th>
                      <th className={`border px-3 py-2.5 ${borderClass}`}>Référence</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-[#111c30]">
                    {historiqueData.map((p) => (
                      <tr key={p.id} className="h-[52px] transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className={`border px-3 py-2 ${borderClass}`}>
                          <span className="text-[14px] font-medium capitalize text-slate-900 dark:text-slate-100">{moisLabels[p.mois - 1] || `Mois ${p.mois}`} {p.annee}</span>
                        </td>
                        <td className={`border px-3 py-2 ${borderClass}`}>
                          <span className="text-[14.5px] font-semibold text-emerald-600 dark:text-emerald-400">{formatMoney(p.montant)}</span>
                        </td>
                        <td className={`border px-3 py-2 ${borderClass}`}>
                          <span className="inline-flex rounded-md bg-indigo-50 px-2 py-0.5 text-[13px] font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">{p.mode_paiement || '—'}</span>
                        </td>
                        <td className={`border px-3 py-2 ${borderClass}`}>
                          <span className="text-[14px] text-slate-500 dark:text-slate-400">{formatDate(p.date_paiement)}</span>
                        </td>
                        <td className={`border px-3 py-2 ${borderClass}`}>
                          <span className="text-[14px] text-slate-500 dark:text-slate-400">{p.reference || '—'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <div className={`flex shrink-0 flex-col-reverse gap-2 border-t px-5 py-3 sm:flex-row sm:items-center sm:justify-end ${borderClass}`}>
        <button type="button" onClick={onClose} className="h-9 rounded-lg px-4 text-[14.5px] font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Fermer</button>
        <button type="button" onClick={onAddPaiement} className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-[14.5px] font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"><Plus size={15} />Ajouter un paiement</button>
      </div>
    </div>
    <style>{`@keyframes paiementHistoryIn { from { opacity: 0; transform: translateY(8px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } } .custom-history-scrollbar::-webkit-scrollbar { width: 6px; } .custom-history-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-history-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.28); border-radius: 999px; } .custom-table-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; } .custom-table-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-table-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.28); border-radius: 999px; }`}</style>
  </div>);
};

export default PaiementsHistoriqueModal;