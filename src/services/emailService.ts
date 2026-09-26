import { Player, TrainingWeek } from '../types/tennis';
import { formatWeekDate } from '../utils/dateUtils';

export interface SpringerEmailParams {
  springer: Player;
  week: TrainingWeek;
  slotKey?: string;
  decliningPlayer?: Player | { name: string };
  clubName: string;
  groupName?: string;
}

export function generateSpringerEmailContent({
  springer,
  week,
  slotKey,
  decliningPlayer,
  clubName,
  groupName,
}: SpringerEmailParams): { subject: string; body: string; to: string } {
  const dateFormatted = formatWeekDate(week);
  const slotText = slotKey ? `${slotKey} Uhr` : 'Trainingsslot';
  const groupText = groupName ? ` (${groupName})` : '';
  const reasonText = decliningPlayer ? `${decliningPlayer.name} hat abgesagt` : 'ein Platz ist frei geworden';

  const appUrl = typeof window !== 'undefined'
    ? (springer.accessToken
        ? `${window.location.origin}/?token=${springer.accessToken}`
        : window.location.origin)
    : '';

  const subject = `🎾 Freier Tennis-Platz am ${dateFormatted} (${slotText}) – ${clubName}`;

  const body = `Hallo ${springer.name},

bei ${clubName}${groupText} ist am ${dateFormatted} ein Trainingsplatz frei geworden:

📅 Spieltermin: ${dateFormatted}
⏰ Spielzeit: ${slotText}
👤 Status: ${reasonText}

Du bist als Springer eingeteilt und an der Reihe! Bitte öffne kurz den Trainingsplaner, um den Platz zu übernehmen oder Bescheid zu geben:

👉 Direkt zum Trainingsplaner:
${appUrl}

Sportliche Grüße,
${clubName}`;

  return {
    to: springer.email || '',
    subject,
    body,
  };
}

export function openSpringerEmailClient(params: SpringerEmailParams): void {
  const { to, subject, body } = generateSpringerEmailContent(params);
  const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, '_blank');
}
