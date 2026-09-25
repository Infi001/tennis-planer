import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  Dna, 
  RotateCcw, 
  Check, 
  Sliders, 
  TrendingUp, 
  Users, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Flame,
  Info
} from 'lucide-react';
import { 
  analyzeScheduleMetrics, 
  generateBaselineCyclicSchedule, 
  optimizeSchedulePairings,
  ScheduleMetrics 
} from '../../utils/scheduleGenerator';
import { TrainingWeek } from '../../types/tennis';

export const ScheduleOptimizer: React.FC = () => {
  const { 
    weeks, 
    players, 
    theme, 
    replaceEntireSchedule 
  } = useApp();

  const [algorithmMode, setAlgorithmMode] = useState<'optimized' | 'excel_baseline'>('optimized');
  const [candidateSchedule, setCandidateSchedule] = useState<TrainingWeek[] | null>(null);
  const [selectedPlayerForMatrix, setSelectedPlayerForMatrix] = useState<string | null>(null);
  const [appliedNotice, setAppliedNotice] = useState(false);

  // Compute metrics for active schedule
  const activeSchedule = candidateSchedule || weeks;
  const metrics: ScheduleMetrics = useMemo(() => {
    return analyzeScheduleMetrics(activeSchedule, players);
  }, [activeSchedule, players]);

  // Generate / Optimize candidate schedule
  const handleRunOptimizer = (mode: 'optimized' | 'excel_baseline') => {
    const weeksMeta = weeks.map(w => ({
      dateStr: w.dateString,
      iso: w.date,
      cancelled: w.isCancelled,
      cancelReason: w.cancelReason,
    }));

    const template = weeks[0];
    const hours = template ? Object.keys(template.slots).length : 3;
    const duration = template?.slotDurationMinutes || 60;
    const startTime = template?.startTime || '18:00';

    const baseline = generateBaselineCyclicSchedule(players, weeksMeta, hours, duration, startTime);

    if (mode === 'excel_baseline') {
      setCandidateSchedule(baseline);
      setAlgorithmMode('excel_baseline');
    } else {
      // Run intelligent local search optimizer
      const optimized = optimizeSchedulePairings(baseline, players, 4000);
      setCandidateSchedule(optimized);
      setAlgorithmMode('optimized');
    }
    setAppliedNotice(false);
  };

  const handleApplyToSeason = () => {
    if (candidateSchedule) {
      replaceEntireSchedule(candidateSchedule);
      setCandidateSchedule(null);
      setAppliedNotice(true);
      setTimeout(() => setAppliedNotice(false), 4000);
    }
  };

  const handleRevertOriginal = () => {
    handleRunOptimizer('excel_baseline');
    handleApplyToSeason();
  };

  return (
    <div className="space-y-4">
      
      {/* Header & Mode Selector */}
      <div className="p-5 bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3">
          <div 
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-xs"
            style={{ backgroundColor: theme.primary }}
          >
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-100">
                Saisonplan-Generator & Paarungs-Optimierer
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                Smart Algorithm
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Generiert automatisch faire Spieltage mit maximal abwechslungsreichen Paarungen und gleichmäßig rotierenden Uhrzeiten.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => handleRunOptimizer('excel_baseline')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border m3-ripple ${
              algorithmMode === 'excel_baseline' && candidateSchedule
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Bewährte Excel-Formel
          </button>

          <button
            onClick={() => handleRunOptimizer('optimized')}
            className="py-2 px-3.5 rounded-xl text-xs font-bold text-white shadow-xs m3-ripple flex items-center space-x-1.5"
            style={{ backgroundColor: theme.primary }}
          >
            <Dna className="w-4 h-4" />
            <span>Paarungs-Optimierer 🎲</span>
          </button>

          {candidateSchedule && (
            <button
              onClick={handleApplyToSeason}
              className="py-2 px-4 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md m3-ripple flex items-center space-x-1.5 animate-bounce"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Diesen Plan auf Saison anwenden! 💾</span>
            </button>
          )}
        </div>

      </div>

      {/* Applied Notice Banner */}
      {appliedNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Der neue Saisonplan wurde erfolgreich gespeichert und für alle Montage der Saison aktiviert! 🎉</span>
        </div>
      )}

      {/* Candidate Preview Notice */}
      {candidateSchedule && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Vorschau aktiv:</strong> Du siehst die berechneten Fairness-Werte und Paarungen für den {algorithmMode === 'optimized' ? 'KI-optimierten' : 'zyklischen'} Plan. Klicke auf <strong>„Auf Saison anwenden“</strong>, um ihn zu übernehmen.
            </span>
          </div>
          <button
            onClick={() => setCandidateSchedule(null)}
            className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 text-[11px] underline shrink-0"
          >
            Vorschau verwerfen
          </button>
        </div>
      )}

      {/* Real-time Fairness & Diversity Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Score 1: Overall Fairness */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[var(--md-sys-color-surface)] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Gesamt-Score
            </span>
            <div className="text-2xl font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <span>{metrics.overallFairnessScore}%</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                Exzellent
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Paarungen + Zeiten + Springer
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* Score 2: Pairing Variety */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[var(--md-sys-color-surface)] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Paarungs-Diversität
            </span>
            <div className="text-2xl font-black text-neutral-900 dark:text-neutral-100">
              {metrics.pairingVarietyScore}%
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              {metrics.uniquePairsCount} von {metrics.totalPossiblePairs} Paarungen spielen
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Score 3: Time Balance */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[var(--md-sys-color-surface)] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Zeiten-Variation
            </span>
            <div className="text-2xl font-black text-neutral-900 dark:text-neutral-100">
              {metrics.timeBalanceScore}%
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Gleichmäßige 18h / 19h / 20h Slots
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Score 4: Standby Equity */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[var(--md-sys-color-surface)] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Springer-Gerechtigkeit
            </span>
            <div className="text-2xl font-black text-neutral-900 dark:text-neutral-100">
              {metrics.standbyEquityScore}%
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Faire Springer 1, 2 & Pause Verteilung
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Interactive Pairing Matrix Heatmap */}
      <div className="bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <span>Paarungs-Matrix: Wer spielt wie oft zusammen?</span>
              <span className="text-[10px] font-medium text-neutral-400">(Gemeinsame Slot-Zugehörigkeit)</span>
            </h4>
            <p className="text-xs text-neutral-500">
              Klicke auf einen Spieler, um seine Verteilung mit allen anderen Mitgliedern hervorzuheben.
            </p>
          </div>

          {selectedPlayerForMatrix && (
            <button
              onClick={() => setSelectedPlayerForMatrix(null)}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 underline self-start sm:self-auto"
            >
              Filter aufheben
            </button>
          )}
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <table className="text-center text-[10px] border-collapse min-w-full">
            <thead>
              <tr>
                <th className="p-1.5 text-left font-bold text-neutral-400">Spieler</th>
                {players.map(p => (
                  <th 
                    key={p.id} 
                    className={`p-1.5 font-bold cursor-pointer transition-colors ${
                      selectedPlayerForMatrix === p.id ? 'text-blue-600 underline font-black' : 'text-neutral-600 dark:text-neutral-300'
                    }`}
                    onClick={() => setSelectedPlayerForMatrix(selectedPlayerForMatrix === p.id ? null : p.id)}
                    title={p.name}
                  >
                    {p.shortName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map(rowPlayer => {
                const isRowSelected = selectedPlayerForMatrix === rowPlayer.id;

                return (
                  <tr key={rowPlayer.id} className={isRowSelected ? 'bg-blue-50/50 dark:bg-blue-950/30' : 'hover:bg-neutral-50/50'}>
                    <td 
                      className={`p-1.5 text-left font-bold truncate max-w-[100px] cursor-pointer ${
                        isRowSelected ? 'text-blue-600 font-black' : 'text-neutral-800 dark:text-neutral-200'
                      }`}
                      onClick={() => setSelectedPlayerForMatrix(isRowSelected ? null : rowPlayer.id)}
                      title={rowPlayer.name}
                    >
                      {rowPlayer.shortName} <span className="font-normal text-[9px] text-neutral-400 hidden sm:inline">({rowPlayer.name.split(' ')[0]})</span>
                    </td>

                    {players.map(colPlayer => {
                      const count = metrics.pairCoOccurrenceMatrix[rowPlayer.id]?.[colPlayer.id] || 0;
                      const isSelf = rowPlayer.id === colPlayer.id;

                      return (
                        <td 
                          key={colPlayer.id}
                          className={`p-1.5 font-mono font-bold transition-all ${
                            isSelf 
                              ? 'bg-neutral-100 dark:bg-neutral-800/40 text-neutral-300' 
                              : count === 0
                                ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600'
                                : count >= 5
                                  ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200'
                                  : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200'
                          }`}
                          title={isSelf ? rowPlayer.name : `${rowPlayer.name} & ${colPlayer.name}: ${count}x zusammen`}
                        >
                          {isSelf ? '—' : count}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center flex-wrap gap-4 pt-2 text-[11px] text-neutral-500 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-emerald-100 text-emerald-800 inline-block font-mono text-[9px] text-center font-bold">3</span>
            <span>1-4x zusammen (Optimal)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-amber-100 text-amber-800 inline-block font-mono text-[9px] text-center font-bold">5</span>
            <span>$\ge$ 5x zusammen</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-rose-100 text-rose-800 inline-block font-mono text-[9px] text-center font-bold">0</span>
            <span>Noch nie zusammen</span>
          </div>
        </div>

      </div>

    </div>
  );
};
