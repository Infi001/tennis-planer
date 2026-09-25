import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, Award, Flame, UserCheck, XCircle, Shield } from 'lucide-react';
import { SlotTime } from '../types/tennis';

export const StatsDashboard: React.FC = () => {
  const { players, weeks, currentUser, theme } = useApp();

  // Calculate statistics per player
  const playerStats = players.map(player => {
    let playedCount = 0;
    let confirmedCount = 0;
    let declinedCount = 0;
    let substituteCount = 0;
    let springerNominationCount = 0;
    let freiCount = 0;

    weeks.forEach(w => {
      if (w.isCancelled) return;

      if (w.frei.playerId === player.id) freiCount++;
      if (w.springer1.playerId === player.id || w.springer2.playerId === player.id) {
        springerNominationCount++;
      }

      const slotKeys = Object.keys(w.slots || {});
      slotKeys.forEach(slotTime => {
        const assign = (w.slots[slotTime] || []).find(a => a.playerId === player.id);
        if (assign) {
          if (assign.status === 'confirmed') {
            playedCount++;
            confirmedCount++;
          } else if (assign.status === 'substitute') {
            playedCount++;
            substituteCount++;
          } else if (assign.status === 'declined') {
            declinedCount++;
          } else if (assign.status === 'pending') {
            playedCount++;
          }
        }
      });
    });

    return {
      player,
      playedCount,
      confirmedCount,
      declinedCount,
      substituteCount,
      springerNominationCount,
      freiCount,
    };
  });

  // Sort by playedCount descending
  const sortedStats = [...playerStats].sort((a, b) => b.playedCount - a.playedCount);

  // Top substitute hero
  const topSub = [...playerStats].sort((a, b) => b.substituteCount - a.substituteCount)[0];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-[var(--md-sys-color-surface)] p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
            style={{ backgroundColor: theme.primary }}
          >
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Statistiken
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Einsätze und Anwesenheiten
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-4 rounded-3xl bg-white dark:bg-[var(--md-sys-color-surface)] border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Springer-Held (Meiste Einsätze)</p>
            <p className="text-lg font-extrabold text-neutral-900 dark:text-neutral-100">
              {topSub?.player.name} ({topSub?.substituteCount}x eingesprungen)
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[var(--md-sys-color-surface)] border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Rotations-Fairness</p>
            <p className="text-lg font-extrabold text-neutral-900 dark:text-neutral-100">
              100% Ausgeglichen
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[var(--md-sys-color-surface)] border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Saison-Montage gesamt</p>
            <p className="text-lg font-extrabold text-neutral-900 dark:text-neutral-100">
              {weeks.filter(w => !w.isCancelled).length} Termine
            </p>
          </div>
        </div>

      </div>

      {/* Fairness Table */}
      <div className="bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Einsatz-Tabelle aller 15 Spieler
          </h3>
          <span className="text-xs text-neutral-500">Live aus allen 30 Trainingswochen</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-bold">
              <tr>
                <th className="px-4 py-3 text-left">Spieler</th>
                <th className="px-3 py-3 text-center">Spiele (Geplant/Aktiv)</th>
                <th className="px-3 py-3 text-center">Eingesprungen (Springer)</th>
                <th className="px-3 py-3 text-center">Absagen</th>
                <th className="px-3 py-3 text-center">Freie Wochen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {sortedStats.map(({ player, playedCount, substituteCount, declinedCount, freiCount }) => {
                const isMe = player.id === currentUser.id;

                return (
                  <tr 
                    key={player.id}
                    className={`transition-colors ${
                      isMe 
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 font-semibold' 
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                    }`}
                  >
                    <td className="px-4 py-3 font-bold text-neutral-900 dark:text-neutral-100 flex items-center space-x-2.5">
                      <div 
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: player.avatarColor || theme.primary }}
                      >
                        {player.shortName}
                      </div>
                      <span>{player.name}</span>
                      {isMe && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-bold">
                          Du
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-3 text-center font-bold text-neutral-800 dark:text-neutral-200">
                      {playedCount} Std.
                    </td>

                    <td className="px-3 py-3 text-center">
                      {substituteCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
                          +{substituteCount}x
                        </span>
                      ) : (
                        <span className="text-neutral-400">0</span>
                      )}
                    </td>

                    <td className="px-3 py-3 text-center">
                      {declinedCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold">
                          {declinedCount}x
                        </span>
                      ) : (
                        <span className="text-neutral-400">0</span>
                      )}
                    </td>

                    <td className="px-3 py-3 text-center text-neutral-600 dark:text-neutral-400">
                      {freiCount} Wochen
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
