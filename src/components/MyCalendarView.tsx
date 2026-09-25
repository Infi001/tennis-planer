import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarExportService } from '../services/calendarExport';
import { Calendar, Download, Check, Smartphone, Bell, Sparkles } from 'lucide-react';
import { SlotTime } from '../types/tennis';

export const MyCalendarView: React.FC = () => {
  const { weeks, players, currentUser, theme } = useApp();
  const [downloadedAll, setDownloadedAll] = useState(false);

  // Get all scheduled dates for current user
  const mySchedule: Array<{ date: string, time: string }> = [];
  weeks.forEach(w => {
    if (w.isCancelled) return;
    Object.keys(w.slots).forEach(slotTime => {
      const isHere = (w.slots[slotTime] || []).some(a => a.playerId === currentUser.id && a.status !== 'declined');
      if (isHere) {
        mySchedule.push({ date: w.dateString, time: slotTime });
      }
    });
  });

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

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      
      {/* Hero Section */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-neutral-200 dark:border-neutral-700 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Calendar className="w-24 h-24" />
        </div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight mb-2">
            Dein persönlicher Kalender
          </h2>
          
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6 max-w-sm mx-auto">
            Du bist für <strong className="text-neutral-900 dark:text-neutral-100">{mySchedule.length} Termine</strong> in dieser Saison eingeteilt. Lade dir jetzt alle Termine mit einem Klick in deinen Smartphone-Kalender herunter.
          </p>

          <button
            onClick={handleExportAll}
            className={`w-full sm:w-auto mx-auto px-6 py-3 rounded-xl font-bold text-white flex items-center justify-center space-x-2 transition-all shadow-sm m3-ripple ${
              downloadedAll 
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            style={!downloadedAll ? { backgroundColor: theme.primary } : undefined}
          >
            {downloadedAll ? (
              <>
                <Check className="w-5 h-5" />
                <span>Gespeichert!</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Gesamte Saison abonnieren (.ics)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Upcoming Dates Preview */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 sm:p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
        <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Deine nächsten Einsätze
        </h3>
        
        {mySchedule.length === 0 ? (
          <div className="text-center py-6 text-neutral-500 text-sm">
            Du bist aktuell für keine Termine eingeteilt.
          </div>
        ) : (
          <ul className="space-y-3">
            {mySchedule.map((s, i) => (
              <li key={i} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                  {s.date}
                </span>
                <span className="px-3 py-1 bg-white dark:bg-neutral-800 rounded-lg text-xs font-bold text-neutral-600 dark:text-neutral-300 shadow-xs">
                  {s.time} Uhr
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
};
