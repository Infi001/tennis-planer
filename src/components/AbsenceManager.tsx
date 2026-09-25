import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plane, Calendar, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { SEASON_MONDAYS } from '../constants/initialData';

export const AbsenceManager: React.FC = () => {
  const { 
    players, 
    currentUser, 
    absences, 
    addAbsence, 
    deleteAbsence, 
    theme,
    weeks 
  } = useApp();

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(currentUser.id);
  const [selectedDate, setSelectedDate] = useState<string>(
    SEASON_MONDAYS.find(m => !m.cancelled)?.iso || '2026-10-05'
  );
  const [reason, setReason] = useState<string>('Urlaub');
  const [customReason, setCustomReason] = useState<string>('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason === 'Sonstiges' ? (customReason || 'Verhindert') : reason;
    
    addAbsence(selectedPlayerId, selectedDate, finalReason);

    const playerName = players.find(p => p.id === selectedPlayerId)?.name || 'Spieler';
    const dateFormatted = SEASON_MONDAYS.find(m => m.iso === selectedDate)?.dateStr || selectedDate;
    
    setSuccessNotice(`Abwesenheit für ${playerName} am ${dateFormatted} eingetragen. Springer wird automatisch informiert!`);
    setTimeout(() => setSuccessNotice(null), 4000);

    setCustomReason('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-[var(--md-sys-color-surface)] p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
            style={{ backgroundColor: theme.primary }}
          >
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Urlaubs- & Abwesenheitsplaner
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Trage Abwesenheiten im Voraus ein – der Trainingsplan zieht Springer automatisch nach!
            </p>
          </div>
        </div>
      </div>

      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Entry Form */}
        <div className="bg-white dark:bg-[var(--md-sys-color-surface)] p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-neutral-500" />
            Neue Abwesenheit melden
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Player Selection */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Spieler
              </label>
              <select
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                disabled={!currentUser.isAdmin}
                className={(!currentUser.isAdmin ? "opacity-50 cursor-not-allowed " : "") + "w-full text-sm font-semibold p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.id === currentUser.id ? '(Du)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Trainings-Montag auswählen
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full text-sm font-semibold p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SEASON_MONDAYS.filter(m => !m.cancelled).map((m) => (
                  <option key={m.iso} value={m.iso}>
                    Montag, {m.dateStr}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason Selection */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Grund der Verhinderung
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-sm font-semibold p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Urlaub">🏖️ Urlaub</option>
                <option value="Dienstreise">💼 Dienstreise / Beruflich</option>
                <option value="Verletzung">🩹 Verletzung / Krank</option>
                <option value="Privater Termin">📅 Privater Termin</option>
                <option value="Sonstiges">Sonstiges...</option>
              </select>

              {reason === 'Sonstiges' && (
                <input
                  type="text"
                  placeholder="Genauer Grund..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="mt-2 w-full text-sm p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white shadow-md m3-ripple transition-all"
              style={{ backgroundColor: theme.primary }}
            >
              Abwesenheit eintragen
            </button>

          </form>
        </div>

        {/* Existing Absences List */}
        <div className="lg:col-span-2 bg-white dark:bg-[var(--md-sys-color-surface)] p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neutral-500" />
              Geplante Abwesenheiten ({absences.length})
            </span>
          </h3>

          {absences.length === 0 ? (
            <div className="p-8 text-center text-neutral-400 dark:text-neutral-500">
              <Plane className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Bisher keine Abwesenheiten gemeldet.</p>
              <p className="text-xs">Alle 15 Spieler sind laut Plan verfügbar.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {absences.map((abs) => {
                const player = players.find(p => p.id === abs.playerId);
                const dateObj = SEASON_MONDAYS.find(m => m.iso === abs.date);

                return (
                  <div
                    key={abs.id}
                    className="p-3.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs"
                        style={{ backgroundColor: player?.avatarColor || theme.primary }}
                      >
                        {player?.shortName || '??'}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                          <span>{player?.name}</span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                            Montag, {dateObj?.dateStr || abs.date}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          Grund: {abs.reason}
                        </p>
                      </div>
                    </div>

                    {(currentUser.isAdmin || abs.playerId === currentUser.id) && (
                      <button
                        onClick={() => deleteAbsence(abs.id)}
                        title="Abwesenheit löschen"
                        className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors m3-ripple"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
