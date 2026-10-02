import React, { useState } from 'react';
import { Calendar, Table2, Plane, BarChart3, Shield, HelpCircle, MoreHorizontal, X, ChevronRight, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

export type TabKey = 'matchcenter' | 'schedule' | 'calendar' | 'absences' | 'stats' | 'help' | 'admin';

interface NavigationTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onOpenImpressum?: () => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange, onOpenImpressum }) => {
  const { theme, absences, currentUser, selectedWeekId } = useApp();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // All tabs definition
  const primaryTabs: Array<{ id: TabKey; label: string; icon: React.ReactNode; badge?: number; hash: string }> = [
    {
      id: 'matchcenter',
      label: 'Wochenplan',
      icon: <Calendar className="w-5 h-5" />,
      hash: selectedWeekId ? `#/wochenplan/${selectedWeekId}` : '#/wochenplan',
    },
    {
      id: 'schedule',
      label: 'Gesamtplan',
      icon: <Table2 className="w-5 h-5" />,
      hash: '#/gesamtplan',
    },
    {
      id: 'calendar',
      label: 'Kalender',
      icon: <Calendar className="w-5 h-5" />,
      hash: '#/kalender',
    },
    {
      id: 'absences',
      label: 'Abwesenheiten',
      icon: <Plane className="w-5 h-5" />,
      badge: absences.length > 0 ? absences.length : undefined,
      hash: '#/abwesenheiten',
    },
  ];

  const secondaryTabs: Array<{ id: TabKey; label: string; description: string; icon: React.ReactNode; hash: string }> = [
    {
      id: 'stats',
      label: 'Statistik',
      description: 'Einsatzquote & Spielzeiten',
      icon: <BarChart3 className="w-5 h-5" />,
      hash: '#/statistik',
    },
    {
      id: 'help',
      label: 'Hilfe & FAQ',
      description: 'Regeln, Kaskade & Tipps',
      icon: <HelpCircle className="w-5 h-5" />,
      hash: '#/hilfe',
    },
  ];

  if (currentUser.isAdmin) {
    secondaryTabs.push({
      id: 'admin',
      label: 'Admin',
      description: 'Verwaltung & Einstellungen',
      icon: <Shield className="w-5 h-5" />,
      hash: '#/admin',
    });
  }

  const allTabs = [
    ...primaryTabs,
    ...secondaryTabs.map(s => ({ id: s.id, label: s.label, icon: s.icon, hash: s.hash, badge: undefined }))
  ];

  const isSecondaryActive = secondaryTabs.some(t => t.id === activeTab);
  const activeSecondaryItem = secondaryTabs.find(t => t.id === activeTab);

  return (
    <>
      {/* Mobile "Mehr" Sheet Backdrop & Modal */}
      {isMoreOpen && (
        <div 
          className="fixed inset-0 z-50 sm:hidden bg-black/40 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200"
          onClick={() => setIsMoreOpen(false)}
        >
          <div 
            className="w-full bg-white dark:bg-neutral-900 rounded-t-3xl p-5 border-t border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto" />

            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="font-extrabold text-base text-neutral-900 dark:text-neutral-100">
                  Weitere Bereiche
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {theme.clubName} • {theme.groupName || 'Tennis'}
                </p>
              </div>
              <button 
                onClick={() => setIsMoreOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Secondary Destinations List */}
            <div className="space-y-1.5">
              {secondaryTabs.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setIsMoreOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all m3-ripple ${
                      isActive 
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-extrabold'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isActive 
                            ? 'text-white shadow-xs' 
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                        }`}
                        style={isActive ? { backgroundColor: theme.primary } : undefined}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-sm font-bold">{item.label}</div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${isActive ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400'}`} />
                  </button>
                );
              })}

              {onOpenImpressum && (
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    onOpenImpressum();
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl text-left text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-all m3-ripple"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Impressum & Datenschutz</div>
                      <div className="text-xs text-neutral-400 font-normal">Rechtliche Angaben</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Docked Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {/* Mobile View: 4 Primary Destinations + "Mehr" Button */}
        <div className="flex sm:hidden items-center justify-around px-1 py-1.5 w-full">
          {primaryTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <a
                key={tab.id}
                href={tab.hash}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    onTabChange(tab.id);
                  }
                }}
                className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[11px] font-bold transition-all m3-ripple relative no-underline select-none ${
                  isActive
                    ? 'text-neutral-950 dark:text-white font-extrabold bg-neutral-100/90 dark:bg-neutral-800/90'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
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
                  <span className="absolute top-0 right-2 text-[9px] px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 font-extrabold border-2 border-white dark:border-neutral-900">
                    {tab.badge}
                  </span>
                )}
              </a>
            );
          })}

          {/* 5th Mobile Destination: "Mehr" */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[11px] font-bold transition-all m3-ripple relative select-none ${
              isSecondaryActive
                ? 'text-neutral-950 dark:text-white font-extrabold bg-neutral-100/90 dark:bg-neutral-800/90'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <span 
              className="transition-colors flex items-center justify-center w-5 h-5 mx-auto"
              style={{ color: isSecondaryActive ? theme.primary : undefined }}
            >
              {activeSecondaryItem ? activeSecondaryItem.icon : <MoreHorizontal className="w-5 h-5" />}
            </span>
            <span className="truncate w-full text-center mt-0.5 leading-tight">
              {activeSecondaryItem ? activeSecondaryItem.label : 'Mehr'}
            </span>
          </button>
        </div>

        {/* Desktop / Tablet View: Full Clean Pill Navigation */}
        <div className="hidden sm:flex w-full max-w-4xl mx-auto items-center justify-center px-4 py-1.5 gap-2">
          {allTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <a
                key={tab.id}
                href={tab.hash}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    onTabChange(tab.id);
                  }
                }}
                className={`flex items-center space-x-2 py-2 px-4 rounded-xl text-xs font-bold transition-all m3-ripple relative no-underline select-none ${
                  isActive
                    ? 'text-neutral-950 dark:text-white font-extrabold bg-neutral-100/90 dark:bg-neutral-800/90 shadow-2xs'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <span 
                  className="transition-colors flex items-center justify-center w-4 h-4"
                  style={{ color: isActive ? theme.primary : undefined }}
                >
                  {tab.icon}
                </span>
                <span className="leading-tight">{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 font-extrabold">
                    {tab.badge}
                  </span>
                )}
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
};
