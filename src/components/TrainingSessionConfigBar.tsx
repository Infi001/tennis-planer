import React, { useState } from 'react';
import { TrainingWeek } from '../types/tennis';
import { useApp } from '../context/AppContext';
import { getWeekSlotConfig, generateSlotTimes, getWeekSlotKeys } from '../utils/slotTimeUtils';
import { 
  Clock, 
  Minus, 
  Plus, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  SlidersHorizontal,
  CalendarCheck2,
  AlertTriangle,
  Trash2
} from 'lucide-react';

interface TrainingSessionConfigBarProps {
  week: TrainingWeek;
}

const DURATION_PRESETS = [
  { label: '45 Min.', value: 45 },
  { label: '60 Min.', value: 60 },
  { label: '90 Min.', value: 90 },
  { label: '120 Min.', value: 120 },
];

const START_TIME_PRESETS = ['17:00', '17:30', '18:00', '18:30', '19:00'];

export const TrainingSessionConfigBar: React.FC<TrainingSessionConfigBarProps> = ({ week }) => {
  const { 
    updateWeekSlotConfig, 
    applySlotConfigToAllWeeks, 
    emptyWeekSlot, 
    players, 
    weeks, 
    theme 
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showSeasonConfirm, setShowSeasonConfirm] = useState(false);
  const [showEmptyLastConfirm, setShowEmptyLastConfirm] = useState(false);

  const config = getWeekSlotConfig(week);
  const [hoursCount, setHoursCount] = useState(config.hoursCount);
  const [durations, setDurations] = useState<number[]>(config.durations);
  const [startTime, setStartTime] = useState(config.startTime);

  // Sync state if week changes
  React.useEffect(() => {
    const current = getWeekSlotConfig(week);
    setHoursCount(current.hoursCount);
    setDurations(current.durations);
    setStartTime(current.startTime);
    setShowEmptyLastConfirm(false);
  }, [week.id, week.slots, week.customDurations]);

  const currentSlotKeys = getWeekSlotKeys(week);
  const previewSlots = generateSlotTimes(startTime, durations, hoursCount);
  const totalCapacity = hoursCount * 4;

  // Check if reducing hoursCount is blocked because the last slot still has players assigned
  const targetDeleteSlotKey = currentSlotKeys[hoursCount - 1];
  const targetDeleteAssignments = targetDeleteSlotKey ? (week.slots[targetDeleteSlotKey] || []) : [];
  const isLastSlotOccupied = hoursCount <= currentSlotKeys.length && targetDeleteAssignments.length > 0;
  const canReduce = hoursCount > 1 && !isLastSlotOccupied;

  const occupiedPlayerNames = targetDeleteAssignments.map(a => {
    const p = players.find(pl => pl.id === a.playerId);
    return p ? p.name : (a.guestName || 'Gastspieler');
  });

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {}
    }
  };

  const handleUpdate = (newHours: number, newDurations: number[], newStart: string) => {
    triggerHaptic();
    setHoursCount(newHours);
    setDurations(newDurations);
    setStartTime(newStart);
    updateWeekSlotConfig(week.id, newHours, newDurations, newStart);
  };

  const handleApplyToSeason = () => {
    triggerHaptic();
    applySlotConfigToAllWeeks(hoursCount, durations, startTime);
    setShowSeasonConfirm(false);
  };

  const handleResetToDefault = () => {
    triggerHaptic();
    handleUpdate(3, [60, 60, 60], '18:00');
  };

  const handleEmptyLastSlot = () => {
    triggerHaptic();
    if (targetDeleteSlotKey) {
      emptyWeekSlot(week.id, targetDeleteSlotKey);
      setShowEmptyLastConfirm(false);
    }
  };

  return (
    <div className="bg-neutral-50/80 dark:bg-[var(--md-sys-color-surface)] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden transition-all duration-200">
      
      {/* Compact Interactive Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors select-none"
      >
        <div className="flex items-center space-x-3">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
            style={{ backgroundColor: theme.primary }}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                Trainingseinheiten-Steuerung
              </span>
              <span 
                className="text-[10px] font-extrabold px-2 py-0.2 rounded-full text-white"
                style={{ backgroundColor: theme.primary }}
              >
                {hoursCount} {hoursCount === 1 ? 'Einheit' : 'Einheiten'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mt-0.5">
              <span>{startTime} – {previewSlots[previewSlots.length - 1]?.split('-')[1]} Uhr</span>
              <span>•</span>
              <strong className="text-neutral-700 dark:text-neutral-300 font-bold">
                {totalCapacity} Plätze (immer 4 je Trainingseinheit)
              </strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            type="button"
            className="p-1.5 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 transition-transform duration-200"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Tactile Config Controls */}
      {isExpanded && (
        <div className="p-4 sm:p-5 pt-1 border-t border-neutral-100 dark:border-neutral-800/80 space-y-5 animate-in fade-in duration-150">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Control 1: Training Units Stepper */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-black text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    1. Trainingseinheiten (Plätze)
                  </label>
                  <p className="text-[11px] text-neutral-500">
                    Jede Trainingseinheit bietet exakt 4 Spieler-Plätze
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                  {totalCapacity} Plätze gesamt
                </span>
              </div>

              {/* Haptic Stepper */}
              <div className="flex items-center justify-between bg-white dark:bg-[var(--md-sys-color-surface)] p-2 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canReduce) {
                      const newDurations = [...durations];
                      newDurations.pop();
                      handleUpdate(hoursCount - 1, newDurations, startTime);
                    }
                  }}
                  disabled={!canReduce}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold transition-transform active:scale-95 m3-ripple ${
                    !canReduce
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
                      : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100'
                  }`}
                  title={
                    isLastSlotOccupied 
                      ? `Die letzte Trainingseinheit (${targetDeleteSlotKey} Uhr) ist noch belegt. Sie muss leer sein, bevor sie gelöscht werden kann!`
                      : hoursCount <= 1
                        ? 'Mindestens 1 Trainingseinheit erforderlich'
                        : 'Eine Trainingseinheit weniger'
                  }
                >
                  <Minus className="w-5 h-5 stroke-[2.5]" />
                </button>

                <div className="text-center px-4">
                  <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight">
                    {hoursCount} {hoursCount === 1 ? 'Trainingseinheit' : 'Trainingseinheiten'}
                  </div>
                  <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                    {hoursCount} Einheiten × 4 = {totalCapacity} Plätze
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hoursCount < 6) {
                      const newDurations = [...durations, durations[durations.length - 1] || 60];
                      handleUpdate(hoursCount + 1, newDurations, startTime);
                    }
                  }}
                  disabled={hoursCount >= 6}
                  className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-neutral-800 dark:text-neutral-100 font-bold transition-transform active:scale-95 m3-ripple"
                  title="Eine Trainingseinheit mehr"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Invariant Warning Banner: Last Slot Still Occupied */}
              {isLastSlotOccupied && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 space-y-2.5 animate-in fade-in">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <div className="font-extrabold text-amber-900 dark:text-amber-200">
                          Letzte Einheit ({targetDeleteSlotKey} Uhr) ist noch belegt!
                        </div>
                        <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                          Die Einheit kann erst gelöscht werden, wenn sie komplett leer ist ({targetDeleteAssignments.length} Spieler eingetragen).
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowEmptyLastConfirm(true);
                      }}
                      className="shrink-0 px-2.5 py-1.5 rounded-xl bg-amber-200/90 dark:bg-amber-900/60 hover:bg-amber-300 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 font-extrabold text-xs transition-colors flex items-center space-x-1 m3-ripple"
                      title="Alle Spieler aus dieser Einheit entfernen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Einheit leeren</span>
                    </button>
                  </div>

                  <div className="flex items-center flex-wrap gap-1.5 pt-1 border-t border-amber-200/60 dark:border-amber-800/60">
                    <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Belegt von:</span>
                    {occupiedPlayerNames.map((name, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/90 dark:bg-neutral-900/90 text-neutral-800 dark:text-neutral-200 border border-amber-200 dark:border-amber-800 shadow-2xs">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {showEmptyLastConfirm && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700/80 space-y-2 text-xs animate-in fade-in">
                  <div className="font-bold text-rose-900 dark:text-rose-200">
                    Trainingseinheit {targetDeleteSlotKey} Uhr jetzt leeren?
                  </div>
                  <p className="text-[11px] text-rose-800 dark:text-rose-300 leading-relaxed">
                    Dadurch werden alle {targetDeleteAssignments.length} Spieler aus dieser Einheit entfernt.
                  </p>
                  <div className="flex items-center space-x-2 pt-1 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowEmptyLastConfirm(false)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-neutral-600 hover:bg-neutral-200/60"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      onClick={handleEmptyLastSlot}
                      className="px-3 py-1 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs m3-ripple"
                    >
                      Ja, Einheit leeren
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Control 2: Start Time Picker & Quick Presets */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between space-y-3">
              <div>
                <label className="text-xs font-black text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                  2. Startzeit des Trainings
                </label>
                <p className="text-[11px] text-neutral-500">
                  Beginn der ersten Trainingseinheit
                </p>
              </div>

              <div className="flex items-center flex-wrap gap-1.5">
                {START_TIME_PRESETS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdate(hoursCount, durations, t);
                    }}
                    className={`flex-1 min-w-[58px] py-2 px-2 rounded-xl text-xs font-bold transition-all active:scale-95 m3-ripple ${
                      startTime === t
                        ? 'text-white shadow-xs'
                        : 'bg-white dark:bg-[var(--md-sys-color-surface)] border border-neutral-200/80 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                    style={{ backgroundColor: startTime === t ? theme.primary : undefined }}
                  >
                    {t} Uhr
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Control 3: Individual Durations */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-black text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-neutral-400" />
                  <span>3. Dauer pro Trainingseinheit</span>
                </label>
                <p className="text-[11px] text-neutral-500">
                  Individuelle Länge jeder Einheit einstellen
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {Array.from({ length: hoursCount }).map((_, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white dark:bg-[var(--md-sys-color-surface)] border border-neutral-200/80 dark:border-neutral-700 gap-3">
                  <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500">#{idx + 1}</span>
                    <span>Einheit {idx + 1}</span>
                  </div>
                  <div className="flex items-center flex-wrap gap-1.5">
                    {DURATION_PRESETS.map((p) => {
                      const isActive = (durations[idx] || 60) === p.value;
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newDurations = [...durations];
                            newDurations[idx] = p.value;
                            handleUpdate(hoursCount, newDurations, startTime);
                          }}
                          className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 m3-ripple ${
                            isActive
                              ? 'text-white shadow-sm ring-1 ring-blue-500/20'
                              : 'bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                          }`}
                          style={{ backgroundColor: isActive ? theme.primary : undefined }}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Slot Sequence Preview */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[var(--md-sys-color-surface)] border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Vorschau Einheiten:
              </span>
              <div className="flex items-center flex-wrap gap-1.5">
                {previewSlots.map((s, idx) => (
                  <span 
                    key={s}
                    className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border border-blue-200/80 dark:border-blue-900"
                  >
                    #{idx + 1}: {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="py-1.5 px-3 rounded-xl text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center space-x-1 m3-ripple"
                title="Auf 3 Trainingseinheiten à 60 Min. zurücksetzen"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Standard (3 Einheiten à 60 Min)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSeasonConfirm(true)}
                className="py-1.5 px-3 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 flex items-center space-x-1.5 m3-ripple"
              >
                <CalendarCheck2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Auf alle Wochen anwenden</span>
              </button>
            </div>
          </div>

          {showSeasonConfirm && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
              <div className="text-xs text-amber-900 dark:text-amber-200">
                <strong>Für die gesamte Saison übernehmen?</strong>
                <p className="mt-0.5 text-amber-800 dark:text-amber-300">
                  Alle Montage werden auf {hoursCount} Trainingseinheiten ({startTime} Uhr Beginn) eingestellt. Wochen mit belegten Einheiten werden zum Schutz der Spieler nicht gekürzt.
                </p>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSeasonConfirm(false)}
                  className="py-1 px-2.5 rounded-lg text-xs font-semibold text-neutral-600 hover:bg-neutral-200/60"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={handleApplyToSeason}
                  className="py-1.5 px-3.5 rounded-xl text-xs font-bold text-white shadow-xs m3-ripple"
                  style={{ backgroundColor: theme.primary }}
                >
                  Ja, für alle Wochen übernehmen
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
