/**
 * Date and Weekday utilities for generic multi-day support
 */

const GERMAN_WEEKDAYS = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag'
];

/**
 * Returns the German weekday name from an ISO date string (YYYY-MM-DD) or Date object.
 */
export function getWeekdayName(dateIsoOrStr: string): string {
  if (!dateIsoOrStr) return 'Spieltag';

  // Handle ISO format YYYY-MM-DD
  const parts = dateIsoOrStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return GERMAN_WEEKDAYS[d.getDay()];
    }
  }

  const d = new Date(dateIsoOrStr);
  if (!isNaN(d.getTime())) {
    return GERMAN_WEEKDAYS[d.getDay()];
  }

  return 'Spieltag';
}

/**
 * Formats a training week's date with its dynamic weekday, e.g.:
 * "Montag, 05.10.26" or "Dienstag, 06.10.26" or "Samstag, 10.10.26"
 */
export function formatWeekDate(week: { date: string; dateString: string }): string {
  if (!week) return '';
  const weekday = getWeekdayName(week.date);
  return `${weekday}, ${week.dateString}`;
}

/**
 * Generates an array of recurring season dates for any chosen start date and interval.
 * By default generates weekly dates for the specified count (e.g. 30 weeks).
 */
export function generateRecurringSeasonDates(
  startDateIso: string,
  totalDatesCount: number = 30,
  intervalDays: number = 7
): Array<{ iso: string; dateStr: string; weekdayName: string }> {
  if (!startDateIso) return [];

  const [startYear, startMonth, startDay] = startDateIso.split('-').map(Number);
  const results: Array<{ iso: string; dateStr: string; weekdayName: string }> = [];

  const current = new Date(startYear, startMonth - 1, startDay);

  for (let i = 0; i < totalDatesCount; i++) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    const iso = `${y}-${m}-${d}`;
    const dateStr = `${d}.${m}.${String(y).slice(2)}`;
    const weekdayName = GERMAN_WEEKDAYS[current.getDay()];

    results.push({ iso, dateStr, weekdayName });

    // Advance by interval (default 7 days)
    current.setDate(current.getDate() + intervalDays);
  }

  return results;
}
