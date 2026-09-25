import React, { useState, useEffect } from 'react';
import { Smartphone, Share, PlusSquare, X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PWAInstallBanner: React.FC = () => {
  const { theme } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (installed)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Check if previously dismissed
    const wasDismissed = localStorage.getItem('tennis_pwa_dismissed_v1');
    if (wasDismissed) {
      setDismissed(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('tennis_pwa_dismissed_v1', 'true');
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDismissed(true);
      }
      setDeferredPrompt(null);
    }
  };

  // If already installed or dismissed, do not render
  if (isStandalone || dismissed) {
    return null;
  }

  // Only show on mobile devices (iOS or when install prompt exists on Android)
  return (
    <div className="mx-auto max-w-xl px-4 py-2 animate-in fade-in duration-300">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-900/90 dark:to-indigo-950/90 text-white rounded-2xl p-3.5 shadow-lg border border-blue-400/30 flex items-center justify-between gap-3 relative overflow-hidden">
        
        {/* App Icon preview */}
        <div className="w-10 h-10 rounded-xl bg-white p-0.5 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
          <img src="/apple-touch-icon.png" alt="App Icon" className="w-full h-full object-cover rounded-[10px]" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 text-xs">
          <div className="font-extrabold text-sm leading-tight flex items-center gap-1.5">
            <span>Als App auf den Startbildschirm</span>
          </div>
          {isIOS ? (
            <p className="text-[11px] text-blue-100 dark:text-blue-200 mt-0.5 leading-snug">
              Tippe unten auf <Share className="w-3 h-3 inline mx-0.5 -mt-0.5" /> <strong>Teilen</strong> und dann auf <PlusSquare className="w-3 h-3 inline mx-0.5 -mt-0.5" /> <strong>Zum Home-Bildschirm</strong>.
            </p>
          ) : deferredPrompt ? (
            <p className="text-[11px] text-blue-100 dark:text-blue-200 mt-0.5">
              Installiere den Trainingsplaner mit einem Klick auf dein Smartphone.
            </p>
          ) : (
            <p className="text-[11px] text-blue-100 dark:text-blue-200 mt-0.5">
              Im Browser-Menü (⋮) auf <strong>Zum Startbildschirm hinzufügen</strong> tippen.
            </p>
          )}
        </div>

        {/* Action Button or Dismiss */}
        <div className="flex items-center gap-1.5 shrink-0">
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="py-1.5 px-3 rounded-xl bg-white text-blue-700 font-extrabold text-xs shadow-xs hover:bg-blue-50 transition-colors m3-ripple"
            >
              Installieren
            </button>
          )}

          <button
            onClick={handleDismiss}
            title="Schließen"
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
