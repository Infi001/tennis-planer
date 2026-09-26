import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Player, TrainingWeek } from '../types/tennis';
import { generateSpringerEmailContent } from '../services/emailService';
import { X, Mail, Copy, Check, ExternalLink, UserCheck, AlertCircle } from 'lucide-react';

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
  const [emailInput, setEmailInput] = useState(springer.email || '');
  const [copied, setCopied] = useState(false);
  const [savedEmailSuccess, setSavedEmailSuccess] = useState(false);

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

  const handleSaveEmail = () => {
    if (!emailInput.trim()) return;
    updatePlayer({
      ...springer,
      email: emailInput.trim(),
    });
    setSavedEmailSuccess(true);
    setTimeout(() => setSavedEmailSuccess(false), 2500);
  };

  const handleCopy = () => {
    const fullText = `Betreff: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenClient = () => {
    const mailto = `mailto:${encodeURIComponent(emailInput.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
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
                Springer benachrichtigen
              </h3>
              <p className="text-xs text-neutral-500">
                E-Mail-Vorlage für freien Platz an {springer.name}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {/* Recipient info & optional email save */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
              <span>Empfänger (E-Mail)</span>
              {savedEmailSuccess && (
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Gespeichert
                </span>
              )}
            </label>
            <div className="flex items-center gap-2">
              <input 
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="spieler@beispiel.de (optional)"
                className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {emailInput.trim() && emailInput.trim() !== springer.email && (
                <button
                  type="button"
                  onClick={handleSaveEmail}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 shrink-0 transition-colors"
                  title="E-Mail für zukünftige Benachrichtigungen im Profil speichern"
                >
                  Speichern
                </button>
              )}
            </div>
            {!springer.email && !emailInput.trim() && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>Für diesen Spieler ist noch keine E-Mail hinterlegt. Du kannst sie oben eintragen oder den Text kopieren.</span>
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
              className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Body field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Nachrichtentext
            </label>
            <textarea 
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="py-2.5 px-3.5 rounded-xl text-xs font-bold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 flex items-center space-x-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Kopiert!' : 'Kopieren'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-3.5 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Schließen
            </button>
            <button
              type="button"
              onClick={handleOpenClient}
              className="py-2.5 px-4 rounded-xl text-xs font-bold text-white flex items-center space-x-1.5 shadow-sm transition-all hover:opacity-95 m3-ripple"
              style={{ backgroundColor: theme.primary }}
            >
              <ExternalLink className="w-4 h-4" />
              <span>In Mail-App öffnen</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
