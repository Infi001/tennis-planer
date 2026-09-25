import { Player, TrainingWeek, SlotTime, SlotAssignment } from '../types/tennis';
import { generateSlotTimes, getWeekSlotKeys } from './slotTimeUtils';

export interface ScheduleMetrics {
  totalWeeks: number;
  activeWeeks: number;
  cancelledWeeks: number;
  totalMatchesPlayed: number;
  uniquePairsCount: number;
  totalPossiblePairs: number;
  pairingVarietyScore: number; // 0 to 100%
  timeBalanceScore: number;    // 0 to 100%
  standbyEquityScore: number;  // 0 to 100%
  overallFairnessScore: number;// 0 to 100%
  pairCoOccurrenceMatrix: Record<string, Record<string, number>>;
  playerStats: Record<string, {
    totalPlayed: number;
    slotsCount: Record<string, number>;
    springer1Count: number;
    springer2Count: number;
    freiCount: number;
  }>;
}

// 15-Element Excel-Cycle pattern provided by the user
const EXCEL_CYCLE_15: Array<{ type: 'slot'; slotIndex: number } | { type: 'springer1' } | { type: 'springer2' } | { type: 'frei' }> = [
  { type: 'frei' },                       // index 0
  { type: 'slot', slotIndex: 1 },         // index 1
  { type: 'slot', slotIndex: 2 },         // index 2
  { type: 'slot', slotIndex: 0 },         // index 3
  { type: 'slot', slotIndex: 1 },         // index 4
  { type: 'springer2' },                  // index 5
  { type: 'slot', slotIndex: 2 },         // index 6
  { type: 'slot', slotIndex: 1 },         // index 7
  { type: 'slot', slotIndex: 0 },         // index 8
  { type: 'slot', slotIndex: 2 },         // index 9
  { type: 'springer1' },                  // index 10
  { type: 'slot', slotIndex: 0 },         // index 11
  { type: 'slot', slotIndex: 2 },         // index 12
  { type: 'slot', slotIndex: 1 },         // index 13
  { type: 'slot', slotIndex: 0 },         // index 14
];

/**
 * Generates schedule using the user's proven Excel-like cyclic shift formula.
 */
export function generateBaselineCyclicSchedule(
  players: Player[],
  weeksMetadata: Array<{ dateStr: string; iso: string; cancelled?: boolean; cancelReason?: string }>,
  hoursCount = 3,
  durationMinutes = 60,
  startTime = '18:00'
): TrainingWeek[] {
  const slotKeys = generateSlotTimes(startTime, durationMinutes, hoursCount);
  let activeWeekIndex = 0;
  const numPlayers = players.length;

  return weeksMetadata.map(m => {
    if (m.cancelled) {
      const emptySlots: Record<string, SlotAssignment[]> = {};
      slotKeys.forEach(k => { emptySlots[k] = []; });
      return {
        id: m.iso,
        dateString: m.dateStr,
        date: m.iso,
        isCancelled: true,
        cancelReason: m.cancelReason || 'Kein Training',
        startTime,
        slotDurationMinutes: durationMinutes,
        slots: emptySlots,
        springer1: { playerId: '', status: 'idle' },
        springer2: { playerId: '', status: 'idle' },
        frei: { playerId: '', status: 'idle' },
      };
    }

    const currentCycleWeek = activeWeekIndex;
    activeWeekIndex++;

    const newSlots: Record<string, SlotAssignment[]> = {};
    slotKeys.forEach(k => { newSlots[k] = []; });

    let sp1PlayerId = '';
    let sp2PlayerId = '';
    let freiPlayerId = '';

    if (numPlayers === 15 && hoursCount === 3) {
      // Use exact user formula
      players.forEach((player, pIdx) => {
        const cycleIdx = (currentCycleWeek - pIdx + 1500) % 15;
        const role = EXCEL_CYCLE_15[cycleIdx];

        if (role.type === 'slot') {
          const targetSlotKey = slotKeys[role.slotIndex] || slotKeys[0];
          newSlots[targetSlotKey].push({
            playerId: player.id,
            status: 'confirmed',
            updatedAt: new Date().toISOString(),
          });
        } else if (role.type === 'springer1') {
          sp1PlayerId = player.id;
        } else if (role.type === 'springer2') {
          sp2PlayerId = player.id;
        } else if (role.type === 'frei') {
          freiPlayerId = player.id;
        }
      });
    } else {
      // Generalized cyclic distribution for arbitrary N and H
      const courtCapacity = hoursCount * 4;
      const totalRoles = Math.max(numPlayers, courtCapacity + 3);

      players.forEach((player, pIdx) => {
        const roleIdx = (currentCycleWeek * 7 + pIdx) % totalRoles;
        if (roleIdx < courtCapacity) {
          const slotIdx = Math.floor(roleIdx / 4);
          const targetSlot = slotKeys[slotIdx] || slotKeys[0];
          if (newSlots[targetSlot].length < 4) {
            newSlots[targetSlot].push({
              playerId: player.id,
              status: 'confirmed',
              updatedAt: new Date().toISOString(),
            });
          }
        } else if (roleIdx === courtCapacity) {
          sp1PlayerId = player.id;
        } else if (roleIdx === courtCapacity + 1) {
          sp2PlayerId = player.id;
        } else {
          if (!freiPlayerId) freiPlayerId = player.id;
        }
      });

      // Fill any remaining unfilled spots
      const assignedIds = new Set<string>();
      Object.values(newSlots).forEach(arr => arr.forEach(a => assignedIds.add(a.playerId)));
      if (sp1PlayerId) assignedIds.add(sp1PlayerId);
      if (sp2PlayerId) assignedIds.add(sp2PlayerId);
      if (freiPlayerId) assignedIds.add(freiPlayerId);

      const unassigned = players.filter(p => !assignedIds.has(p.id));
      for (const slotKey of slotKeys) {
        while (newSlots[slotKey].length < 4 && unassigned.length > 0) {
          const next = unassigned.shift()!;
          newSlots[slotKey].push({ playerId: next.id, status: 'confirmed' });
        }
      }
      if (!sp1PlayerId && unassigned.length > 0) sp1PlayerId = unassigned.shift()!.id;
      if (!sp2PlayerId && unassigned.length > 0) sp2PlayerId = unassigned.shift()!.id;
      if (!freiPlayerId && unassigned.length > 0) freiPlayerId = unassigned.shift()!.id;
    }

    return {
      id: m.iso,
      dateString: m.dateStr,
      date: m.iso,
      isCancelled: false,
      startTime,
      slotDurationMinutes: durationMinutes,
      slots: newSlots,
      springer1: { playerId: sp1PlayerId, status: 'idle' },
      springer2: { playerId: sp2PlayerId, status: 'idle' },
      frei: { playerId: freiPlayerId, status: 'idle' },
      originalState: {
        slots: JSON.parse(JSON.stringify(newSlots)),
        springer1: { playerId: sp1PlayerId, status: 'idle' },
        springer2: { playerId: sp2PlayerId, status: 'idle' },
        frei: { playerId: freiPlayerId, status: 'idle' }
      },
    };
  });
}

/**
 * Computes deep fairness and variety metrics for a schedule.
 */
export function analyzeScheduleMetrics(
  weeks: TrainingWeek[],
  players: Player[]
): ScheduleMetrics {
  const activeWeeksList = weeks.filter(w => !w.isCancelled);
  const activeWeeks = activeWeeksList.length;
  const cancelledWeeks = weeks.length - activeWeeks;

  // Initialize pair co-occurrence matrix
  const matrix: Record<string, Record<string, number>> = {};
  players.forEach(p1 => {
    matrix[p1.id] = {};
    players.forEach(p2 => {
      matrix[p1.id][p2.id] = 0;
    });
  });

  // Initialize player stats
  const playerStats: ScheduleMetrics['playerStats'] = {};
  players.forEach(p => {
    playerStats[p.id] = {
      totalPlayed: 0,
      slotsCount: {},
      springer1Count: 0,
      springer2Count: 0,
      freiCount: 0,
    };
  });

  let totalMatchesPlayed = 0;

  activeWeeksList.forEach(week => {
    const slotKeys = getWeekSlotKeys(week);

    // Track standby roles
    if (week.springer1?.playerId && playerStats[week.springer1.playerId]) {
      playerStats[week.springer1.playerId].springer1Count++;
    }
    if (week.springer2?.playerId && playerStats[week.springer2.playerId]) {
      playerStats[week.springer2.playerId].springer2Count++;
    }
    if (week.frei?.playerId && playerStats[week.frei.playerId]) {
      playerStats[week.frei.playerId].freiCount++;
    }

    // Track slots and pairings
    slotKeys.forEach(slotKey => {
      const assignments = week.slots[slotKey] || [];
      const activeInSlot = assignments.filter(a => a.status !== 'declined');

      activeInSlot.forEach(a => {
        if (playerStats[a.playerId]) {
          playerStats[a.playerId].totalPlayed++;
          playerStats[a.playerId].slotsCount[slotKey] = (playerStats[a.playerId].slotsCount[slotKey] || 0) + 1;
          totalMatchesPlayed++;
        }
      });

      // Every pair of players in this slot played together
      for (let i = 0; i < activeInSlot.length; i++) {
        for (let j = i + 1; j < activeInSlot.length; j++) {
          const id1 = activeInSlot[i].playerId;
          const id2 = activeInSlot[j].playerId;
          if (matrix[id1] && matrix[id2]) {
            matrix[id1][id2]++;
            matrix[id2][id1]++;
          }
        }
      }
    });
  });

  // Calculate unique pairs that played together at least once
  let uniquePairsCount = 0;
  let totalPossiblePairs = (players.length * (players.length - 1)) / 2;
  const pairCountsList: number[] = [];

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const count = matrix[players[i].id]?.[players[j].id] || 0;
      pairCountsList.push(count);
      if (count > 0) {
        uniquePairsCount++;
      }
    }
  }

  // Pairing Variety Score: ratio of active pairs + standard deviation penalty
  const rawVarietyRatio = totalPossiblePairs > 0 ? (uniquePairsCount / totalPossiblePairs) : 1;
  const avgPairings = pairCountsList.length > 0 
    ? pairCountsList.reduce((a, b) => a + b, 0) / pairCountsList.length 
    : 0;
  const pairVariance = pairCountsList.length > 0 
    ? pairCountsList.reduce((acc, c) => acc + Math.pow(c - avgPairings, 2), 0) / pairCountsList.length 
    : 0;
  const pairStdDev = Math.sqrt(pairVariance);
  const pairingVarietyScore = Math.max(0, Math.min(100, Math.round(
    (rawVarietyRatio * 75) + Math.max(0, 25 - pairStdDev * 6)
  )));

  // Time Balance Score: measure how equally players play across different hours
  let totalTimeImbalance = 0;
  players.forEach(p => {
    const counts = Object.values(playerStats[p.id].slotsCount);
    if (counts.length > 1) {
      const min = Math.min(...counts);
      const max = Math.max(...counts);
      totalTimeImbalance += (max - min);
    }
  });
  const avgTimeImbalance = players.length > 0 ? totalTimeImbalance / players.length : 0;
  const timeBalanceScore = Math.max(0, Math.min(100, Math.round(100 - avgTimeImbalance * 8)));

  // Standby Equity Score: measure how fairly standby roles are distributed
  const standbySums = players.map(p => {
    const s = playerStats[p.id];
    return s.springer1Count + s.springer2Count + s.freiCount;
  });
  const maxStandby = Math.max(...standbySums, 0);
  const minStandby = Math.min(...standbySums, 0);
  const standbyRange = maxStandby - minStandby;
  const standbyEquityScore = Math.max(0, Math.min(100, Math.round(100 - standbyRange * 12)));

  const overallFairnessScore = Math.round(
    pairingVarietyScore * 0.45 + timeBalanceScore * 0.35 + standbyEquityScore * 0.20
  );

  return {
    totalWeeks: weeks.length,
    activeWeeks,
    cancelledWeeks,
    totalMatchesPlayed,
    uniquePairsCount,
    totalPossiblePairs,
    pairingVarietyScore,
    timeBalanceScore,
    standbyEquityScore,
    overallFairnessScore,
    pairCoOccurrenceMatrix: matrix,
    playerStats,
  };
}

/**
 * Intelligent Pairing & Time Variation Optimizer.
 * Uses simulated annealing / constraint local search to maximize pairing diversity
 * while ensuring equal slot times and standby equity.
 */
export function optimizeSchedulePairings(
  initialWeeks: TrainingWeek[],
  players: Player[],
  iterations = 3500
): TrainingWeek[] {
  // Deep clone schedule
  const schedule: TrainingWeek[] = JSON.parse(JSON.stringify(initialWeeks));
  const activeWeeks = schedule.filter(w => !w.isCancelled);
  if (activeWeeks.length < 2 || players.length < 4) return schedule;

  // Track initial objective cost
  let currentMetrics = analyzeScheduleMetrics(schedule, players);
  let bestScore = currentMetrics.overallFairnessScore;
  let bestSchedule = JSON.parse(JSON.stringify(schedule));

  for (let iter = 0; iter < iterations; iter++) {
    // Pick a random active week
    const weekIdx = Math.floor(Math.random() * activeWeeks.length);
    const targetWeek = activeWeeks[weekIdx];
    const slotKeys = getWeekSlotKeys(targetWeek);
    if (slotKeys.length < 2) continue;

    // Pick two random distinct slots in this week
    const slotIdx1 = Math.floor(Math.random() * slotKeys.length);
    let slotIdx2 = Math.floor(Math.random() * slotKeys.length);
    while (slotIdx2 === slotIdx1) {
      slotIdx2 = Math.floor(Math.random() * slotKeys.length);
    }

    const slot1 = slotKeys[slotIdx1];
    const slot2 = slotKeys[slotIdx2];

    const playersInSlot1 = targetWeek.slots[slot1] || [];
    const playersInSlot2 = targetWeek.slots[slot2] || [];
    if (playersInSlot1.length === 0 || playersInSlot2.length === 0) continue;

    const pIdx1 = Math.floor(Math.random() * playersInSlot1.length);
    const pIdx2 = Math.floor(Math.random() * playersInSlot2.length);

    const playerA = playersInSlot1[pIdx1].playerId;
    const playerB = playersInSlot2[pIdx2].playerId;

    // Quick swap in memory
    playersInSlot1[pIdx1].playerId = playerB;
    playersInSlot2[pIdx2].playerId = playerA;

    // Evaluate proposed move
    const newMetrics = analyzeScheduleMetrics(schedule, players);
    const newScore = newMetrics.overallFairnessScore;

    // Acceptance condition (Metropolis or greedy with slight exploration)
    const delta = newScore - bestScore;
    if (delta > 0 || (delta === 0 && newMetrics.pairingVarietyScore > currentMetrics.pairingVarietyScore)) {
      bestScore = newScore;
      currentMetrics = newMetrics;
      bestSchedule = JSON.parse(JSON.stringify(schedule));
    } else {
      // Revert swap
      playersInSlot1[pIdx1].playerId = playerA;
      playersInSlot2[pIdx2].playerId = playerB;
    }
  }

  bestSchedule.forEach((w: TrainingWeek) => {
    if (!w.isCancelled) {
      w.originalState = {
        slots: JSON.parse(JSON.stringify(w.slots)),
        springer1: { ...w.springer1 },
        springer2: { ...w.springer2 },
        frei: { ...w.frei }
      };
    }
  });

  return bestSchedule;
}
