import React, { useMemo } from 'react';
import { AlertTriangle, PackageX, Bell, CheckCircle, Clock } from 'lucide-react';

interface AlertItem {
  id?: number | string;
  nom?: string;
  produit_nom?: string;
  code?: string;
  produit_code?: string;
  quantite_stock?: number | string;
  quantite_minimale?: number | string;
  statut_stock?: string;
}

interface DashboardAlertsProps {
  alerts?: AlertItem[];
  totalAlertes?: number;
}

const DashboardAlerts: React.FC<DashboardAlertsProps> = ({ alerts = [], totalAlertes = 0 }) => {
  const notifications = useMemo(() => {
    return (alerts || []).filter(item => {
      const stock = Number(item?.quantite_stock ?? 0);
      const minimum = Number(item?.quantite_minimale ?? 0);
      return item?.statut_stock === 'rupture' || item?.statut_stock === 'alerte' || stock <= 0 || (minimum > 0 && stock <= minimum);
    }).slice(0, 5).map((item, index) => {
      const stock = Number(item?.quantite_stock ?? 0);
      const minimum = Number(item?.quantite_minimale ?? 0);
      const rupture = stock <= 0 || item?.statut_stock === 'rupture';
      const nom = item?.nom || item?.produit_nom || 'Produit';
      return {
        id: `stock-${item?.id ?? index}`,
        type: rupture ? 'danger' : 'warning',
        icon: rupture ? PackageX : AlertTriangle,
        title: rupture ? 'Rupture de stock' : 'Stock faible',
        description: rupture ? `${nom} — aucun stock disponible` : `${nom} — ${stock} unité(s) restante(s), minimum ${minimum}`,
        time: '',
      };
    });
  }, [alerts]);

  const getTypeStyles = (type: string) => {
    if (type === 'danger') return { background: 'rgba(244,63,94,.12)', color: '#FB7185' };
    return { background: 'rgba(245,158,11,.12)', color: '#FBBF24' };
  };

  return (
    <div className="overflow-hidden rounded-xl border" style={{ background: '#111B2E', borderColor: '#1F2D45' }}>
      <div className="flex items-center justify-between border-b px-4 py-3.5" style={{ borderColor: '#1F2D45' }}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'rgba(244,63,94,.10)', color: '#FB7185' }}>
            <Bell size={15} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-[14.5px] font-semibold" style={{ color: '#F8FAFC' }}>Alertes & Notifications</h2>
            <p className="mt-0.5 text-[11px]" style={{ color: '#64748B' }}>État du stock</p>
          </div>
        </div>
        <span className="text-[12px] font-medium" style={{ color: '#818CF8' }}>{totalAlertes} alerte(s)</span>
      </div>

      {notifications.length === 0 ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'rgba(16,185,129,.10)', color: '#34D399' }}>
            <CheckCircle size={18} />
          </div>
          <p className="text-[14px] font-medium" style={{ color: '#94A3B8' }}>Aucune alerte</p>
          <p className="mt-1 text-[11px]" style={{ color: '#64748B' }}>Tout fonctionne normalement</p>
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: '#1A2940' }}>
          {notifications.map(notification => {
            const Icon = notification.icon;
            const styles = getTypeStyles(notification.type);
            return (
              <div key={notification.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.025]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: styles.background, color: styles.color }}>
                  <Icon size={14} strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold" style={{ color: '#E2E8F0' }}>{notification.title}</p>
                  <p className="mt-0.5 truncate text-[11px]" style={{ color: '#64748B' }}>{notification.description}</p>
                </div>
                {notification.time && (
                  <div className="flex shrink-0 items-center gap-1 text-[10px]" style={{ color: '#475569' }}>
                    <Clock size={9} />
                    {notification.time}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between border-t px-4 py-2.5" style={{ borderColor: '#1F2D45', background: '#0D1729' }}>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[11px]" style={{ color: '#64748B' }}>Système opérationnel</span>
        </div>
        <span className="text-[11px]" style={{ color: '#475569' }}>{totalAlertes > 0 ? `${totalAlertes} alerte(s)` : 'Aucune alerte critique'}</span>
      </div>
    </div>
  );
};

export default DashboardAlerts;