import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SlotTime, Player } from '../types/tennis';
import { PlayerCard } from './PlayerCard';
import { SpringerHub } from './SpringerHub';
import { DoppelGeneratorModal } from './DoppelGeneratorModal';
import { AdminAssignModal } from './AdminAssignModal';
import { getWeekSlotKeys } from '../utils/slotTimeUtils';
import { calculateStandbyCascade } from '../utils/standbyCascade';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Calendar as CalendarIcon, 
  UserPlus, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  RotateCcw, 
  Check, 
  X, 
  ArrowLeftRight, 
  Shuffle,
  Share2,
  ShieldCheck,
  Users
} from 'lucide-react';

interface WeeklyMatchCenterProps {
  onOpenDecline: (playerId: string) => void;
  onOpenSwap: (playerId: string, fromSlot: SlotTime) => void;
  onOpenAddGuest: (slotTime: SlotTime) => void;
  onOpenCalendar?: () => void;
  onOpenWhatsApp?: () => void;
}

export const WeeklyMatchCenter: React.FC<WeeklyMatchCenterProps> = ({
  onOpenDecline,
  onOpenSwap,
  onOpenAddGuest,
  onOpenCalendar,
  onOpenWhatsApp
}) => {
  const { 
    weeks, 
    selectedWeek, 
    selectedWeekId, 
    setSelectedWeekId, 
    currentUser, 
    theme,
    confirmAttendance,
    reclaimSlot,
    cancelSubstitute,
    acceptSubstitute,
    declineSubstituteOffer,
    isPlayerScheduledInWeek,
    getPlayerCurrentSlotInWeek,
    getOpenSlotsInWeek,
    swaps,
    acceptSwap,
    declineSwap,
    cancelSwap,
    players,
    adminDragDropAssign,
    resetWeekToOriginal,
    springerCount,
  } = useApp();

  const [doppelSlot, setDoppelSlot] = useState<SlotTime | null>(null);
  const [adminAssignSlot, setAdminAssignSlot] = useState<{slotTime: SlotTime, targetPlayerIdToReplace?: string} | null>(null);
  const [assignPlayerTarget, setAssignPlayerTarget] = useState<Player | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const currentIndex = weeks.findIndex(w => w.id === selectedWeekId);
  const prevWeek = currentIndex > 0 ? weeks[currentIndex - 1] : null;
  const nextWeek = currentIndex < weeks.length - 1 ? weeks[currentIndex + 1] : null;

  if (!selectedWeek) {
    return (
      <div className="p-12 text-center text-neutral-500">
        Keine Trainingswoche ausgewählt.
      </div>
    );
  }

  // Handle cancelled week (e.g. Ostermontag)
  if (selectedWeek.isCancelled) {
    return (
      <div className="space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between bg-white dark:bg-[var(--md-sys-color-surface)] p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <button
            onClick={() => prevWeek && setSelectedWeekId(prevWeek.id)}
            disabled={!prevWeek}
            className="p-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-800 m3-ripple"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Montag, {selectedWeek.dateString}
            </h2>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
              {selectedWeek.cancelReason || 'Kein Training'}
            </p>
          </div>

          <button
            onClick={() => nextWeek && setSelectedWeekId(nextWeek.id)}
            disabled={!nextWeek}
            className="p-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-800 m3-ripple"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="p-12 rounded-3xl bg-neutral-100/50 dark:bg-[var(--md-sys-color-surface)] text-center border border-dashed border-neutral-300 dark:border-neutral-800">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl font-bold">
            🐣
          </div>
          <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-1">
            {selectedWeek.cancelReason || 'Spielfreier Feiertag'}
          </h3>
          <p className="text-sm text-neutral-500 max-w-md mx-auto">
            An diesem Montag findet kein reguläres Vereinstraining statt. Die Hallenplätze sind für dieses Datum pausiert.
          </p>
        </div>
      </div>
    );
  }

  // Dynamic slots & capacity: 4 spots per available hour
  const slotKeys = getWeekSlotKeys(selectedWeek);
  const totalCapacity = slotKeys.length * 4;
  let confirmedCount = 0;
  let declinedCount = 0;
  let pendingCount = 0;

  slotKeys.forEach(key => {
    (selectedWeek.slots[key] || []).forEach(a => {
      if (a.status === 'confirmed' || a.status === 'substitute') confirmedCount++;
      else if (a.status === 'declined') declinedCount++;
      else pendingCount++;
    });
  });

  // Total open spots: either declined or where slot has fewer than 4 players
  const totalOpenSpots = slotKeys.reduce((sum, key) => {
    const active = (selectedWeek.slots[key] || []).filter(a => a.status !== 'declined').length;
    return sum + Math.max(0, 4 - active);
  }, 0);

  // User status in this week
  const isCurrentlyPlaying = isPlayerScheduledInWeek(selectedWeek.id, currentUser.id);
  const myCurrentSlot = getPlayerCurrentSlotInWeek(selectedWeek.id, currentUser.id);
  const openSlots = getOpenSlotsInWeek(selectedWeek.id);

  // Check if current user is substitute
  let isMySlotSubstitute = false;
  let myAssignment = null;
  if (myCurrentSlot && selectedWeek.slots[myCurrentSlot]) {
    myAssignment = selectedWeek.slots[myCurrentSlot].find(a => a.playerId === currentUser.id);
    isMySlotSubstitute = myAssignment?.status === 'substitute';
  }

  // Check if current user declined and spot is still open
  let myDeclinedSlot: SlotTime | null = null;
  slotKeys.forEach(sk => {
    if ((selectedWeek.slots[sk] || []).some(a => (a.playerId === currentUser.id || a.originalPlayerId === currentUser.id) && a.status === 'declined')) {
      myDeclinedSlot = sk;
    }
  });

  const isCurrentUserSp1 = selectedWeek.springer1.playerId === currentUser.id;
  const isCurrentUserSp2 = selectedWeek.springer2.playerId === currentUser.id;
  const isCurrentUserFrei = selectedWeek.frei.playerId === currentUser.id;

  // Standby Priority Cascade calculations
  const cascade = calculateStandbyCascade(selectedWeek, springerCount);
  const sp1Player = players.find(p => p.id === selectedWeek.springer1.playerId);
  const sp2Player = players.find(p => p.id === selectedWeek.springer2.playerId);
  const freiPlayer = players.find(p => p.id === selectedWeek.frei?.playerId);

  const isCurrentUserSp1Turn = isCurrentUserSp1 && cascade.activeOfferedPrios.includes(1);
  const isCurrentUserSp2Turn = isCurrentUserSp2 && cascade.activeOfferedPrios.includes(2) && springerCount >= 2;
  const isCurrentUserFreiTurn = isCurrentUserFrei && cascade.activeOfferedPrios.includes(3) && springerCount >= 3;
  const isCurrentUserStandbyTurn = isCurrentUserSp1Turn || isCurrentUserSp2Turn || isCurrentUserFreiTurn;

  // Swap lookups
  const incomingSwapForMe = swaps.find(s => 
    s.weekId === selectedWeek.id && 
    s.status === 'pending' && 
    myCurrentSlot && 
    s.targetSlot === myCurrentSlot && 
    (!s.targetPlayerId || s.targetPlayerId === currentUser.id)
  );
  const requesterOfIncomingSwap = incomingSwapForMe 
    ? players.find(p => p.id === incomingSwapForMe.fromPlayerId) 
    : null;

  const myOutgoingSwap = swaps.find(s =>
    s.weekId === selectedWeek.id &&
    s.status === 'pending' &&
    s.fromPlayerId === currentUser.id
  );

  // Handle Swipe Gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = touchStart - currentTouch;
    
    if (diff > 50 && nextWeek) { // swiped left
      setSelectedWeekId(nextWeek.id);
      setTouchStart(null);
    } else if (diff < -50 && prevWeek) { // swiped right
      setSelectedWeekId(prevWeek.id);
      setTouchStart(null);
    }
  };
  
  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Swipeable Area */}
      <div 
        className="flex-1 min-w-0 space-y-6"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
      
      {/* Week Navigator Card */}
      <div className="bg-white dark:bg-[var(--md-sys-color-surface)] p-4 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        
        <div className="flex items-center justify-between sm:justify-start space-x-3">
          <button
            onClick={() => prevWeek && setSelectedWeekId(prevWeek.id)}
            disabled={!prevWeek}
            className="py-2 px-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs flex items-center gap-1.5 m3-ripple"
            title="Vorherige Woche"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Vorige Woche</span>
          </button>

          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Woche {currentIndex + 1} von {weeks.length}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Winterrunde 26/27
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight flex items-center justify-center sm:justify-start gap-2">
              <CalendarIcon className="w-5 h-5 text-neutral-400" />
              Montag, {selectedWeek.dateString}
            </h2>
          </div>

          <button
            onClick={() => nextWeek && setSelectedWeekId(nextWeek.id)}
            disabled={!nextWeek}
            className="py-2 px-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs flex items-center gap-1.5 m3-ripple"
            title="Nächste Woche"
          >
            <span className="hidden sm:inline">Nächste Woche</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Status Chips */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{confirmedCount}/{totalCapacity} Besetzt</span>
          </div>

          {totalOpenSpots > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center space-x-1.5 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>{totalOpenSpots} {totalOpenSpots === 1 ? 'Platz frei' : 'Plätze frei'} – Kaskade aktiv!</span>
            </div>
          )}

          {pendingCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 flex items-center space-x-1.5">
              <span>{pendingCount} Offen</span>
            </div>
          )}

          {/* Action Buttons for this Week */}
          <div className="flex items-center space-x-2 ml-auto">
            {onOpenCalendar && (
              <button
                onClick={onOpenCalendar}
                title="Diesen Spieltag in den Kalender exportieren"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all m3-ripple"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kalender</span>
              </button>
            )}
            
            {onOpenWhatsApp && (
              <button
                onClick={onOpenWhatsApp}
                title="Diesen Spieltag via WhatsApp teilen"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-all m3-ripple"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Prominent Personal Status & Action Banner */}
      <div className={`p-4 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs transition-all ${
        isCurrentUserStandbyTurn 
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 ring-2 ring-amber-400/30'
          : cascade.openForAnyoneCount > 0 && !isCurrentlyPlaying
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
            : 'bg-white dark:bg-[var(--md-sys-color-surface)] border-neutral-200/80 dark:border-neutral-800'
      }`}>
        
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs"
            style={{ backgroundColor: currentUser.avatarColor || theme.primary }}
          >
            {currentUser.shortName}
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Dein persönlicher Status ({currentUser.name})
            </div>
            
            {myCurrentSlot ? (
              <p className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100 leading-snug">
                <span>{isMySlotSubstitute ? '🦘 Du bist als Springer eingeteilt um ' : '🎾 Du spielst um '}</span>
                <span className="text-blue-600 dark:text-blue-400 whitespace-nowrap">{myCurrentSlot} Uhr</span>
                <span className="whitespace-nowrap">{myAssignment?.status === 'confirmed' ? ' (Bestätigt ✅)' : ' (Noch offen ⏳)'}</span>
              </p>
            ) : myDeclinedSlot ? (
              <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                ❌ Du hast für {myDeclinedSlot} Uhr abgesagt (Platz ist noch frei)
              </p>
            ) : isCurrentUserStandbyTurn ? (
              <p className="text-sm font-extrabold text-amber-800 dark:text-amber-200 flex items-center gap-1.5 animate-pulse">
                🔔 Du bist als {isCurrentUserSp1Turn ? '1. Springer (Prio 1)' : isCurrentUserSp2Turn ? '2. Springer (Prio 2)' : '3. Springer (Prio 3)'} an der Reihe!
              </p>
            ) : isCurrentUserSp1 ? (
              <p className="text-sm font-extrabold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                🟡 Du bist 1. Springer für diesen Montag {cascade.springer1.status === 'declined' ? '(Abgelehnt ❌)' : '(Prio 1)'}
              </p>
            ) : isCurrentUserSp2 && springerCount >= 2 ? (
              <p className="text-sm font-extrabold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                🟡 Du bist 2. Springer für diesen Montag {cascade.springer2.status === 'declined' ? '(Abgelehnt ❌)' : '(Prio 2)'}
              </p>
            ) : isCurrentUserFrei && springerCount >= 3 ? (
              <p className="text-sm font-extrabold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                🟡 Du bist 3. Springer für diesen Montag {cascade.frei?.status === 'declined' ? '(Abgelehnt ❌)' : '(Prio 3)'}
              </p>
            ) : isCurrentUserFrei ? (
              <p className="text-sm font-extrabold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                💤 Du hast diese Woche regulär spielfrei
              </p>
            ) : cascade.openForAnyoneCount > 0 ? (
              <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                🟢 Freier Platz verfügbar – Offen für alle Vereinsmitglieder!
              </p>
            ) : (
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Nicht aktiv eingeteilt
              </p>
            )}
          </div>
        </div>

        {/* Dynamic Personal Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-end">
          
          {/* Action 1: If scheduled and pending */}
          {myCurrentSlot && myAssignment?.status === 'pending' && (
            <button
              onClick={() => confirmAttendance(selectedWeek.id, currentUser.id)}
              className="py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center space-x-1.5 shadow-xs m3-ripple"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Ich bin dabei 👍 (Zusagen)</span>
            </button>
          )}

          {/* Action 2: If scheduled, allow swap and decline */}
          {myCurrentSlot && !isMySlotSubstitute && (
            <>
              <button
                onClick={() => onOpenSwap(currentUser.id, myCurrentSlot)}
                className="py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 flex items-center space-x-1.5 m3-ripple"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Tauschanfrage stellen</span>
              </button>
              <button
                onClick={() => onOpenDecline(currentUser.id)}
                className="py-2 px-3 rounded-xl text-xs sm:text-sm font-bold text-rose-600 bg-white dark:bg-neutral-800 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 flex items-center space-x-1.5 m3-ripple"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Termin absagen</span>
              </button>
            </>
          )}

          {/* Action 3: If substitute, allow exit */}
          {myCurrentSlot && isMySlotSubstitute && (
            <button
              onClick={() => cancelSubstitute(selectedWeek.id, myCurrentSlot, currentUser.id, 'Ersatzspieler kann doch nicht')}
              className="py-2 px-3 rounded-xl text-xs sm:text-sm font-bold text-rose-600 bg-white dark:bg-neutral-800 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 flex items-center space-x-1.5 m3-ripple"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Einsatz absagen / Aussteigen</span>
            </button>
          )}

          {/* Action 4: If previously declined and spot is still open, allow reclaim */}
          {myDeclinedSlot && (
            <button
              onClick={() => myDeclinedSlot && reclaimSlot(selectedWeek.id, myDeclinedSlot, currentUser.id)}
              className="py-2 px-3.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs m3-ripple flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Doch dabei! (Wieder zusagen 👍)</span>
            </button>
          )}

          {/* Action 5A: Standby Priority Call to Action */}
          {isCurrentUserStandbyTurn && openSlots.length > 0 && (
            <div className="flex items-center flex-wrap gap-1.5">
              {openSlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => acceptSubstitute(selectedWeek.id, slot, currentUser.id)}
                  className="py-2 px-3 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs m3-ripple flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{slot} Uhr annehmen 🎾</span>
                </button>
              ))}
              <button
                onClick={() => declineSubstituteOffer(selectedWeek.id, currentUser.id)}
                className="py-2 px-3 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-rose-600 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 m3-ripple"
              >
                Ablehnen (Weitergeben ➔)
              </button>
            </div>
          )}

          {/* Action 5B: General Claim if not scheduled and open spots exist */}
          {!isCurrentlyPlaying && !isCurrentUserStandbyTurn && openSlots.length > 0 && !myDeclinedSlot && (
            <div className="flex items-center space-x-1.5">
              {openSlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => acceptSubstitute(selectedWeek.id, slot, currentUser.id)}
                  className="py-2 px-3 rounded-xl text-xs font-bold text-white shadow-xs m3-ripple flex items-center space-x-1"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{slot} Uhr übernehmen 🎾</span>
                </button>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Incoming swap offer for me (Prominent Full-Width Alert Card) */}
      {incomingSwapForMe && (
        <div className="p-4 sm:p-5 rounded-3xl bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-300 dark:border-purple-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start sm:items-center space-x-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                  Tauschanfrage erhalten
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                  {incomingSwapForMe.fromSlot} ➔ {myCurrentSlot} Uhr
                </span>
              </div>
              <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
                <strong>{requesterOfIncomingSwap?.name}</strong> ({incomingSwapForMe.fromSlot} Uhr) möchte mit deiner Spielzeit (<strong>{myCurrentSlot} Uhr</strong>) tauschen.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={() => acceptSwap(incomingSwapForMe.id, currentUser.id)}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs m3-ripple flex items-center justify-center space-x-1.5 text-center active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 shrink-0" />
              <span>Tausch annehmen (auf {incomingSwapForMe.fromSlot} wechseln)</span>
            </button>
            <button
              onClick={() => declineSwap(incomingSwapForMe.id)}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:text-rose-600 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-center active:scale-95"
            >
              Ablehnen
            </button>
          </div>
        </div>
      )}

      {/* Outgoing swap notice (Full-Width Card) */}
      {myOutgoingSwap && (
        <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-purple-900 dark:text-purple-200">
          <div className="flex items-center space-x-2.5">
            <ArrowLeftRight className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>Deine Tauschanfrage an <strong>{myOutgoingSwap.targetSlot} Uhr</strong> ist aktiv (Warte auf Bestätigung)...</span>
          </div>
          <button
            onClick={() => cancelSwap(myOutgoingSwap.id)}
            className="py-1.5 px-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900 shrink-0 m3-ripple whitespace-nowrap"
          >
            Anfrage abbrechen
          </button>
        </div>
      )}

      {/* Mobile Admin Quick-Assign Strip (Visible only on < lg screens) */}
      {currentUser.isAdmin && (
        <div className="block lg:hidden p-4 rounded-3xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                Verfügbare Spieler nachsetzen ({players.filter(p => !isPlayerScheduledInWeek(selectedWeek.id, p.id)).length})
              </span>
            </div>
            <span className="text-[10px] text-neutral-500">Tippen zum Einteilen</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {players
              .filter(p => !isPlayerScheduledInWeek(selectedWeek.id, p.id))
              .map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setAssignPlayerTarget(p)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xs hover:border-blue-400 active:scale-95 transition-all m3-ripple flex items-center space-x-1.5 text-neutral-800 dark:text-neutral-200"
                >
                  <div 
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white font-bold shrink-0"
                    style={{ backgroundColor: p.avatarColor || theme.primary }}
                  >
                    {p.shortName}
                  </div>
                  <span>{p.name}</span>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-extrabold">+</span>
                </button>
              ))}
            {players.filter(p => !isPlayerScheduledInWeek(selectedWeek.id, p.id)).length === 0 && (
              <span className="text-xs text-neutral-500 italic">Alle Spieler sind bereits eingeteilt.</span>
            )}
          </div>
        </div>
      )}

      {/* Courts / Timeslots Layout (Dynamic hours count) */}
      <div className={`grid grid-cols-1 ${
        slotKeys.length === 1 
          ? 'max-w-md mx-auto' 
          : slotKeys.length === 2 
            ? 'md:grid-cols-2 max-w-4xl mx-auto' 
            : slotKeys.length === 4 
              ? 'md:grid-cols-2 xl:grid-cols-4' 
              : 'lg:grid-cols-3'
      } gap-5`}>
        {slotKeys.map((slotKey, slotIdx) => {
          const rawAssignments = selectedWeek.slots[slotKey];
          const assignments = rawAssignments.filter((a, idx, arr) => a.isGuest || arr.findIndex(other => other.playerId === a.playerId) === idx);
          const activeAssignments = assignments.filter(a => a.status !== 'declined');
          const openSpotsInThisSlot = Math.max(0, 4 - activeAssignments.length);
          const hasOpenSlot = openSpotsInThisSlot > 0 || assignments.some(a => a.status === 'declined');

          return (
            <div 
              key={slotKey}
              className={`bg-neutral-50 dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-5 border transition-all duration-200 ${
                hasOpenSlot 
                  ? 'border-amber-300 dark:border-amber-700/80 shadow-md ring-2 ring-amber-400/20' 
                  : 'border-neutral-200/80 dark:border-neutral-800 shadow-sm'
              }`}
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs font-bold text-xs"
                    style={{ backgroundColor: theme.primary }}
                  >
                    #{slotIdx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 whitespace-nowrap">
                      <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>{slotKey} Uhr</span>
                    </h3>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                      <span>{activeAssignments.length}/4 Spieler besetzt</span>
                      {openSpotsInThisSlot > 0 && (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          • {openSpotsInThisSlot} {openSpotsInThisSlot === 1 ? 'Platz frei' : 'Plätze frei'}!
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setDoppelSlot(slotKey)}
                    title="Faire Doppel-Paarung für diese 4 Spieler auslosen"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 m3-ripple"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>

                  {/* Nachsetzen Button for Admin */}
                  {currentUser.isAdmin && (
                    <button
                      onClick={() => setAdminAssignSlot({ slotTime: slotKey })}
                      title="Spieler zu diesem Slot nachsetzen oder austauschen"
                      className="py-1 px-2.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors flex items-center gap-1 shrink-0 m3-ripple"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Nachsetzen</span>
                    </button>
                  )}

                  {/* Add Guest Button for Admin */}
                  {currentUser.isAdmin && (
                    <button
                      onClick={() => onOpenAddGuest(slotKey)}
                      title="Gastspieler zu diesem Slot hinzufügen"
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 m3-ripple"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Incoming Swap Requests targeting this Slot */}
              {swaps
                .filter(s => s.weekId === selectedWeek.id && s.targetSlot === slotKey && s.status === 'pending')
                .map(swap => {
                  const requester = players.find(p => p.id === swap.fromPlayerId);
                  const isTargetedToMe = !swap.targetPlayerId || swap.targetPlayerId === currentUser.id;
                  const amIInThisSlot = assignments.some(a => a.playerId === currentUser.id);

                  return (
                    <div 
                      key={swap.id}
                      className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2 mb-3 shadow-xs animate-in fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-900 dark:text-purple-200">
                          <ArrowLeftRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>Tauschanfrage von {requester?.name}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                          {swap.fromSlot} ➔ {slotKey}
                        </span>
                      </div>

                      <p className="text-[11px] text-purple-800 dark:text-purple-300">
                        {requester?.name} spielt um <strong>{swap.fromSlot} Uhr</strong> und möchte in diesen Slot (<strong>{slotKey} Uhr</strong>) wechseln.
                      </p>

                      {amIInThisSlot && isTargetedToMe ? (
                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            onClick={() => acceptSwap(swap.id, currentUser.id)}
                            className="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs m3-ripple flex items-center justify-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Tausch annehmen (auf {swap.fromSlot} wechseln)</span>
                          </button>
                          <button
                            onClick={() => declineSwap(swap.id)}
                            className="py-1.5 px-2.5 rounded-xl text-xs font-semibold text-neutral-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Tauschanfrage ablehnen"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : swap.targetPlayerId ? (
                        <div className="text-[10px] text-neutral-500 italic">
                          Tauschanfrage an {players.find(p => p.id === swap.targetPlayerId)?.name}
                        </div>
                      ) : (
                        <div className="text-[10px] text-neutral-500 italic">
                          Offen für alle Spieler in diesem Slot
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* 4 Player Cards in this Slot (with strict deduplication guarantee) */}
              <div className="space-y-2.5">
                {assignments.map((assignment, pIdx) => (
                  <PlayerCard
                    key={`${assignment.playerId}-${pIdx}`}
                    assignment={assignment}
                    slotTime={slotKey}
                    weekId={selectedWeek.id}
                    index={pIdx}
                    onOpenDecline={onOpenDecline}
                    onOpenSwap={onOpenSwap}
                    onAdminEdit={(playerId) => setAdminAssignSlot({ slotTime: slotKey, targetPlayerIdToReplace: playerId })}
                    onOpenCalendar={onOpenCalendar}
                  />
                ))}

                {/* If slot has fewer than 4 assignments, render interactive open spot cards */}
                {Array.from({ length: Math.max(0, 4 - assignments.length) }).map((_, emptyIdx) => {
                  const spotNum = assignments.length + emptyIdx + 1;
                  
                  // Priority indicator
                  let prioLabel = 'Prio 1: 1. Springer';
                  let prioName = sp1Player?.name || '1. Springer';
                  let isMyPrioTurn = isCurrentUserSp1Turn;

                  if (cascade.activeOfferedPrios.includes(1) && sp1Player) {
                    prioLabel = 'Prio 1: 1. Springer';
                    prioName = sp1Player.name;
                    isMyPrioTurn = isCurrentUserSp1;
                  } else if (springerCount >= 2 && cascade.activeOfferedPrios.includes(2) && sp2Player) {
                    prioLabel = 'Prio 2: 2. Springer';
                    prioName = sp2Player.name;
                    isMyPrioTurn = isCurrentUserSp2;
                  } else if (springerCount >= 3 && cascade.activeOfferedPrios.includes(3) && freiPlayer) {
                    prioLabel = 'Prio 3: 3. Springer';
                    prioName = freiPlayer.name;
                    isMyPrioTurn = isCurrentUserFrei;
                  } else if (cascade.openForAnyoneCount > 0) {
                    prioLabel = 'Offen für alle';
                    prioName = 'Alle Vereinsmitglieder';
                    isMyPrioTurn = false;
                  }

                  return (
                      <div 
                      key={`empty-spot-${emptyIdx}`}
                      onClick={() => {
                        if (currentUser.isAdmin) setAdminAssignSlot({ slotTime: slotKey });
                      }}
                      onDragOver={(e) => {
                        if (currentUser.isAdmin) e.preventDefault();
                      }}
                      onDrop={(e) => {
                        if (!currentUser.isAdmin) return;
                        e.preventDefault();
                        const droppedPlayerId = e.dataTransfer.getData('playerId');
                        if (droppedPlayerId) {
                          adminDragDropAssign(selectedWeek.id, slotKey, droppedPlayerId);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                        isMyPrioTurn
                          ? 'border-amber-400 bg-amber-50/80 dark:bg-amber-950/40 ring-2 ring-amber-400/30 shadow-xs'
                          : cascade.openForAnyoneCount > 0
                            ? 'border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/60 dark:bg-emerald-950/20'
                            : 'border-amber-300 dark:border-amber-700/80 bg-amber-50/60 dark:bg-amber-950/20'
                      } flex items-center justify-between ${currentUser.isAdmin ? 'hover:border-blue-400 hover:bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-full border-2 border-dashed border-amber-400 dark:border-amber-600 flex items-center justify-center text-amber-700 dark:text-amber-300 font-extrabold text-xs">
                          #{spotNum}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 flex-wrap">
                            <span>Freier Platz #{spotNum}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                              {prioLabel}
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                            {cascade.openForAnyoneCount > 0 ? (
                              <span className="text-emerald-700 dark:text-emerald-400 font-bold">Freigegeben für alle Vereinsmitglieder</span>
                            ) : (
                              <span>Vorrang für {prioName}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isCurrentlyPlaying ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              acceptSubstitute(selectedWeek.id, slotKey, currentUser.id);
                            }}
                            className={`py-1.5 px-3 rounded-xl text-[10px] sm:text-xs font-bold text-white shadow-xs m3-ripple flex items-center space-x-1 ${
                              isMyPrioTurn ? 'bg-amber-600 hover:bg-amber-700' : ''
                            }`}
                            style={!isMyPrioTurn ? { backgroundColor: theme.primary } : undefined}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isMyPrioTurn ? 'Platz annehmen 🎾' : 'Hier einspringen'}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-neutral-400 italic hidden sm:block">
                            Du spielst um {myCurrentSlot} Uhr
                          </span>
                        )}
                        
                        {currentUser.isAdmin && (
                          <button
                            className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                            title="Spieler manuell hinzufügen"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

      {/* Mobile Admin Quick-Assign Card (Visible only on < lg screens) */}
      {currentUser.isAdmin && (
        <div className="block lg:hidden p-5 rounded-3xl bg-neutral-100/70 dark:bg-[var(--md-sys-color-surface)] border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Verfügbare Spieler nachsetzen
              </h3>
              <p className="text-xs text-neutral-500">
                Tippe auf einen Spieler, um ihn direkt in einen Zeitslot einzuteilen
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {players
              .filter(p => !isPlayerScheduledInWeek(selectedWeek.id, p.id))
              .map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setAssignPlayerTarget(p)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xs hover:border-blue-400 active:scale-95 transition-all m3-ripple flex items-center space-x-2 text-neutral-800 dark:text-neutral-200"
                >
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0"
                    style={{ backgroundColor: p.avatarColor || theme.primary }}
                  >
                    {p.shortName}
                  </div>
                  <span>{p.name}</span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold">+</span>
                </button>
              ))}
            {players.filter(p => !isPlayerScheduledInWeek(selectedWeek.id, p.id)).length === 0 && (
              <span className="text-xs text-neutral-500 italic">Alle Spieler sind bereits eingeteilt.</span>
            )}
          </div>

          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700/60">
            <button
              onClick={() => {
                if (window.confirm('Möchtest du diesen Spieltag wirklich auf den ursprünglich berechneten Basis-Plan zurücksetzen? Alle manuellen Anpassungen, Tausche und Springer werden entfernt!')) {
                  resetWeekToOriginal(selectedWeek.id);
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center space-x-2 transition-colors m3-ripple"
              title="Auf den ursprünglichen Plan zurücksetzen"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Spieltag auf Original zurücksetzen</span>
            </button>
          </div>
        </div>
      )}

      {/* Springer- & Standby-Hub */}
      <SpringerHub week={selectedWeek} />

      </div> {/* End Main Swipeable Area */}

      {/* Admin Drag & Drop Pool (Sidebar on Desktop) */}
      {currentUser.isAdmin && (
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-24 p-5 rounded-3xl bg-neutral-100/50 dark:bg-[var(--md-sys-color-surface)] border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Verfügbare Spieler
                </h3>
              </div>
              <p className="text-[11px] text-neutral-500 mb-3">
                Klicken zum schnellen Zuweisen oder per Drag & Drop in einen Zeitslot ziehen.
              </p>
              
              <div className="flex flex-wrap gap-2">
                {players
                  .filter(p => !isPlayerScheduledInWeek(selectedWeek.id, p.id))
                  .map(p => (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('playerId', p.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onClick={() => setAssignPlayerTarget(p)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xs cursor-pointer hover:border-blue-400 active:cursor-grabbing m3-ripple flex items-center space-x-2"
                      title="Klicken zum Einteilen oder in Slot ziehen"
                    >
                      <div 
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white shrink-0"
                        style={{ backgroundColor: p.avatarColor || theme.primary }}
                      >
                        {p.shortName}
                      </div>
                      <span>{p.name}</span>
                    </div>
                ))}
                {players.filter(p => !isPlayerScheduledInWeek(selectedWeek.id, p.id)).length === 0 && (
                  <span className="text-xs text-neutral-500 italic">Alle Spieler sind bereits eingeteilt.</span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700/60 mt-4">
              <button
                onClick={() => {
                  if (window.confirm('Möchtest du diesen Spieltag wirklich auf den ursprünglich berechneten Basis-Plan zurücksetzen? Alle manuellen Anpassungen, Tausche und Springer werden entfernt!')) {
                    resetWeekToOriginal(selectedWeek.id);
                  }
                }}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center space-x-2 transition-colors m3-ripple whitespace-nowrap"
                title="Auf den ursprünglichen Plan zurücksetzen"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Spieltag zurücksetzen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doppel Generator Modal */}
      {doppelSlot && (
        <DoppelGeneratorModal
          slotTime={doppelSlot}
          assignments={selectedWeek.slots[doppelSlot]}
          onClose={() => setDoppelSlot(null)}
        />
      )}

      {/* Admin Tap-to-Assign Bottom Sheet (from slot header button) */}
      {adminAssignSlot && (
        <AdminAssignModal
          isOpen={true}
          onClose={() => setAdminAssignSlot(null)}
          weekId={selectedWeekId}
          slotTime={adminAssignSlot.slotTime}
          targetPlayerIdToReplace={adminAssignSlot.targetPlayerIdToReplace}
        />
      )}

      {/* Admin Quick Slot Chooser Modal (when clicking an unassigned player) */}
      {assignPlayerTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" 
            onClick={() => setAssignPlayerTarget(null)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0"
                  style={{ backgroundColor: assignPlayerTarget.avatarColor || theme.primary }}
                >
                  {assignPlayerTarget.shortName}
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    {assignPlayerTarget.name} nachsetzen
                  </h3>
                  <p className="text-xs text-neutral-500">
                    In welchen Zeitslot soll der Spieler eingeteilt werden?
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setAssignPlayerTarget(null)}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {slotKeys.map(slot => {
                const slotPlayers = selectedWeek.slots[slot] || [];
                const activeCount = slotPlayers.filter(a => a.status !== 'declined').length;
                const isFull = activeCount >= 4;

                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      adminDragDropAssign(selectedWeek.id, slot, assignPlayerTarget.id);
                      setAssignPlayerTarget(null);
                    }}
                    className="w-full p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 text-left flex items-center justify-between transition-all m3-ripple"
                  >
                    <div>
                      <span className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100 block">
                        {slot} Uhr
                      </span>
                      <span className="text-xs text-neutral-500">
                        {activeCount}/4 Spieler belegt
                      </span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${
                      isFull 
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {isFull ? 'Slot voll (ersetzen)' : 'Freier Platz 🎾'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
