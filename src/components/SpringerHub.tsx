import React from 'react';
import { TrainingWeek } from '../types/tennis';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  RotateCcw
} from 'lucide-react';
import { 
  buildStandbyQueueDisplay, 
  calculateStandbyCascade 
} from '../utils/standbyCascade';

interface SpringerHubProps {
  week: TrainingWeek;
}

export const SpringerHub: React.FC<SpringerHubProps> = ({ week }) => {
  const { 
    players, 
    currentUser, 
    theme, 
    acceptSubstitute, 
    declineSubstituteOffer,
    skipStandbyPriorityToNext,
    resetStandbyCascade,
    springerCount,
  } = useApp();

  const cascade = calculateStandbyCascade(week, springerCount);
  const queueItems = buildStandbyQueueDisplay(week, players, currentUser.id, springerCount);

  const { totalOpenSpots, openSlots } = cascade;
  const hasOpenSpots = totalOpenSpots > 0;

  return (
    <div className="bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-sm transition-all space-y-4">
      
      {/* Header & Quick Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center space-x-2.5">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
            style={{ backgroundColor: theme.primary }}
          >
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-neutral-100 leading-tight">
                Springer
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                {springerCount} {springerCount === 1 ? 'Springer' : 'Springer'} eingeteilt
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Feste Nachrücker bei kurzfristigen Absagen
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {hasOpenSpots ? (
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{totalOpenSpots} {totalOpenSpots === 1 ? 'Platz frei' : 'Plätze frei'} ({openSlots.join(', ')})</span>
            </span>
          ) : (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              Alle Plätze besetzt (4/4 je Slot)
            </span>
          )}

          {/* Reset button if any Springer declined */}
          {currentUser.isAdmin && (
            week.springer1.status === 'declined' || 
            (springerCount >= 2 && week.springer2.status === 'declined')
          ) && (
            <button
              onClick={() => resetStandbyCascade(week.id)}
              className="py-1.5 px-2.5 rounded-xl text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center space-x-1"
              title="Absagen zurücksetzen und Kaskade neu starten"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Springer zurücksetzen</span>
            </button>
          )}
        </div>
      </div>

      {/* Simplified Springer Cards */}
      <div className={`grid grid-cols-1 ${springerCount >= 2 ? 'sm:grid-cols-2' : 'max-w-md'} gap-3`}>
        {queueItems.map((item) => {
          const isTurn = item.isCurrentTurn;
          const isUser = item.isCurrentUser;
          const p = item.player;

          return (
            <div
              key={item.prio}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isTurn
                  ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/80 ring-2 ring-amber-400/30 shadow-xs'
                  : item.status === 'accepted'
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                    : item.status === 'declined'
                      ? 'bg-neutral-50/50 dark:bg-neutral-800/30 border-neutral-200/80 dark:border-neutral-800/80 opacity-70'
                      : 'bg-neutral-50/70 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div>
                {/* Card Header: Springer Badge & Turn Status */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    item.prio === 1
                      ? 'bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                  }`}>
                    {item.title}
                  </span>

                  {isTurn && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                      An der Reihe
                    </span>
                  )}
                </div>

                {/* Player Profile */}
                <div className="flex items-center space-x-2.5 mb-2">
                  {p && (
                    <div 
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0"
                      style={{ backgroundColor: p.avatarColor || theme.primary }}
                    >
                      {p.shortName}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 truncate">
                      <span>{p ? p.name : 'Nicht besetzt'}</span>
                      {isUser && (
                        <span 
                          className="text-[10px] font-bold px-1.5 py-0.2 rounded-full text-white shrink-0"
                          style={{ backgroundColor: theme.primary }}
                        >
                          Du
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 truncate">
                      {item.statusLabel}
                    </div>
                  </div>
                </div>

                {/* Explanation text */}
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-2 leading-relaxed">
                  {item.explanation}
                </p>
              </div>

              {/* Action Area */}
              <div className="mt-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
                {isTurn && p && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block">
                      Freien Platz übernehmen:
                    </span>
                    {(currentUser.id === p.id || currentUser.isAdmin) ? (
                      <div className="space-y-1.5">
                        {openSlots.map(slot => (
                          <button
                            key={slot}
                            onClick={() => acceptSubstitute(week.id, slot, p.id)}
                            className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-between shadow-xs m3-ripple"
                          >
                            <span>{slot} Uhr übernehmen 🎾</span>
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        ))}
                        <button
                          onClick={() => declineSubstituteOffer(week.id, p.id)}
                          className="w-full py-1 mt-1 text-[11px] font-semibold text-neutral-500 hover:text-rose-600 text-center transition-colors"
                        >
                          Kann diesen Montag nicht
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-neutral-500 italic block mt-1">Wartet auf Antwort von {p.name}...</span>
                    )}
                  </div>
                )}

                {!isTurn && (
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>
                      {item.status === 'accepted' ? 'Einsatz bestätigt ✅' : item.status === 'declined' ? 'Ausgeschieden ❌' : 'Bereit'}
                    </span>
                    
                    {/* Admin skip button for idle items when open spots exist */}
                    {hasOpenSpots && currentUser.isAdmin && item.status === 'idle' && (
                      <button
                        onClick={() => skipStandbyPriorityToNext(week.id, item.prio)}
                        className="text-[10px] font-semibold text-neutral-500 hover:text-amber-600 underline"
                      >
                        Überspringen
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
