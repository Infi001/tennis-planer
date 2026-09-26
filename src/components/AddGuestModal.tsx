import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SlotTime } from '../types/tennis';
import { X, UserPlus, Check } from 'lucide-react';
import { formatWeekDate } from '../utils/dateUtils';

interface AddGuestModalProps {
  slotTime: SlotTime;
  onClose: () => void;
}

export const AddGuestModal: React.FC<AddGuestModalProps> = ({ slotTime, onClose }) => {
  const { selectedWeek, adminAddGuest, theme } = useApp();
  const [guestName, setGuestName] = useState<string>('');

  if (!selectedWeek) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    adminAddGuest(selectedWeek.id, slotTime, guestName.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-sm bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div 
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: theme.primary }}
            >
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Gastspieler eintragen
              </h3>
              <p className="text-xs text-neutral-500">
                {slotTime} Uhr ({formatWeekDate(selectedWeek)})
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Name des Gastspielers
            </label>
            <input
              type="text"
              autoFocus
              placeholder="z. B. Max Mustermann (Gast)"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!guestName.trim()}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-50 m3-ripple"
              style={{ backgroundColor: theme.primary }}
            >
              Hinzufügen
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
