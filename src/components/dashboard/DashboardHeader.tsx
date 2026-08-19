// src/components/dashboard/DashboardHeader.tsx - GOOGLE-LIKE PROFESSIONAL UI
import React, { useState } from 'react';
import { Calendar, ChevronDown, LayoutDashboard } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';

type TimeRange = 'mois' | 'trimestre' | 'annee';

interface DashboardHeaderProps {
  selectedDate: Date;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  selectedDate, 
  timeRange, 
  onTimeRangeChange 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getDateRangeString = (date: Date, range: TimeRange) => {
    let start, end;
    switch (range) {
      case 'mois':
        start = startOfMonth(date);
        end = endOfMonth(date);
        break;
      case 'trimestre':
        start = startOfQuarter(date);
        end = endOfQuarter(date);
        break;
      case 'annee':
        start = startOfYear(date);
        end = endOfYear(date);
        break;
      default:
        start = startOfMonth(date);
        end = endOfMonth(date);
    }
    return `${format(start, 'dd MMM yyyy', { locale: fr })} - ${format(end, 'dd MMM yyyy', { locale: fr })}`;
  };

  const displayRange = getDateRangeString(selectedDate, timeRange);

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-indigo-600 text-white shadow-sm">
          <LayoutDashboard size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Tableau de bord
          </h1>
          <p className="text-[14.5px] font-medium text-slate-500 dark:text-slate-400">
            Vue d'ensemble de votre activité
          </p>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#020617] px-4 py-2.5 text-[14.5px] font-medium text-slate-700 dark:text-slate-200 shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Calendar size={16} className="text-slate-400 dark:text-slate-500" />
          <span>{displayRange}</span>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 z-20 mt-2 w-40 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#020617] py-1 shadow-xl overflow-hidden">
            {(['mois', 'trimestre', 'annee'] as TimeRange[]).map((option) => (
              <button
                key={option}
                onClick={() => {
                  onTimeRangeChange(option);
                  setIsDropdownOpen(false);
                }}
                className={`block w-full px-4 py-2.5 text-left text-[14.5px] font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  timeRange === option
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {option === 'mois' && 'Mois'}
                {option === 'trimestre' && 'Trimestre'}
                {option === 'annee' && 'Année'}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;