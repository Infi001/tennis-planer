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

  // 1. Webhook Endpoint (e.g. Formspree, Make.com, Zapier, n8n, Cloudflare Worker)
  if (config.endpointUrl && config.endpointUrl.trim()) {
    try {
      const res = await fetch(config.endpointUrl.trim(), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify({
          // Compatible with Formspree, Make, Zapier, n8n, etc.
          to: recipient,
          email: recipient, // for Formspree
          _replyto: config.fromEmail || recipient,
          subject: options.subject,
          message: options.body, // for Formspree
          text: options.body,
          body: options.body,
          name: config.fromName || 'Tennis Trainingsplaner',
          fromName: config.fromName || 'Tennis Trainingsplaner',
          fromEmail: config.fromEmail || undefined,
          timestamp: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        return { 
          success: true, 
          message: `E-Mail erfolgreich via Webhook an ${recipient} übermittelt!` 
        };
      } else {
        const errText = await res.text().catch(() => '');
        let detail = '';
        try {
          const parsed = JSON.parse(errText);
          detail = parsed.error || parsed.message || (parsed.errors && parsed.errors.map((e: any) => e.message).join(', ')) || '';
        } catch {}
        return {
          success: false,
          message: `Webhook-Fehler (Status ${res.status}): ${detail || res.statusText || 'Versand nicht akzeptiert'}. Bitte prüfe die Webhook-URL in den Einstellungen.`
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Verbindungsfehler zur Webhook-URL: ${err.message || 'Netzwerkfehler'}. Bitte prüfe die URL.`
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

  // 3. If no delivery service configured, do NOT fake delivery!
  return {
    success: false,
    message: 'Kein E-Mail-Dienst eingerichtet! Bitte trage unter Admin ➔ Einstellungen eine Webhook-URL (z. B. kostenlose Formspree-URL) ein, oder klicke auf "In Mail-App öffnen", um die E-Mail über dein normales E-Mail-Programm abzusenden.'
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
