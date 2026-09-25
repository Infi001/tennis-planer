import { TrainingWeek } from '../types/tennis';

/**
 * Format total minutes from midnight into "HH:MM"
 */
export function formatMinutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Parse "HH:MM" into total minutes from midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 18 * 60;
  const parts = timeStr.trim().split(':').map(Number);
  const h = isNaN(parts[0]) ? 18 : parts[0];
  const m = isNaN(parts[1]) ? 0 : parts[1];
  return h * 60 + m;
}

/**
 * Generate sequential slot time strings based on start time, duration(s), and count.
 * E.g., ("18:00", 60, 3) -> ["18:00-19:00", "19:00-20:00", "20:00-21:00"]
 * E.g., ("18:00", [45, 90, 60], 3) -> ["18:00-18:45", "18:45-20:15", "20:15-21:15"]
 */
export function generateSlotTimes(startTime: string = '18:00', durations: number | number[] = 60, count: number = 3): string[] {
  const safeCount = Math.max(1, Math.min(count, 6)); // 1 to 6 hours
  const baseMinutes = parseTimeToMinutes(startTime);
  
  const durationArray = Array.isArray(durations) ? durations : Array(safeCount).fill(durations);

  const slots: string[] = [];
  let currentStart = baseMinutes;

  for (let i = 0; i < safeCount; i++) {
    const duration = durationArray[i] || (Array.isArray(durations) ? durations[durations.length - 1] || 60 : durations);
    const safeDuration = Math.max(15, Math.min(duration, 240)); // 15 to 240 min
    const slotEnd = currentStart + safeDuration;
    slots.push(`${formatMinutesToTime(currentStart)}-${formatMinutesToTime(slotEnd)}`);
    currentStart = slotEnd;
  }
  return slots;
}

/**
 * Get ordered slot keys from a TrainingWeek
 */
export function getWeekSlotKeys(week?: TrainingWeek | null): string[] {
  if (!week || !week.slots) {
    return generateSlotTimes('18:00', 60, 3);
  }
  const keys = Object.keys(week.slots);
  if (keys.length === 0) {
    return generateSlotTimes('18:00', 60, 3);
  }
  // Sort chronologically by start time
  return keys.sort((a, b) => {
    const startA = parseTimeToMinutes(a.split('-')[0]);
    const startB = parseTimeToMinutes(b.split('-')[0]);
    return startA - startB;
  });
}

export interface SlotConfig {
  hoursCount: number;
  durations: number[];
  startTime: string;
}

/**
 * Extract or infer the current slot configuration of a week
 */
export function getWeekSlotConfig(week: TrainingWeek): SlotConfig {
  const slotKeys = getWeekSlotKeys(week);
  const hoursCount = slotKeys.length || 3;

  let startTime = week.startTime || '18:00';
  let durations: number[] = week.customDurations || [];

  if (slotKeys.length > 0) {
    const first = slotKeys[0];
    const [startStr] = first.split('-');
    if (startStr && !week.startTime) {
      startTime = startStr.trim();
    }
    
    // If no custom durations are saved, infer them from the actual slots
    if (durations.length === 0) {
      durations = slotKeys.map(key => {
        const [sStr, eStr] = key.split('-');
        if (sStr && eStr) {
          const diff = parseTimeToMinutes(eStr) - parseTimeToMinutes(sStr);
          return diff > 0 ? diff : 60;
        }
        return 60;
      });
    }
  }

  // Fallback if still empty
  if (durations.length === 0) {
    const defaultDuration = week.slotDurationMinutes || 60;
    durations = Array(hoursCount).fill(defaultDuration);
  }

  // Ensure durations array length matches hoursCount
  if (durations.length < hoursCount) {
    const last = durations[durations.length - 1] || 60;
    while (durations.length < hoursCount) {
      durations.push(last);
    }
  } else if (durations.length > hoursCount) {
    durations = durations.slice(0, hoursCount);
  }

  return {
    hoursCount,
    durations,
    startTime,
  };
}

/**
 * Checks if target slots to be removed from a week are empty.
 * Reduction is only allowed if all slots with index >= targetCount are completely empty!
 */
export function canReduceWeekSlots(
  week: TrainingWeek, 
  targetCount: number
): {
  allowed: boolean;
  occupiedSlots: Array<{ slotKey: string; count: number; playerIds: string[] }>;
} {
  const keys = getWeekSlotKeys(week);
  if (targetCount >= keys.length) {
    return { allowed: true, occupiedSlots: [] };
  }
  const keysToDelete = keys.slice(targetCount);
  const occupiedSlots = keysToDelete
    .map(key => {
      const assignments = week.slots[key] || [];
      return {
        slotKey: key,
        count: assignments.length,
        playerIds: assignments.map(a => a.playerId)
      };
    })
    .filter(item => item.count > 0);

  return {
    allowed: occupiedSlots.length === 0,
    occupiedSlots
  };
}
