// src/components/depenses/DepensesStats/StatsCard.tsx

import React from 'react';
import { TrendingUp, TrendingDown as TrendingDownIcon } from 'lucide-react';
import { StatType } from '../DepensesStats';

interface StatItem {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  colorHex: string;
  evolution: number;
  statType: StatType;
  sub?: string;
}

interface StatsCardProps {
  stat: StatItem;
  isDark: boolean;
  curveImage: string;
  colors: {
    card: string;
    border: string;
    text: string;
    muted: string;
  };
  hexToRgba: (color: string, alpha: number) => string;
  onCardClick: (statType: StatType) => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  stat,
  isDark,
  curveImage,
  colors,
  hexToRgba,
  onCardClick,
}) => {
  const isPositive = stat.evolution >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDownIcon;
  const trendColor = isPositive ? 'text-emerald-500' : 'text-red-500';

  const cardBg = isDark
    ? colors.card
    : hexToRgba(stat.color, 0.08);

  const iconBg = isDark
    ? 'rgba(255,255,255,0.05)'
    : 'rgba(255,255,255,0.7)';

  return (
    <div
      onClick={() => onCardClick(stat.statType)}
      className="group relative rounded-xl p-4 border shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.01] cursor-pointer overflow-hidden"
      style={{
        background: cardBg,
        borderColor: 'rgba(99,102,241,0.12)',
        boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.04)',
        position: 'relative',
        overflow: 'hidden',
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCardClick(stat.statType);
        }
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${curveImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: isDark ? 0.08 : 0.10,
          filter: 'blur(1px)',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? `radial-gradient(circle at 30% 20%, ${hexToRgba(stat.colorHex, 0.05)}, transparent 70%)`
            : `radial-gradient(circle at 30% 20%, ${hexToRgba(stat.colorHex, 0.03)}, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="p-2 rounded-lg" style={{ background: iconBg, border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}` }}>
            <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
          </div>
          <span className={`text-xs flex items-center gap-1 font-medium ${trendColor}`}>
            <TrendIcon className="w-3 h-3" />
            {isPositive ? '+' : ''}{stat.evolution}%
          </span>
        </div>
        <p className="text-2xl font-bold mt-2" style={{ color: colors.text }}>
          {stat.value}
        </p>
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>
          {stat.label}
        </p>
        {stat.sub && (
          <p className="text-[10px] mt-0.5" style={{ color: colors.muted }}>
            {stat.sub}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;