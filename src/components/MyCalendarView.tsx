import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarExportService } from '../services/calendarExport';
import { parseDateToTime, formatWeekDate } from '../utils/dateUtils';
import { Calendar, Download, Check, Sparkles, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { TrainingWeek } from '../types/tennis';

export const MyCalendarView: React.FC = () => {
  const { weeks, players, currentUser, theme, setSelectedWeekId } = useApp();
  const [downloadedAll, setDownloadedAll] = useState(false);

  // Extract all scheduled dates for current user with full week context
  const mySchedule = useMemo(() => {
    const list: Array<{ week: TrainingWeek; dateString: string; time: string; timestamp: number; isSubstitute: boolean }> = [];
    
    weeks.forEach(w => {
      if (w.isCancelled) return;
      Object.keys(w.slots).forEach(slotTime => {
        const assignment = (w.slots[slotTime] || []).find(a => a.playerId === currentUser.id && a.status !== 'declined');
        if (assignment) {
          const timestamp = parseDateToTime(w.date || w.dateString || w.id);
          list.push({
            week: w,
            dateString: w.dateString,
            time: slotTime,
            timestamp,
            isSubstitute: assignment.status === 'substitute'
          });
        }
      });
    });

    return list.sort((a, b) => a.timestamp - b.timestamp);
  }, [weeks, currentUser.id]);

  // Find next upcoming match
  const nextMatch = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayMs = now.getTime();
    return mySchedule.find(m => m.timestamp + 86400000 >= todayMs);
  }, [mySchedule]);

  const getDaysUntil = (timestamp: number) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffMs = timestamp - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Heute!';
    if (diffDays === 1) return 'Morgen';
    if (diffDays > 1) return `In ${diffDays} Tagen`;
    return 'Bereits vergangen';
  };

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

  const handleJumpToWeek = (weekId: string) => {
    setSelectedWeekId(weekId);
    window.location.hash = '#/wochenplan';
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      
      {/* Next Upcoming Match Banner (if applicable) */}
      {nextMatch && (
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-5 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                Nächster Einsatz
              </span>
              <span className="text-xs font-bold text-blue-100">
                {getDaysUntil(nextMatch.timestamp)}
              </span>
            </div>
            <div className="text-lg font-black tracking-tight">
              {formatWeekDate(nextMatch.week)}
            </div>
            <div className="text-xs text-blue-100 flex items-center gap-2">
              <span className="flex items-center gap-1 font-semibold">
                <Clock className="w-3.5 h-3.5" /> {nextMatch.time} Uhr
              </span>
              {nextMatch.isSubstitute && (
                <span className="bg-amber-400 text-neutral-900 px-1.5 py-0.2 rounded font-extrabold text-[10px]">
                  Springer
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => handleJumpToWeek(nextMatch.week.id)}
            className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-all m3-ripple shrink-0"
            title="Diesen Spieltag im Wochenplan öffnen"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-200/80 dark:border-neutral-800 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Calendar className="w-32 h-32" />
        </div>
        
        <div className="relative z-10">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-sm"
            style={{ backgroundColor: theme.primary }}
          >
            <Calendar className="w-8 h-8" />
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight mb-2">
            Dein persönlicher Kalender
          </h2>
          
          <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
            Du bist für <strong className="text-neutral-900 dark:text-neutral-100">{mySchedule.length} Termine</strong> in dieser Saison eingeteilt. Lade dir alle Termine mit einem Klick auf dein Smartphone herunter.
          </p>

          <button
            onClick={handleExportAll}
            className={`w-full sm:w-auto mx-auto px-6 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center space-x-2 transition-all shadow-md m3-ripple ${
              downloadedAll 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'hover:opacity-95'
            }`}
            style={!downloadedAll ? { backgroundColor: theme.primary } : undefined}
          >
            {downloadedAll ? (
              <>
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>Kalenderdatei (.ics) gespeichert!</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 stroke-[2.5]" />
                <span>Gesamte Saison herunterladen (.ics)</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-3 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Kompatibel mit Apple Kalender, Google Kalender & Outlook</span>
          </p>
        </div>
      </div>

      {/* Schedule List */}
      <div className="bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-5 sm:p-6 shadow-sm border border-neutral-200/80 dark:border-neutral-800">
        <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Deine Spieltermine ({mySchedule.length})</span>
          </span>
          <span className="text-xs font-semibold text-neutral-400">
            Klick öffnet Wochenplan
          </span>
        </h3>
        
        {mySchedule.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-sm">
            Du bist aktuell für keine festen Termine eingeteilt.
          </div>
        ) : (
          <ul className="space-y-2.5">
            {mySchedule.map((s, i) => (
              <li 
                key={i} 
                onClick={() => handleJumpToWeek(s.week.id)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all m3-ripple group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm block">
                      {formatWeekDate(s.week)}
                    </span>
                    {s.isSubstitute && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                        Springer-Einsatz
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-white dark:bg-neutral-800 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700 shadow-2xs">
                    {s.time} Uhr
                  </span>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
};
