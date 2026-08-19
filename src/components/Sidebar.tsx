// src/components/layout/Sidebar.tsx
import React, { useCallback, useMemo, useState } from 'react';
import { LayoutDashboard, Package, Tags, Users2, Briefcase, DollarSign, ShoppingBag, Truck, FileText, Settings, LogOut, Sun, Moon, X, PanelLeftClose, PanelLeftOpen, CreditCard, Activity, ArrowUp, ArrowDown, UserCircle, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps { user: any; onLogout: () => void; isCollapsed: boolean; setIsCollapsed: (value: boolean) => void; }
interface MenuItem { path: string; icon: React.ElementType; label: string; roles?: ('admin' | 'manager' | 'user')[]; }
interface MenuGroup { id: string; label: string; items: MenuItem[]; }

const menuGroups: MenuGroup[] = [
  { id: 'main', label: 'Principal', items: [{ path: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' }] },
  { id: 'inventory', label: 'Inventaire', items: [{ path: '/produits', icon: Package, label: 'Produits' }, { path: '/categories', icon: Tags, label: 'Catégories' }, { path: '/fournisseurs', icon: Truck, label: 'Fournisseurs' }] },
  { id: 'sales', label: 'Ventes', items: [{ path: '/clients', icon: Users2, label: 'Clients' }, { path: '/commandes', icon: ShoppingBag, label: 'Commandes' }, { path: '/depenses', icon: DollarSign, label: 'Dépenses' }] },
  { id: 'stock', label: 'Stock', items: [{ path: '/entrees', icon: ArrowDown, label: 'Entrées' }, { path: '/sorties', icon: ArrowUp, label: 'Sorties' }, { path: '/mouvements', icon: Activity, label: 'Mouvements' }] },
  { id: 'hr', label: 'RH', items: [{ path: '/employes', icon: Briefcase, label: 'Employés' }, { path: '/paiements', icon: CreditCard, label: 'Paiements', roles: ['admin', 'manager'] }] },
  { id: 'admin', label: 'Administration', items: [{ path: '/rapports', icon: FileText, label: 'Rapports', roles: ['admin', 'manager'] }, { path: '/profile', icon: UserCircle, label: 'Mon profil', roles: ['admin', 'manager', 'user'] }, { path: '/parametres', icon: Settings, label: 'Paramètres', roles: ['admin'] }] },
];

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, isCollapsed, setIsCollapsed }) => {
  const { isDark, toggleTheme } = useTheme(); const location = useLocation(); const [showLogoutModal, setShowLogoutModal] = useState(false); const isLight = !isDark;
  const userRoleLevel = useMemo(() => { const role = user?.role?.toLowerCase() || 'user'; if (role === 'admin' || role === 'administrateur') return 'admin'; if (role === 'manager' || role === 'gestionnaire') return 'manager'; return 'user'; }, [user]);
  const hasAccess = useCallback((roles?: ('admin' | 'manager' | 'user')[]) => { if (!roles) return true; if (userRoleLevel === 'admin') return true; return roles.includes(userRoleLevel as 'admin' | 'manager' | 'user'); }, [userRoleLevel]);
  const filteredMenuGroups = useMemo(() => menuGroups.map((group) => ({ ...group, items: group.items.filter((item) => hasAccess(item.roles)) })).filter((group) => group.items.length > 0), [hasAccess]);
  const isActive = useCallback((path: string) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(`${path}/`)), [location.pathname]);
  const handleToggle = useCallback(() => setIsCollapsed(!isCollapsed), [isCollapsed, setIsCollapsed]);

  const renderMenuItem = (item: MenuItem) => {
    const active = isActive(item.path);
    return (<li key={item.path} className="relative"><Link to={item.path} title={isCollapsed ? item.label : undefined} className={`group relative flex items-center gap-3 rounded-xl transition-all duration-200 ease-out cursor-pointer select-none ${isCollapsed ? 'justify-center px-2 py-3' : 'px-3.5 py-2.5'} ${isLight ? active ? 'bg-white/20 text-white shadow-sm' : 'text-indigo-100 hover:bg-white/15 hover:text-white' : active ? 'bg-[#1A2638] text-white shadow-sm' : 'text-slate-400 hover:bg-[#111c30] hover:text-white'}`}>
      <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full transition-all duration-200 ${active ? (isLight ? 'bg-white opacity-100' : 'bg-[#635BFF] opacity-100') : 'opacity-0'}`} />
      <item.icon className={`shrink-0 transition-all duration-200 ${isCollapsed ? 'w-[22px] h-[22px]' : 'w-[18px] h-[18px]'} ${isLight ? (active ? 'text-white' : 'text-indigo-200 group-hover:text-white') : (active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-200')}`} strokeWidth={active ? 2.2 : 1.8} />
      {!isCollapsed && (<><span className={`flex-1 truncate text-[14.5px] leading-none transition-colors ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>{active && <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-white/70' : 'text-indigo-400'}`} strokeWidth={2} />}</>)}
    </Link></li>);
  };

  const renderGroup = (group: MenuGroup) => (<div key={group.id} className={group.id === 'main' ? 'mt-0' : 'mt-5'}>
    {!isCollapsed && (<div className={`px-3.5 mb-2 text-[12px] font-bold uppercase tracking-[0.12em] ${isLight ? 'text-indigo-200' : 'text-slate-600'}`}>{group.label}</div>)}
    <ul className="space-y-1">{group.items.map((item) => renderMenuItem(item))}</ul>
  </div>);

  return (<>
    <aside className={`fixed left-0 top-0 h-screen flex flex-col z-50 transition-all duration-300 ease-in-out border-r ${isLight ? 'bg-indigo-600 border-indigo-500/30' : 'bg-[#0A1222] border-white/[0.06]'}`} style={{ width: isCollapsed ? '92px' : '260px' }}>
      
      <div className={`relative flex items-center h-[76px] shrink-0 border-b ${isLight ? 'bg-gradient-to-r from-indigo-500/45 via-indigo-500/35 to-indigo-600/40 border-indigo-300/30' : 'bg-[#0A1222] border-white/[0.06]'}`}>
        <div className={`pointer-events-none absolute inset-0 ${isLight ? 'bg-[radial-gradient(circle_at_15%_0%,rgba(255,255,255,0.22),transparent_52%)]' : 'bg-transparent'}`} />
        
        {!isCollapsed ? (<div className="relative z-10 flex items-center gap-3 min-w-0 px-4 pr-14"><div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-sm ${isLight ? 'bg-white border border-white/70' : 'bg-white/5 border border-white/[0.10]'}`}><img src="./images/logo.png" alt="LIFE'S ART" className="w-7 h-7 object-contain" /></div><div className="min-w-0"><div className="text-[15px] font-bold tracking-tight leading-none text-white">LIFE'S ART</div><div className={`mt-1 text-[13px] font-medium tracking-wide ${isLight ? 'text-indigo-100' : 'text-indigo-200/70'}`}>Enterprise</div></div></div>) : (<div className="relative z-10 flex items-center justify-start pl-3 pr-14 w-full"><div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-sm ${isLight ? 'bg-white border border-white/70' : 'bg-white/5 border border-white/[0.10]'}`}><img src="./images/logo.png" alt="LIFE'S ART" className="w-7 h-7 object-contain" /></div></div>)}
        <button type="button" onClick={handleToggle} title={isCollapsed ? 'Ouvrir le menu' : 'Réduire le menu'} className={`absolute z-[100] right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-200 cursor-pointer ${isLight ? 'text-white bg-indigo-500/20 border-white/10 hover:bg-white/20 hover:text-white active:scale-95' : 'text-slate-300 bg-white/[0.05] border-white/[0.08] hover:bg-white/[0.10] hover:text-white active:scale-95'}`}>{isCollapsed ? <PanelLeftOpen className="w-[18px] h-[18px] shrink-0" strokeWidth={2.2} /> : <PanelLeftClose className="w-[18px] h-[18px] shrink-0" strokeWidth={2.2} />}</button>
      </div>
      
      <nav className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-4 custom-scrollbar ${isLight ? 'custom-scrollbar-light' : 'custom-scrollbar-dark'}`}>{filteredMenuGroups.map((group) => renderGroup(group))}</nav>
      <div className={`flex-shrink-0 p-3 border-t ${isLight ? 'border-indigo-500/30' : 'border-white/[0.06]'}`}>
        <div title={isCollapsed ? 'Système opérationnel' : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${isLight ? 'bg-white/15 border border-white/20' : 'bg-[#111c30] border border-white/[0.06]'} ${isCollapsed ? 'justify-center' : ''}`}>
          <span className="relative flex items-center justify-center w-2 h-2 shrink-0"><span className={`absolute inset-0 rounded-full animate-ping opacity-50 ${isLight ? 'bg-emerald-300' : 'bg-emerald-500'}`} /><span className={`relative w-2 h-2 rounded-full ${isLight ? 'bg-emerald-300' : 'bg-emerald-500'}`} /></span>
          {!isCollapsed && (<div className="min-w-0"><div className={`text-[13px] font-semibold leading-none ${isLight ? 'text-white' : 'text-slate-200'}`}>Système opérationnel</div><div className={`mt-1 text-[11px] leading-none ${isLight ? 'text-indigo-200' : 'text-slate-500'}`}>Tous les systèmes fonctionnent</div></div>)}
        </div>
        <div className={`mt-3 pt-2 border-t ${isLight ? 'border-indigo-500/30' : 'border-white/[0.06]'}`}>
          <button type="button" onClick={toggleTheme} title={isCollapsed ? (isDark ? 'Mode clair' : 'Mode sombre') : undefined} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all duration-200 cursor-pointer ${isLight ? 'text-indigo-100 hover:bg-white/15 hover:text-white' : 'text-slate-400 hover:bg-[#111c30] hover:text-white'} ${isCollapsed ? 'justify-center' : ''}`}>{isDark ? <Sun className="w-[17px] h-[17px] shrink-0" /> : <Moon className="w-[17px] h-[17px] shrink-0" />}{!isCollapsed && <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>}</button>
          <button type="button" onClick={() => setShowLogoutModal(true)} title={isCollapsed ? 'Se déconnecter' : undefined} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all duration-200 cursor-pointer ${isLight ? 'text-indigo-100 hover:bg-red-500/20 hover:text-red-200' : 'text-slate-400 hover:bg-red-500/10 hover:text-red-400'} ${isCollapsed ? 'justify-center' : ''}`}><LogOut className="w-[17px] h-[17px] shrink-0" />{!isCollapsed && <span>Se déconnecter</span>}</button>
        </div>
      </div>
      <style>{`
        .custom-scrollbar { scrollbar-width: auto; scrollbar-gutter: stable; scroll-behavior: smooth; }
        .custom-scrollbar::-webkit-scrollbar { width: 9px; height: 9px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 6px 0; }
        .custom-scrollbar::-webkit-scrollbar-corner { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { min-height: 55px; border-radius: 999px; border: 2px solid transparent; background-clip: padding-box; transition: background 0.2s ease, border 0.2s ease; }
        .custom-scrollbar-dark { scrollbar-color: rgba(148, 163, 184, 0.45) transparent; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.45); background-clip: padding-box; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.68); background-clip: padding-box; border-width: 1px; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:active { background: rgba(148, 163, 184, 0.85); background-clip: padding-box; border-width: 1px; }
        .custom-scrollbar-light { scrollbar-color: rgba(255, 255, 255, 0.52) transparent; }
        .custom-scrollbar-light::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.52); background-clip: padding-box; }
        .custom-scrollbar-light::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.78); background-clip: padding-box; border-width: 1px; }
        .custom-scrollbar-light::-webkit-scrollbar-thumb:active { background: rgba(255, 255, 255, 0.92); background-clip: padding-box; border-width: 1px; }
      `}</style>
    </aside>
    {showLogoutModal && (<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"><div className={`w-full max-w-sm overflow-hidden rounded-2xl border shadow-2xl ${isLight ? 'bg-white border-gray-200' : 'bg-[#0A1222] border-white/[0.08]'}`}>
      <div className="flex items-center justify-center pt-5"><div className={`rounded-xl p-4 flex items-center justify-center shrink-0 overflow-hidden ${isLight ? 'bg-white border border-gray-100' : 'bg-white/5 border border-white/[0.08]'}`}><img src="./images/logo.png" alt="LIFE'S ART" className="w-12 h-12 object-contain" /></div></div>
      <div className={`flex items-center justify-between px-5 py-4 border-b ${isLight ? 'border-gray-100' : 'border-white/[0.06]'}`}><div><h2 className={`text-[16px] font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Déconnexion</h2><p className={`mt-0.5 text-[13px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Confirmation de votre session</p></div><button type="button" onClick={() => setShowLogoutModal(false)} className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer ${isLight ? 'text-slate-400 hover:text-slate-900 hover:bg-gray-100' : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'}`}><X className="w-4 h-4" /></button></div>
      <div className="px-5 py-5"><p className={`text-[14.5px] font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Êtes-vous sûr de vouloir vous déconnecter ?</p><p className={`mt-1.5 text-[13px] leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Vous devrez entrer vos identifiants pour vous reconnecter.</p></div>
      <div className={`flex gap-2.5 px-5 py-4 border-t ${isLight ? 'border-gray-100 bg-gray-50/50' : 'border-white/[0.06] bg-[#0A1222]/80'}`}>
        <button type="button" onClick={() => setShowLogoutModal(false)} className={`flex-1 px-4 py-2.5 rounded-xl border text-[14px] font-medium transition-colors cursor-pointer ${isLight ? 'border-gray-300 text-slate-700 hover:bg-gray-100' : 'border-gray-800 text-slate-300 hover:bg-white/[0.06]'}`}>Annuler</button>
        <button type="button" onClick={() => { setShowLogoutModal(false); onLogout(); }} className="flex-1 px-4 py-2.5 rounded-xl text-white text-[14.5px] font-semibold transition-all duration-200 cursor-pointer bg-red-600 hover:bg-red-700 active:scale-[0.98]">Se déconnecter</button>
      </div>
    </div></div>)}
  </>);
};
export default Sidebar;