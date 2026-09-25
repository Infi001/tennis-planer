import React, { useState, useRef } from 'react';
import { Player, SlotAssignment, SlotTime } from '../types/tennis';
import { useApp } from '../context/AppContext';
import { Check, X, ArrowLeftRight, UserCheck, AlertCircle, RotateCcw, Calendar } from 'lucide-react';

interface PlayerCardProps {
  assignment: SlotAssignment;
  slotTime: SlotTime;
  weekId: string;
  index: number;
  onOpenDecline: (playerId: string) => void;
  onOpenSwap: (playerId: string, fromSlot: SlotTime) => void;
  onAdminEdit?: (playerId: string) => void;
  onOpenCalendar?: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  assignment,
  slotTime,
  weekId,
  index,
  onOpenDecline,
  onOpenSwap,
  onAdminEdit,
  onOpenCalendar,
}) => {
  const { 
    weeks,
    players, 
    currentUser, 
    theme,
    confirmAttendance, 
    reclaimSlot,
    cancelSubstitute,
    claimOpenSlot,
    getStandbyCascadeInfo,
    adminDragDropAssign,
    getPlayerCurrentSlotInWeek
  } = useApp();

  const player = players.find(p => p.id === assignment.playerId);
  const isMe = player?.id === currentUser.id;
  const isGuest = assignment.isGuest;

  const isAdmin = currentUser.isAdmin;

  if (!player && !isGuest) return null;

  const isConfirmed = assignment.status === 'confirmed';
  const isDeclined = assignment.status === 'declined';
  const isSubstitute = assignment.status === 'substitute';
  const isSwapped = assignment.status === 'swapped';
  const wasDeclinedByMe = isDeclined && isMe;

  const originalPlayer = assignment.originalPlayerId 
    ? players.find(p => p.id === assignment.originalPlayerId)
    : null;

  const week = weeks.find(w => w.id === weekId);
  const cascade = week ? getStandbyCascadeInfo(weekId) : null;

  const myCurrentSlot = getPlayerCurrentSlotInWeek(weekId, currentUser.id);
  const isCurrentUserAlreadyPlaying = !!myCurrentSlot;

  let isMeOfferedStandby = false;
  let prioName = '';
  
  if (cascade && week) {
    const sp1Player = players.find(p => p.id === week.springer1.playerId);
    const sp2Player = players.find(p => p.id === week.springer2.playerId);
    const freiPlayer = players.find(p => p.id === week.frei?.playerId);

    const isCurrentUserSp1Turn = week.springer1.playerId === currentUser.id && cascade.activeOfferedPrios.includes(1);
    const isCurrentUserSp2Turn = week.springer2.playerId === currentUser.id && cascade.activeOfferedPrios.includes(2);
    const isCurrentUserFreiTurn = week.frei?.playerId === currentUser.id && cascade.activeOfferedPrios.includes(3);
    
    isMeOfferedStandby = isCurrentUserSp1Turn || isCurrentUserSp2Turn || isCurrentUserFreiTurn;

    if (cascade.activeOfferedPrios.includes(1) && sp1Player) {
      prioName = sp1Player.name;
    } else if (cascade.activeOfferedPrios.includes(2) && sp2Player) {
      prioName = sp2Player.name;
    } else if (cascade.activeOfferedPrios.includes(3) && freiPlayer) {
      prioName = freiPlayer.name;
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (!isAdmin) return;
    if (isGuest) return;
    e.dataTransfer.setData('playerId', assignment.playerId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isAdmin) {
      e.preventDefault(); // allow drop
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isAdmin) return;
    e.preventDefault();
    const droppedPlayerId = e.dataTransfer.getData('playerId');
    if (droppedPlayerId && droppedPlayerId !== assignment.playerId) {
      adminDragDropAssign(weekId, slotTime, droppedPlayerId, assignment.playerId);
    }
  };

  // Swipe-to-delete logic for Admins
    const swipeStartX = useRef<number | null>(null);

  
  const handleQuickRemove = () => {
    adminDragDropAssign(weekId, slotTime, 'remove', assignment.playerId);
  };

  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border transition-all duration-200 shadow-sm border-neutral-200 dark:border-neutral-700">
      {/* Background Delete Button (revealed on swipe) */}
      

      {/* Swipeable Foreground */}
      <div 
        draggable={isAdmin && !isGuest}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        
        
      className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-all duration-200 ${
        isDeclined 
          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-900/50' 
          : isSubstitute
            ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
            : isSwapped
              ? 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800'
              : 'bg-white dark:bg-[var(--md-sys-color-surface)] border-neutral-200 dark:border-neutral-700'
      } ${
        isMe ? 'ring-2 ring-inset ring-neutral-300 dark:ring-neutral-600 shadow-sm' : ''
      } ${isAdmin && !isGuest ? 'cursor-grab active:cursor-grabbing hover:border-blue-400' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden">
          {/* Avatar / Placeholder */}
          <div 
            className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white font-bold text-[11px] sm:text-xs shrink-0 ${
              isDeclined ? 'opacity-40 grayscale' : 'shadow-xs'
            }`}
            style={{ backgroundColor: isGuest ? '#6b7280' : player?.avatarColor || theme.primary }}
          >
            {isGuest ? 'G' : player?.shortName}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className={`text-xs sm:text-sm font-bold truncate ${
                isDeclined ? 'text-neutral-500 line-through' : 'text-neutral-900 dark:text-neutral-100'
              }`}>
                {isGuest ? assignment.guestName || 'Gastspieler' : player?.name}
              </h4>
              {isMe && (
                <span className="px-1.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  Du
                </span>
              )}
              {isGuest && (
                <span className="px-1.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  Gast
                </span>
              )}
            </div>

            {/* Sub-label / Reason */}
            {isDeclined && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium truncate flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {assignment.declineReason || 'Abgesagt'}
              </p>
            )}

            {isSubstitute && originalPlayer && (
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate">
                Eingesprungen für {originalPlayer.name}
              </p>
            )}

            {!isDeclined && !isSubstitute && (
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Platz {index + 1}
              </p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isConfirmed && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
              <Check className="w-3 h-3 stroke-[3]" />
              <span className="hidden sm:inline">Dabei</span>
            </span>
          )}

          {isDeclined && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
              <X className="w-3 h-3 stroke-[3]" />
              <span>Ausfall</span>
            </span>
          )}

          {isSubstitute && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
              <UserCheck className="w-3 h-3" />
              <span>Springer</span>
            </span>
          )}

          {isSwapped && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
              <ArrowLeftRight className="w-3 h-3" />
              <span>Tausch</span>
            </span>
          )}

          {assignment.status === 'pending' && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
              <span>Offen</span>
            </span>
          )}
        </div>

      </div>

      {/* Action Bar for Regular Scheduled Player */}
      {(isMe || currentUser.isAdmin) && !isGuest && player && !isDeclined && !isSubstitute && (
        <div className="mt-2 sm:mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-700/60 flex items-center flex-wrap gap-1.5 justify-end">
          
          {isMe && onOpenCalendar && (
            <button
              onClick={onOpenCalendar}
              title="In meinen Kalender eintragen"
              className="px-3 min-h-[36px] rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center space-x-1 m3-ripple border border-neutral-200 dark:border-neutral-700 mr-auto"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Termin sichern</span>
            </button>
          )}

          {!isConfirmed && (
            <button
              onClick={() => confirmAttendance(weekId, player.id)}
              className="px-3 min-h-[36px] rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1 shadow-xs m3-ripple"
            >
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">Zusagen</span>
            </button>
          )}

          <button
            onClick={() => onOpenSwap(player.id, slotTime)}
            title="Diesen Zeitslot tauschen"
            className="px-3 min-h-[36px] rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center space-x-1 m3-ripple border border-neutral-200 dark:border-neutral-700"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span className="hidden sm:inline">Tauschen</span>
          </button>

          <button
            onClick={() => onOpenDecline(player.id)}
            title="Absagen und Ersatz suchen"
            className="px-3 min-h-[36px] rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-1 m3-ripple border border-rose-100 dark:border-rose-900/50"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Absagen</span>
          </button>

          {currentUser.isAdmin && onAdminEdit && (
            <button
              onClick={() => onAdminEdit(player.id)}
              className="px-3 min-h-[36px] rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 flex items-center space-x-1 m3-ripple border border-blue-200 dark:border-blue-800 ml-auto sm:ml-2"
            >
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Ändern</span>
            </button>
          )}
        </div>
      )}

      {/* Action Bar for Substitute who wants to cancel/step down */}
      {isSubstitute && !isGuest && player && (isMe || currentUser.isAdmin) && (
        <div className="mt-2.5 pt-2 border-t border-blue-100 dark:border-blue-900/50 flex items-center justify-between">
          <span className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">
            Du springst hier ein
          </span>
          <button
            onClick={() => cancelSubstitute(weekId, slotTime, player.id, 'Springer kann doch nicht')}
            className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 m3-ripple"
          >
            Einsatz absagen / Aussteigen ❌
          </button>
        </div>
      )}

      {/* When Slot is Declined: Claim or Reclaim logic */}
      {isDeclined && (
        <div className="mt-2.5 pt-2 border-t border-rose-200/50 dark:border-rose-900/40 flex items-center justify-between flex-wrap gap-2">
          
          {/* Case A: Original player wants to reclaim their spot */}
          {wasDeclinedByMe ? (
            <div className="w-full flex items-center justify-between">
              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                Du hast abgesagt
              </span>
              <button
                onClick={() => reclaimSlot(weekId, slotTime, currentUser.id)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs m3-ripple flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Doch dabei! (Reaktivieren 👍)</span>
              </button>
            </div>
          ) : isCurrentUserAlreadyPlaying ? (
            /* Case B: Current user is ALREADY playing this week -> NO DOUBLE BOOKING! */
            <div className="w-full flex items-center justify-between text-[11px] text-neutral-500">
              <span className="font-semibold text-rose-700 dark:text-rose-300">
                1 Platz frei
              </span>
              <span className="italic text-neutral-400">
                Du spielst bereits um {myCurrentSlot} Uhr
              </span>
            </div>
          ) : (
            /* Case C: Current user is NOT playing -> can step in! */
            <div className="w-full flex items-center justify-between flex-wrap gap-1.5">
              <div>
                <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 block">
                  1 Platz frei!
                </span>
                {cascade && cascade.openForAnyoneCount > 0 ? (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                    Freigegeben für alle
                  </span>
                ) : prioName ? (
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                    Vorrang: {prioName}
                  </span>
                ) : null}
              </div>
              <button
                onClick={() => claimOpenSlot(weekId, slotTime, currentUser.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold text-white shadow-xs m3-ripple flex items-center space-x-1 ${
                  isMeOfferedStandby ? 'bg-amber-600 hover:bg-amber-700' : ''
                }`}
                style={!isMeOfferedStandby ? { backgroundColor: theme.primary } : undefined}
              >
                <span>{isMeOfferedStandby ? 'Platz annehmen 🎾' : 'Ich springe ein! 🎾'}</span>
              </button>
            </div>
          )}

        </div>
      )}

      </div>
    </div>
  );
};
