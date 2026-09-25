import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, 
  CalendarPlus, 
  Trash2, 
  Ban, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Sliders, 
  AlertTriangle,
  X,
  Check,
  RotateCcw
} from 'lucide-react';
import { getWeekSlotKeys, canReduceWeekSlots } from '../../utils/slotTimeUtils';

export const SeasonDatesManagement: React.FC = () => {
  const { 
    weeks, 
    theme, 
    addTrainingWeekDate, 
    deleteTrainingWeek, 
    toggleWeekCancellation, 
    updateWeekNotes,
    applySlotConfigToAllWeeks
  } = useApp();

  const [isAddingDate, setIsAddingDate] = useState(false);
  const [newIsoDate, setNewIsoDate] = useState('');
  const [editingNotesWeekId, setEditingNotesWeekId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  // Global session times configurator
  const [globalHours, setGlobalHours] = useState(3);
  const [globalDuration, setGlobalDuration] = useState(60);
  const [globalStartTime, setGlobalStartTime] = useState('18:00');
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);

  const activeCount = weeks.filter(w => !w.isCancelled).length;
  const cancelledCount = weeks.length - activeCount;

  // Weeks that cannot be reduced because slots are still occupied
  const blockedWeeks = weeks.filter(w => {
    if (w.isCancelled) return false;
    const { allowed } = canReduceWeekSlots(w, globalHours);
    return !allowed;
  });

  const handleAddDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIsoDate) return;

    // Convert YYYY-MM-DD to DD.MM.YY
    const [year, month, day] = newIsoDate.split('-');
    const dateStr = `${day}.${month}.${year.slice(2)}`;

    addTrainingWeekDate(dateStr, newIsoDate);
    setIsAddingDate(false);
    setNewIsoDate('');
  };

  const handleSaveNotes = (weekId: string) => {
    updateWeekNotes(weekId, notesText.trim());
    setEditingNotesWeekId(null);
  };

  return (
    <div className="space-y-4">
      
      {/* Overview & Quick Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
        
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-xs"
            style={{ backgroundColor: theme.primary }}
          >
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-neutral-100">
                Saison-Termine & Hallenzeiten
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                {weeks.length} Montage
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {activeCount} aktive Spieltage • {cancelledCount} spielfreie Montage (Feiertage/Ferien)
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddingDate(true)}
          className="py-2 px-3.5 rounded-xl text-xs font-bold text-white shadow-xs m3-ripple flex items-center space-x-1.5 shrink-0 self-start sm:self-auto"
          style={{ backgroundColor: theme.primary }}
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Montag hinzufügen</span>
        </button>

      </div>

      {/* Global Training Units Configuration Tool */}
      <div className="p-4 rounded-3xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 flex flex-col space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-4 h-4 text-neutral-500 shrink-0" />
            <div>
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                Standard-Zeiten & Trainingseinheiten für Saison festlegen
              </span>
              <span className="text-[11px] text-neutral-500">
                Startzeit, Spieldauer und Anzahl der Trainingseinheiten je Montag
              </span>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Start Time */}
            <select
              value={globalStartTime}
              onChange={(e) => setGlobalStartTime(e.target.value)}
              className="text-xs font-semibold py-1.5 px-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            >
              {['16:00', '17:00', '17:30', '18:00', '18:30', '19:00', '20:00'].map(t => (
                <option key={t} value={t}>{t} Uhr Beginn</option>
              ))}
            </select>

            {/* Duration */}
            <select
              value={globalDuration}
              onChange={(e) => setGlobalDuration(Number(e.target.value))}
              className="text-xs font-semibold py-1.5 px-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            >
              {[45, 60, 75, 90, 120].map(d => (
                <option key={d} value={d}>{d} Min / Einheit</option>
              ))}
            </select>

            {/* Training Units Count */}
            <select
              value={globalHours}
              onChange={(e) => setGlobalHours(Number(e.target.value))}
              className="text-xs font-semibold py-1.5 px-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            >
              {[1, 2, 3, 4, 5].map(h => (
                <option key={h} value={h}>{h} {h === 1 ? 'Trainingseinheit' : 'Trainingseinheiten'} ({h * 4} Plätze)</option>
              ))}
            </select>

            <button
              onClick={() => {
                applySlotConfigToAllWeeks(globalHours, globalDuration, globalStartTime);
                setAppliedFeedback(`Standard-Zeiten angewendet!${blockedWeeks.length > 0 ? ` (${blockedWeeks.length} Wochen mit belegten Einheiten geschützt)` : ''}`);
                setTimeout(() => setAppliedFeedback(null), 4000);
              }}
              className="py-1.5 px-3 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 m3-ripple"
            >
              Auf alle Montage anwenden
            </button>
          </div>
        </div>

        {/* Warning if reducing would cut off occupied slots */}
        {blockedWeeks.length > 0 && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Hinweis zum Spielerschutz:</strong> In <strong>{blockedWeeks.length} Wochen</strong> sind die Einheiten #{globalHours + 1}+ noch mit Spielern belegt. Diese Wochen werden nicht gekürzt, da Einheiten vor dem Löschen komplett leer sein müssen.
              </span>
            </div>
          </div>
        )}

        {appliedFeedback && (
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 font-semibold flex items-center space-x-1.5 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{appliedFeedback}</span>
          </div>
        )}
      </div>

      {/* Dates List Table */}
      <div className="bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs">
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {weeks.map((week, idx) => {
            const slotKeys = getWeekSlotKeys(week);
            const isCancelled = week.isCancelled;

            return (
              <div 
                key={week.id}
                className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isCancelled 
                    ? 'bg-rose-50/40 dark:bg-rose-950/15 opacity-75' 
                    : 'hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40'
                }`}
              >
                {/* Date & Week number */}
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCancelled 
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' 
                      : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                  }`}>
                    #{idx + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-bold ${
                        isCancelled ? 'line-through text-neutral-400' : 'text-neutral-900 dark:text-neutral-100'
                      }`}>
                        Montag, {week.dateString}
                      </span>
                      {isCancelled ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                          {week.cancelReason || 'Spielfrei'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Training</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      <span>{slotKeys.length} Plätze/Std. ({slotKeys.join(', ')})</span>
                      {week.notes && (
                        <span className="italic text-neutral-600 dark:text-neutral-400 truncate">
                          • {week.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-auto">
                  {/* Notes Editor Button */}
                  <button
                    onClick={() => {
                      setEditingNotesWeekId(week.id);
                      setNotesText(week.notes || '');
                    }}
                    title="Notiz hinzufügen"
                    className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-blue-600 m3-ripple"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  {/* Cancel / Uncancel Toggle */}
                  <button
                    onClick={() => toggleWeekCancellation(week.id, isCancelled ? undefined : 'Kein Training (Feiertag / Ausfall)')}
                    title={isCancelled ? 'Wieder aktivieren' : 'Als Feiertag / Ausfall markieren'}
                    className={`py-1 px-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all m3-ripple ${
                      isCancelled
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-50 hover:text-rose-600 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    {isCancelled ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reaktivieren</span>
                      </>
                    ) : (
                      <>
                        <Ban className="w-3.5 h-3.5 text-rose-500" />
                        <span>Absagen</span>
                      </>
                    )}
                  </button>

                  {/* Delete Date Button */}
                  <button
                    onClick={() => deleteTrainingWeek(week.id)}
                    title="Termin komplett löschen"
                    className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 m3-ripple"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Add Date Modal */}
      {isAddingDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <CalendarPlus className="w-4 h-4 text-blue-500" />
                <span>Neuen Montag hinzufügen</span>
              </h3>
              <button 
                onClick={() => setIsAddingDate(false)}
                className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Datum des Montags
                </label>
                <input
                  type="date"
                  required
                  value={newIsoDate}
                  onChange={(e) => setNewIsoDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingDate(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white shadow-xs m3-ripple"
                  style={{ backgroundColor: theme.primary }}
                >
                  Hinzufügen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Notes Modal */}
      {editingNotesWeekId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Notiz zum Spieltag
            </h3>
            <textarea
              rows={3}
              placeholder="z. B. Grillabend nach dem Training oder Trainer-Fortbildung..."
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setEditingNotesWeekId(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleSaveNotes(editingNotesWeekId)}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white shadow-xs m3-ripple"
                style={{ backgroundColor: theme.primary }}
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
