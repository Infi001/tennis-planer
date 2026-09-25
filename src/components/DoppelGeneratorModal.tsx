import React from 'react';
import { Player, SlotAssignment, SlotTime } from '../types/tennis';
import { X, Shuffle, Users, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DoppelGeneratorModalProps {
  slotTime: SlotTime;
  assignments: SlotAssignment[];
  onClose: () => void;
}

export const DoppelGeneratorModal: React.FC<DoppelGeneratorModalProps> = ({
  slotTime,
  assignments,
  onClose,
}) => {
  const { players, theme } = useApp();

  const activePlayers = assignments
    .filter(a => a.status !== 'declined')
    .map(a => {
      if (a.isGuest) return { name: a.guestName || 'Gastspieler', color: '#10B981' };
      const p = players.find(player => player.id === a.playerId);
      return { name: p?.name || 'Spieler', color: p?.avatarColor || '#3B82F6' };
    });

  if (activePlayers.length < 4) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
        <div className="w-full max-w-sm bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-center space-y-3">
          <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
            Nicht genügend Spieler für Doppel
          </p>
          <p className="text-xs text-neutral-500">
            Für ein Doppel werden 4 aktive Spieler benötigt (aktuell: {activePlayers.length}).
          </p>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-200 dark:bg-neutral-800">
            Schließen
          </button>
        </div>
      </div>
    );
  }

  const [p1, p2, p3, p4] = activePlayers;

  // The 3 classic fair rounds where everyone partners with everyone once
  const rounds = [
    {
      name: 'Runde 1 (Min. 00 – 20)',
      teamA: [p1.name, p2.name],
      teamB: [p3.name, p4.name],
    },
    {
      name: 'Runde 2 (Min. 20 – 40)',
      teamA: [p1.name, p3.name],
      teamB: [p2.name, p4.name],
    },
    {
      name: 'Runde 3 (Min. 40 – 60)',
      teamA: [p1.name, p4.name],
      teamB: [p2.name, p3.name],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center space-x-2.5">
            <div 
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: theme.primary }}
            >
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Doppel-Rotation ({slotTime} Uhr)
              </h3>
              <p className="text-xs text-neutral-500">
                Jeder spielt 1x mit jedem (3x 20 Min. Runden)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Rounds */}
        <div className="space-y-3">
          {rounds.map((r, idx) => (
            <div 
              key={idx}
              className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  {r.name}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                  Match {idx + 1}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold pt-1 gap-2">
                <div className="p-2 rounded-xl bg-blue-600 text-white flex-1 text-center truncate shadow-sm">
                  {r.teamA.join(' & ')}
                </div>
                <span className="px-1 text-neutral-500 dark:text-neutral-400 text-xs font-black">VS</span>
                <div className="p-2 rounded-xl bg-amber-500 text-white flex-1 text-center truncate shadow-sm">
                  {r.teamB.join(' & ')}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-xs m3-ripple"
          style={{ backgroundColor: theme.primary }}
        >
          Fertig / Schließen
        </button>

      </div>
    </div>
  );
};
