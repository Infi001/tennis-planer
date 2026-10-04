import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Unlock, AlertTriangle, ShieldCheck, X, CheckSquare, Square } from 'lucide-react';

interface ScheduleLockBannerProps {
  compact?: boolean;
  contextTitle?: string;
}

export const ScheduleLockBanner: React.FC<ScheduleLockBannerProps> = ({ 
  compact = false, 
  contextTitle 
}) => {
  const { isScheduleLocked, setIsScheduleLocked, theme } = useApp();
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [confirmedCheckbox, setConfirmedCheckbox] = useState(false);

  const handleOpenUnlock = () => {
    setConfirmedCheckbox(false);
    setShowUnlockModal(true);
  };

  const handleConfirmUnlock = () => {
    if (!confirmedCheckbox) return;
    setIsScheduleLocked(false);
    setShowUnlockModal(false);
    setConfirmedCheckbox(false);
  };

  const handleLockAgain = () => {
    setIsScheduleLocked(true);
  };

  if (compact) {
    return (
      <>
        <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
          isScheduleLocked
            ? 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700'
            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
        }`}>
          <div className="flex items-center space-x-2.5 min-w-0">
            {isScheduleLocked ? (
              <div className="w-7 h-7 rounded-xl bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-xl bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-amber-900 dark:text-amber-100 shrink-0">
                <Unlock className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <span className="font-extrabold block truncate">
                {isScheduleLocked ? 'Planung ist fixiert 🔒' : 'Planung ist entsperrt ⚠️'}
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block truncate">
                {isScheduleLocked 
                  ? 'Gesperrt gegen versehentliches Überschreiben' 
                  : 'Neuplanen & Zurücksetzen sind vorübergehend freigeschaltet'}
              </span>
            </div>
          </div>

          {isScheduleLocked ? (
            <button
              onClick={handleOpenUnlock}
              type="button"
              className="py-1.5 px-3 rounded-xl text-xs font-bold text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 shadow-2xs shrink-0 m3-ripple flex items-center gap-1.5"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Entsperren</span>
            </button>
          ) : (
            <button
              onClick={handleLockAgain}
              type="button"
              className="py-1.5 px-3 rounded-xl text-xs font-bold text-white shadow-2xs shrink-0 m3-ripple flex items-center gap-1.5"
              style={{ backgroundColor: theme.primary }}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Jetzt fixieren</span>
            </button>
          )}
        </div>

        {/* Safety Unlock Modal */}
        {showUnlockModal && (
          <UnlockConfirmationModal
            onClose={() => setShowUnlockModal(false)}
            onConfirm={handleConfirmUnlock}
            confirmed={confirmedCheckbox}
            setConfirmed={setConfirmedCheckbox}
            contextTitle={contextTitle}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
        isScheduleLocked
          ? 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200/90 dark:border-neutral-800 shadow-2xs'
          : 'bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 shadow-xs ring-2 ring-amber-400/20'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3.5 min-w-0">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              isScheduleLocked
                ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200'
                : 'bg-amber-500 text-white animate-pulse'
            }`}>
              {isScheduleLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100">
                  {isScheduleLocked ? 'Saisonplanung ist fixiert & geschützt' : 'Saisonplanung ist freigeschaltet (Änderungsmodus)'}
                </h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isScheduleLocked
                    ? 'bg-neutral-200/80 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                    : 'bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200'
                }`}>
                  {isScheduleLocked ? 'Schreibschutz aktiv' : 'Änderungen möglich'}
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 leading-relaxed">
                {isScheduleLocked
                  ? 'Alle Buttons zum Neuplanen, Optimieren und Zurücksetzen sind gesperrt, um versehentliche Änderungen am Saisonplan zu verhindern.'
                  : 'Buttons zur Neuplanung sind aktiv. Bitte fixiere die Planung nach deinen Anpassungen wieder, damit nichts versehentlich überschrieben wird.'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center">
            {isScheduleLocked ? (
              <button
                type="button"
                onClick={handleOpenUnlock}
                className="w-full sm:w-auto py-2.5 px-4 rounded-2xl text-xs font-bold text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 shadow-xs m3-ripple flex items-center justify-center space-x-2 transition-all"
              >
                <Unlock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Planung entsperren</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLockAgain}
                className="w-full sm:w-auto py-2.5 px-4 rounded-2xl text-xs font-bold text-white shadow-xs m3-ripple flex items-center justify-center space-x-2 transition-all"
                style={{ backgroundColor: theme.primary }}
              >
                <Lock className="w-4 h-4" />
                <span>Planung jetzt wieder fixieren</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Safety Unlock Modal */}
      {showUnlockModal && (
        <UnlockConfirmationModal
          onClose={() => setShowUnlockModal(false)}
          onConfirm={handleConfirmUnlock}
          confirmed={confirmedCheckbox}
          setConfirmed={setConfirmedCheckbox}
          contextTitle={contextTitle}
        />
      )}
    </>
  );
};

interface UnlockConfirmationModalProps {
  onClose: () => void;
  onConfirm: () => void;
  confirmed: boolean;
  setConfirmed: (val: boolean) => void;
  contextTitle?: string;
}

const UnlockConfirmationModal: React.FC<UnlockConfirmationModalProps> = ({
  onClose,
  onConfirm,
  confirmed,
  setConfirmed,
  contextTitle
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-neutral-100">
                Saisonplanung entsperren?
              </h3>
              <p className="text-xs text-neutral-500">
                {contextTitle || 'Sicherheitsschwelle gegen versehentliches Überschreiben'}
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

        {/* Warning Callout */}
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-2 leading-relaxed">
          <p className="font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Schutzfunktion für den bestehenden Spielplan:</span>
          </p>
          <p>
            Durch das Entsperren werden die Buttons zur <strong>Neuplanung</strong>, zum <strong>Paarungs-Optimierer</strong> und zum <strong>Zurücksetzen</strong> der Saison aktiviert.
          </p>
          <p className="text-neutral-600 dark:text-neutral-400 text-[11px]">
            Wenn du anschließend eine neue Planung anwendest, werden bestehende Spieltage, Einteilungen und individuelle Zusagen überschrieben.
          </p>
        </div>

        {/* Safety Barrier Checkbox */}
        <div 
          onClick={() => setConfirmed(!confirmed)}
          className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-3 select-none ${
            confirmed
              ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-500 dark:border-blue-500'
              : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
          }`}
        >
          <div className="mt-0.5 text-blue-600 dark:text-blue-400 shrink-0">
            {confirmed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-neutral-400" />}
          </div>
          <div className="text-xs">
            <span className="font-extrabold text-neutral-900 dark:text-neutral-100 block">
              Ich möchte die Saisonplanung bearbeiten
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Ich bin mir bewusst, dass eine Neuplanung den aktuellen Saisonplan ersetzen kann.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Abbrechen (Fixiert lassen)
          </button>
          <button
            type="button"
            disabled={!confirmed}
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
              confirmed
                ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer m3-ripple'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed border border-neutral-300 dark:border-neutral-700'
            }`}
          >
            <Unlock className="w-4 h-4" />
            <span>Jetzt entsperren</span>
          </button>
        </div>
      </div>
    </div>
  );
};
