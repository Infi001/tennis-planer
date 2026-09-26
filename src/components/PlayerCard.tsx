import React from 'react';
import { SlotAssignment, SlotTime } from '../types/tennis';
import { useApp } from '../context/AppContext';
import { Check, X, ArrowLeftRight, AlertCircle, RotateCcw, Pencil } from 'lucide-react';

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
}) => {
  const { 
    weeks, players, currentUser, theme,
    confirmAttendance, reclaimSlot, cancelSubstitute,
    claimOpenSlot, getStandbyCascadeInfo, adminDragDropAssign, adminRemovePlayer,
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
    ? players.find(p => p.id === assignment.originalPlayerId) : null;

  const week = weeks.find(w => w.id === weekId);
  const cascade = week ? getStandbyCascadeInfo(weekId) : null;
  const myCurrentSlot = getPlayerCurrentSlotInWeek(weekId, currentUser.id);
  const isCurrentUserAlreadyPlaying = !!myCurrentSlot;

  let isMeOfferedStandby = false;
  let prioName = '';
  
  if (cascade && week) {
    const sp1Player = players.find(p => p.id === week.springer1.playerId);
    const sp2Player = players.find(p => p.id === week.springer2.playerId);

    const isCurrentUserSp1Turn = week.springer1.playerId === currentUser.id && cascade.activeOfferedPrios.includes(1);
    const isCurrentUserSp2Turn = week.springer2.playerId === currentUser.id && cascade.activeOfferedPrios.includes(2);
    
    isMeOfferedStandby = isCurrentUserSp1Turn || isCurrentUserSp2Turn;

    if (cascade.activeOfferedPrios.includes(1) && sp1Player) prioName = sp1Player.name;
    else if (cascade.activeOfferedPrios.includes(2) && sp2Player) prioName = sp2Player.name;
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (!isAdmin || isGuest) return;
    e.dataTransfer.setData('playerId', assignment.playerId);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent) => { if (isAdmin) e.preventDefault(); };
  const handleDrop = (e: React.DragEvent) => {
    if (!isAdmin) return;
    e.preventDefault();
    const droppedPlayerId = e.dataTransfer.getData('playerId');
    if (droppedPlayerId && droppedPlayerId !== assignment.playerId) {
      adminDragDropAssign(weekId, slotTime, droppedPlayerId, assignment.playerId);
    }
  };

  const playerName = isGuest ? (assignment.guestName || 'Gastspieler') : (player?.name || 'Unbekannt');

  return (
    <div
      draggable={isAdmin && !isGuest}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`rounded-2xl border transition-all duration-200 shadow-xs overflow-hidden ${
        isMe 
          ? 'border-2 border-[var(--club-primary)] bg-blue-50/30 dark:bg-blue-950/20 shadow-sm' 
          : 'border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-800'
      } ${isAdmin && !isGuest ? 'cursor-grab active:cursor-grabbing hover:border-blue-400' : ''} ${
        isDeclined ? 'opacity-70 grayscale-[0.2]' : ''
      }`}
    >
      {/* Main Info Row */}
      <div className="p-3.5">
        {/* Top: Avatar + Player Details (Full uninterrupted width) */}
        <div className="flex items-center space-x-3 min-w-0">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs"
            style={{ backgroundColor: isGuest ? '#6b7280' : player?.avatarColor || theme.primary }}
          >
            {isGuest ? 'G' : player?.shortName}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-base font-bold truncate leading-tight ${isDeclined ? 'text-neutral-500 line-through' : 'text-neutral-900 dark:text-neutral-100'}`}>
                {playerName}
              </span>

              {isMe && (
                <span 
                  className="px-2 py-0.5 rounded text-[10px] font-black uppercase text-white shadow-xs shrink-0"
                  style={{ backgroundColor: theme.primary }}
                >
                  DU
                </span>
              )}
            </div>

            {/* Status Line */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              <span className="text-[11px] text-neutral-400 font-semibold">P{index + 1}</span>
              <span className="text-neutral-300 dark:text-neutral-600">•</span>

              {isConfirmed && (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Dabei
                </span>
              )}

              {isDeclined && (
                <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {assignment.declineReason || 'Abgesagt'}
                </span>
              )}

              {isSubstitute && originalPlayer && (
                <span className="text-blue-600 dark:text-blue-400 font-semibold truncate">
                  Springer für {originalPlayer.name}
                </span>
              )}

              {isSwapped && (
                <span className="text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1">
                  <ArrowLeftRight className="w-3.5 h-3.5" /> Getauscht
                </span>
              )}

              {assignment.status === 'pending' && (
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  Offen
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dedicated Admin Action Row for other players (Clean, spacious, full width) */}
        {isAdmin && !isMe && (
          <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-700/60 flex items-center gap-2">
            {onAdminEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdminEdit(player ? player.id : `guest_${assignment.guestName}`);
                }}
                title="Spieler austauschen / bearbeiten (Admin)"
                className="flex-1 py-1.5 px-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700/60 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-neutral-200/80 dark:border-neutral-600 shadow-2xs cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
                <span>Ändern</span>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const targetId = player ? player.id : `guest_${assignment.guestName}`;
                adminRemovePlayer(weekId, slotTime, targetId);
              }}
              title="Spieler aus diesem Slot entfernen (Admin)"
              className="flex-1 py-1.5 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-rose-200 dark:border-rose-900/60 shadow-2xs cursor-pointer"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Entfernen</span>
            </button>
          </div>
        )}

        {/* Dedicated Action Row ONLY for the logged-in user (isMe) */}
        {isMe && !isDeclined && !isGuest && player && !isSubstitute && (
          <div className="mt-2.5 pt-2 border-t border-neutral-200/70 dark:border-neutral-700/60 space-y-1.5">
            {!isConfirmed && (
              <button 
                onClick={() => confirmAttendance(weekId, player.id)} 
                title="Ich bin dabei (Zusagen)" 
                className="w-full py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors m3-ripple"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Zusagen</span>
              </button>
            )}

            <button 
              onClick={() => onOpenSwap(player.id, slotTime)} 
              title="Tauschanfrage an Mitspieler stellen" 
              className="w-full py-1.5 px-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors m3-ripple border border-neutral-200/60 dark:border-neutral-600"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
              <span>Tauschanfrage stellen</span>
            </button>

            <button 
              onClick={() => onOpenDecline(player.id)} 
              title="Für diesen Montag absagen" 
              className="w-full py-1.5 px-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors m3-ripple border border-rose-200 dark:border-rose-900/60"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Termin absagen</span>
            </button>
          </div>
        )}

        {/* Action Row for Substitute who wants to cancel (isSubstitute && isMe) */}
        {isSubstitute && !isGuest && player && (isMe || isAdmin) && (
          <div className="mt-2.5 pt-2 border-t border-neutral-200/70 dark:border-neutral-700/60">
            <button 
              onClick={() => cancelSubstitute(weekId, slotTime, player.id, 'Springer kann doch nicht')} 
              title="Einsatz absagen" 
              className="w-full py-1.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-rose-200 dark:border-rose-900"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Einsatz absagen (Aussteigen)</span>
            </button>
          </div>
        )}
      </div>

      {/* Declined Slot Claim Area */}
      {isDeclined && (
        <div className="bg-rose-50 dark:bg-rose-900/10 border-t border-rose-100 dark:border-rose-900/30 p-2.5 flex items-center justify-between">
          {wasDeclinedByMe ? (
            <>
              <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold px-1">Du hast abgesagt</span>
              <button 
                onClick={() => reclaimSlot(weekId, slotTime, currentUser.id)} 
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> 
                <span>Doch dabei!</span>
              </button>
            </>
          ) : isCurrentUserAlreadyPlaying ? (
            <div className="w-full flex items-center justify-between px-1">
              <span className="font-bold text-xs text-rose-600 dark:text-rose-400">1 Platz frei</span>
              <span className="text-xs text-neutral-500">Du spielst um {myCurrentSlot} Uhr</span>
            </div>
          ) : (
            <>
              <div className="flex flex-col px-1 leading-tight">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">1 Platz frei!</span>
                {(cascade?.openForAnyoneCount ?? 0) > 0 ? (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Für alle offen</span>
                ) : prioName ? (
                  <span className="text-[10px] text-neutral-500">Vorrang: {prioName}</span>
                ) : null}
              </div>
              <button
                onClick={() => claimOpenSlot(weekId, slotTime, currentUser.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1 transition-colors ${
                  isMeOfferedStandby ? 'bg-amber-600 hover:bg-amber-700' : ''
                }`}
                style={!isMeOfferedStandby ? { backgroundColor: theme.primary } : undefined}
              >
                {isMeOfferedStandby ? 'Annehmen 🎾' : 'Einspringen 🎾'}
              </button>
            </>
          )}
        </div>
      )}

    </div>
  );
};
