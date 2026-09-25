import React from 'react';
import { Calendar, Table2, Plane, BarChart3, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export type TabKey = 'matchcenter' | 'schedule' | 'calendar' | 'absences' | 'stats' | 'admin';

interface NavigationTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {
  const { theme, absences, swaps, currentUser } = useApp();

  const tabs: Array<{ id: TabKey; label: string; icon: React.ReactNode; badge?: number }> = [
    {
      id: 'matchcenter',
      label: 'Wochenplan',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'schedule',
      label: 'Gesamtplan',
      icon: <Table2 className="w-4 h-4" />,
    },
    {
      id: 'calendar',
      label: 'Kalender',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'absences',
      label: 'Urlaub / Abwesend',
      icon: <Plane className="w-4 h-4" />,
      badge: absences.length > 0 ? absences.length : undefined,
    },
    {
      id: 'stats',
      label: 'Statistiken',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'admin',
      label: 'Verwaltung',
      icon: <Shield className="w-4 h-4" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 pb-[env(safe-area-inset-bottom)] sm:relative sm:border-0 sm:bg-transparent sm:dark:bg-transparent sm:backdrop-blur-none sm:pb-0 w-full flex items-center justify-center sm:py-2 sm:px-4">
      <div className="w-full sm:max-w-2xl sm:bg-neutral-100 sm:dark:bg-[var(--md-sys-color-surface)]/80 sm:p-1.5 sm:rounded-2xl flex items-center justify-between sm:justify-center space-x-0 sm:space-x-1 sm:border sm:border-neutral-200/60 sm:dark:border-neutral-800 sm:shadow-xs px-1 py-1 sm:px-0 sm:py-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 sm:py-2 px-1 sm:px-3 rounded-xl text-[10px] sm:text-sm font-semibold transition-all m3-ripple relative ${
                isActive
                  ? 'text-neutral-900 dark:text-neutral-100 sm:bg-white sm:dark:bg-neutral-800 sm:shadow-sm'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 sm:hover:bg-neutral-200/50 sm:dark:hover:bg-neutral-800/50'
              }`}
            >
              <span 
                className="transition-colors flex items-center justify-center w-5 h-5 sm:w-4 sm:h-4 mx-auto sm:mx-0"
                style={{ color: isActive ? theme.primary : undefined }}
              >
                {tab.icon}
              </span>
              <span className="truncate w-full text-center sm:w-auto">{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="absolute top-0 right-2 sm:static sm:ml-1 text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold border-2 border-white dark:border-neutral-900 sm:border-0">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <button onClick={() => window.dispatchEvent(new CustomEvent('open-impressum'))} className="absolute -top-6 left-1/2 -translate-x-1/2 sm:static sm:mt-2 text-[9px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">Impressum & Datenschutz</button>
    </nav>
  );
};
