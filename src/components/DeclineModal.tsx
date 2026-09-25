import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, AlertTriangle, ShieldCheck, Share2 } from 'lucide-react';

interface DeclineModalProps {
  playerId: string;
  onClose: () => void;
  onOpenWhatsApp: () => void;
}

export const DeclineModal: React.FC<DeclineModalProps> = ({ playerId, onClose, onOpenWhatsApp }) => {
  const { players, selectedWeek, declineAttendance, theme } = useApp();
  const player = players.find(p => p.id === playerId);
  const [reason, setReason] = useState<string>('Krank / Verletzung');
  const [customNote, setCustomNote] = useState<string>('');

  if (!selectedWeek || !player) return null;

  const sp1Player = players.find(p => p.id === selectedWeek.springer1.playerId);
  const sp2Player = players.find(p => p.id === selectedWeek.springer2.playerId);
  const freiPlayer = players.find(p => p.id === selectedWeek.frei?.playerId);

  const handleConfirmDecline = () => {
    const finalReason = customNote ? `${reason} (${customNote})` : reason;
    declineAttendance(selectedWeek.id, playerId, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-5"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Absage für {player.name}
              </h3>
              <p className="text-xs text-neutral-500">
                Montag, {selectedWeek.dateString}
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

        {/* Reason Selector */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
            Grund für die Absage
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {['Krank / Verletzung', 'Beruflich / Dienstreise', 'Privat verhindert', 'Urlaub'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                  reason === r
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Zusätzliche Notiz (optional)..."
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Springer Automation Preview */}
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs space-y-1.5">
          <div className="flex items-center space-x-1.5 font-bold text-amber-800 dark:text-amber-300">
            <ShieldCheck className="w-4 h-4" />
            <span>Feste Nachrück-Reihenfolge:</span>
          </div>
          <p className="text-amber-700 dark:text-amber-300/90 leading-relaxed space-y-0.5">
            1. <strong>1. Springer ({sp1Player?.name || 'André R.'})</strong> erhält Vorrang.<br />
            2. Falls verhindert ➔ <strong>2. Springer ({sp2Player?.name || 'Markus B.'})</strong>.<br />
            3. Falls verhindert ➔ <strong>Frei / Pause ({freiPlayer?.name || 'Thomas M.'})</strong>.<br />
            4. Danach ➔ <strong>Offener Pool für alle Vereinsmitglieder</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleConfirmDecline}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md m3-ripple"
          >
            Absage bestätigen
          </button>
        </div>

      </div>
    </div>
  );
};
