import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, ShieldCheck, X, Check, BellOff, Info } from 'lucide-react';

interface EmailPromptModalProps {
  onClose: () => void;
}

export const EmailPromptModal: React.FC<EmailPromptModalProps> = ({ onClose }) => {
  const { currentUser, updatePlayer, theme } = useApp();
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = emailInput.trim();

    if (!trimmed) {
      setError('Bitte gib deine E-Mail-Adresse ein oder wähle „Keine E-Mails erhalten“.');
      return;
    }

    if (!validateEmail(trimmed)) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein (z. B. name@beispiel.de).');
      return;
    }

    setError(null);
    updatePlayer({
      ...currentUser,
      email: trimmed,
      emailNotifications: true,
    });

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleDeclineAllEmails = () => {
    // User explicitly says they do not want emails -> permanently opt out
    updatePlayer({
      ...currentUser,
      emailNotifications: false,
    });
    onClose();
  };

  const handleRemindLater = () => {
    // Session dismiss only (will ask again upon next login)
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-5 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-xs shrink-0"
              style={{ backgroundColor: theme.primary }}
            >
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-neutral-100">
                E-Mail-Adresse hinterlegen?
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Hallo {currentUser.name}! Bleibe bei Spieltagen informiert
              </p>
            </div>
          </div>
          <button 
            onClick={handleRemindLater}
            className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors"
            title="Später erinnern"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wichtiger Hinweis zum Datenschutz & Zweck (Explizite User-Anforderung) */}
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/80 text-blue-950 dark:text-blue-100 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-800 dark:text-blue-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <span>Nur für die Spieltags-Organisation</span>
          </div>
          <p className="text-xs leading-relaxed text-blue-900/90 dark:text-blue-200/90">
            Deine E-Mail-Adresse dient <strong>ausschließlich der vereinsinternen Organisation unserer Spieltage</strong> – z.&nbsp;B. um dich rechtzeitig zu benachrichtigen, wenn:
          </p>
          <ul className="text-[11px] space-y-1 text-blue-900/80 dark:text-blue-200/80 pl-1">
            <li className="flex items-center gap-1.5">
              <span>•</span>
              <span>Du als <strong>Springer nachrückst</strong> und spielen kannst 🦘</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span>•</span>
              <span>Ein Mitspieler eine <strong>Tauschanfrage</strong> an dich stellt 🔄</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span>•</span>
              <span>Ein Spieltag kurzfristig <strong>ausfällt</strong> 🌧️</span>
            </li>
          </ul>
          <p className="text-[10px] text-blue-700/80 dark:text-blue-300/80 pt-1 border-t border-blue-200/60 dark:border-blue-800/60">
            🔒 Kein Newsletter, keine Werbung und keine Weitergabe an Dritte.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSaveEmail} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
              Deine E-Mail-Adresse
            </label>
            <div className="relative">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setError(null);
                }}
                placeholder="z. B. vorname.nachname@web.de"
                autoFocus
                className="w-full text-xs font-semibold p-3 pl-9 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
            </div>
            {error && (
              <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}
            {isSuccess && (
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>E-Mail erfolgreich gespeichert!</span>
              </p>
            )}
          </div>

          <div className="pt-2 space-y-2">
            {/* Primary Save Button */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-xs m3-ripple flex items-center justify-center space-x-1.5 transition-all"
              style={{ backgroundColor: theme.primary }}
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>E-Mail speichern & aktivieren</span>
            </button>

            {/* Permanent Opt-out Button */}
            <button
              type="button"
              onClick={handleDeclineAllEmails}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800 transition-colors flex items-center justify-center space-x-1.5"
            >
              <BellOff className="w-3.5 h-3.5" />
              <span>Ich möchte keine E-Mails erhalten</span>
            </button>

            {/* Remind later Button */}
            <button
              type="button"
              onClick={handleRemindLater}
              className="w-full py-1.5 text-[11px] font-medium text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 text-center transition-colors"
            >
              Später erinnern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
