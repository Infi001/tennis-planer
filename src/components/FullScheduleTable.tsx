import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Player, SlotTime } from '../types/tennis';
import { Search, Filter, Calendar, ExternalLink } from 'lucide-react';

interface FullScheduleTableProps {
  onSelectWeek: (weekId: string) => void;
}

export const FullScheduleTable: React.FC<FullScheduleTableProps> = ({ onSelectWeek }) => {
  const { players, weeks, currentUser, theme } = useApp();
  const [selectedPlayerFilter, setSelectedPlayerFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPlayers = players.filter(p => {
    if (selectedPlayerFilter !== 'all' && p.id !== selectedPlayerFilter) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Helper to determine role for a player in a week
  const getPlayerCellInfo = (week: typeof weeks[0], player: Player) => {
    if (week.isCancelled) {
      return { text: 'Kein Training', type: 'cancelled' };
    }

    if (week.frei.playerId === player.id) {
      return { 
        text: week.frei.status === 'accepted' ? 'Eingesprungen (Frei)' : 'Frei', 
        type: 'frei',
        isSub: week.frei.status === 'accepted'
      };
    }

    if (week.springer1.playerId === player.id) {
      return { 
        text: '1. Springer', 
        type: 'sp1', 
        isSub: week.springer1.status === 'accepted' 
      };
    }

    if (week.springer2.playerId === player.id) {
      return { 
        text: '2. Springer', 
        type: 'sp2', 
        isSub: week.springer2.status === 'accepted' 
      };
    }

    // Check slots dynamically
    const slotTimes = Object.keys(week.slots || {}).sort();
    for (const time of slotTimes) {
      const assignment = (week.slots[time] || []).find(a => a.playerId === player.id);
      if (assignment) {
        if (assignment.status === 'declined') {
          return { text: `${time} (Abgesagt)`, type: 'declined' };
        }
        if (assignment.status === 'substitute') {
          return { text: `${time} (Springer)`, type: 'substitute' };
        }
        return { text: time, type: 'slot' };
      }
    }

    return { text: '-', type: 'none' };
  };

  return (
    <div className="space-y-4">
      
      {/* Top Filter & Search Controls */}
      <div className="bg-white dark:bg-[var(--md-sys-color-surface)] p-4 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs"
            style={{ backgroundColor: theme.primary }}
          >
            📋
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Saisonplan
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Gesamtübersicht aller Termine
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {/* Player select filter */}
          <div className="relative flex-1 sm:w-48">
            <select
              value={selectedPlayerFilter}
              onChange={(e) => setSelectedPlayerFilter(e.target.value)}
              className="w-full text-xs font-semibold py-2 pl-3 pr-8 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle 15 Spieler anzeigen</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.id === currentUser.id ? '(Du)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Current user quick filter button */}
          <button
            onClick={() => setSelectedPlayerFilter(selectedPlayerFilter === currentUser.id ? 'all' : currentUser.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all m3-ripple ${
              selectedPlayerFilter === currentUser.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
          >
            Nur meine Termine
          </button>
        </div>
      </div>

      {/* Matrix Table Container with horizontal scrolling */}
      <div className="bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-xs border-collapse">
            
            {/* Header with Dates */}
            <thead className="sticky top-0 z-20 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="sticky left-0 z-30 bg-neutral-200 dark:bg-neutral-800/90 backdrop-blur-sm px-4 py-3 text-left font-extrabold text-neutral-800 dark:text-neutral-200 border-r border-neutral-300 dark:border-neutral-700 min-w-[130px]">
                  Spieler
                </th>
                {weeks.map((week) => (
                  <th 
                    key={week.id}
                    onClick={() => onSelectWeek(week.id)}
                    className="px-3 py-2.5 text-center font-bold text-neutral-700 dark:text-neutral-300 border-r border-neutral-200 dark:border-neutral-700 whitespace-nowrap cursor-pointer hover:bg-neutral-200/80 dark:hover:bg-neutral-700 transition-colors group"
                    title={`Klicken, um Woche ${week.dateString} im Matchcenter zu öffnen`}
                  >
                    <div className="text-[11px] group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {week.dateString}
                    </div>
                    {week.isCancelled && (
                      <span className="text-[9px] block text-rose-500 font-semibold">Pause</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body: Player Rows */}
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredPlayers.map((player) => {
                const isCurrentMe = player.id === currentUser.id;

                return (
                  <tr 
                    key={player.id}
                    className={`transition-colors ${
                      isCurrentMe 
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 font-semibold' 
                        : 'hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40'
                    }`}
                  >
                    {/* Fixed Player Name Column */}
                    <td className={`sticky left-0 z-10 px-4 py-2.5 font-bold border-r border-neutral-200 dark:border-neutral-700 whitespace-nowrap flex items-center space-x-2 ${
                      isCurrentMe 
                        ? 'bg-blue-100/90 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100' 
                        : 'bg-white dark:bg-[var(--md-sys-color-surface)] text-neutral-900 dark:text-neutral-100'
                    }`}>
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs shrink-0"
                        style={{ backgroundColor: player.avatarColor || theme.primary }}
                      >
                        {player.shortName}
                      </div>
                      <span className="truncate">{player.name}</span>
                      {isCurrentMe && (
                        <span className="text-[9px] px-1 rounded bg-blue-600 text-white font-bold ml-1">
                          Ich
                        </span>
                      )}
                    </td>

                    {/* Date Cells */}
                    {weeks.map((week) => {
                      const info = getPlayerCellInfo(week, player);

                      let cellBg = '';
                      let cellText = 'text-neutral-800 dark:text-neutral-200 font-medium';

                      if (info.type === 'frei') {
                        cellBg = 'bg-rose-50 dark:bg-rose-950/30';
                        cellText = 'text-rose-600 dark:text-rose-400 font-black';
                      } else if (info.type === 'sp1') {
                        cellBg = 'bg-amber-50 dark:bg-amber-950/30';
                        cellText = 'text-amber-700 dark:text-amber-300 font-bold';
                      } else if (info.type === 'sp2') {
                        cellBg = 'bg-yellow-50 dark:bg-yellow-950/20';
                        cellText = 'text-yellow-700 dark:text-yellow-400 font-bold';
                      } else if (info.type === 'declined') {
                        cellBg = 'bg-rose-100/60 dark:bg-rose-950/60';
                        cellText = 'text-rose-500 line-through';
                      } else if (info.type === 'substitute') {
                        cellBg = 'bg-blue-100/60 dark:bg-blue-950/60';
                        cellText = 'text-blue-700 dark:text-blue-300 font-bold';
                      } else if (info.type === 'cancelled') {
                        cellBg = 'bg-neutral-100/50 dark:bg-neutral-800/50';
                        cellText = 'text-neutral-400 text-[10px] italic';
                      }

                      return (
                        <td 
                          key={`${week.id}-${player.id}`}
                          onClick={() => onSelectWeek(week.id)}
                          className={`px-3 py-2 text-center border-r border-neutral-200 dark:border-neutral-800 whitespace-nowrap cursor-pointer hover:ring-1 hover:ring-blue-400 transition-all ${cellBg}`}
                        >
                          <span className={cellText}>
                            {info.text}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>

        {/* Legend */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
          <span className="font-bold text-neutral-700 dark:text-neutral-300">Legende:</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-neutral-200 dark:bg-neutral-700 inline-block" />
            <span>18:00, 19:00, 20:00 = Aktiver Trainingsplatz</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-amber-200 dark:bg-amber-900 inline-block" />
            <span>1. & 2. Springer = Standby-Ersatz</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-rose-200 dark:bg-rose-900 inline-block" />
            <span>Frei = Spielfreie Woche</span>
          </div>
        </div>

      </div>

    </div>
  );
};
