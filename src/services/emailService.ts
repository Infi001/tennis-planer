import { Player, TrainingWeek, EmailConfig } from '../types/tennis';
import { formatWeekDate } from '../utils/dateUtils';
import { StorageService } from './storage';
import { getSupabase } from './supabase';

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

export async function sendDirectEmail(options: {
  to: string;
  subject: string;
  body: string;
  config?: EmailConfig;
}): Promise<{ success: boolean; message: string }> {
  const recipient = (options.to || '').trim();
  if (!recipient || !recipient.includes('@')) {
    return { 
      success: false, 
      message: 'Bitte gib eine gültige E-Mail-Adresse für den Empfänger an.' 
    };
  }

  const config = options.config || StorageService.getEmailConfig();

  if (!config.apiKey || !config.apiKey.trim()) {
    return {
      success: false,
      message: 'Bitte trage unter Admin ➔ Einstellungen deinen Brevo-API-Schlüssel ein.',
    };
  }

  try {
    const fromName = config.fromName?.trim() || 'TCRW Montagsgruppe';
    const fromEmail = config.fromEmail?.trim() || 'no-reply@rw-senne.de';

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': config.apiKey.trim(),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: recipient }],
        subject: options.subject,
        textContent: options.body,
        htmlContent: options.body.replace(/\n/g, '<br/>'),
      }),
    });

    const data = await res.json().catch(() => null);

    if (res.ok) {
      const msgId = data?.messageId ? ` (ID: ${data.messageId})` : '';
      return {
        success: true,
        message: `E-Mail erfolgreich via Brevo-API versendet${msgId}!`,
      };
    } else {
      const errMsg = data?.message || data?.error || `HTTP ${res.status}`;
      return {
        success: false,
        message: `Brevo-API Fehler (${res.status}): ${errMsg}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Verbindungsfehler zur Brevo-API: ${err.message || 'Netzwerkfehler'}`,
    };
  }
}

export async function sendDirectSpringerEmail(params: SpringerEmailParams): Promise<{ success: boolean; message: string }> {
  const content = generateSpringerEmailContent(params);
  return sendDirectEmail({
    to: content.to,
    subject: content.subject,
    body: content.body,
  });
}

export function openSpringerEmailClient(params: SpringerEmailParams): void {
  const { to, subject, body } = generateSpringerEmailContent(params);
  const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
}
