import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SlotTime } from '../types/tennis';
import { getWeekSlotKeys } from '../utils/slotTimeUtils';
import { X, ArrowLeftRight, Clock, Check } from 'lucide-react';

interface SwapModalProps {
  playerId: string;
  fromSlot: SlotTime;
  onClose: () => void;
}

export const SwapModal: React.FC<SwapModalProps> = ({ playerId, fromSlot, onClose }) => {
  const { players, selectedWeek, requestSwap, acceptSwap, theme } = useApp();
  const player = players.find(p => p.id === playerId);

  const allSlots: SlotTime[] = selectedWeek ? getWeekSlotKeys(selectedWeek) : [];
  const availableTargetSlots = allSlots.filter(s => s !== fromSlot);

  const [targetSlot, setTargetSlot] = useState<SlotTime>(availableTargetSlots[0] || fromSlot);
  const [targetPlayerId, setTargetPlayerId] = useState<string>('any');

  if (!selectedWeek || !player) return null;

  const targetSlotPlayers = (selectedWeek.slots[targetSlot] || []).map(a => {
    return players.find(p => p.id === a.playerId) || { id: a.playerId, name: 'Gastspieler' };
  });

  const handleExecuteSwap = () => {
    // If specific player chosen, perform swap
    if (targetPlayerId !== 'any') {
      // Find or trigger direct swap
      requestSwap(
        selectedWeek.id,
        playerId,
        fromSlot,
        targetSlot,
        targetPlayerId
      );
    } else {
      // Open swap offer
      requestSwap(
        selectedWeek.id,
        playerId,
        fromSlot,
        targetSlot
      );
    }
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
            <div className="w-9 h-9 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Uhrzeit tauschen
              </h3>
              <p className="text-xs text-neutral-500">
                {player.name} spielt aktuell um {fromSlot} Uhr
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

        {/* Target Slot Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
            In welche Uhrzeit möchtest du wechseln?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availableTargetSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => {
                  setTargetSlot(slot);
                  setTargetPlayerId('any');
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                  targetSlot === slot
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold">{slot} Uhr</span>
              </button>
            ))}
          </div>
        </div>

        {/* Target Player Preference */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
            Mit wem möchtest du tauschen?
          </label>
          <select
            value={targetPlayerId}
            onChange={(e) => setTargetPlayerId(e.target.value)}
            className="w-full text-xs font-semibold p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="any">Offen für alle Mitspieler um {targetSlot} Uhr</option>
            {targetSlotPlayers.map((tp) => (
              <option key={tp.id} value={tp.id}>
                Direkt mit {tp.name} tauschen
              </option>
            ))}
          </select>
        </div>

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
            onClick={handleExecuteSwap}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md m3-ripple"
          >
            Tauschanfrage stellen
          </button>
        </div>

      </div>
    </div>
  );
};
