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

export async function checkBridgeHealth(url?: string): Promise<{ ok: boolean; message: string }> {
  const bridgeUrl = (url || 'https://tcrw-senne.de/send-mail.php').trim();
  try {
    const res = await fetch(bridgeUrl, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      return { 
        ok: true, 
        message: data?.message || 'Server-Bridge erreichbar!' 
      };
    }
    return { 
      ok: false, 
      message: `Server antwortete mit Status ${res.status} (${res.statusText || 'Nicht gefunden'}). Bitte prüfe, ob send-mail.php auf dem Webspace liegt.` 
    };
  } catch (err: any) {
    return { 
      ok: false, 
      message: `Verbindung zu ${bridgeUrl} fehlgeschlagen: ${err.message || 'Server nicht erreichbar'}` 
    };
  }
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

  // 1. Primär: Direkter Brevo-API Versand (kein PHP / kein Webserver nötig)
  if (config.apiKey && config.apiKey.trim()) {
    try {
      const fromName = config.fromName?.trim() || 'TCRW Montagsgruppe';
      const fromEmail = config.fromEmail?.trim() || config.smtpUser?.trim() || 'no-reply@rw-senne.de';

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
          message: `E-Mail erfolgreich an Brevo übergeben${msgId}! Bitte prüfe auch deinen Spam-Ordner in Gmail.`,
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

  // 2. Sekundär: Falls Webserver-Bridge konfiguriert ist
  if (config.endpointUrl && config.endpointUrl.trim()) {
    const bridgeUrl = config.endpointUrl.trim();
    try {
      const payload = {
        to: recipient,
        subject: options.subject,
        body: options.body,
        fromName: config.fromName || 'TCRW Montagsgruppe',
        fromEmail: config.fromEmail || config.smtpUser || 'no-reply@rw-senne.de',
        smtpHost: config.smtpHost || 'smtp.strato.de',
        smtpPort: config.smtpPort || 465,
        smtpUser: config.smtpUser || '',
        smtpPass: config.smtpPass || '',
      };

      const res = await fetch(bridgeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        return {
          success: true,
          message: data.message || `E-Mail erfolgreich via Server (${bridgeUrl}) an ${recipient} versendet!`,
        };
      } else {
        const errDetail = data?.error || data?.message || `Server meldete HTTP ${res.status}`;
        return {
          success: false,
          message: `Versandfehler (${bridgeUrl}): ${errDetail}`,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Server-Bridge nicht erreichbar (${bridgeUrl}): ${err.message || 'Netzwerkfehler'}.`,
      };
    }
  }

  // 3. Weder API noch Bridge eingerichtet
  return {
    success: false,
    message: 'Bitte trage unter Admin ➔ Einstellungen deinen Brevo-API-Schlüssel ein, um E-Mails direkt per API zu versenden.',
  };
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
