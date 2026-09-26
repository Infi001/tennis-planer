import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { THEME_PRESETS } from '../../constants/initialData';
import { 
  Palette, 
  RotateCcw, 
  Download, 
  Check, 
  Sparkles,
  Settings,
  ShieldAlert,
  Users
} from 'lucide-react';

export const ClubSettings: React.FC = () => {
  const { theme, setTheme, resetAll, weeks, players, springerCount, setSpringerCount } = useApp();
  
  // Theme state
  const [clubName, setClubName] = useState(theme.clubName);
  const [customPrimary, setCustomPrimary] = useState(theme.primary);
  const [customSecondary, setCustomSecondary] = useState(theme.secondary);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveTheme = () => {
    setTheme({
      ...theme,
      clubName,
      primary: customPrimary,
      secondary: customSecondary,
      id: 'custom',
      name: `${clubName} (Individuell)`,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
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

        <div>
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
            Vereinsname
          </label>
          <input
            type="text"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            placeholder="z. B. TC Grün-Weiß"
            className="w-full max-w-md text-sm font-semibold p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
                <span>Farben anwenden & speichern</span>
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
          Legt fest, wie viele feste Nachrücker es pro Spieltag gibt (1. Springer, 2. Springer usw.), bevor ein freier Platz für alle Vereinsmitglieder geöffnet wird.
        </p>
        
        <div className="flex flex-wrap gap-2.5">
          {[1, 2, 3].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setSpringerCount(count)}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all m3-ripple border flex items-center gap-2 ${
                springerCount === count
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50'
              }`}
            >
              <span>{count} {count === 1 ? 'Springer' : 'Springer'}{count === 2 ? ' (Standard)' : ''}</span>
              {springerCount === count && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-neutral-500">
          {springerCount === 1 && 'Bei Absagen rückt zunächst Springer 1 nach. Kann dieser nicht, ist der Platz sofort für alle Mitglieder frei.'}
          {springerCount === 2 && 'Bei Absagen rückt erst Springer 1, danach Springer 2 nach. Danach ist der Platz für alle Mitglieder frei.'}
          {springerCount === 3 && 'Bei Absagen rücken nacheinander Springer 1, 2 und 3 nach. Danach ist der Platz für alle Mitglieder frei.'}
        </p>
      </div>

      {/* 3. Datensicherung */}
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
