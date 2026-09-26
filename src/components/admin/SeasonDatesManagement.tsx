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
  SlidersHorizontal, 
  AlertTriangle,
  X,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Layers,
  CheckSquare,
  Square
} from 'lucide-react';
import { getWeekSlotKeys, canReduceWeekSlots, generateSlotTimes, getWeekSlotConfig } from '../../utils/slotTimeUtils';
import { formatWeekDate, getWeekdayName, generateRecurringSeasonDates } from '../../utils/dateUtils';
import { generateBaselineCyclicSchedule } from '../../utils/scheduleGenerator';
import { TrainingWeek } from '../../types/tennis';

const START_TIMES = ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'];
const DURATIONS = [
  { label: '45 Min.', value: 45 },
  { label: '60 Min. (Standard)', value: 60 },
  { label: '75 Min.', value: 75 },
  { label: '90 Min.', value: 90 },
  { label: '120 Min.', value: 120 },
];
const UNIT_OPTIONS = [1, 2, 3, 4, 5];

export const SeasonDatesManagement: React.FC = () => {
  const { 
    weeks, 
    players,
    theme, 
    addTrainingWeekDate, 
    deleteTrainingWeek, 
    toggleWeekCancellation, 
    updateWeekNotes,
    updateWeekSlotConfig,
    applySlotConfigToAllWeeks,
    replaceEntireSchedule
  } = useApp();

  const [isAddingDate, setIsAddingDate] = useState(false);
  const [newIsoDate, setNewIsoDate] = useState('');
  const [editingNotesWeekId, setEditingNotesWeekId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  // Season generator modal state
  const [isGeneratingSeason, setIsGeneratingSeason] = useState(false);
  const [genStartDate, setGenStartDate] = useState(weeks[0]?.date || '2026-10-05');
  const [genWeeksCount, setGenWeeksCount] = useState(30);
  const [genIntervalDays, setGenIntervalDays] = useState(7);
  const [genStartTime, setGenStartTime] = useState('18:00');
  const [genDuration, setGenDuration] = useState(60);
  const [genHours, setGenHours] = useState(3);

  // Target slot configuration to be set on training sessions
  const [targetHours, setTargetHours] = useState(3);
  const [targetDuration, setTargetDuration] = useState(60);
  const [targetStartTime, setTargetStartTime] = useState('18:00');

  // Multi-selection state
  const [selectedWeekIds, setSelectedWeekIds] = useState<string[]>([]);
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);
  const [justAppliedId, setJustAppliedId] = useState<string | null>(null);

  const activeCount = weeks.filter(w => !w.isCancelled).length;
  const cancelledCount = weeks.length - activeCount;

  // Preview generated slot times for the target settings
  const previewSlots = generateSlotTimes(targetStartTime, targetDuration, targetHours);
  const previewEndTime = previewSlots.length > 0 ? previewSlots[previewSlots.length - 1].split('-')[1] : '';

  // Apply settings to a single specific training session
  const handleApplyToSingleWeek = (week: TrainingWeek) => {
    const { allowed, occupiedSlots } = canReduceWeekSlots(week, targetHours);
    if (!allowed) {
      alert(`Trainingseinheit kann nicht gekürzt werden: In Einheit #${occupiedSlots[0].slotKey} spielen noch ${occupiedSlots[0].count} Spieler. Bitte erst im Wochenplan freigeben.`);
      return;
    }

    updateWeekSlotConfig(week.id, targetHours, targetDuration, targetStartTime);
    setJustAppliedId(week.id);
    setTimeout(() => setJustAppliedId(null), 2500);

    setAppliedFeedback(`Einstellungen für ${formatWeekDate(week)} erfolgreich gesetzt (${targetHours} Einheiten)!`);
    setTimeout(() => setAppliedFeedback(null), 3500);
  };

  // Apply settings to all selected training sessions
  const handleApplyToSelected = () => {
    if (selectedWeekIds.length === 0) return;

    let successCount = 0;
    let blockedCount = 0;

    selectedWeekIds.forEach(id => {
      const w = weeks.find(item => item.id === id);
      if (!w) return;

      const { allowed } = canReduceWeekSlots(w, targetHours);
      if (allowed) {
        updateWeekSlotConfig(w.id, targetHours, targetDuration, targetStartTime);
        successCount++;
      } else {
        blockedCount++;
      }
    });

    setAppliedFeedback(
      `${successCount} Spieltage auf ${targetHours} Einheiten gesetzt!${blockedCount > 0 ? ` (${blockedCount} Wochen mit belegten Einheiten geschützt)` : ''}`
    );
    setTimeout(() => setAppliedFeedback(null), 4000);
    setSelectedWeekIds([]);
  };

  // Apply settings to all weeks in the season
  const handleApplyToAll = () => {
    const blockedWeeks = weeks.filter(w => !w.isCancelled && !canReduceWeekSlots(w, targetHours).allowed);
    applySlotConfigToAllWeeks(targetHours, targetDuration, targetStartTime);
    setAppliedFeedback(
      `Alle Spieltage auf ${targetHours} Einheiten gesetzt!${blockedWeeks.length > 0 ? ` (${blockedWeeks.length} Wochen mit belegten Einheiten geschützt)` : ''}`
    );
    setTimeout(() => setAppliedFeedback(null), 4000);
  };

  const handleGenerateSeason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genStartDate) return;

    const weekday = getWeekdayName(genStartDate);
    if (!window.confirm(`Möchtest du wirklich eine neue Saison mit ${genWeeksCount} Terminen (jeweils am ${weekday}) generieren? Bestehende Termine werden dadurch ersetzt.`)) {
      return;
    }

    const recurringDates = generateRecurringSeasonDates(genStartDate, genWeeksCount, genIntervalDays);
    const newSchedule = generateBaselineCyclicSchedule(
      players,
      recurringDates,
      genHours,
      genDuration,
      genStartTime
    );

    replaceEntireSchedule(newSchedule);
    setIsGeneratingSeason(false);
    setAppliedFeedback(`Neue Saison mit ${genWeeksCount} Spieltagen (${weekday}s) erfolgreich generiert! 🎉`);
    setTimeout(() => setAppliedFeedback(null), 4500);
  };

  const handleToggleSelectWeek = (id: string) => {
    setSelectedWeekIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedWeekIds.length === weeks.length) {
      setSelectedWeekIds([]);
    } else {
      setSelectedWeekIds(weeks.map(w => w.id));
    }
  };

  const handleAddDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIsoDate) return;

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
    <div className="space-y-5">
      
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
                Saison-Termine & Trainingseinheiten
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                {weeks.length} Termine
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {activeCount} aktive Spieltage • {cancelledCount} spielfreie Termine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setIsGeneratingSeason(true)}
            className="py-2 px-3.5 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-100 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-800 shadow-xs m3-ripple flex items-center space-x-1.5 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Saison generieren</span>
          </button>

          <button
            onClick={() => setIsAddingDate(true)}
            className="py-2 px-3.5 rounded-xl text-xs font-bold text-white shadow-xs m3-ripple flex items-center space-x-1.5 shrink-0"
            style={{ backgroundColor: theme.primary }}
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Termin hinzufügen</span>
          </button>
        </div>
      </div>

      {/* Global & Per-Training Session Configurator Panel */}
      <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 space-y-4">
        
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-700/60">
          <div className="flex items-center space-x-2.5">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
              style={{ backgroundColor: theme.primary }}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100">
                Trainingseinheiten einstellen
              </h4>
              <p className="text-xs text-neutral-500">
                Wähle die gewünschten Einstellungen und weise sie einzelnen oder allen Trainings zu
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
            {targetHours * 4} Spielerplätze je Spieltag
          </span>
        </div>

        {/* Configuration Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Control 1: Number of Units */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 space-y-2">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
              1. Anzahl Einheiten
            </label>
            <div className="flex items-center gap-1">
              {UNIT_OPTIONS.map((count) => {
                const isSelected = targetHours === count;
                return (
                  <button
                    key={count}
                    onClick={() => setTargetHours(count)}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all m3-ripple ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-700/60 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                    }`}
                    style={isSelected ? { backgroundColor: theme.primary } : undefined}
                  >
                    {count}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-neutral-400 text-center">
              {targetHours} {targetHours === 1 ? 'Einheit' : 'Einheiten'} = {targetHours * 4} Plätze
            </p>
          </div>

          {/* Control 2: Start Time */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 space-y-2">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
              2. Beginn / Startzeit
            </label>
            <select
              value={targetStartTime}
              onChange={(e) => setTargetStartTime(e.target.value)}
              className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {START_TIMES.map(t => (
                <option key={t} value={t}>{t} Uhr Beginn</option>
              ))}
            </select>
            <p className="text-[11px] text-neutral-400">
              Ende: ca. {previewEndTime} Uhr
            </p>
          </div>

          {/* Control 3: Duration per Unit */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 space-y-2">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
              3. Dauer je Einheit
            </label>
            <select
              value={targetDuration}
              onChange={(e) => setTargetDuration(Number(e.target.value))}
              className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DURATIONS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            <p className="text-[11px] text-neutral-400">
              Gesamtdauer: {targetHours * targetDuration} Min.
            </p>
          </div>

        </div>

        {/* Live Preview & Bulk Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-neutral-800 p-3.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/80">
          <div className="flex items-center space-x-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
            <Clock className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              Aktuelle Auswahl: <strong>{targetHours} Einheiten</strong> ({targetStartTime} – {previewEndTime} Uhr) • <strong>{previewSlots.join(', ')}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
            {selectedWeekIds.length > 0 && (
              <button
                onClick={handleApplyToSelected}
                className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs m3-ripple flex items-center justify-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Auf {selectedWeekIds.length} gewählte anwenden</span>
              </button>
            )}

            <button
              onClick={handleApplyToAll}
              className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors m3-ripple"
            >
              Für alle Spieltage setzen
            </button>
          </div>
        </div>

        {appliedFeedback && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 font-bold flex items-center space-x-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{appliedFeedback}</span>
          </div>
        )}

      </div>

      {/* Dates List Table */}
      <div className="bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs">
        
        {/* Table Header with Select All */}
        <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between text-xs font-bold text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-1.5 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
            >
              {selectedWeekIds.length === weeks.length ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-neutral-400" />
              )}
              <span>Alle auswählen</span>
            </button>
          </div>

          <span>Aktion: Einstellungen pro Training setzen</span>
        </div>

        {/* List of Weeks */}
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {weeks.map((week, idx) => {
            const slotKeys = getWeekSlotKeys(week);
            const isCancelled = week.isCancelled;
            const isSelected = selectedWeekIds.includes(week.id);
            const isJustApplied = justAppliedId === week.id;

            return (
              <div 
                key={week.id}
                className={`p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                  isCancelled 
                    ? 'bg-rose-50/40 dark:bg-rose-950/15 opacity-75' 
                    : isJustApplied
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 ring-1 ring-emerald-400'
                      : isSelected
                        ? 'bg-blue-50/50 dark:bg-blue-950/20'
                        : 'hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40'
                }`}
              >
                {/* Left: Checkbox + Date info */}
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  
                  {/* Select Checkbox */}
                  <button
                    onClick={() => handleToggleSelectWeek(week.id)}
                    className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 transition-colors"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  {/* Week index badge */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCancelled 
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' 
                      : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                  }`}>
                    #{idx + 1}
                  </div>

                  {/* Date & Current Configuration Display */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className={`text-sm font-bold ${
                        isCancelled ? 'line-through text-neutral-400' : 'text-neutral-900 dark:text-neutral-100'
                      }`}>
                        {formatWeekDate(week)}
                      </span>
                      {isCancelled ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                          {week.cancelReason || 'Spielfrei'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Aktiv</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex-wrap">
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        {slotKeys.length} {slotKeys.length === 1 ? 'Einheit' : 'Einheiten'} ({slotKeys.length * 4} Plätze)
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">
                        {slotKeys.join(', ')}
                      </span>
                      {week.notes && (
                        <span className="italic text-neutral-600 dark:text-neutral-400 truncate">
                          • {week.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions & The Prominent Settings Setter Button */}
                <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
                  
                  {/* The Primary Setter Button for this specific training */}
                  {!isCancelled && (
                    <button
                      onClick={() => handleApplyToSingleWeek(week)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold shadow-xs m3-ripple flex items-center space-x-1.5 transition-all ${
                        isJustApplied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      style={!isJustApplied ? { backgroundColor: theme.primary } : undefined}
                      title={`Diese Einstellungen (${targetHours} Einheiten ab ${targetStartTime} Uhr) auf diesen Spieltag setzen`}
                    >
                      {isJustApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Gesetzt!</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{targetHours} {targetHours === 1 ? 'Einheit' : 'Einheiten'} setzen</span>
                        </>
                      )}
                    </button>
                  )}

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

                  {/* Cancel / Re-activate Toggle */}
                  <button
                    onClick={() => toggleWeekCancellation(week.id, isCancelled ? undefined : 'Kein Training (Feiertag / Ausfall)')}
                    title={isCancelled ? 'Wieder aktivieren' : 'Als Feiertag / Ausfall markieren'}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all m3-ripple ${
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
                <span>Neuen Termin hinzufügen</span>
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
                  Datum des Spieltags
                </label>
                <input
                  type="date"
                  required
                  value={newIsoDate}
                  onChange={(e) => setNewIsoDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
                {newIsoDate && (
                  <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 pt-1">
                    Wochentag: {getWeekdayName(newIsoDate)}
                  </p>
                )}
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

      {/* Season Generator Modal */}
      {isGeneratingSeason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    Saison automatisch generieren
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Beliebigen Wochentag & Rhythmus wählen
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsGeneratingSeason(false)}
                className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateSeason} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    1. Startdatum
                  </label>
                  <input
                    type="date"
                    required
                    value={genStartDate}
                    onChange={(e) => setGenStartDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                  {genStartDate && (
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">
                      Wochentag: {getWeekdayName(genStartDate)}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    2. Rhythmus
                  </label>
                  <select
                    value={genIntervalDays}
                    onChange={(e) => setGenIntervalDays(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    <option value={7}>Wöchentlich (alle 7 Tage)</option>
                    <option value={14}>Alle 2 Wochen (alle 14 Tage)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    3. Anzahl Termine
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={52}
                    value={genWeeksCount}
                    onChange={(e) => setGenWeeksCount(Math.max(1, Number(e.target.value)))}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    4. Startzeit
                  </label>
                  <select
                    value={genStartTime}
                    onChange={(e) => setGenStartTime(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    {START_TIMES.map(t => (
                      <option key={t} value={t}>{t} Uhr</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    5. Einheiten
                  </label>
                  <select
                    value={genHours}
                    onChange={(e) => setGenHours(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    {UNIT_OPTIONS.map(u => (
                      <option key={u} value={u}>{u} {u === 1 ? 'Std.' : 'Std.'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Informational banner */}
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Vorschau & Hinweis:</span>
                </p>
                <p className="text-[11px] leading-relaxed">
                  Generiert <strong>{genWeeksCount} Termine</strong> jeweils am <strong>{getWeekdayName(genStartDate)}</strong> ({genStartTime} Uhr, {genHours} Einheiten). Die {players.length} Spieler werden im fairen Rotationszyklus automatisch eingeteilt.
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGeneratingSeason(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs m3-ripple flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Plan generieren</span>
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
