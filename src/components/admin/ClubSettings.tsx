import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { THEME_PRESETS } from '../../constants/initialData';
import { StorageService } from '../../services/storage';
import { sendDirectEmail } from '../../services/emailService';
import { EmailConfig } from '../../types/tennis';
import { 
  Palette, 
  RotateCcw, 
  Download, 
  Check, 
  Sparkles,
  Settings,
  ShieldAlert,
  Users,
  Mail,
  Send,
  Loader2,
  AlertCircle,
  Lock,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

export const ClubSettings: React.FC = () => {
  const { theme, setTheme, resetAll, weeks, players, springerCount, setSpringerCount, currentUser, updatePlayer } = useApp();
  
  // Theme state
  const [clubName, setClubName] = useState(theme.clubName);
  const [groupName, setGroupName] = useState(theme.groupName || 'Montagsrunde');
  const [courtInfo, setCourtInfo] = useState(theme.courtInfo || '1 Platz mit Trainer');
  const [customPrimary, setCustomPrimary] = useState(theme.primary);
  const [customSecondary, setCustomSecondary] = useState(theme.secondary);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Email Direct Send State (Brevo API)
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(() => StorageService.getEmailConfig());
  const [savedEmailConfigSuccess, setSavedEmailConfigSuccess] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState(currentUser?.email || '');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Admin PIN / Password Change State
  const [currentAdminPin, setCurrentAdminPin] = useState('');
  const [newAdminPin, setNewAdminPin] = useState('');
  const [confirmAdminPin, setConfirmAdminPin] = useState('');
  const [showNewPin, setShowNewPin] = useState(false);
  const [pinChangeStatus, setPinChangeStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Selected Admin for change (defaults to currentUser, but can select other admins if multiple)
  const adminPlayers = players.filter(p => p.isAdmin);
  const [targetAdminId, setTargetAdminId] = useState(currentUser.id);
  const targetAdmin = players.find(p => p.id === targetAdminId) || currentUser;

  const handleUpdateAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeStatus(null);

    // If changing own PIN, verify current PIN if one was already set
    if (targetAdmin.id === currentUser.id && currentUser.pin) {
      if (currentAdminPin.trim() !== currentUser.pin) {
        setPinChangeStatus({
          success: false,
          message: 'Die aktuelle PIN ist nicht korrekt.',
        });
        return;
      }
    }

    if (!newAdminPin.trim()) {
      setPinChangeStatus({
        success: false,
        message: 'Bitte eine neue PIN oder ein Passwort eingeben.',
      });
      return;
    }

    if (newAdminPin.trim().length < 4) {
      setPinChangeStatus({
        success: false,
        message: 'Die PIN / das Passwort muss mindestens 4 Zeichen lang sein.',
      });
      return;
    }

    if (newAdminPin.trim() !== confirmAdminPin.trim()) {
      setPinChangeStatus({
        success: false,
        message: 'Die Passwörter / PINs stimmen nicht überein.',
      });
      return;
    }

    updatePlayer({
      ...targetAdmin,
      pin: newAdminPin.trim(),
    });

    setPinChangeStatus({
      success: true,
      message: `Admin-PIN für ${targetAdmin.name} erfolgreich aktualisiert!`,
    });
    setCurrentAdminPin('');
    setNewAdminPin('');
    setConfirmAdminPin('');
    setTimeout(() => setPinChangeStatus(null), 4000);
  };

  const handleSaveTheme = () => {
    setTheme({
      ...theme,
      clubName,
      groupName,
      courtInfo,
      primary: customPrimary,
      secondary: customSecondary,
      id: 'custom',
      name: `${clubName} (Individuell)`,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveEmailConfig = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveEmailConfig(emailConfig);
    setSavedEmailConfigSuccess(true);
    setTimeout(() => setSavedEmailConfigSuccess(false), 2500);
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress.trim()) {
      setTestEmailStatus({
        success: false,
        message: 'Bitte Empfänger-E-Mail eingeben.',
      });
      return;
    }

    if (!emailConfig.apiKey || !emailConfig.apiKey.trim()) {
      setTestEmailStatus({
        success: false,
        message: 'Bitte trage zuerst deinen Brevo-API-Schlüssel ein und klicke auf Speichern.',
      });
      return;
    }
    setIsSendingTestEmail(true);
    setTestEmailStatus(null);
    try {
      const res = await sendDirectEmail({
        to: testEmailAddress.trim(),
        subject: `🎾 Test-Nachricht von ${theme.clubName}`,
        body: `Hallo!\n\nDies ist eine direkte Test-E-Mail aus deinem Tennis-Trainingsplaner (${theme.clubName}).\nDer E-Mail-Versand per Brevo-API funktioniert einwandfrei!`,
        config: emailConfig,
      });
      setTestEmailStatus(res);
    } catch (err: any) {
      setTestEmailStatus({
        success: false,
        message: err.message || 'Fehler beim Senden.',
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleExportBackup = () => {
    const data = {
      exportDate: new Date().toISOString(),
      club: theme,
      players,
      weeks,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tennis-trainingsplan-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div 
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: theme.primary }}
        >
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Einstellungen
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Vereinsname, Vereinsfarben und Datensicherung
          </p>
        </div>
      </div>

      {/* 1. Vereinsname */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          Vereinsname & Erscheinungsbild
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Vereinsname
            </label>
            <input
              type="text"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              placeholder="z. B. TC Rot-Weiß Senne"
              className="w-full text-sm font-semibold p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Name der Runde / Trainingsgruppe
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="z. B. Montagsrunde oder Herren 60"
              className="w-full text-sm font-semibold p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Platz- & Trainer-Information (z. B. für WhatsApp & Kalender)
            </label>
            <input
              type="text"
              value={courtInfo}
              onChange={(e) => setCourtInfo(e.target.value)}
              placeholder="z. B. 1 Platz mit Trainer • 3x 60 Min."
              className="w-full text-sm font-semibold p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Farbauswahl Vorlagen */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
            Beliebte Farb-Kombinationen
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setTheme(preset);
                  setClubName(preset.clubName);
                  setCustomPrimary(preset.primary);
                  setCustomSecondary(preset.secondary);
                  setSavedSuccess(true);
                  setTimeout(() => setSavedSuccess(false), 2000);
                }}
                className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 transition-all m3-ripple ${
                  theme.id === preset.id
                    ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <div 
                  className="w-6 h-6 rounded-full border border-white dark:border-neutral-700 shadow-xs shrink-0"
                  style={{ backgroundColor: preset.primary }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">
                    {preset.name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-neutral-500 truncate">
                    {preset.clubName}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Eigene Farben */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 space-y-3">
          <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
            Eigene Farben einstellen
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={customPrimary}
                onChange={(e) => setCustomPrimary(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
              />
              <div className="flex-1">
                <label className="text-[11px] text-neutral-500 block">Hauptfarbe</label>
                <input
                  type="text"
                  value={customPrimary}
                  onChange={(e) => setCustomPrimary(e.target.value)}
                  className="w-full text-xs font-mono p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={customSecondary}
                onChange={(e) => setCustomSecondary(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
              />
              <div className="flex-1">
                <label className="text-[11px] text-neutral-500 block">Zweitfarbe</label>
                <input
                  type="text"
                  value={customSecondary}
                  onChange={(e) => setCustomSecondary(e.target.value)}
                  className="w-full text-xs font-mono p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSaveTheme}
              className="py-2 px-4 rounded-xl text-xs font-bold text-white shadow-xs m3-ripple flex items-center gap-1.5"
              style={{ backgroundColor: customPrimary }}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Gespeichert!</span>
                </>
              ) : (
                <span>Anwenden und speichern</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Springer-Einstellungen (Nachrücker) */}
      <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <h3 className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-500" />
          Springer-Einstellungen (Nachrücker)
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Legt fest, wie viele feste Nachrücker es pro Spieltag gibt (1. Springer, 2. Springer usw.), bevor ein freier Platz für alle Gruppenmitglieder geöffnet wird. (0 bis 10 Springer)
        </p>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setSpringerCount(Math.max(0, springerCount - 1))}
              disabled={springerCount <= 0}
              className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30 font-bold text-lg flex items-center justify-center transition-colors text-neutral-800 dark:text-neutral-200"
              title="Weniger Springer"
            >
              -
            </button>
            <input
              type="number"
              min={0}
              max={10}
              value={springerCount}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  setSpringerCount(Math.max(0, Math.min(10, val)));
                } else {
                  setSpringerCount(0);
                }
              }}
              className="w-20 text-center text-base font-extrabold p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
            />
            <button
              type="button"
              onClick={() => setSpringerCount(Math.min(10, springerCount + 1))}
              disabled={springerCount >= 10}
              className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30 font-bold text-lg flex items-center justify-center transition-colors text-neutral-800 dark:text-neutral-200"
              title="Mehr Springer"
            >
              +
            </button>
          </div>

          {/* Quick selection chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[0, 1, 2, 3].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setSpringerCount(num)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  springerCount === num
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {num === 0 ? '0 (Keine Springer)' : num === 2 ? '2 Springer (Standard)' : `${num} Springer`}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
          {springerCount === 0 && 'Keine Springer: Bei Absagen wird der freie Platz sofort für alle Mitglieder im offenen Pool geöffnet.'}
          {springerCount === 1 && '1 Springer: Bei Absagen wird zunächst der 1. Springer aktiviert.'}
          {springerCount === 2 && '2 Springer: Bei Absagen wird erst der 1. Springer, bei dessen Absage der 2. Springer aktiviert.'}
          {springerCount > 2 && `Bis zu ${springerCount} Springer: Bei Absagen werden nacheinander die eingeteilten Nachrücker aktiviert.`}
        </p>
      </div>

      {/* 3. E-Mail-Direktversand via Brevo API */}
      <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-500" />
            E-Mail-Benachrichtigungen (Brevo API)
          </h3>
          {emailConfig.apiKey ? (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <Check className="w-3 h-3" />
              Brevo API aktiv
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              API nicht eingerichtet
            </span>
          )}
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Benachrichtigt Springer bei kurzfristig freien Plätzen per E-Mail inklusive Direkt-Link zum Bestätigen.
        </p>

        {/* Explanation card */}
        <div className="max-w-2xl p-4 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/80 text-xs text-emerald-950 dark:text-emerald-100 space-y-2">
          <div className="font-bold flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-emerald-900 dark:text-emerald-100">
              <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Direkter E-Mail-Versand per Brevo API</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200">
              300 Mails / Tag kostenlos
            </span>
          </div>
          <p className="text-[11px] text-emerald-900/90 dark:text-emerald-200 leading-relaxed">
            E-Mails werden direkt und zuverlässig über die offizielle <strong>Brevo-API</strong> versendet – <strong>ohne PHP, ohne Server-Konfiguration und ohne Dateiuploads</strong>. 100% DSGVO-konform (europäischer Dienst).
          </p>
          <div className="text-[11px] text-emerald-900/80 dark:text-emerald-300/90 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60 space-y-1">
            <div className="font-semibold">So richtest du es in 2 Minuten ein:</div>
            <ol className="list-decimal list-inside space-y-0.5 pl-1">
              <li>Kostenlos registrieren auf <a href="https://www.brevo.com" target="_blank" rel="noreferrer" className="underline font-bold hover:text-emerald-700">brevo.com</a></li>
              <li>Im Menü auf <strong>SMTP & API</strong> gehen ➔ <strong>API-Schlüssel generieren</strong></li>
              <li>Den Schlüssel unten einfügen und speichern – fertig!</li>
            </ol>
          </div>
        </div>

        <form onSubmit={handleSaveEmailConfig} className="space-y-4 max-w-2xl bg-neutral-50 dark:bg-neutral-800/50 p-4 sm:p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/80">
          {/* API Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Brevo API-Schlüssel
              </label>
              <a
                href="https://app.brevo.com/settings/keys/api"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Schlüssel auf brevo.com abrufen ↗
              </a>
            </div>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={emailConfig.apiKey || ''}
                onChange={(e) => setEmailConfig({ ...emailConfig, apiKey: e.target.value })}
                placeholder="xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full text-xs font-mono p-2.5 pr-9 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Absender Information */}
          <div className="space-y-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
              Absender-Informationen
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Absender-Name
                </label>
                <input
                  type="text"
                  value={emailConfig.fromName || ''}
                  onChange={(e) => setEmailConfig({ ...emailConfig, fromName: e.target.value })}
                  placeholder="TCRW Montagsgruppe"
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Absender-E-Mail
                </label>
                <input
                  type="email"
                  value={emailConfig.fromEmail || ''}
                  onChange={(e) => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })}
                  placeholder="z. B. deine Brevo-E-Mail oder Vereinsadresse"
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 shadow-xs"
            >
              {savedEmailConfigSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>API-Einstellungen gespeichert!</span>
                </>
              ) : (
                <span>API-Einstellungen speichern</span>
              )}
            </button>
          </div>
        </form>

        {/* Test Email Box */}
        <div className="max-w-2xl bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 space-y-2.5">
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
            E-Mail-Versand testen
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="email"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              placeholder="Deine E-Mail-Adresse für Test..."
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={isSendingTestEmail}
              className="py-2 px-3.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-1.5 transition-all shadow-xs disabled:opacity-50"
            >
              {isSendingTestEmail ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sendet über Brevo API...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Test-E-Mail senden</span>
                </>
              )}
            </button>
          </div>

          {testEmailStatus && (
            <div className={`text-xs p-3 rounded-xl font-bold flex items-start gap-2.5 leading-relaxed ${
              testEmailStatus.success 
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
            }`}>
              {testEmailStatus.success ? <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              <span>{testEmailStatus.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Admin-Passwort / PIN ändern */}
      <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" />
            Admin-Passwort / PIN ändern
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
            Sicherheit
          </span>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Hier kannst du deine persönliche Admin-PIN bzw. dein Passwort für den Login und Zugriff auf das Admin-Panel ändern.
        </p>

        <form onSubmit={handleUpdateAdminPin} className="space-y-3.5 max-w-2xl bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/80">
          {adminPlayers.length > 1 && (
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Admin-Konto auswählen
              </label>
              <select
                value={targetAdminId}
                onChange={(e) => {
                  setTargetAdminId(e.target.value);
                  setPinChangeStatus(null);
                }}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {adminPlayers.map((adm) => (
                  <option key={adm.id} value={adm.id}>
                    {adm.name} {adm.id === currentUser.id ? '(Du)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {targetAdmin.id === currentUser.id && currentUser.pin && (
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Bisherige Admin-PIN
              </label>
              <input
                type="password"
                value={currentAdminPin}
                onChange={(e) => setCurrentAdminPin(e.target.value)}
                placeholder="Aktuelle PIN eingeben..."
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Neue PIN / Neues Passwort
              </label>
              <div className="relative">
                <input
                  type={showNewPin ? 'text' : 'password'}
                  value={newAdminPin}
                  onChange={(e) => setNewAdminPin(e.target.value)}
                  placeholder="Mind. 4 Zeichen / Ziffern"
                  className="w-full text-xs font-semibold p-2.5 pr-9 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPin(!showNewPin)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  title={showNewPin ? 'Verbergen' : 'Anzeigen'}
                >
                  {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Neue PIN wiederholen
              </label>
              <input
                type={showNewPin ? 'text' : 'password'}
                value={confirmAdminPin}
                onChange={(e) => setConfirmAdminPin(e.target.value)}
                placeholder="Wiederholung bestätigen..."
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {pinChangeStatus && (
            <div className={`text-xs p-2.5 rounded-xl font-bold flex items-center gap-2 ${
              pinChangeStatus.success 
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
            }`}>
              {pinChangeStatus.success ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{pinChangeStatus.message}</span>
            </div>
          )}

          <div className="pt-1">
            <button
              type="submit"
              className="py-2 px-3.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-all flex items-center gap-1.5 shadow-xs"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Admin-PIN speichern</span>
            </button>
          </div>
        </form>
      </div>

      {/* 5. Datensicherung */}
      <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <h3 className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-500" />
          Datensicherung
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Sichert alle Spieler, Spieltermine und Konfigurationen als Datei auf deinem Computer oder Smartphone.
        </p>
        <div>
          <button
            onClick={handleExportBackup}
            className="py-2.5 px-4 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center space-x-2 m3-ripple border border-neutral-200 dark:border-neutral-700"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Sicherungsdatei herunterladen (.json)</span>
          </button>
        </div>
      </div>

      {/* 3. Zurücksetzen */}
      <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <h3 className="text-sm font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          Plan zurücksetzen
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Setzt alle Spieltage und Zuteilungen unwiderruflich auf die ursprüngliche Vorlage zurück.
        </p>
        <div>
          <button
            onClick={() => {
              if (window.confirm('Möchtest du wirklich alle Termine auf die ursprüngliche 15-Wochen-Vorlage zurücksetzen? Alle individuellen Zu- und Absagen werden dabei gelöscht.')) {
                resetAll();
                alert('Der Plan wurde erfolgreich auf die ursprüngliche Vorlage zurückgesetzt.');
              }
            }}
            className="py-2.5 px-4 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 flex items-center space-x-2 m3-ripple border border-rose-200 dark:border-rose-900"
          >
            <RotateCcw className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Auf Originalplan zurücksetzen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
