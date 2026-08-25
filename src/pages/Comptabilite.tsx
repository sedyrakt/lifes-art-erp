// src/pages/Comptabilite.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Plus, Search, RefreshCw, BookOpen, Edit, Trash2, X } from 'lucide-react';

const Comptabilite: React.FC = () => {
  const { isDark } = useTheme();
  const [comptes, setComptes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingCompte, setEditingCompte] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [formData, setFormData] = useState({
    numero: '',
    nom: '',
    type: 'actif',
    solde_initial: 0,
    description: '',
  });

  const loadComptes = useCallback(async () => {
    try {
      setLoading(true);
      const result = await window.api.comptabilite.getComptes();
      if (result?.success) setComptes(result.data || []);
    } catch (err) {
      console.error('Erreur chargement comptes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadComptes(); }, [loadComptes]);

  const resetForm = () => {
    setFormData({
      numero: '',
      nom: '',
      type: 'actif',
      solde_initial: 0,
      description: '',
    });
    setEditingCompte(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (compte: any) => {
    setEditingCompte(compte);
    setFormData({
      numero: compte.numero || '',
      nom: compte.nom || '',
      type: compte.type || 'actif',
      solde_initial: compte.solde_initial || 0,
      description: compte.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCompte) {
        const result = await window.api.comptabilite.updateCompte(editingCompte.id, formData);
        if (result?.success) {
          setShowModal(false);
          setShowSuccessModal(true);
          loadComptes();
          resetForm();
        }
      } else {
        const result = await window.api.comptabilite.createCompte(formData);
        if (result?.success) {
          setShowModal(false);
          setShowSuccessModal(true);
          loadComptes();
          resetForm();
        }
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await window.api.comptabilite.deleteCompte(deleteTarget.id);
      if (result?.success) {
        setShowDeleteModal(false);
        setShowSuccessModal(true);
        loadComptes();
      }
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert(err.message);
    }
  };

  const inputClass = `h-10 w-full rounded-lg border px-3 text-[14px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 ${isDark ? 'border-slate-700 bg-[#0F172A] text-slate-100' : 'border-gray-300 bg-white text-slate-900'}`;

  return (
    <div className="min-h-full w-full px-4 py-6" style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}>
      <div className="mx-auto max-w-[1600px]">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="text-[22px] font-bold text-slate-900 dark:text-white">Comptabilité</h1>
              <p className="text-[14px] text-slate-500 dark:text-slate-400">Gestion des comptes, journaux et bilan</p>
            </div>
          </div>
          <button type="button" onClick={openCreateModal} className="flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-[14px] font-semibold text-white hover:bg-indigo-700">
            <Plus size={18} />Nouveau compte
          </button>
        </header>

        {/* Search */}
        <div className="mt-6 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un compte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={inputClass}
            />
          </div>
          <button type="button" onClick={loadComptes} className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-[#111c30] dark:hover:bg-slate-800">
            <RefreshCw size={16} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#111c30]">
            <p className="text-[12px] font-semibold uppercase text-slate-500 dark:text-slate-400">Actif</p>
            <p className="mt-1 text-[20px] font-bold text-slate-900 dark:text-white">0 Ar</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#111c30]">
            <p className="text-[12px] font-semibold uppercase text-slate-500 dark:text-slate-400">Passif</p>
            <p className="mt-1 text-[20px] font-bold text-slate-900 dark:text-white">0 Ar</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#111c30]">
            <p className="text-[12px] font-semibold uppercase text-slate-500 dark:text-slate-400">Produits</p>
            <p className="mt-1 text-[20px] font-bold text-slate-900 dark:text-white">0 Ar</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#111c30]">
            <p className="text-[12px] font-semibold uppercase text-slate-500 dark:text-slate-400">Charges</p>
            <p className="mt-1 text-[20px] font-bold text-slate-900 dark:text-white">0 Ar</p>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-[#111c30]">
          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <RefreshCw size={24} className="animate-spin text-indigo-500" />
            </div>
          ) : comptes.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center">
              <BookOpen size={32} className="text-slate-400" />
              <p className="mt-2 text-slate-500">Aucun compte trouvé</p>
            </div>
          ) : (
            <table className="w-full min-w-[800px] text-left">
              <thead className="border-b border-slate-200 dark:border-slate-700">
                <tr className="text-[12px] font-semibold uppercase text-slate-500 dark:text-slate-400">
                  <th className="px-4 py-3">Numéro</th>
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Solde</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {comptes.map((compte) => (
                  <tr key={compte.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3 font-mono text-[14px]">{compte.numero}</td>
                    <td className="px-4 py-3 text-[14px]">{compte.nom}</td>
                    <td className="px-4 py-3 text-[14px]">{compte.type}</td>
                    <td className="px-4 py-3 text-right text-[14px] font-bold">{compte.solde_initial} Ar</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => openEditModal(compte)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600">
                          <Edit size={16} />
                        </button>
                        <button type="button" onClick={() => { setDeleteTarget(compte); setShowDeleteModal(true); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL CREATE/EDIT */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl ${isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between border-b px-6 py-4 dark:border-white/[0.06]">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900 dark:text-white">
                  {editingCompte ? 'Modifier compte' : 'Nouveau compte'}
                </h2>
                <p className="text-[13px] text-slate-500">Gestion des comptes comptables</p>
              </div>
              <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-700 dark:text-slate-300">Numéro *</label>
                <input
                  type="text"
                  required
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="Ex: 512"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-700 dark:text-slate-300">Nom *</label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Banque"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-700 dark:text-slate-300">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={inputClass}
                >
                  <option value="actif">Actif</option>
                  <option value="passif">Passif</option>
                  <option value="produit">Produit</option>
                  <option value="charge">Charge</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-700 dark:text-slate-300">Solde initial</label>
                <input
                  type="number"
                  value={formData.solde_initial}
                  onChange={(e) => setFormData({ ...formData, solde_initial: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={`w-full rounded-lg border px-3 py-2 text-[14px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 ${isDark ? 'border-slate-700 bg-[#0F172A] text-slate-100' : 'border-gray-300 bg-white text-slate-900'}`}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t dark:border-white/[0.06]">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 rounded-lg border text-[14px] font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.06]">
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-[14px] font-semibold text-white hover:bg-indigo-700">
                  {editingCompte ? 'Mettre à jour' : 'Créer compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-sm overflow-hidden rounded-2xl border shadow-2xl ${isDark ? 'bg-[#0F172A] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/10">
                <Trash2 size={20} className="text-rose-600" />
              </div>
              <h2 className="text-[16px] font-bold text-slate-900 dark:text-white">Supprimer ce compte ?</h2>
              <p className="mt-2 text-[14px] text-slate-500">Cette action est irréversible.</p>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 rounded-lg border text-[14px] font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.06]">
                Annuler
              </button>
              <button type="button" onClick={handleDelete} className="flex-1 px-4 py-2 rounded-lg bg-rose-600 text-[14px] font-semibold text-white hover:bg-rose-700">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border bg-white p-6 text-center shadow-2xl dark:bg-[#0F172A] dark:border-white/[0.08]">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/10">
              <span className="text-[20px]">✅</span>
            </div>
            <h2 className="text-[16px] font-bold text-slate-900 dark:text-white">Opération réussie !</h2>
            <p className="mt-2 text-[14px] text-slate-500">Le compte a été enregistré avec succès.</p>
            <button type="button" onClick={() => setShowSuccessModal(false)} className="mt-4 w-full px-4 py-2 rounded-lg bg-indigo-600 text-[14px] font-semibold text-white hover:bg-indigo-700">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comptabilite;