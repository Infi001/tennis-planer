import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Settings, 
  Sun, 
  Moon, 
  Palette, 
  CheckCircle2, 
  Database,
  Share2,
  Calendar
} from 'lucide-react';
import { THEME_PRESETS } from '../constants/initialData';
import { getSupabaseConfig } from '../services/supabase';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenUserSwitch: () => void;
  onOpenWhatsApp: () => void;
  }

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenSettings, 
  onOpenUserSwitch, 
  onOpenWhatsApp,
  }) => {
  const { theme, setTheme, currentUser, isDarkMode, setIsDarkMode } = useApp();
  const [showThemePicker, setShowThemePicker] = useState(false);
  const { url } = getSupabaseConfig();
  const hasSupabase = Boolean(url);

  return (
    <header className="sticky top-0 z-40 bg-[var(--club-primary)] dark:bg-neutral-900/95 backdrop-blur-md border-b border-transparent dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Club Logo & Brand */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-[var(--club-primary)] shadow-sm transition-transform duration-200 hover:scale-105 bg-white"
          >
            🎾
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white dark:text-neutral-50 truncate">
                {theme.clubName}
              </span>
              <span 
                className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-[var(--club-primary)] bg-white/90"
              >
                Trainingsplaner
              </span>
            </div>
            <p className="text-xs text-white/80 dark:text-neutral-400 hidden sm:block">
              Montagsrunde • 1 Platz mit Trainer • 3x 60 Min.
            </p>
          </div>
        </div>

        {/* Action Controls & User Switcher */}
        <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren'}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300 transition-all m3-ripple"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Current User Pill / Account */}
          <button
            onClick={onOpenUserSwitch}
            className="flex items-center space-x-1.5 sm:space-x-2 pl-1.5 pr-2.5 sm:pr-3 py-1 rounded-full bg-white/20 dark:bg-neutral-800 border border-white/10 dark:border-neutral-700 hover:bg-white/30 dark:hover:bg-neutral-700 cursor-pointer transition-all m3-ripple"
            title="Mein Profil & Zugangslink"
          >
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs border border-white/20"
              style={{ backgroundColor: currentUser.avatarColor || 'rgba(0,0,0,0.2)' }}
            >
              {currentUser.shortName}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white dark:text-neutral-200 leading-tight flex items-center gap-1 max-w-[75px] sm:max-w-[120px] truncate">
                <span>{currentUser.name.split(' ')[0]}</span>
                {currentUser.isAdmin && (
                  <span className="text-[9px] bg-white/20 text-white dark:bg-amber-500/20 dark:text-amber-300 px-1 py-0.2 rounded font-semibold hidden sm:inline">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Settings Button */}
          {currentUser.isAdmin && (
          <button
            onClick={onOpenSettings}
            title="Einstellungen & Vereins-Konfiguration"
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300 transition-all m3-ripple relative"
          >
            <Settings className="w-4 h-4" />
            {hasSupabase && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-neutral-900 rounded-full" title="Mit Supabase verbunden" />
            )}
          </button>
          )}

        </div>
      </div>
    </header>
  );
};
