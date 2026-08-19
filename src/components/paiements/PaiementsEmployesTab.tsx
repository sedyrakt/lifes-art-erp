// src/components/paiements/PaiementsEmployesTab.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Search, Eye, Users } from 'lucide-react';
import { safeString, normalizeText, ITEMS_PER_PAGE } from './PaiementsUtils';
import { formatMoney } from '../../lib/formatMoney';
import PaiementsPagination from './PaiementsPagination';

interface Props { isDark: boolean; employes: any[]; paiementCounts: Record<number, number>; employeTotals: Record<number, number>; onViewHistorique: (id: number) => void; }

const PaiementsEmployesTab: React.FC<Props> = ({ isDark, employes = [], paiementCounts = {}, employeTotals = {}, onViewHistorique }) => {
  const [searchEmploye, setSearchEmploye] = useState('');
  const [employePage, setEmployePage] = useState(1);
  const borderColor = isDark ? 'border-white/[0.14]' : 'border-slate-300';
  const cellBorderColor = isDark ? 'border-white/[0.10]' : 'border-slate-200';
  const headerBorderColor = isDark ? 'border-white/[0.18]' : 'border-slate-300';

  const filteredEmployes = useMemo(() => { const term = normalizeText(searchEmploye); if (!term) return employes; return employes.filter((employee) => { const prenom = safeString(employee?.prenom); const nom = safeString(employee?.nom); const poste = safeString(employee?.poste); const email = safeString(employee?.email); const fullName = `${prenom} ${nom}`; return normalizeText(fullName).includes(term) || normalizeText(prenom).includes(term) || normalizeText(nom).includes(term) || normalizeText(poste).includes(term) || normalizeText(email).includes(term); }); }, [employes, searchEmploye]);
  useEffect(() => { setEmployePage(1); }, [searchEmploye]);
  const totalPages = Math.max(1, Math.ceil(filteredEmployes.length / ITEMS_PER_PAGE));
  useEffect(() => { if (employePage > totalPages) setEmployePage(totalPages); }, [employePage, totalPages]);
  const displayedEmployes = useMemo(() => { const start = (employePage - 1) * ITEMS_PER_PAGE; return filteredEmployes.slice(start, start + ITEMS_PER_PAGE); }, [filteredEmployes, employePage]);

  const getEmployeeId = (employee: any): number => Number(employee?.id ?? 0);
  const getPaymentCount = (employee: any): number => { const id = getEmployeeId(employee); const value = paiementCounts?.[id] ?? paiementCounts?.[Number(id)] ?? 0; const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; };
  const getEmployeeTotal = (employee: any): number => { const id = getEmployeeId(employee); const value = employeTotals?.[id] ?? employeTotals?.[Number(id)] ?? 0; const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; };
  const getInitials = (employee: any): string => { const prenom = safeString(employee?.prenom); const nom = safeString(employee?.nom); const first = prenom.charAt(0); const second = nom.charAt(0); return `${first}${second}`.toUpperCase() || '?'; };

  if (employes.length === 0) return (<div className={`rounded-xl border bg-white px-6 py-14 text-center shadow-sm dark:bg-[#111c30] dark:shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${borderColor}`}><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10"><Users size={26} strokeWidth={1.8} className="text-indigo-500" /></div><h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100">Aucun employé</h3><p className="mt-1 text-[14px] text-slate-500 dark:text-slate-400">Aucun employé n'est disponible pour afficher les paiements.</p></div>);

  const hasSearch = normalizeText(searchEmploye).length > 0;
  if (filteredEmployes.length === 0 && hasSearch) return (<div className="space-y-4"><div className={`rounded-xl border bg-white p-4 shadow-sm dark:bg-[#111c30] dark:shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${borderColor}`}><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10"><Users size={19} className="text-indigo-500" /></div><div><h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">Détails des paiements par employé</h2><p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">Aucun résultat</p></div></div><div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" /><input value={searchEmploye} onChange={(e) => setSearchEmploye(e.target.value)} placeholder="Rechercher un employé..." className="h-10 w-full rounded-lg border bg-white pl-9 pr-3 text-[14px] text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-100 dark:placeholder:text-slate-500 sm:w-64" /></div></div></div><div className={`rounded-xl border bg-white px-6 py-14 text-center shadow-sm dark:bg-[#111c30] ${borderColor}`}><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"><Search size={24} className="text-slate-400 dark:text-slate-500" /></div><h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100">Aucun employé trouvé</h3><p className="mt-1 text-[14px] text-slate-500 dark:text-slate-400">Aucun résultat pour « {searchEmploye} ».</p><button type="button" onClick={() => setSearchEmploye('')} className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-indigo-700">Réinitialiser la recherche</button></div></div>);

  return (<div className="space-y-4"><div className={`rounded-xl border bg-white p-4 shadow-sm dark:bg-[#111c30] dark:shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${borderColor}`}><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10"><Users size={19} className="text-indigo-500" /></div><div className="min-w-0"><h2 className="truncate text-[15px] font-semibold text-slate-900 dark:text-slate-100">Détails des paiements par employé</h2><p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">{filteredEmployes.length} employé{filteredEmployes.length > 1 ? 's' : ''}</p></div></div><div className="relative"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" /><input type="text" value={searchEmploye} onChange={(e) => setSearchEmploye(e.target.value)} placeholder="Rechercher un employé..." className="h-10 w-full rounded-lg border bg-white pl-9 pr-3 text-[14px] text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-[#0F172A] dark:text-slate-100 dark:placeholder:text-slate-500 sm:w-64" /></div></div></div>
    <div className={`overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-[#111c30] dark:shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${borderColor}`}><div className="overflow-x-auto">
      {/* ⭐ BORDER SEPARATE + SPACING 0 -> Mitovy amin'ny tabilao hafa */}
      <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left">
        <thead className={`${headerBorderColor} bg-slate-100 dark:bg-[#111c30]`}>
          <tr className="text-[12px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <th className={`w-[60px] border px-5 py-2.5 ${headerBorderColor}`}>#</th>
            <th className={`min-w-[260px] border px-5 py-2.5 ${headerBorderColor}`}>Employé</th>
            <th className={`w-[130px] border px-5 py-2.5 ${headerBorderColor}`}>Nombre</th>
            <th className={`w-[180px] border px-5 py-2.5 ${headerBorderColor}`}>Montant total</th>
            <th className={`w-[160px] border px-5 py-2.5 ${headerBorderColor}`}>Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-[#111c30]">
          {displayedEmployes.map((employee, index) => {
            const employeeId = getEmployeeId(employee); const count = getPaymentCount(employee); const globalTotal = getEmployeeTotal(employee); const initials = getInitials(employee); const prenom = safeString(employee?.prenom); const nom = safeString(employee?.nom); const poste = safeString(employee?.poste);
            return (<tr key={employeeId || `employee-${index}`} className="group h-[60px] cursor-pointer transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}><span className="text-[14px] text-slate-500 dark:text-slate-400">{(employePage - 1) * ITEMS_PER_PAGE + index + 1}</span></td>
              <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-500/10 text-[12px] font-bold text-indigo-600 dark:text-indigo-400">{initials}</div><div className="min-w-0"><p className="truncate text-[14px] font-medium text-slate-900 dark:text-slate-100">{prenom} {nom}</p>{poste && <p className="mt-0.5 truncate text-[13px] text-slate-500 dark:text-slate-400">{poste}</p>}</div></div></td>
              <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}><div className="flex items-center gap-2"><span className={`inline-flex min-w-[30px] items-center justify-center rounded-md px-2 py-1 text-[13px] font-semibold ${count > 0 ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}>{count}</span><span className="text-[13px] text-slate-500 dark:text-slate-400">paiement{count > 1 ? 's' : ''}</span></div></td>
              <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}><span className={`text-[14px] font-semibold ${globalTotal > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>{formatMoney(globalTotal)}</span></td>
              <td className={`border px-5 py-3 align-middle ${cellBorderColor}`}><button type="button" onClick={() => onViewHistorique(employeeId)} disabled={!employeeId} className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-3 py-1.5 text-[14px] font-semibold text-indigo-600 transition-all hover:bg-indigo-100 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300"><Eye size={14} strokeWidth={2} />Voir détails</button></td>
            </tr>);
          })}
        </tbody>
      </table>
    </div>{totalPages > 1 && (<div className={`border-t ${borderColor}`}><PaiementsPagination currentPage={employePage} totalPages={totalPages} totalItems={filteredEmployes.length} onPageChange={setEmployePage} /></div>)}</div>
    <style>{`.custom-paiements-employes-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; } .custom-paiements-employes-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-paiements-employes-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.35); border-radius: 999px; } .custom-paiements-employes-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.55); }`}</style>
  </div>);
};
export default PaiementsEmployesTab;