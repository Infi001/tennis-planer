import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Player, TrainingWeek } from '../types/tennis';
import { generateSpringerEmailContent, sendDirectEmail } from '../services/emailService';
import { StorageService } from '../services/storage';
import { X, Mail, Send, Loader2, Copy, Check, AlertCircle, ExternalLink } from 'lucide-react';

interface EmailModalProps {
  springer: Player;
  week: TrainingWeek;
  slotKey?: string;
  decliningPlayer?: Player | { name: string };
  onClose: () => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  springer,
  week,
  slotKey,
  decliningPlayer,
  onClose,
}) => {
  const { theme, updatePlayer } = useApp();
  const emailConfig = StorageService.getEmailConfig();
  const hasWebhook = Boolean(emailConfig.endpointUrl && emailConfig.endpointUrl.trim());

  const [emailInput, setEmailInput] = useState(springer.email || '');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  const initialContent = generateSpringerEmailContent({
    springer: { ...springer, email: emailInput },
    week,
    slotKey,
    decliningPlayer,
    clubName: theme.clubName,
    groupName: theme.groupName,
  });

  const [subject, setSubject] = useState(initialContent.subject);
  const [body, setBody] = useState(initialContent.body);

  const handleDirectSend = async () => {
    const trimmedEmail = emailInput.trim();
    if (!trimmedEmail) {
      setSendResult({
        success: false,
        message: 'Bitte trage eine Empfänger-E-Mail-Adresse ein.',
      });
      return;
    }

    // Auto-save email to player profile if not yet saved or changed
    if (trimmedEmail !== springer.email) {
      updatePlayer({
        ...springer,
        email: trimmedEmail,
      });
    }

    setIsSending(true);
    setSendResult(null);

    try {
      const res = await sendDirectEmail({
        to: trimmedEmail,
        subject,
        body,
      });

      setSendResult(res);

      if (res.success) {
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch (err: any) {
      setSendResult({
        success: false,
        message: err.message || 'Fehler beim direkten E-Mail-Versand.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = () => {
    const fullText = `Betreff: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenClientFallback = () => {
    const trimmedEmail = emailInput.trim();
    if (trimmedEmail && trimmedEmail !== springer.email) {
      updatePlayer({
        ...springer,
        email: trimmedEmail,
      });
    }
    const mailto = `mailto:${encodeURIComponent(trimmedEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div 
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold shadow-xs shrink-0"
              style={{ backgroundColor: theme.primary }}
            >
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                E-Mail an Springer senden
              </h3>
              <p className="text-xs text-neutral-500">
                Benachrichtigung für {springer.name}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isSending}
            className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tip banner if no webhook is configured */}
        {!hasWebhook && (
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-100 flex items-start space-x-2">
            <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">E-Mail mit einem Klick absenden:</span>
              <p className="text-[11px] text-blue-800 dark:text-blue-200 leading-relaxed">
                Klicke unten auf <strong>"In Mail-App öffnen"</strong> – die E-Mail wird sofort in deinem Mail-Programm (Apple Mail, Outlook, Gmail) mit allem Text geöffnet!
              </p>
            </div>
          </div>
        )}

        {/* Status result banner */}
        {sendResult && (
          <div 
            className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
              sendResult.success 
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
            }`}
          >
            {sendResult.success ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{sendResult.message}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {/* Recipient info & optional email save */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
              <span>Empfänger-E-Mail</span>
              <span className="text-[11px] text-neutral-500 font-normal">
                {springer.name}
              </span>
            </label>
            <input 
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="z. B. spieler@beispiel.de"
              disabled={isSending}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {!springer.email && !emailInput.trim() && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Trage die E-Mail ein. Sie wird automatisch für {springer.name} gespeichert.</span>
              </p>
            )}
          </div>

          {/* Subject field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Betreff
            </label>
            <input 
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSending}
              className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Body field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Nachrichtentext
            </label>
            <textarea 
              rows={7}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isSending}
              className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={handleCopy}
              disabled={isSending}
              className="py-2.5 px-3 rounded-xl text-xs font-bold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 flex items-center space-x-1.5 transition-colors"
              title="Text in Zwischenablage kopieren (z. B. für WhatsApp)"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopiert!' : 'Text kopieren'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="py-2.5 px-3 rounded-xl text-xs font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Schließen
            </button>

            <button
              type="button"
              onClick={handleOpenClientFallback}
              disabled={isSending}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all m3-ripple ${
                !hasWebhook 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20' 
                  : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700'
              }`}
              title="In Standard-Mailprogramm öffnen"
            >
              <ExternalLink className="w-4 h-4" />
              <span>In Mail-App öffnen</span>
            </button>

            {hasWebhook && (
              <button
                type="button"
                onClick={handleDirectSend}
                disabled={isSending || sendResult?.success}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-white flex items-center space-x-2 shadow-sm transition-all hover:opacity-95 disabled:opacity-50 m3-ripple"
                style={{ backgroundColor: theme.primary }}
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sendet...</span>
                  </>
                ) : sendResult?.success ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Gesendet!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Via Webhook senden</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
