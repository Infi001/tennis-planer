import { Player, TrainingWeek, SlotTime } from '../types/tennis';

function formatIcsDate(isoDate: string, timeStr: string): string {
  // isoDate is YYYY-MM-DD
  const cleanDate = isoDate.replace(/-/g, '');
  const cleanTime = timeStr.trim().replace(':', '') + '00';
  return `${cleanDate}T${cleanTime}`;
}

export class CalendarExportService {
  /**
   * Generates a full RFC 5545 .ics file for all dates a player is scheduled for the season
   */
  static generateSeasonIcsForPlayer(
    player: Player,
    weeks: TrainingWeek[],
    allPlayers: Player[],
    clubName: string = 'Tennis Club'
  ): string {
    const events: string[] = [];

    weeks.forEach((w) => {
      if (w.isCancelled) return;
      const slotTimes = Object.keys(w.slots);

      slotTimes.forEach((slotKey) => {
        const assignment = (w.slots[slotKey] || []).find(
          (a) => a.playerId === player.id && (a.status === 'confirmed' || a.status === 'pending' || a.status === 'substitute')
        );

        if (assignment) {
          const [startTimeStr, endTimeStr] = slotKey.split('-');
          const dtStart = formatIcsDate(w.date, startTimeStr);
          const dtEnd = formatIcsDate(w.date, endTimeStr);

          // Get other players in this slot
          const coPlayers = (w.slots[slotKey] || [])
            .filter((a) => a.playerId !== player.id && a.status !== 'declined')
            .map((a) => {
              if (a.isGuest) return a.guestName || 'Gast';
              return allPlayers.find((p) => p.id === a.playerId)?.name || 'Mitspieler';
            })
            .join(', ');

          const sp1Name = allPlayers.find((p) => p.id === w.springer1.playerId)?.name || 'Keiner';
          const sp2Name = allPlayers.find((p) => p.id === w.springer2.playerId)?.name || 'Keiner';

          const summary = `🎾 Tennistraining (${slotKey} Uhr) - ${clubName}`;
          const description = `Montags-Tennistraining 1 Platz mit Trainer\\nUhrzeit: ${slotKey} Uhr\\nMitspieler: ${coPlayers}\\n1. Springer: ${sp1Name}\\n2. Springer: ${sp2Name}`;
          const uid = `tennis-${w.date}-${slotKey.replace(':', '')}-${player.id}@${clubName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

          const eventBlock = [
            'BEGIN:VEVENT',
            `UID:${uid}`,
            `DTSTAMP:${formatIcsDate(new Date().toISOString().split('T')[0], '18:00')}Z`,
            `DTSTART:${dtStart}`,
            `DTEND:${dtEnd}`,
            `SUMMARY:${summary}`,
            `DESCRIPTION:${description}`,
            'LOCATION:Tennisplatz 1 (mit Trainer)',
            'STATUS:CONFIRMED',
            'BEGIN:VALARM',
            'TRIGGER:-PT2H',
            'ACTION:DISPLAY',
            'DESCRIPTION:Erinnerung: Tennistraining in 2 Stunden!',
            'END:VALARM',
            'END:VEVENT',
          ].join('\r\n');

          events.push(eventBlock);
        }
      });
    });

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Tennis Trainingsplaner//DE',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:🎾 Tennistraining (${player.name})`,
      'X-WR-TIMEZONE:Europe/Berlin',
      ...events,
      'END:VCALENDAR',
    ].join('\r\n');
  }

  /**
   * Triggers download of the .ics file in browser
   */
  static downloadIcsFile(icsContent: string, fileName: string) {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generates a Google Calendar Web URL for a single session
   */
  static getGoogleCalendarLink(
    week: TrainingWeek,
    slotKey: SlotTime,
    clubName: string = 'Tennis Club'
  ): string {
    const [startStr, endStr] = slotKey.split('-');
    const dtStart = formatIcsDate(week.date, startStr.trim());
    const dtEnd = formatIcsDate(week.date, endStr.trim());

    const title = encodeURIComponent(`🎾 Tennistraining (${slotKey} Uhr) - ${clubName}`);
    const details = encodeURIComponent(`Montagsrunde: 1 Platz mit Trainer auf Platz 1.`);
    const location = encodeURIComponent('Tennisplatz 1 (mit Trainer)');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dtStart}/${dtEnd}&details=${details}&location=${location}`;
  }
}
