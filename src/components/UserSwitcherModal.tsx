import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Users, Shield } from 'lucide-react';

interface UserSwitcherModalProps {
  onClose: () => void;
}

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({ onClose }) => {
  const { players, currentUser, setCurrentUser, theme } = useApp();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center space-x-2.5">
            <div 
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: theme.primary }}
            >
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Benutzer wechseln
              </h3>
              <p className="text-xs text-neutral-500">
                Wähle deinen Namen aus, um deine Termine zu verwalten
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

        {/* Member Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[60vh] overflow-y-auto p-1">
          {players.map((player) => {
            const isSelected = player.id === currentUser.id;

            return (
              <button
                key={player.id}
                onClick={() => {
                  setCurrentUser(player);
                  onClose();
                }}
                className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 transition-all m3-ripple ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                }`}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0"
                  style={{ backgroundColor: player.avatarColor || theme.primary }}
                >
                  {player.shortName}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate flex items-center gap-1">
                    <span>{player.name}</span>
                    {player.isAdmin && (
                      <Shield className="w-3 h-3 text-amber-500 shrink-0" />
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-500 truncate">
                    {isSelected ? 'Aktiv' : player.isAdmin ? 'Admin' : 'Mitglied'}
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-2 text-center">
          <p className="text-[11px] text-neutral-400">
            Jeder Spieler kann über seinen persönlichen Link oder durch Auswahl seines Namens zugreifen.
          </p>
        </div>

      </div>
    </div>
  );
};
