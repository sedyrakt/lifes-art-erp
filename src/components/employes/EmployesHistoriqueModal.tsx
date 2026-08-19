import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatMoney } from '../../lib/formatMoney';
import { Calendar, X, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Trash2, DollarSign, User, Briefcase, Clock, Info, Ban } from 'lucide-react';

const COLORS = {
  light: {
    card: '#FFFFFF', border: '#CBD5E1', headerBg: '#F8FAFC', formBg: '#FFFFFF', cellBg: '#F8FAFC', inputBg: '#FFFFFF',
    text: '#0F172A', muted: '#64748B', primary: '#6366F1', primaryBg: 'rgba(99,102,241,0.06)', primaryBorder: 'rgba(99,102,241,0.15)',
    red: '#EF4444', amber: '#F59E0B', amberDark: '#D97706', green: '#10B981',
  },
  dark: {
    card: '#0F172A', border: '#334155', headerBg: '#0F172A', formBg: '#0F172A', cellBg: '#1E293B', inputBg: '#0F172A',
    text: '#F8FAFC', muted: '#94A3B8', primary: '#6366F1', primaryBg: 'rgba(99,102,241,0.12)', primaryBorder: 'rgba(99,102,241,0.25)',
    red: '#EF4444', amber: '#F59E0B', amberDark: '#D97706', green: '#10B981',
  }
};

interface Employe { id: number; nom: string; prenom: string; email: string; telephone: string; poste: string; departement: string; date_embauche: string; salaire: number; image: string; status: string; created_at: string; }
interface Paiement { id: number; employe_id: number; mois: number; annee: number; montant: number; mode_paiement: string; reference: string; observation: string; date_paiement: string; created_at: string; }
interface EmployesHistoriqueModalProps {
  isOpen: boolean; onClose: () => void; employe: Employe; historiquePaiements: Paiement[]; imageUrl: string | null;
  anneeCalendrier: number; selectedMoisDetail: number | null; selectedMoisDetailAnnee: number | null;
  onAnneeChange: (annee: number) => void; onMoisDetailSelect: (mois: number | null, annee: number | null) => void;
  onPayer: () => void; onAnnulerPaiement?: (paiementId: number) => void;
  getMoisPourAnnee: (dateEmbauche: string, annee: number, labels?: string[]) => { mois: number; annee: number; label: string }[];
  moisLabels: string[]; moisLabelsCourt: string[]; isDark: boolean;
}

const FormCell: React.FC<{ label: string; children: React.ReactNode; icon?: React.ReactNode; required?: boolean; borderRight?: boolean; borderBottom?: boolean; fullWidth?: boolean }> = ({ label, children, icon, required = false, borderRight = true, borderBottom = true, fullWidth = false }) => {
  const { isDark } = useTheme();
  const theme = isDark ? COLORS.dark : COLORS.light;
  return (
    <div className={`flex items-center px-3 py-2.5 ${borderRight ? 'border-r' : ''} ${borderBottom ? 'border-b' : ''} ${fullWidth ? 'col-span-3' : ''}`} style={{ borderColor: theme.border, background: theme.cellBg }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {icon && <span className="shrink-0 text-indigo-600 dark:text-gray-100">{icon}</span>}
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.muted }}>{label} {required && <span className="text-rose-500">*</span>}</span>
        </div>
        <div className="text-[15px] font-medium">{children}</div>
      </div>
    </div>
  );
};

const EmployesHistoriqueModal: React.FC<EmployesHistoriqueModalProps> = ({
  isOpen, onClose, employe, historiquePaiements, imageUrl, anneeCalendrier, selectedMoisDetail, selectedMoisDetailAnnee,
  onAnneeChange, onMoisDetailSelect, onPayer, onAnnulerPaiement, getMoisPourAnnee, moisLabels, moisLabelsCourt, isDark: propIsDark,
}) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : themeIsDark;
  const theme = isDark ? COLORS.dark : COLORS.light;

  if (!isOpen || !employe) return null;

  const paiementsAnnee = historiquePaiements.filter(p => p?.annee === anneeCalendrier);
  const moisTotal = getMoisPourAnnee(employe.date_embauche, anneeCalendrier).length;
  const tauxPaiement = moisTotal > 0 ? Math.round((paiementsAnnee.length / moisTotal) * 100) : 0;
  const totalPayeAnnee = paiementsAnnee.reduce((sum, p) => sum + (p?.montant || 0), 0);
  const moyenne = paiementsAnnee.length > 0 ? Math.round(paiementsAnnee.reduce((sum, p) => sum + (p?.montant || 0), 0) / paiementsAnnee.length) : 0;
  const isMoisPaye = (mois: number, annee: number) => historiquePaiements.some(p => p?.mois === mois && p?.annee === annee);
  const getPaiementForMois = (mois: number, annee: number) => historiquePaiements.find(p => p?.mois === mois && p?.annee === annee);
  const anneeEmbauche = employe.date_embauche ? new Date(employe.date_embauche).getFullYear() : new Date().getFullYear();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="historique-modal-title">
      <div className="relative w-full max-w-4xl max-h-[80vh] shadow-2xl transition-all duration-300 rounded-2xl flex flex-col overflow-hidden border" style={{ background: theme.card, borderColor: theme.border }}>
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b z-10" style={{ background: theme.headerBg, borderColor: theme.border }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border flex items-center justify-center shadow-sm" style={{ borderColor: theme.primaryBorder, background: theme.primaryBg }}><img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" /></div>
            <div>
              <h2 id="historique-modal-title" className="text-[16px] font-bold tracking-tight" style={{ color: theme.text }}>Historique des salaires</h2>
              <p className="text-[13px] font-medium" style={{ color: theme.muted }}>Gestion des paiements de <span style={{ color: theme.primary }}>{employe.prenom} {employe.nom}</span></p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-500" style={{ color: theme.muted }} aria-label="Fermer"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-56 flex-shrink-0 flex flex-col gap-4">
              <div className="border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: theme.border }}>
                <div className="flex flex-col items-center p-4 gap-3" style={{ background: theme.formBg }}>
                  <div className="w-20 h-20 rounded-xl overflow-hidden border flex items-center justify-center shrink-0" style={{ borderColor: theme.border, background: theme.primaryBg }}>
                    {imageUrl ? <img src={imageUrl} alt={employe.nom} className="w-full h-full object-cover" /> :
                     <span className="font-bold text-2xl" style={{ color: theme.primary }}>{employe.prenom?.charAt(0)}{employe.nom?.charAt(0)}</span>}
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-[17px]" style={{ color: theme.text }}>{employe.prenom} {employe.nom}</div>
                    <div className="text-[13px] font-medium mt-0.5" style={{ color: theme.muted }}>{employe.poste}</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border" style={{ background: 'rgba(16,185,129,0.1)', color: theme.green, borderColor: 'rgba(16,185,129,0.2)' }}>{employe.status}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl border" style={{ borderColor: theme.border, background: theme.formBg }}>
                <div className="flex items-center gap-2 mb-3"><Info className="w-4 h-4" style={{ color: theme.primary }} /><span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.muted }}>Statistiques</span></div>
                <div className="flex justify-between text-[14px] font-medium" style={{ color: theme.muted }}><span>Mois réglés</span><span style={{ color: theme.primary }}>{paiementsAnnee.length} / {moisTotal}</span></div>
                <div className="flex justify-between text-[14px] font-medium mt-1" style={{ color: theme.muted }}><span>Total versé</span><span style={{ color: theme.green }}>{formatMoney(totalPayeAnnee)}</span></div>
                <div className="h-px my-2" style={{ background: theme.border }} />
                <div className="flex justify-between text-[18px] font-bold"><span style={{ color: theme.text }}>Taux</span><span style={{ color: theme.primary }}>{tauxPaiement}%</span></div>
              </div>
            </div>

            <div className="flex-1 border rounded-xl overflow-hidden" style={{ borderColor: theme.border, background: theme.formBg }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: theme.border, background: theme.cellBg }}>
                <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: theme.text }}><Calendar className="w-4 h-4" style={{ color: theme.primary }} />Calendrier des paiements</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => { const newAnnee = anneeCalendrier - 1; if (newAnnee >= anneeEmbauche) { onAnneeChange(newAnnee); onMoisDetailSelect(null, null); } }} className="p-1 rounded-lg transition-all hover:bg-indigo-500/10 disabled:opacity-40" style={{ color: theme.muted }} disabled={anneeCalendrier <= anneeEmbauche}><ChevronLeft className="w-4 h-4" /></button>
                  <span className="text-[14px] font-bold px-3 py-1 rounded-lg border" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.text }}>{anneeCalendrier}</span>
                  <button type="button" onClick={() => { onAnneeChange(anneeCalendrier + 1); onMoisDetailSelect(null, null); }} className="p-1 rounded-lg transition-all hover:bg-indigo-500/10" style={{ color: theme.muted }}><ChevronRight className="w-4 h-4" /></button>
                  <button type="button" onClick={() => { onAnneeChange(new Date().getFullYear()); onMoisDetailSelect(null, null); }} className="px-2.5 py-1 text-[12px] font-bold uppercase tracking-wider rounded-lg transition-all hover:bg-indigo-500/10" style={{ background: theme.primaryBg, color: theme.primary }}>Actuel</button>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {getMoisPourAnnee(employe.date_embauche, anneeCalendrier, moisLabelsCourt).map((item, index) => {
                    const maintenant = new Date();
                    const moisCourant = maintenant.getMonth() + 1;
                    const anneeCourante = maintenant.getFullYear();
                    const estFutur = item.annee > anneeCourante || (item.annee === anneeCourante && item.mois > moisCourant);
                    const paye = isMoisPaye(item.mois, item.annee);
                    const isSelected = selectedMoisDetail === item.mois && selectedMoisDetailAnnee === item.annee;
                    let statusBg = theme.inputBg, statusText = theme.muted, statusIcon = null, statusLabel = '';
                    if (estFutur) { statusBg = 'rgba(0,0,0,0.03)'; statusText = theme.muted; statusIcon = <Clock className="w-3 h-3" style={{ color: theme.muted }} />; statusLabel = 'Futur'; }
                    else if (paye) { statusBg = 'rgba(16,185,129,0.08)'; statusText = theme.green; statusIcon = <CheckCircle className="w-3 h-3" style={{ color: theme.green }} />; statusLabel = 'Payé'; }
                    else { statusBg = 'rgba(245,158,11,0.08)'; statusText = theme.amber; statusIcon = <AlertCircle className="w-3 h-3" style={{ color: theme.amber }} />; statusLabel = 'Impayé'; }
                    return (
                      <button key={index} type="button" onClick={() => { if (estFutur) return; if (isSelected) onMoisDetailSelect(null, null); else onMoisDetailSelect(item.mois, item.annee); }}
                        className={`relative p-2.5 rounded-lg text-center border transition-all duration-200 shadow-sm ${isSelected ? 'ring-2 ring-indigo-500 border-indigo-500 scale-[1.02] shadow-md bg-indigo-500/10' : estFutur ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-[1.02] hover:shadow-md'}`}
                        style={{ background: statusBg, borderColor: isSelected ? theme.primary : theme.border }} disabled={estFutur}>
                        <p className="text-[15px] font-bold" style={{ color: isSelected ? theme.primary : theme.text }}>{item.label}</p>
                        <div className="flex items-center justify-center gap-1 mt-1 text-[11px] font-bold uppercase tracking-wider" style={{ color: statusText }}>{statusIcon}<span>{statusLabel}</span></div>
                        {paye && <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-md"><CheckCircle className="w-2.5 h-2.5 text-white" /></div>}
                        {isSelected && <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center shadow-md"><CheckCircle className="w-2.5 h-2.5 text-white" /></div>}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2.5 mt-3 pt-2.5 border-t text-[11px] font-bold uppercase tracking-wider" style={{ borderColor: theme.border, color: theme.muted }}>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span>Payé</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span>Impayé</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }}></span><span>Futur</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span><span>Sélectionné</span></div>
                </div>
              </div>

              {selectedMoisDetail !== null && selectedMoisDetailAnnee !== null && (
                <div className="border-t" style={{ borderColor: theme.border }}>
                  <FormCell label="Détail de la période" icon={<Calendar size={14} />} borderRight={true} borderBottom={false}>
                    <span className="font-medium text-[15px]" style={{ color: theme.text }}>{moisLabels[selectedMoisDetail - 1]} {selectedMoisDetailAnnee}</span>
                  </FormCell>
                  <div className="flex items-center justify-between px-3 py-2.5 border-t" style={{ borderColor: theme.border, background: theme.formBg }}>
                    {isMoisPaye(selectedMoisDetail, selectedMoisDetailAnnee) ? (
                      <div className="flex items-center gap-3 w-full justify-end">
                        <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 border" style={{ background: 'rgba(16,185,129,0.1)', color: theme.green, borderColor: 'rgba(16,185,129,0.2)' }}><CheckCircle className="w-3.5 h-3.5" />Payé</span>
                        <span className="font-bold text-[15px]" style={{ color: theme.green }}>{formatMoney(getPaiementForMois(selectedMoisDetail, selectedMoisDetailAnnee)?.montant || 0)}</span>
                        {onAnnulerPaiement && <button type="button" onClick={() => { const paiement = getPaiementForMois(selectedMoisDetail, selectedMoisDetailAnnee); if (paiement && window.confirm(`Annuler le paiement de ${moisLabels[selectedMoisDetail - 1]} ${selectedMoisDetailAnnee} (${formatMoney(paiement.montant || 0)}) ?`)) onAnnulerPaiement(paiement.id); }} className="p-1 rounded-lg transition-all hover:bg-rose-500/10" style={{ color: theme.red }}><Trash2 className="w-4 h-4" /></button>}
                      </div>
                    ) : (
                      <div className="flex items-center justify-end w-full"><span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 border" style={{ background: 'rgba(245,158,11,0.1)', color: theme.amber, borderColor: 'rgba(245,158,11,0.2)' }}><AlertCircle className="w-3.5 h-3.5" />Non payé</span></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: theme.border, background: theme.headerBg }}>
          <button type="button" onClick={onPayer} className="px-3 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider text-white transition-all shadow-md inline-flex items-center gap-2 hover:opacity-90 bg-indigo-600"><DollarSign className="w-4 h-4" />Payer un salaire</button>
          <button type="button" onClick={onClose} className="px-3 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all border shadow-sm hover:opacity-80" style={{ background: theme.inputBg, borderColor: theme.border, color: theme.muted }}>Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default EmployesHistoriqueModal;