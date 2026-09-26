import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlayerManagement } from './PlayerManagement';
import { SeasonDatesManagement } from './SeasonDatesManagement';
import { ScheduleOptimizer } from './ScheduleOptimizer';
import { ClubSettings } from './ClubSettings';
import { 
  ShieldCheck, 
  Users, 
  CalendarDays, 
  Sparkles, 
  BarChart3, 
  Info, 
  AlertCircle,
  Clock,
  CheckCircle2,
  Settings
} from 'lucide-react';
import { analyzeScheduleMetrics } from '../../utils/scheduleGenerator';

export type AdminSubTab = 'players' | 'dates' | 'optimizer' | 'settings';

interface AdminDashboardProps {
  initialSubTab?: AdminSubTab;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialSubTab = 'players' }) => {
  const { currentUser, players, weeks, theme } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>(initialSubTab);

  // Calculate live overview metrics
  const activeWeeksCount = weeks.filter(w => !w.isCancelled).length;
  const metrics = React.useMemo(() => {
    return analyzeScheduleMetrics(weeks, players);
  }, [weeks, players]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Welcome Card */}
      <div className="bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-sm shrink-0"
              style={{ backgroundColor: theme.primary }}
            >
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight">
                  Vereins- & Saisonverwaltung
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                  Admin-Modus
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Kader, Spieltermine und Rotationsplan verwalten
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-neutral-50 dark:bg-neutral-800/80 p-3 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 self-start md:self-auto">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs"
              style={{ backgroundColor: currentUser.avatarColor || theme.primary }}
            >
              {currentUser.shortName}
            </div>
            <div className="text-left text-xs pr-2">
              <div className="font-bold text-neutral-900 dark:text-neutral-100">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                {currentUser.isAdmin ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Administrator
                  </span>
                ) : (
                  <span className="text-neutral-500">Gast-Zugang</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-700/40">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
              <span>Spielerkader</span>
              <Users className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
              {players.length} <span className="text-xs font-normal text-neutral-500">Mitglieder</span>
            </div>
          </div>

          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-700/40">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
              <span>Trainingstage</span>
              <CalendarDays className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
              {activeWeeksCount} <span className="text-xs font-normal text-neutral-500">von {weeks.length} Mo.</span>
            </div>
          </div>

          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-700/40">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
              <span>Paarungs-Vielfalt</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div className="text-xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
              {metrics.pairingVarietyScore}%
            </div>
          </div>

          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-700/40">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
              <span>Zeiten-Rotation</span>
              <Clock className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl font-black text-neutral-900 dark:text-neutral-100 mt-1">
              {metrics.timeBalanceScore}%
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Pill Tabs */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 bg-white dark:bg-[var(--md-sys-color-surface)]/80 p-1.5 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 shadow-xs max-w-2xl mx-auto">
        <button
          onClick={() => setActiveSubTab('players')}
          className={`flex-1 min-w-[120px] flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all m3-ripple ${
            activeSubTab === 'players'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <Users 
            className="w-4 h-4 transition-colors" 
            style={{ color: activeSubTab === 'players' ? theme.primary : undefined }} 
          />
          <span>Spieler ({players.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dates')}
          className={`flex-1 min-w-[120px] flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all m3-ripple ${
            activeSubTab === 'dates'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <CalendarDays 
            className="w-4 h-4 transition-colors" 
            style={{ color: activeSubTab === 'dates' ? theme.primary : undefined }} 
          />
          <span>Termine & Zeiten</span>
        </button>

        <button
          onClick={() => setActiveSubTab('optimizer')}
          className={`flex-1 min-w-[120px] flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all m3-ripple ${
            activeSubTab === 'optimizer'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <Sparkles 
            className="w-4 h-4 transition-colors" 
            style={{ color: activeSubTab === 'optimizer' ? theme.primary : undefined }} 
          />
          <span>Plan-Optimierer</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex-1 min-w-[120px] flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all m3-ripple ${
            activeSubTab === 'settings'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <Settings 
            className="w-4 h-4 transition-colors" 
            style={{ color: activeSubTab === 'settings' ? theme.primary : undefined }} 
          />
          <span>Einstellungen</span>
        </button>
      </div>

      {/* Active Sub-Tab View */}
      <div className="pt-2">
        {activeSubTab === 'players' && <PlayerManagement />}
        {activeSubTab === 'dates' && <SeasonDatesManagement />}
        {activeSubTab === 'optimizer' && <ScheduleOptimizer />}
        {activeSubTab === 'settings' && <ClubSettings />}
      </div>
    </div>
  );
};
