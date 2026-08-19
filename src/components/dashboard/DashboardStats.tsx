import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PALETTE = ['#6366F1', '#10B981', '#F59E0B', '#3B82F6'];

interface StatItem {
  label: string;
  value: string | number;
  icon: React.ElementType;
  evolution?: number;
  color?: string;
  path?: string;
}

interface DashboardStatsProps { stats?: StatItem[]; }

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats = [] }) => {
  const navigate = useNavigate();

  const handleClick = (path?: string) => {
    if (path) navigate(path);
  };

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map((item, index) => {
        const color = item.color || PALETTE[index % PALETTE.length];
        const evolution = Number(item.evolution ?? 0);
        const positive = evolution >= 0;
        const clickable = Boolean(item.path);

        return (
          <div key={`${item.label}-${index}`} onClick={() => handleClick(item.path)} role={clickable ? 'button' : undefined} tabIndex={clickable ? 0 : undefined}
            onKeyDown={e => { if (clickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); handleClick(item.path); } }}
            className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${clickable ? 'cursor-pointer' : ''}`}
            style={{ background: '#111B2E', borderColor: '#1F2D45' }}>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${color}20`, color }}>
                <item.icon size={21} strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#64748B' }}>{item.label}</p>
                <p className="mt-1 truncate text-[20px] font-bold tracking-tight" style={{ color: '#F8FAFC' }}>{item.value ?? 0}</p>
                {item.evolution !== undefined && (
                  <div className={`mt-1 flex items-center gap-1 text-[11px] font-medium ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    <span>{positive ? '+' : ''}{evolution.toFixed(1)}%</span>
                    <span style={{ color: '#64748B' }}>vs mois dernier</span>
                  </div>
                )}
              </div>
            </div>
            <div className="pointer-events-none absolute bottom-0 right-0 h-12 w-28 opacity-50">
              <svg width="100%" height="100%" viewBox="0 0 150 35" preserveAspectRatio="none">
                <path d="M0 27 C15 22,20 30,35 19 S55 29,72 17 S92 25,110 12 S130 19,150 6" fill="none" stroke={color} strokeWidth="2" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;