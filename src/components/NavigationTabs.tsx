import React from 'react';
import { Calendar, Table2, Plane, BarChart3, Shield, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export type TabKey = 'matchcenter' | 'schedule' | 'calendar' | 'absences' | 'stats' | 'help' | 'admin';

interface NavigationTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {
  const { theme, absences, currentUser } = useApp();

  const tabs: Array<{ id: TabKey; label: string; icon: React.ReactNode; badge?: number }> = [
    {
      id: 'matchcenter',
      label: 'Wochenplan',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: 'schedule',
      label: 'Gesamtplan',
      icon: <Table2 className="w-5 h-5" />,
    },
    {
      id: 'calendar',
      label: 'Kalender',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: 'absences',
      label: 'Urlaub',
      icon: <Plane className="w-5 h-5" />,
      badge: absences.length > 0 ? absences.length : undefined,
    },
    {
      id: 'stats',
      label: 'Statistik',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'help',
      label: 'Hilfe',
      icon: <HelpCircle className="w-5 h-5" />,
    }
  ];

  if (currentUser.isAdmin) {
    tabs.push({
      id: 'admin',
      label: 'Admin',
      icon: <Shield className="w-5 h-5" />,
    });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="w-full max-w-3xl mx-auto flex items-center justify-between sm:justify-center px-1.5 py-1 sm:py-1.5 sm:gap-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 sm:px-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all m3-ripple relative ${
                isActive
                  ? 'text-neutral-950 dark:text-white font-extrabold bg-neutral-100/90 dark:bg-neutral-800/90 shadow-2xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <span 
                className="transition-colors flex items-center justify-center w-5 h-5 mx-auto"
                style={{ color: isActive ? theme.primary : undefined }}
              >
                {tab.icon}
              </span>
              <span className="truncate w-full text-center mt-0.5 leading-tight">{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="absolute top-0 right-1 sm:right-2.5 text-[9px] px-1 sm:px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 font-extrabold border-2 border-white dark:border-neutral-900">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
