import React from 'react';
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
    weeks, players, currentUser, theme,
    confirmAttendance, reclaimSlot, cancelSubstitute,
    claimOpenSlot, getStandbyCascadeInfo, adminDragDropAssign,
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
    const freiPlayer = players.find(p => p.id === week.frei?.playerId);

    const isCurrentUserSp1Turn = week.springer1.playerId === currentUser.id && cascade.activeOfferedPrios.includes(1);
    const isCurrentUserSp2Turn = week.springer2.playerId === currentUser.id && cascade.activeOfferedPrios.includes(2);
    const isCurrentUserFreiTurn = week.frei?.playerId === currentUser.id && cascade.activeOfferedPrios.includes(3);
    
    isMeOfferedStandby = isCurrentUserSp1Turn || isCurrentUserSp2Turn || isCurrentUserFreiTurn;

    if (cascade.activeOfferedPrios.includes(1) && sp1Player) prioName = sp1Player.name;
    else if (cascade.activeOfferedPrios.includes(2) && sp2Player) prioName = sp2Player.name;
    else if (cascade.activeOfferedPrios.includes(3) && freiPlayer) prioName = freiPlayer.name;
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

  return (
    <div
      draggable={isAdmin && !isGuest}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative overflow-hidden rounded-xl border transition-all duration-200 shadow-sm border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800
      ${isMe ? 'ring-1 ring-[var(--club-primary)] dark:ring-[var(--club-primary)]/80' : ''}
      ${isAdmin && !isGuest ? 'cursor-grab active:cursor-grabbing hover:border-blue-400' : ''}
      ${isDeclined ? 'opacity-70 grayscale-[0.3]' : ''}
      ${isSubstitute ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
    >
      {/* Admin Quick Remove Button */}
      {isAdmin && !isDeclined && (
        <button
          onClick={(e) => { e.stopPropagation(); adminDragDropAssign(weekId, slotTime, player ? player.id : `guest_${assignment.guestName}`, 'remove'); }}
          className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-rose-100 dark:bg-rose-900/50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-full flex items-center justify-center border border-white dark:border-neutral-800 shadow-sm transition-colors z-10"
          title="Spieler aus Slot entfernen"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      <div className="flex items-center justify-between gap-2 p-2 sm:p-3">
        
        {/* Left Side: Avatar + Info */}
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs`}
            style={{ backgroundColor: isGuest ? '#6b7280' : player?.avatarColor || theme.primary }}
          >
            {isGuest ? 'G' : player?.shortName}
          </div>
          
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-bold truncate ${isDeclined ? 'text-neutral-500 line-through' : 'text-neutral-900 dark:text-neutral-100'}`}>
                {isGuest ? assignment.guestName || 'Gastspieler' : player?.name}
              </span>
              {isMe && <span className="hidden sm:inline-block px-1 py-0.5 rounded text-[9px] font-black uppercase bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">Du</span>}
            </div>
            
            {/* Sub-status line */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400">
              {!isDeclined && !isSubstitute && <span>P{index + 1}</span>}
              {isConfirmed && <span className="text-emerald-600 dark:text-emerald-400 flex items-center"><Check className="w-3 h-3 mr-0.5"/>Dabei</span>}
              {isDeclined && <span className="text-rose-600 dark:text-rose-400 flex items-center"><AlertCircle className="w-3 h-3 mr-0.5"/>{assignment.declineReason || 'Abgesagt'}</span>}
              {isSubstitute && originalPlayer && <span className="text-blue-600 dark:text-blue-400 truncate">Springer für {originalPlayer.name}</span>}
              {isSwapped && <span className="text-purple-600 dark:text-purple-400 flex items-center"><ArrowLeftRight className="w-3 h-3 mr-0.5"/>Tausch</span>}
              {assignment.status === 'pending' && <span className="text-amber-600 dark:text-amber-400">Offen</span>}
            </div>
          </div>
        </div>

        {/* Right Side: Compact Actions */}
        <div className="flex items-center gap-1 shrink-0">
          
          {/* Action Bar for Regular Scheduled Player */}
          {(isMe || currentUser.isAdmin) && !isGuest && player && !isDeclined && !isSubstitute && (
            <>
              
              {!isConfirmed && (
                <button onClick={() => confirmAttendance(weekId, player.id)} title="Zusagen" className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 transition-colors">
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
              )}
              <button onClick={() => onOpenSwap(player.id, slotTime)} title="Tauschen" className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 transition-colors">
                <ArrowLeftRight className="w-4 h-4" />
              </button>
              <button onClick={() => onOpenDecline(player.id)} title="Absagen" className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
              {currentUser.isAdmin && onAdminEdit && (
                <button onClick={() => onAdminEdit(player.id)} title="Ändern" className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200 transition-colors ml-1">
                  <UserCheck className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          {/* Action Bar for Substitute who wants to cancel */}
          {isSubstitute && !isGuest && player && (isMe || currentUser.isAdmin) && (
            <button onClick={() => cancelSubstitute(weekId, slotTime, player.id, 'Springer kann doch nicht')} title="Einsatz absagen" className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-200 transition-colors flex items-center gap-1 text-[11px] font-bold pr-2">
              <X className="w-4 h-4" /> <span className="hidden sm:inline">Absagen</span>
            </button>
          )}
        </div>
      </div>

      {/* Declined Slot Claim Area (Rendered compactly as a bottom strip if declined) */}
      {isDeclined && (
        <div className="bg-rose-50 dark:bg-rose-900/10 border-t border-rose-100 dark:border-rose-900/30 p-2 flex items-center justify-between">
          {wasDeclinedByMe ? (
            <>
              <span className="text-[10px] text-rose-600 font-semibold px-1">Du hast abgesagt</span>
              <button onClick={() => reclaimSlot(weekId, slotTime, currentUser.id)} className="px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
                <RotateCcw className="w-3 h-3" /> Reaktivieren
              </button>
            </>
          ) : isCurrentUserAlreadyPlaying ? (
            <div className="w-full flex items-center justify-between px-1">
              <span className="font-bold text-[10px] text-rose-600">1 Platz frei</span>
              <span className="text-[10px] text-neutral-500">Du spielst um {myCurrentSlot} Uhr</span>
            </div>
          ) : (
            <>
              <div className="flex flex-col px-1 leading-tight">
                <span className="text-[11px] font-bold text-rose-600">1 Platz frei!</span>
                {(cascade?.openForAnyoneCount ?? 0) > 0 ? (
                  <span className="text-[9px] text-emerald-600 font-semibold">Für alle offen</span>
                ) : prioName ? (
                  <span className="text-[9px] text-neutral-500">Vorrang: {prioName}</span>
                ) : null}
              </div>
              <button
                onClick={() => claimOpenSlot(weekId, slotTime, currentUser.id)}
                className={`px-2 py-1.5 rounded-md text-[11px] font-bold text-white shadow-sm flex items-center gap-1 ${isMeOfferedStandby ? 'bg-amber-500' : ''}`}
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
