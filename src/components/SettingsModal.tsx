import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { THEME_PRESETS } from '../constants/initialData';
import { 
  X, 
  Palette, 
  Database, 
  RotateCcw, 
  Download, 
  Check, 
  Copy, 
  ExternalLink,
  ShieldAlert,
  Sparkles
} from 'lucide-react';


interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { theme, setTheme, resetAll, weeks, players } = useApp();
  
  // Theme state
  const [clubName, setClubName] = useState(theme.clubName);
  const [customPrimary, setCustomPrimary] = useState(theme.primary);
  const [customSecondary, setCustomSecondary] = useState(theme.secondary);

  const handleSaveTheme = () => {
    setTheme({
      ...theme,
      clubName,
      primary: customPrimary,
      secondary: customSecondary,
      id: 'custom',
      name: `${clubName} (Individuell)`,
    });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-6 max-h-[85vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center space-x-2.5">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: theme.primary }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Einstellungen & Vereinsfarben
              </h2>
              <p className="text-xs text-neutral-500">
                Google Material Design Anpassung & Datenbankanbindung
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Club Branding & Colors */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            Vereinsfarben & Look & Feel
          </h3>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Vereinsname
            </label>
            <input
              type="text"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              className="w-full text-sm font-semibold p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
              Beliebte Vereins-Farbpaletten (Klassiker)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setTheme(preset);
                    setClubName(preset.clubName);
                    setCustomPrimary(preset.primary);
                    setCustomSecondary(preset.secondary);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 transition-all m3-ripple ${
                    theme.id === preset.id
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-200 dark:bg-neutral-800'
                  }`}
                >
                  <div 
                    className="w-6 h-6 rounded-full border border-white dark:border-neutral-700 shadow-xs shrink-0"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-800 dark:text-neutral-800 dark:text-neutral-200 truncate">
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

          {/* Custom Hex Color Pickers */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 space-y-3">
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
              Eigene Farben definieren (Hex-Code / Farbwähler)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={customPrimary}
                  onChange={(e) => setCustomPrimary(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                />
                <div className="flex-1">
                  <label className="text-[11px] text-neutral-500 block">Hauptfarbe (Primary)</label>
                  <input
                    type="text"
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="w-full text-xs font-mono p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[var(--md-sys-color-surface)]"
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
                  <label className="text-[11px] text-neutral-500 block">Sekundärfarbe (Secondary)</label>
                  <input
                    type="text"
                    value={customSecondary}
                    onChange={(e) => setCustomSecondary(e.target.value)}
                    className="w-full text-xs font-mono p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[var(--md-sys-color-surface)]"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveTheme}
              className="py-2 px-4 rounded-xl text-xs font-bold text-white shadow-xs m3-ripple"
              style={{ backgroundColor: customPrimary }}
            >
              Farben anwenden & speichern
            </button>
          </div>
        </div>

        {/* Backup & Reset */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleExportBackup}
            className="w-full sm:w-auto py-2 px-3 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 flex items-center justify-center space-x-1.5 m3-ripple"
          >
            <Download className="w-4 h-4" />
            <span>JSON-Backup exportieren</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Möchtest du wirklich alle Termine auf die ursprüngliche 15-Wochen-Excel-Matrix zurücksetzen?')) {
                resetAll();
                onClose();
              }
            }}
            className="w-full sm:w-auto py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center space-x-1.5 m3-ripple"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Auf Excel-Originalplan zurücksetzen</span>
          </button>
        </div>

      </div>
    </div>
  );
};
