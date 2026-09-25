import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Users, Shield, Copy, LogOut, ExternalLink, Key } from 'lucide-react';
import { Player } from '../types/tennis';

interface AccountModalProps {
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ onClose }) => {
  const { players, currentUser, setCurrentUser, logout, theme } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);
  const [showSwitchGrid, setShowSwitchGrid] = useState(false);

  const personalLink = currentUser?.accessToken 
    ? `${window.location.origin}/?token=${currentUser.accessToken}`
    : `${window.location.origin}/?admin=florian`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(personalLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-5"
        role="dialog"
        aria-modal="true"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center space-x-2.5">
            <div 
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: theme.primary }}
            >
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Mein Profil
              </h3>
              <p className="text-xs text-neutral-500">
                Kontoverwaltung & Zugangslink
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

        {/* Current User Card */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0"
              style={{ backgroundColor: currentUser?.avatarColor || theme.primary }}
            >
              {currentUser?.shortName}
            </div>
            <div>
              <div className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <span>{currentUser?.name}</span>
                {currentUser?.isAdmin && (
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1">
                    <Shield className="w-3 h-3 text-amber-500" /> Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {currentUser?.isAdmin ? 'Voller Administrator-Zugriff' : 'Vereinsmitglied'}
              </p>
            </div>
          </div>
        </div>

        {/* Personal Magic Link Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
            Dein persönlicher Login-Link
          </label>
          <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 truncate select-all">
              {personalLink}
            </span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shrink-0 flex items-center gap-1 shadow-xs transition-all m3-ripple"
              style={{ backgroundColor: copiedLink ? '#10B981' : theme.primary }}
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Kopiert!' : 'Kopieren'}</span>
            </button>
          </div>
          <p className="text-[10px] text-neutral-400">
            Speichere diesen Link als Lesezeichen oder auf dem Startbildschirm.
          </p>
        </div>

        {/* Admin Switch Perspective Option */}
        {currentUser?.isAdmin && (
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            {!showSwitchGrid ? (
              <button
                onClick={() => setShowSwitchGrid(true)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Users className="w-4 h-4 text-blue-500" />
                <span>Als anderer Spieler ansehen (Test-Modus)</span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Spieleransicht auswählen:
                  </span>
                  <button
                    onClick={() => setShowSwitchGrid(false)}
                    className="text-xs text-neutral-400 hover:text-neutral-600"
                  >
                    Schließen
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto p-1">
                  {players.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setCurrentUser(p);
                        onClose();
                      }}
                      className={`p-2 rounded-xl text-left border flex items-center space-x-1.5 text-xs font-bold transition-all ${
                        p.id === currentUser.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600'
                          : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white shrink-0"
                        style={{ backgroundColor: p.avatarColor || theme.primary }}
                      >
                        {p.shortName}
                      </div>
                      <span className="truncate">{p.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Logout Button */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
          <button
            onClick={handleLogout}
            className="py-2 px-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center space-x-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Abmelden</span>
          </button>

          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl text-xs font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 transition-colors"
          >
            Schließen
          </button>
        </div>

      </div>
    </div>
  );
};
