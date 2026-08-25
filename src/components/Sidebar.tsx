// ============================================================
// src/components/layout/Sidebar.tsx
// ⭐ LIFE'S ART ERP - PREMIUM SIDEBAR
// ⭐ FONT SIZE 13px-15px
// ⭐ FOND COULEUR MITOVY AMIN'NY STAT CARDS DASHBOARD (#111c30)
// ⭐ WIDTH 260px
// ⭐ Role access: admin / manager / user
// ⭐ Dark / Light mode
// ⭐ Collapsible sidebar
// ⭐ Logout confirmation
// ============================================================

import React, { useCallback, useMemo, useState } from 'react';
import { LayoutDashboard, Package, Tags, Users2, Briefcase, DollarSign, ShoppingBag, Truck, FileText, Settings, LogOut, Sun, Moon, X, PanelLeftClose, PanelLeftOpen, CreditCard, Activity, UserCircle, ChevronRight, ShoppingCart, Receipt } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps { user: any; onLogout: () => void; isCollapsed: boolean; setIsCollapsed: (value: boolean) => void; }
interface MenuItem { path: string; icon: React.ElementType; label: string; roles?: ('admin' | 'manager' | 'user')[]; }
interface MenuGroup { id: string; label: string; items: MenuItem[]; }

const menuGroups: MenuGroup[] = [
  { id: 'main', label: 'Principal', items: [{ path: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' }] },
  { id: 'inventory', label: 'Inventaire', items: [
    { path: '/produits', icon: Package, label: 'Produits' },
    { path: '/categories', icon: Tags, label: 'Catégories' },
    { path: '/fournisseurs', icon: Truck, label: 'Fournisseurs' }
  ]},
  { id: 'sales', label: 'Ventes & Achats', items: [
    { path: '/clients', icon: Users2, label: 'Clients' },
    { path: '/commandes', icon: ShoppingBag, label: 'Commandes' },
    { path: '/depenses', icon: DollarSign, label: 'Dépenses' },
    { path: '/ventes', icon: Receipt, label: 'Ventes (Devis/Factures)' },
    { path: '/achats', icon: ShoppingCart, label: 'Achats' }
  ]},
  { id: 'stock', label: 'Stock', items: [
    { path: '/mouvements', icon: Activity, label: 'Mouvements' }
  ]},
  { id: 'hr', label: 'RH', items: [
    { path: '/employes', icon: Briefcase, label: 'Employés' },
    { path: '/paiements', icon: CreditCard, label: 'Paiements', roles: ['admin', 'manager'] }
  ]},
  { id: 'admin', label: 'Administration', items: [
    { path: '/rapports', icon: FileText, label: 'Rapports', roles: ['admin', 'manager'] },
    { path: '/profile', icon: UserCircle, label: 'Mon profil', roles: ['admin', 'manager', 'user'] },
    { path: '/parametres', icon: Settings, label: 'Paramètres', roles: ['admin'] }
  ]}
];

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, isCollapsed, setIsCollapsed }) => {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const isLight = !isDark;

  const userRoleLevel = useMemo(() => {
    const role = String(user?.role || 'user').toLowerCase();
    if (role === 'admin' || role === 'administrateur') return 'admin';
    if (role === 'manager' || role === 'gestionnaire') return 'manager';
    return 'user';
  }, [user]);

  const hasAccess = useCallback((roles?: ('admin' | 'manager' | 'user')[]) => {
    if (!roles || userRoleLevel === 'admin') return true;
    return roles.includes(userRoleLevel as 'admin' | 'manager' | 'user');
  }, [userRoleLevel]);

  const filteredMenuGroups = useMemo(() =>
    menuGroups.map(group => ({ ...group, items: group.items.filter(item => hasAccess(item.roles)) })).filter(group => group.items.length > 0),
    [hasAccess]);

  const isActive = useCallback((path: string) =>
    location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(`${path}/`)),
    [location.pathname]);

  const renderMenuItem = (item: MenuItem) => {
    const active = isActive(item.path);
    return (
      <li key={item.path} className="relative">
        <Link
          to={item.path}
          title={isCollapsed ? item.label : undefined}
          className={`group relative flex items-center gap-3 rounded-xl cursor-pointer select-none transition-all duration-200 ease-out ${isCollapsed ? 'justify-center px-2 py-3' : 'px-3.5 py-2.5'} ${isLight ? (active ? 'bg-white/20 text-white shadow-sm' : 'text-indigo-100 hover:bg-white/15 hover:text-white') : (active ? 'bg-[#1A2638] text-white shadow-sm' : 'text-slate-400 hover:bg-[#111c30] hover:text-white')}`}
        >
          <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full transition-all duration-200 ${active ? (isLight ? 'bg-white opacity-100' : 'bg-[#635BFF] opacity-100') : 'opacity-0'}`} />
          <item.icon
            className={`shrink-0 transition-all duration-200 ${isCollapsed ? 'w-[22px] h-[22px]' : 'w-[18px] h-[18px]'} ${isLight ? (active ? 'text-white' : 'text-indigo-200 group-hover:text-white') : (active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-200')}`}
            strokeWidth={active ? 2.2 : 1.8}
          />
          {!isCollapsed && (
            <>
              <span className={`flex-1 truncate text-[14px] leading-none transition-colors ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
              {active && <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-white/70' : 'text-indigo-400'}`} strokeWidth={2} />}
            </>
          )}
        </Link>
      </li>
    );
  };

  const renderGroup = (group: MenuGroup) => (
    <div key={group.id} className={group.id === 'main' ? 'mt-0' : 'mt-5'}>
      {!isCollapsed && (
        <div className={`px-3.5 mb-2 text-[13px] font-bold uppercase tracking-[0.12em] ${isLight ? 'text-indigo-200' : 'text-slate-600'}`}>
          {group.label}
        </div>
      )}
      <ul className="space-y-1">{group.items.map(renderMenuItem)}</ul>
    </div>
  );

  const handleToggle = useCallback(() => setIsCollapsed(!isCollapsed), [isCollapsed, setIsCollapsed]);

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r transition-all duration-300 ease-in-out ${isLight ? 'bg-indigo-600 border-indigo-500/30' : 'bg-[#111c30] border-white/[0.06]'}`}
        style={{ width: isCollapsed ? '92px' : '260px' }}
      >
        <div className={`relative flex h-[76px] shrink-0 items-center border-b ${isLight ? 'bg-gradient-to-r from-indigo-500/45 via-indigo-500/35 to-indigo-600/40 border-indigo-300/30' : 'bg-[#111c30] border-white/[0.06]'}`}>
          <div className={`pointer-events-none absolute inset-0 ${isLight ? 'bg-[radial-gradient(circle_at_15%_0%,rgba(255,255,255,0.22),transparent_52%)]' : 'bg-transparent'}`} />

          {!isCollapsed ? (
            <div className="relative z-10 flex min-w-0 items-center gap-3 px-4 pr-14">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-sm ${isLight ? 'bg-white border border-white/70' : 'bg-white/5 border border-white/[0.10]'}`}>
                <img src="./images/logo.png" alt="LIFE'S ART" className="h-7 w-7 object-contain" />
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-bold leading-none tracking-tight text-white">LIFE'S ART</div>
                <div className={`mt-1 text-[13px] font-medium tracking-wide ${isLight ? 'text-indigo-100' : 'text-indigo-200/70'}`}>Enterprise</div>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex w-full items-center justify-start pl-3 pr-14">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-sm ${isLight ? 'bg-white border border-white/70' : 'bg-white/5 border border-white/[0.10]'}`}>
                <img src="./images/logo.png" alt="LIFE'S ART" className="h-7 w-7 object-contain" />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleToggle}
            title={isCollapsed ? 'Ouvrir le menu' : 'Réduire le menu'}
            className={`absolute right-2 top-1/2 z-[100] flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg border transition-all duration-200 active:scale-95 ${isLight ? 'bg-indigo-500/20 border-white/10 text-white hover:bg-white/20' : 'bg-white/[0.05] border-white/[0.08] text-slate-300 hover:bg-white/[0.10] hover:text-white'}`}
          >
            {isCollapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" strokeWidth={2.2} /> : <PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={2.2} />}
          </button>
        </div>

        <nav className={`custom-scrollbar flex-1 min-h-0 overflow-x-hidden overflow-y-auto px-3 py-4 ${isLight ? 'custom-scrollbar-light' : 'custom-scrollbar-dark'}`}>
          {filteredMenuGroups.map(renderGroup)}
        </nav>

        <div className={`flex-shrink-0 border-t p-3 ${isLight ? 'border-indigo-500/30' : 'border-white/[0.06]'}`}>
          <div
            title={isCollapsed ? 'Système opérationnel' : undefined}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${isLight ? 'bg-white/15 border-white/20' : 'bg-[#111c30] border-white/[0.06]'} ${isCollapsed ? 'justify-center' : ''}`}
          >
            <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
              <span className={`absolute inset-0 animate-ping rounded-full opacity-50 ${isLight ? 'bg-emerald-300' : 'bg-emerald-500'}`} />
              <span className={`relative h-2 w-2 rounded-full ${isLight ? 'bg-emerald-300' : 'bg-emerald-500'}`} />
            </span>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className={`text-[13px] font-semibold leading-none ${isLight ? 'text-white' : 'text-slate-200'}`}>Système opérationnel</div>
                <div className={`mt-1 text-[13px] leading-none ${isLight ? 'text-indigo-200' : 'text-slate-500'}`}>Tous les systèmes fonctionnent</div>
              </div>
            )}
          </div>

          <div className={`mt-3 border-t pt-2 ${isLight ? 'border-indigo-500/30' : 'border-white/[0.06]'}`}>
            <button
              type="button"
              onClick={toggleTheme}
              title={isCollapsed ? (isDark ? 'Mode clair' : 'Mode sombre') : undefined}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all duration-200 ${isLight ? 'text-indigo-100 hover:bg-white/15 hover:text-white' : 'text-slate-400 hover:bg-[#111c30] hover:text-white'} ${isCollapsed ? 'justify-center' : ''}`}
            >
              {isDark ? <Sun className="h-[17px] w-[17px] shrink-0" /> : <Moon className="h-[17px] w-[17px] shrink-0" />}
              {!isCollapsed && <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>}
            </button>

            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              title={isCollapsed ? 'Se déconnecter' : undefined}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all duration-200 ${isLight ? 'text-indigo-100 hover:bg-red-500/20 hover:text-red-200' : 'text-slate-400 hover:bg-red-500/10 hover:text-red-400'} ${isCollapsed ? 'justify-center' : ''}`}
            >
              <LogOut className="h-[17px] w-[17px] shrink-0" />
              {!isCollapsed && <span>Se déconnecter</span>}
            </button>
          </div>
        </div>

        <style>{`
          .custom-scrollbar { scrollbar-width: auto; scrollbar-gutter: stable; scroll-behavior: smooth; }
          .custom-scrollbar::-webkit-scrollbar { width: 9px; height: 9px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 6px 0; }
          .custom-scrollbar::-webkit-scrollbar-corner { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { min-height: 55px; border-radius: 999px; border: 2px solid transparent; background-clip: padding-box; transition: background .2s ease, border .2s ease; }
          .custom-scrollbar-dark { scrollbar-color: rgba(148,163,184,.45) transparent; }
          .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: rgba(148,163,184,.45); background-clip: padding-box; }
          .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,.68); background-clip: padding-box; border-width: 1px; }
          .custom-scrollbar-dark::-webkit-scrollbar-thumb:active { background: rgba(148,163,184,.85); background-clip: padding-box; border-width: 1px; }
          .custom-scrollbar-light { scrollbar-color: rgba(255,255,255,.52) transparent; }
          .custom-scrollbar-light::-webkit-scrollbar-thumb { background: rgba(255,255,255,.52); background-clip: padding-box; }
          .custom-scrollbar-light::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,.78); background-clip: padding-box; border-width: 1px; }
          .custom-scrollbar-light::-webkit-scrollbar-thumb:active { background: rgba(255,255,255,.92); background-clip: padding-box; border-width: 1px; }
        `}</style>
      </aside>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex animate-fadeIn items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className={`w-full max-w-sm overflow-hidden rounded-2xl border shadow-2xl ${isLight ? 'bg-white border-gray-200' : 'bg-[#0A1222] border-white/[0.08]'}`}>
            <div className="flex items-center justify-center pt-5">
              <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl p-4 ${isLight ? 'bg-white border border-gray-100' : 'bg-white/5 border border-white/[0.08]'}`}>
                <img src="./images/logo.png" alt="LIFE'S ART" className="h-12 w-12 object-contain" />
              </div>
            </div>

            <div className={`flex items-center justify-between border-b px-5 py-4 ${isLight ? 'border-gray-100' : 'border-white/[0.06]'}`}>
              <div>
                <h2 className={`text-[15px] font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Déconnexion</h2>
                <p className={`mt-0.5 text-[13px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Confirmation de votre session</p>
              </div>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors ${isLight ? 'text-slate-400 hover:bg-gray-100 hover:text-slate-900' : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-5 py-5">
              <p className={`text-[14px] font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Êtes-vous sûr de vouloir vous déconnecter ?</p>
              <p className={`mt-1.5 text-[13px] leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Vous devrez entrer vos identifiants pour vous reconnecter.</p>
            </div>

            <div className={`flex gap-2.5 border-t px-5 py-4 ${isLight ? 'border-gray-100 bg-gray-50/50' : 'border-white/[0.06] bg-[#0A1222]/80'}`}>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className={`flex-1 cursor-pointer rounded-xl border px-4 py-2.5 text-[13px] font-medium transition-colors ${isLight ? 'border-gray-300 text-slate-700 hover:bg-gray-100' : 'border-gray-800 text-slate-300 hover:bg-white/[0.06]'}`}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => { setShowLogoutModal(false); onLogout(); }}
                className="flex-1 cursor-pointer rounded-xl bg-red-600 px-4 py-2.5 text-[13px] font-semibold text-white transition-all duration-200 hover:bg-red-700 active:scale-[0.98]"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;