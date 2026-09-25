import React, { useState } from 'react';
import { Player, SlotTime } from '../types/tennis';
import { useApp } from '../context/AppContext';
import { X, Search, Check } from 'lucide-react';

interface AdminAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekId: string;
  slotTime: SlotTime;
  targetPlayerIdToReplace?: string;
}

export const AdminAssignModal: React.FC<AdminAssignModalProps> = ({
  isOpen,
  onClose,
  weekId,
  slotTime,
  targetPlayerIdToReplace
}) => {
  const { players, adminDragDropAssign, weeks } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const week = weeks.find(w => w.id === weekId);
  const currentSlot = week?.slots[slotTime] || [];

  // Find all players that are NOT currently in this specific slot
  // (We can assign someone who is not playing, or someone who is playing in ANOTHER slot to move them)
  const availablePlayers = players.filter(p => {
    // If we are replacing this exact player, they shouldn't show up in the pool as an option to replace themselves
    if (p.id === targetPlayerIdToReplace) return false;
    // Otherwise, they are available if they aren't already in this specific slot.
    return !currentSlot.some(assignment => assignment.playerId === p.id);
  });

  const filteredPlayers = availablePlayers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = (playerId: string) => {
    adminDragDropAssign(weekId, slotTime, playerId, targetPlayerIdToReplace);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pt-10 px-0 pb-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg h-full sm:h-auto bg-white dark:bg-neutral-900 sm:rounded-3xl shadow-xl overflow-hidden flex flex-col sm:max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-800/50">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {targetPlayerIdToReplace ? 'Spieler austauschen' : 'Spieler hinzufügen'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Slot: {slotTime} Uhr
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Spieler suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-neutral-100 dark:bg-neutral-800/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 dark:text-neutral-200"
            />
          </div>
        </div>

        {/* Player List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 text-sm">
              Keine Spieler gefunden.
            </div>
          ) : (
            <div className="space-y-1">
              {targetPlayerIdToReplace && (
                <button
                  onClick={() => handleAssign('remove')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 font-semibold text-sm transition-colors mb-2"
                >
                  <span>Aus dem Slot entfernen</span>
                  <X className="w-4 h-4" />
                </button>
              )}
              
              {filteredPlayers.map(player => (
                <button
                  key={player.id}
                  onClick={() => handleAssign(player.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                      style={{ backgroundColor: player.avatarColor }}
                    >
                      {player.shortName}
                    </div>
                    <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                      {player.name}
                    </span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-900 dark:group-hover:text-blue-400 transition-colors">
                    <Check className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
