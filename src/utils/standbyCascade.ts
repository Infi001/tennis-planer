import { TrainingWeek, SlotTime, Player, SlotAssignment } from '../types/tennis';
import { getWeekSlotKeys } from './slotTimeUtils';

export interface StandbyCascadeResult {
  totalOpenSpots: number;
  openSlots: SlotTime[];
  slotOpenCounts: Record<SlotTime, number>;
  springer1: {
    playerId: string;
    status: 'idle' | 'offered' | 'accepted' | 'declined';
  };
  springer2: {
    playerId: string;
    status: 'idle' | 'offered' | 'accepted' | 'declined';
  };
  frei: {
    playerId: string;
    status: 'idle' | 'offered' | 'accepted' | 'declined';
  };
  openForAnyoneCount: number;
  activeOfferedPrios: number[];
}

/**
 * Checks if a player is actively playing in any slot in the week
 * (i.e. has an assignment that is not 'declined').
 */
export function isPlayerActivelyPlayingInWeek(week: TrainingWeek, playerId: string): boolean {
  if (!playerId) return false;
  const slotKeys = getWeekSlotKeys(week);
  return slotKeys.some(slotKey => {
    const list = week.slots[slotKey] || [];
    return list.some(a => 
      a.playerId === playerId && 
      (a.status === 'confirmed' || a.status === 'pending' || a.status === 'substitute' || a.status === 'swapped')
    );
  });
}

/**
 * Calculates open spots across all slots in a week.
 * Exactly 4 players per slot capacity.
 */
export function calculateWeekOpenSpots(week: TrainingWeek): {
  openSlots: SlotTime[];
  totalOpenSpots: number;
  slotOpenCounts: Record<SlotTime, number>;
} {
  const slotKeys = getWeekSlotKeys(week);
  const openSlots: SlotTime[] = [];
  const slotOpenCounts: Record<SlotTime, number> = {};
  let totalOpenSpots = 0;

  if (week.isCancelled) {
    return { openSlots: [], totalOpenSpots: 0, slotOpenCounts: {} };
  }

  slotKeys.forEach(slotKey => {
    const assignments = week.slots[slotKey] || [];
    const activeCount = assignments.filter(a => a.status !== 'declined').length;
    const missing = Math.max(0, 4 - activeCount);
    slotOpenCounts[slotKey] = missing;
    if (missing > 0) {
      openSlots.push(slotKey);
      totalOpenSpots += missing;
    }
  });

  return { openSlots, totalOpenSpots, slotOpenCounts };
}

/**
 * Pure calculation of the Standby Priority Cascade:
 * Springer 1 und Springer 2 (max 1 oder 2)
 * Keine Prio 3 oder Prio 4 Logik.
 */
export function calculateStandbyCascade(week: TrainingWeek, maxSpringers: number = 2): StandbyCascadeResult {
  const { openSlots, totalOpenSpots, slotOpenCounts } = calculateWeekOpenSpots(week);

  let sp1 = { ...week.springer1 };
  let sp2 = { ...week.springer2 };
  let frei = week.frei ? { ...week.frei } : { playerId: '', status: 'idle' as const };

  // If no spots are open, reset any temporary 'offered' states to 'idle'
  if (totalOpenSpots === 0) {
    if (sp1.status === 'offered') sp1.status = 'idle';
    if (sp2.status === 'offered') sp2.status = 'idle';

    return {
      totalOpenSpots: 0,
      openSlots: [],
      slotOpenCounts,
      springer1: sp1,
      springer2: sp2,
      frei,
      openForAnyoneCount: 0,
      activeOfferedPrios: [],
    };
  }

  // Check which standby players are actively playing
  const isSp1Playing = isPlayerActivelyPlayingInWeek(week, sp1.playerId);
  const isSp2Playing = isPlayerActivelyPlayingInWeek(week, sp2.playerId);

  // Available spots to offer to the springers
  let availableSpots = totalOpenSpots;
  const activeOfferedPrios: number[] = [];

  // --- 1. Springer (Prio 1) ---
  if (maxSpringers >= 1 && !isSp1Playing && sp1.status !== 'declined' && sp1.status !== 'accepted') {
    if (availableSpots > 0) {
      sp1.status = 'offered';
      activeOfferedPrios.push(1);
      availableSpots -= 1;
    } else {
      sp1.status = 'idle';
    }
  }

  // --- 2. Springer (Prio 2) ---
  if (maxSpringers >= 2 && !isSp2Playing && sp2.status !== 'declined' && sp2.status !== 'accepted') {
    if (availableSpots > 0) {
      sp2.status = 'offered';
      activeOfferedPrios.push(2);
      availableSpots -= 1;
    } else {
      sp2.status = 'idle';
    }
  }

  // --- 3. Springer (Prio 3) - Uses frei slot as 3. Springer ---
  const isFreiPlaying = isPlayerActivelyPlayingInWeek(week, frei.playerId);
  if (maxSpringers >= 3 && frei.playerId && !isFreiPlaying && frei.status !== 'declined' && frei.status !== 'accepted') {
    if (availableSpots > 0) {
      frei.status = 'offered';
      activeOfferedPrios.push(3);
      availableSpots -= 1;
    } else {
      frei.status = 'idle';
    }
  }

  const openForAnyoneCount = Math.max(0, availableSpots);

  return {
    totalOpenSpots,
    openSlots,
    slotOpenCounts,
    springer1: sp1,
    springer2: sp2,
    frei,
    openForAnyoneCount,
    activeOfferedPrios,
  };
}

export interface StandbyQueueDisplayItem {
  prio: number;
  title: string;
  prioBadge: string;
  player?: Player;
  status: 'idle' | 'offered' | 'accepted' | 'declined' | 'playing';
  statusLabel: string;
  isCurrentTurn: boolean;
  isCurrentUser: boolean;
  canClaim: boolean;
  explanation: string;
}

/**
 * Builds structured display models for Springer 1 and Springer 2
 */
export function buildStandbyQueueDisplay(
  week: TrainingWeek,
  players: Player[],
  currentUserId: string,
  maxSpringers: number = 2
): StandbyQueueDisplayItem[] {
  const cascade = calculateStandbyCascade(week, maxSpringers);
  const { totalOpenSpots, activeOfferedPrios } = cascade;

  const sp1Player = players.find(p => p.id === week.springer1.playerId);
  const sp2Player = players.find(p => p.id === week.springer2.playerId);

  const isSp1Playing = isPlayerActivelyPlayingInWeek(week, week.springer1.playerId);
  const isSp2Playing = isPlayerActivelyPlayingInWeek(week, week.springer2.playerId);

  const items: StandbyQueueDisplayItem[] = [];

  // --- 1. Springer ---
  if (maxSpringers >= 1) {
    const isUserSp1 = currentUserId === week.springer1.playerId;
    let sp1Status: StandbyQueueDisplayItem['status'] = 'idle';
    let sp1Label = 'Bereit auf Abruf';
    let sp1Explanation = 'Hat Vorrang bei der ersten Absage';

    if (isSp1Playing) {
      sp1Status = 'playing';
      sp1Label = 'Spielt aktiv mit ✅';
      sp1Explanation = 'Bereits für einen Zeitslot eingeteilt';
    } else if (cascade.springer1.status === 'accepted') {
      sp1Status = 'accepted';
      sp1Label = 'Eingesprungen ✅';
      sp1Explanation = 'Hat einen freien Platz übernommen';
    } else if (cascade.springer1.status === 'declined') {
      sp1Status = 'declined';
      sp1Label = 'Abgelehnt / Ausgestiegen ❌';
      sp1Explanation = 'Kann diese Woche nicht einspringen';
    } else if (cascade.springer1.status === 'offered') {
      sp1Status = 'offered';
      sp1Label = 'An der Reihe 🔔';
      sp1Explanation = 'Kann jetzt einen freien Platz übernehmen';
    }

    items.push({
      prio: 1,
      title: '1. Springer',
      prioBadge: '1. Springer',
      player: sp1Player,
      status: sp1Status,
      statusLabel: sp1Label,
      isCurrentTurn: activeOfferedPrios.includes(1),
      isCurrentUser: isUserSp1,
      canClaim: activeOfferedPrios.includes(1) && isUserSp1,
      explanation: sp1Explanation,
    });
  }

  // --- 2. Springer ---
  if (maxSpringers >= 2) {
    const isUserSp2 = currentUserId === week.springer2.playerId;
    let sp2Status: StandbyQueueDisplayItem['status'] = 'idle';
    let sp2Label = 'Nachrücker Stufe 2';
    let sp2Explanation = 'Kommt zum Zug bei Absage von Springer 1 oder ab 2 freien Plätzen';

    if (isSp2Playing) {
      sp2Status = 'playing';
      sp2Label = 'Spielt aktiv mit ✅';
      sp2Explanation = 'Bereits für einen Zeitslot eingeteilt';
    } else if (cascade.springer2.status === 'accepted') {
      sp2Status = 'accepted';
      sp2Label = 'Eingesprungen ✅';
      sp2Explanation = 'Hat einen freien Platz übernommen';
    } else if (cascade.springer2.status === 'declined') {
      sp2Status = 'declined';
      sp2Label = 'Abgelehnt / Ausgestiegen ❌';
      sp2Explanation = 'Kann diese Woche nicht einspringen';
    } else if (cascade.springer2.status === 'offered') {
      sp2Status = 'offered';
      sp2Label = 'An der Reihe 🔔';
      sp2Explanation = 'Kann jetzt einen freien Platz übernehmen';
    } else if (totalOpenSpots > 0 && !activeOfferedPrios.includes(2)) {
      sp2Label = 'Wartet auf 1. Springer ⏳';
    }

    items.push({
      prio: 2,
      title: '2. Springer',
      prioBadge: '2. Springer',
      player: sp2Player,
      status: sp2Status,
      statusLabel: sp2Label,
      isCurrentTurn: activeOfferedPrios.includes(2),
      isCurrentUser: isUserSp2,
      canClaim: activeOfferedPrios.includes(2) && isUserSp2,
      explanation: sp2Explanation,
    });
  }

  // --- 3. Springer (Uses week.frei) ---
  if (maxSpringers >= 3 && week.frei?.playerId) {
    const isUserSp3 = currentUserId === week.frei.playerId;
    const freiPlayer = players.find(p => p.id === week.frei.playerId);
    const isSp3Playing = isPlayerActivelyPlayingInWeek(week, week.frei.playerId);
    let sp3Status: StandbyQueueDisplayItem['status'] = 'idle';
    let sp3Label = 'Nachrücker Stufe 3';
    let sp3Explanation = 'Kommt zum Zug bei Absage von Springer 1 & 2 oder ab 3 freien Plätzen';

    if (isSp3Playing) {
      sp3Status = 'playing';
      sp3Label = 'Spielt aktiv mit ✅';
      sp3Explanation = 'Bereits für einen Zeitslot eingeteilt';
    } else if (cascade.frei?.status === 'accepted') {
      sp3Status = 'accepted';
      sp3Label = 'Eingesprungen ✅';
      sp3Explanation = 'Hat einen freien Platz übernommen';
    } else if (cascade.frei?.status === 'declined') {
      sp3Status = 'declined';
      sp3Label = 'Abgelehnt / Ausgestiegen ❌';
      sp3Explanation = 'Kann diese Woche nicht einspringen';
    } else if (cascade.frei?.status === 'offered') {
      sp3Status = 'offered';
      sp3Label = 'An der Reihe 🔔';
      sp3Explanation = 'Kann jetzt einen freien Platz übernehmen';
    } else if (totalOpenSpots > 0 && !activeOfferedPrios.includes(3)) {
      sp3Label = 'Wartet auf vorherige Springer ⏳';
    }

    items.push({
      prio: 3,
      title: '3. Springer',
      prioBadge: '3. Springer',
      player: freiPlayer,
      status: sp3Status,
      statusLabel: sp3Label,
      isCurrentTurn: activeOfferedPrios.includes(3),
      isCurrentUser: isUserSp3,
      canClaim: activeOfferedPrios.includes(3) && isUserSp3,
      explanation: sp3Explanation,
    });
  }

  return items;
}
