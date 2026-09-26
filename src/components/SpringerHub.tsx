import React from 'react';
import { TrainingWeek, SlotTime } from '../types/tennis';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Coffee, 
  AlertCircle, 
  Check, 
  X, 
  Sparkles, 
  ArrowRight, 
  Users, 
  FastForward, 
  RotateCcw,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  buildStandbyQueueDisplay, 
  calculateStandbyCascade, 
  isPlayerActivelyPlayingInWeek 
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
    releaseOpenSlotsToAll,
    resetStandbyCascade,
    isPlayerScheduledInWeek,
    springerCount,
  } = useApp();

  const cascade = calculateStandbyCascade(week, springerCount);
  const queueItems = buildStandbyQueueDisplay(week, players, currentUser.id, springerCount);

  const { totalOpenSpots, openSlots, openForAnyoneCount, activeOfferedPrios } = cascade;
  const hasOpenSpots = totalOpenSpots > 0;
  const isCurrentUserScheduled = isPlayerScheduledInWeek(week.id, currentUser.id);

  const sequenceText = [
    '1. Springer',
    springerCount >= 2 ? '2. Springer' : null,
    springerCount >= 3 ? '3. Springer' : null,
    'Alle Vereinsmitglieder'
  ].filter(Boolean).join(' ➔ ');

  return (
    <div className="bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-sm transition-all space-y-4">
      
      {/* Header & Quick Actions */}
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
                Springer & Nachrücker
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                {springerCount} {springerCount === 1 ? 'Springer' : 'Springer'} aktiv
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {sequenceText}
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
              Alle {openSlots.length === 0 ? 'Plätze' : ''} besetzt (4/4 je Slot)
            </span>
          )}

          {/* Quick Action: Release to all or Reset */}
          {hasOpenSpots && currentUser.isAdmin && openForAnyoneCount < totalOpenSpots && (
            <button
              onClick={() => releaseOpenSlotsToAll(week.id)}
              className="py-1.5 px-3 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center space-x-1"
              title="Kaskade überspringen und sofort für alle Spieler öffnen"
            >
              <FastForward className="w-3.5 h-3.5 text-amber-500" />
              <span>Sofort für alle freigeben</span>
            </button>
          )}

          {/* Reset button if any Springer declined */}
          {currentUser.isAdmin && (
            week.springer1.status === 'declined' || 
            (springerCount >= 2 && week.springer2.status === 'declined') || 
            (springerCount >= 3 && week.frei?.status === 'declined')
          ) && (
            <button
              onClick={() => resetStandbyCascade(week.id)}
              className="py-1.5 px-2.5 rounded-xl text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center space-x-1"
              title="Absagen zurücksetzen und Kaskade neu starten"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kaskade zurücksetzen</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Sequence Flow Banner */}
      <div className="p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800 overflow-x-auto">
        <div className="flex items-center min-w-[360px] justify-between text-xs font-bold gap-2">
          
          {/* Step 1 */}
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl transition-all ${
            activeOfferedPrios.includes(1)
              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 ring-2 ring-amber-400/40'
              : cascade.springer1.status === 'accepted'
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                : cascade.springer1.status === 'declined'
                  ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 line-through'
                  : 'text-neutral-500 dark:text-neutral-400'
          }`}>
            <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px]">1</span>
            <span>1. Springer</span>
            {activeOfferedPrios.includes(1) && <span className="animate-pulse">🔔</span>}
            {cascade.springer1.status === 'accepted' && <span>✅</span>}
          </div>

          {/* Step 2 */}
          {springerCount >= 2 && (
            <>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-700 shrink-0" />
              <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl transition-all ${
                activeOfferedPrios.includes(2)
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 ring-2 ring-amber-400/40'
                  : cascade.springer2.status === 'accepted'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : cascade.springer2.status === 'declined'
                      ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 line-through'
                      : 'text-neutral-500 dark:text-neutral-400'
              }`}>
                <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px]">2</span>
                <span>2. Springer</span>
                {activeOfferedPrios.includes(2) && <span className="animate-pulse">🔔</span>}
                {cascade.springer2.status === 'accepted' && <span>✅</span>}
              </div>
            </>
          )}

          {/* Step 3 */}
          {springerCount >= 3 && (
            <>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-700 shrink-0" />
              <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl transition-all ${
                activeOfferedPrios.includes(3)
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 ring-2 ring-amber-400/40'
                  : cascade.frei.status === 'accepted'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : cascade.frei.status === 'declined'
                      ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 line-through'
                      : 'text-neutral-500 dark:text-neutral-400'
              }`}>
                <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px]">3</span>
                <span>3. Springer</span>
                {activeOfferedPrios.includes(3) && <span className="animate-pulse">🔔</span>}
                {cascade.frei.status === 'accepted' && <span>✅</span>}
              </div>
            </>
          )}

          <ArrowRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-700 shrink-0" />

          {/* Final Step: Alle Vereinsmitglieder */}
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl transition-all ${
            openForAnyoneCount > 0
              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-400/40'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}>
            <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px]">★</span>
            <span>Alle Mitglieder</span>
            {openForAnyoneCount > 0 && <span className="animate-pulse">🟢</span>}
          </div>

        </div>
      </div>

      {/* Priority Cards Grid (dynamic columns based on springerCount) */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${
        springerCount === 1 
          ? 'lg:grid-cols-2 max-w-2xl' 
          : springerCount === 2 
            ? 'lg:grid-cols-3' 
            : 'lg:grid-cols-2 xl:grid-cols-4'
      } gap-3`}>
        {queueItems.map((item) => {
          const isTurn = item.isCurrentTurn;
          const isUser = item.isCurrentUser;
          const p = item.player;

          return (
            <div
              key={item.prio}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                isTurn
                  ? item.prio === 4
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/80 ring-2 ring-emerald-400/30 shadow-xs'
                    : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/80 ring-2 ring-amber-400/30 shadow-xs'
                  : item.status === 'accepted'
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                    : item.status === 'declined'
                      ? 'bg-neutral-50/50 dark:bg-neutral-800/30 border-neutral-200/80 dark:border-neutral-800/80 opacity-70'
                      : 'bg-neutral-50/70 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div>
                {/* Card Header: Prio Pill & Status Badge */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    item.prio === 1
                      ? 'bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                      : item.prio === 2
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        : item.prio === 3
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {item.prioBadge}
                  </span>

                  {isTurn && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                      An der Reihe
                    </span>
                  )}
                </div>

                {/* Player Profile or Generic Pool */}
                <div className="flex items-center space-x-2.5 mb-2">
                  {p ? (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0"
                      style={{ backgroundColor: p.avatarColor || theme.primary }}
                    >
                      {p.shortName}
                    </div>
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0 bg-emerald-600"
                    >
                      <Users className="w-4 h-4" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 truncate">
                      <span>{p ? p.name : 'Alle Clubmitglieder'}</span>
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

              {/* Action Area based on Priority Level */}
              <div className="mt-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
                {/* Case A: Item 1, 2, or 3 is current turn */}
                {item.prio !== 4 && isTurn && p && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block">
                      Freien Slot übernehmen:
                    </span>
                    {(currentUser.id === p.id || currentUser.isAdmin) ? (
                      <div className="space-y-1">
                        {openSlots.map(slot => (
                          <button
                            key={slot}
                            onClick={() => acceptSubstitute(week.id, slot, p.id)}
                            className="w-full py-1.5 px-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-between shadow-xs m3-ripple"
                          >
                            <span>{slot} Uhr übernehmen</span>
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        ))}
                        <button
                          onClick={() => declineSubstituteOffer(week.id, p.id)}
                          className="w-full py-1 mt-1 text-[11px] font-semibold text-neutral-500 hover:text-rose-600 text-center transition-colors"
                        >
                          {item.prio === springerCount 
                            ? 'Kann nicht (für alle Vereinsmitglieder freigeben ➔)' 
                            : 'Kann nicht (an nächsten Nachrücker ➔)'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-neutral-500 italic block mt-1">Wartet auf Antwort von {p.name}...</span>
                    )}
                  </div>
                )}

                {/* Case B: Item 4 (Open for anyone) is current turn */}
                {item.prio === 4 && item.status === 'open' && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">
                      Freies Einspringen:
                    </span>
                    {!isCurrentUserScheduled ? (
                      <div className="space-y-1">
                        {openSlots.map(slot => (
                          <button
                            key={slot}
                            onClick={() => acceptSubstitute(week.id, slot, currentUser.id)}
                            className="w-full py-1.5 px-2.5 rounded-xl text-xs font-bold text-white shadow-xs m3-ripple flex items-center justify-between"
                            style={{ backgroundColor: theme.primary }}
                          >
                            <span>{slot} Uhr übernehmen 🎾</span>
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-neutral-400 italic block">
                        Du spielst diesen Montag bereits.
                      </span>
                    )}
                  </div>
                )}

                {/* Case C: Not current turn, or already accepted/declined */}
                {!isTurn && (
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>
                      {item.status === 'accepted' ? 'Einsatz bestätigt' : item.status === 'declined' ? 'Ausgeschieden' : 'In Warteschlange'}
                    </span>
                    
                    {/* Admin skip button for idle items when open spots exist */}
                    {hasOpenSpots && currentUser.isAdmin && item.prio !== 4 && item.status === 'idle' && (
                      <button
                        onClick={() => skipStandbyPriorityToNext(week.id, item.prio as 1 | 2 | 3)}
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
