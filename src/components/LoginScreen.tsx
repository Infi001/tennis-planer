import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Lock, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { Player } from '../types/tennis';

export const LoginScreen: React.FC = () => {
  const { players, setCurrentUser, theme } = useApp();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  const handleSelectPlayer = (player: Player) => {
    if (player.isAdmin) {
      setSelectedPlayer(player);
      setAdminPinInput('');
      setPinError(false);
    } else {
      // Direct login for regular players
      setCurrentUser(player);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;

    // Check PIN: matches player.pin, default '1234', 'admin', or the player's name
    const input = adminPinInput.trim().toLowerCase();
    const correctPin = (selectedPlayer.pin || '1234').toLowerCase();
    if (input === correctPin || input === 'admin' || input === selectedPlayer.name.toLowerCase()) {
      setCurrentUser(selectedPlayer);
    } else {
      setPinError(true);
    }
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = manualToken.trim();
    if (!token) return;

    // Check if token matches or is a URL
    let extractedToken = token;
    if (token.includes('token=')) {
      try {
        const url = new URL(token.startsWith('http') ? token : `https://example.com/${token}`);
        extractedToken = url.searchParams.get('token') || token;
      } catch {
        extractedToken = token.split('token=')[1]?.split('&')[0] || token;
      }
    }

    const matched = players.find(p => p.accessToken === extractedToken);
    if (matched) {
      setCurrentUser(matched);
    } else {
      setTokenError(true);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex flex-col justify-center items-center p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div 
            className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-md text-white font-bold transition-transform hover:scale-105"
            style={{ backgroundColor: theme.primary }}
          >
            🎾
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight">
            {theme.clubName}
          </h1>
          <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
            Trainingsplaner • {theme.groupName || 'Trainingsgruppe'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-200/80 dark:border-neutral-800 space-y-6">
          
          <div className="text-center">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Wer bist du?
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Wähle deinen Namen aus, um deine Spieltermine zu sehen
            </p>
          </div>

          {/* Player Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[50vh] overflow-y-auto p-1">
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => handleSelectPlayer(player)}
                className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-all text-left flex items-center space-x-2.5 m3-ripple group"
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0 transition-transform group-hover:scale-105"
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
                  <div className="text-[10px] text-neutral-400 truncate">
                    {player.isAdmin ? 'Admin' : 'Spieler'}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Link / Token Toggle */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-center">
            {!showTokenInput ? (
              <button
                onClick={() => setShowTokenInput(true)}
                className="text-xs font-medium text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                Zugangslink eingeben ➔
              </button>
            ) : (
              <form onSubmit={handleTokenSubmit} className="space-y-2 pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Link oder Token hier einfügen..."
                    value={manualToken}
                    onChange={(e) => {
                      setManualToken(e.target.value);
                      setTokenError(false);
                    }}
                    className="flex-1 text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    style={{ backgroundColor: theme.primary }}
                  >
                    Login
                  </button>
                </div>
                {tokenError && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Ungültiger Zugangslink
                  </p>
                )}
              </form>
            )}
          </div>

        </div>

        {/* Small Notice */}
        <p className="text-center text-[11px] text-neutral-400">
          Tipp: Wenn du deinen persönlichen WhatsApp-Link öffnest, wirst du künftig automatisch eingeloggt.
        </p>

      </div>

      {/* Admin PIN Dialog */}
      {selectedPlayer && selectedPlayer.isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Admin-Zugang ({selectedPlayer.name})
              </h3>
              <p className="text-xs text-neutral-500">
                Bitte gib die Admin-PIN ein (Standard: 1234)
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  inputMode="numeric"
                  autoFocus
                  placeholder="PIN eingeben"
                  value={adminPinInput}
                  onChange={(e) => {
                    setAdminPinInput(e.target.value);
                    setPinError(false);
                  }}
                  className="w-full text-center text-lg tracking-widest font-mono p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {pinError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold text-center mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Falsche PIN
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlayer(null)}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-white shadow-xs m3-ripple"
                  style={{ backgroundColor: theme.primary }}
                >
                  Anmelden
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
