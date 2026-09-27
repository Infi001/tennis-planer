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

// Helper to dynamically load SMTPJS for direct browser-to-SMTP dispatch
let smtpJsPromise: Promise<void> | null = null;
function loadSmtpJs(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Nur im Browser verfügbar'));
  if ((window as any).Email) return Promise.resolve();
  if (smtpJsPromise) return smtpJsPromise;

  smtpJsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="smtpjs"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Konnte SMTP.js nicht laden')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://smtpjs.com/v3/smtp.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Konnte SMTP-Client (smtpjs.com) nicht laden. Bitte Internetverbindung prüfen.'));
    document.head.appendChild(script);
  });

  return smtpJsPromise;
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

  // 1. Direkter SMTP-Server (z. B. mail.tcrw-senne.de)
  if (config.smtpHost && config.smtpUser && config.smtpPass) {
    try {
      await loadSmtpJs();
      if (!(window as any).Email || typeof (window as any).Email.send !== 'function') {
        throw new Error('SMTP-Dienst konnte nicht initialisiert werden.');
      }

      const senderEmail = config.fromEmail?.trim() || config.smtpUser.trim();
      const sendResult = await (window as any).Email.send({
        Host: config.smtpHost.trim(),
        Username: config.smtpUser.trim(),
        Password: config.smtpPass.trim(),
        To: recipient,
        From: senderEmail,
        Subject: options.subject,
        Body: options.body.replace(/\n/g, '<br/>'),
      });

      if (sendResult === 'OK') {
        return {
          success: true,
          message: `E-Mail erfolgreich via SMTP (${config.smtpHost}) an ${recipient} gesendet!`,
        };
      } else {
        return {
          success: false,
          message: `SMTP-Fehler von ${config.smtpHost}: ${sendResult}`,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `SMTP-Verbindungsfehler (${config.smtpHost}): ${err.message || 'Fehler beim Kontaktieren des SMTP-Servers'}`,
      };
    }
  }

  // 2. Supabase Edge Function (send-email) if active
  const sb = getSupabase();
  if (sb && config.provider === 'supabase') {
    try {
      const { data, error } = await sb.functions.invoke('send-email', {
        body: {
          to: recipient,
          subject: options.subject,
          text: options.body,
          fromName: config.fromName,
        },
      });
      if (!error) {
        return { 
          success: true, 
          message: `E-Mail direkt über Supabase an ${recipient} gesendet!` 
        };
      } else {
        return {
          success: false,
          message: `Supabase Edge Function Fehler: ${error.message || 'Fehler beim Senden'}`
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Supabase Verbindungsfehler: ${err.message}`
      };
    }
  }

  // 3. If no delivery service configured:
  return {
    success: false,
    message: 'Kein SMTP-Server eingerichtet! Bitte trage unter Admin ➔ Einstellungen deine SMTP-Zugangsdaten (mail.tcrw-senne.de) ein, oder nutze den Button "In Mail-App öffnen".'
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
