import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarExportService } from '../services/calendarExport';
import { X, Calendar, Download, ExternalLink, Check, Smartphone, Bell, Sparkles } from 'lucide-react';
import { SlotTime } from '../types/tennis';

interface CalendarExportModalProps {
  onClose: () => void;
}

export const CalendarExportModal: React.FC<CalendarExportModalProps> = ({ onClose }) => {
  const { weeks, players, currentUser, selectedWeek, theme, getPlayerCurrentSlotInWeek } = useApp();
  const [downloadedAll, setDownloadedAll] = useState(false);
  const [downloadedSingle, setDownloadedSingle] = useState(false);

  // Count how many dates the player is scheduled for
  let scheduledDatesCount = 0;
  weeks.forEach(w => {
    if (w.isCancelled) return;
    if (Object.keys(w.slots).some(sk => (w.slots[sk] || []).some(a => a.playerId === currentUser.id && a.status !== 'declined'))) {
      scheduledDatesCount++;
    }
  });

  const mySlotThisWeek = selectedWeek ? getPlayerCurrentSlotInWeek(selectedWeek.id, currentUser.id) : null;

  const handleExportAll = () => {
    const icsContent = CalendarExportService.generateSeasonIcsForPlayer(
      currentUser,
      weeks,
      players,
      theme.clubName
    );
    const fileName = `tennistraining-saison-${currentUser.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`;
    CalendarExportService.downloadIcsFile(icsContent, fileName);
    setDownloadedAll(true);
    setTimeout(() => setDownloadedAll(false), 3000);
  };

  const handleExportSingleWeek = () => {
    if (!selectedWeek || !mySlotThisWeek) return;
    const icsContent = CalendarExportService.generateSeasonIcsForPlayer(
      currentUser,
      [selectedWeek],
      players,
      theme.clubName
    );
    const fileName = `tennistraining-${selectedWeek.date}-${currentUser.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`;
    CalendarExportService.downloadIcsFile(icsContent, fileName);
    setDownloadedSingle(true);
    setTimeout(() => setDownloadedSingle(false), 3000);
  };

  const handleOpenGoogleCalendar = () => {
    if (!selectedWeek || !mySlotThisWeek) return;
    const url = CalendarExportService.getGoogleCalendarLink(selectedWeek, mySlotThisWeek, theme.clubName);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-5 max-h-[85vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center space-x-2.5">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: theme.primary }}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Kalender-Export (Apple / Google / ICS)
              </h3>
              <p className="text-xs text-neutral-500">
                Synchronisiere deine Trainingszeiten mit deinem Smartphone
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

        {/* Option 1: Full Season Export (Hero Option) */}
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-900 dark:text-blue-200">
                Komplette Saison auf einmal
              </span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {scheduledDatesCount} Montage
            </span>
          </div>

          <p className="text-xs text-blue-800 dark:text-blue-200/90 leading-relaxed">
            Exportiere alle <strong>{scheduledDatesCount} Trainingstermine</strong> für <strong>{currentUser.name}</strong> mit exakter Uhrzeit, Mitspielern und 2-Stunden-Erinnerung in deinen Smartphone-Kalender.
          </p>

          <button
            onClick={handleExportAll}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-md m3-ripple flex items-center justify-center space-x-2 transition-all"
            style={{ backgroundColor: theme.primary }}
          >
            {downloadedAll ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            <span>{downloadedAll ? 'Saison-Kalenderdatei heruntergeladen!' : 'Alle Termine exportieren (.ics)'}</span>
          </button>

          <div className="flex items-center space-x-2 text-[11px] text-blue-700 dark:text-blue-300">
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span>Kompatibel mit Apple Kalender (iPhone/Mac), Google Kalender & Outlook</span>
          </div>
        </div>

        {/* Option 2: Single Week Export */}
        {selectedWeek && (
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Nur diesen Montag ({selectedWeek.dateString})
              </span>
              {mySlotThisWeek ? (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {mySlotThisWeek} Uhr
                </span>
              ) : (
                <span className="text-xs text-neutral-400">Kein aktiver Slot</span>
              )}
            </div>

            {mySlotThisWeek ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={handleOpenGoogleCalendar}
                  className="py-2 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 flex items-center justify-center space-x-1.5 m3-ripple"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                  <span>Google Kalender</span>
                </button>

                <button
                  onClick={handleExportSingleWeek}
                  className="py-2 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 flex items-center justify-center space-x-1.5 m3-ripple"
                >
                  {downloadedSingle ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Download className="w-3.5 h-3.5" />}
                  <span>Als .ics herunterladen</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-neutral-500">
                Du bist für diesen Montag nicht als aktiver Spieler eingeteilt.
              </p>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 text-xs space-y-2 text-neutral-600 dark:text-neutral-400">
          <p className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5" />
            Anleitung für Smartphone-Nutzer:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[11px]">
            <li><strong>iPhone / iPad:</strong> Klicke auf <em>„Alle Termine exportieren“</em>. Tippe auf die Datei und wähle <em>„Alle hinzufügen“</em>.</li>
            <li><strong>Android / Google:</strong> Lade die .ics herunter und importiere sie in calendar.google.com oder öffne den Google Kalender Link.</li>
          </ul>
        </div>

      </div>
    </div>
  );
};
