import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, AlertTriangle, ShieldCheck, Mail, Loader2 } from 'lucide-react';
import { formatWeekDate } from '../utils/dateUtils';
import { sendDirectSpringerEmail } from '../services/emailService';

interface DeclineModalProps {
  playerId: string;
  onClose: () => void;
  onOpenWhatsApp?: () => void;
}

export const DeclineModal: React.FC<DeclineModalProps> = ({ playerId, onClose }) => {
  const { players, selectedWeek, declineAttendance, declineSubstituteOffer, theme, springerCount, getPlayerCurrentSlotInWeek, updatePlayer } = useApp();
  const player = players.find(p => p.id === playerId);
  const [reason, setReason] = useState<string>('Krank / Verletzung');
  const [customNote, setCustomNote] = useState<string>('');
  const [notifySpringerViaEmail, setNotifySpringerViaEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [springerEmailInput, setSpringerEmailInput] = useState('');

  if (!selectedWeek || !player) return null;

  const playerSlot = getPlayerCurrentSlotInWeek(selectedWeek.id, playerId) || undefined;
  const isSpringerRole = !playerSlot && (
    selectedWeek.springer1.playerId === playerId ||
    selectedWeek.springer2.playerId === playerId ||
    selectedWeek.frei?.playerId === playerId
  );
  const springerRoleLabel = selectedWeek.springer1.playerId === playerId
    ? '1. Springer'
    : selectedWeek.springer2.playerId === playerId
      ? '2. Springer'
      : '3. Springer';

  const sp1Player = players.find(p => p.id === selectedWeek.springer1.playerId);
  const sp2Player = players.find(p => p.id === selectedWeek.springer2.playerId);
  const freiPlayer = players.find(p => p.id === selectedWeek.frei?.playerId);

  const nextSpringer = (selectedWeek.springer1.playerId && selectedWeek.springer1.status !== 'declined' && selectedWeek.springer1.playerId !== playerId)
    ? sp1Player
    : (springerCount >= 2 && selectedWeek.springer2.playerId && selectedWeek.springer2.status !== 'declined' && selectedWeek.springer2.playerId !== playerId)
      ? sp2Player
      : (springerCount >= 3 && selectedWeek.frei?.playerId && selectedWeek.frei?.status !== 'declined' && selectedWeek.frei?.playerId !== playerId)
        ? freiPlayer
        : null;

  const handleConfirmDecline = async () => {
    const finalReason = customNote ? `${reason} (${customNote})` : reason;
    
    if (isSpringerRole) {
      declineSubstituteOffer(selectedWeek.id, playerId, finalReason);
    } else {
      declineAttendance(selectedWeek.id, playerId, finalReason);
    }

    if (!isSpringerRole && notifySpringerViaEmail && nextSpringer) {
      const emailToSend = (nextSpringer.email || springerEmailInput).trim();
      if (emailToSend) {
        if (!nextSpringer.email || nextSpringer.email !== emailToSend) {
          updatePlayer({
            ...nextSpringer,
            email: emailToSend,
          });
        }
        setIsSubmitting(true);
        try {
          await sendDirectSpringerEmail({
            springer: { ...nextSpringer, email: emailToSend },
            week: selectedWeek,
            slotKey: playerSlot,
            decliningPlayer: player,
            clubName: theme.clubName,
            groupName: theme.groupName,
          });
        } catch (err) {
          console.error('Fehler beim automatischen E-Mail-Versand an Springer:', err);
        } finally {
          setIsSubmitting(false);
        }
      }
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
            <div className="w-9 h-9 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {isSpringerRole ? `Als ${springerRoleLabel} absagen` : `Absage für ${player.name}`}
              </h3>
              <p className="text-xs text-neutral-500">
                {formatWeekDate(selectedWeek)}
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
            <span>Nachrücker-Regelung:</span>
          </div>
          <p className="text-amber-800 dark:text-amber-200 leading-relaxed text-xs">
            {isSpringerRole ? (
              nextSpringer ? (
                <>Du stehst für diesen Spieltag nicht als Springer zur Verfügung. Bei freien Plätzen rückt vorrangig <strong>{nextSpringer.name}</strong> nach.</>
              ) : (
                <>Du stehst für diesen Spieltag nicht als Springer zur Verfügung. Bei freien Plätzen wird direkt die gesamte Gruppe informiert.</>
              )
            ) : (
              nextSpringer ? (
                <>Der freie Platz geht vorrangig an <strong>{nextSpringer.name}</strong> (Springer).</>
              ) : (
                <>Der freie Platz wird für nachrückende Gruppenmitglieder freigegeben.</>
              )
            )}
          </p>
        </div>

        {/* Optional Email Notification to Springer */}
        {!isSpringerRole && nextSpringer && (
          <div className="space-y-1.5">
            <label className="flex items-center space-x-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none px-1">
              <input
                type="checkbox"
                checked={notifySpringerViaEmail}
                onChange={(e) => setNotifySpringerViaEmail(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
              />
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>
                  Springer <strong>{nextSpringer.name}</strong> per E-Mail benachrichtigen
                  {nextSpringer.email && (
                    <span className="text-neutral-400 font-normal"> ({nextSpringer.email})</span>
                  )}
                </span>
              </span>
            </label>
            {!nextSpringer.email && notifySpringerViaEmail && (
              <div className="pl-6">
                <input
                  type="email"
                  placeholder={`E-Mail-Adresse für ${nextSpringer.name} eingeben...`}
                  value={springerEmailInput}
                  onChange={(e) => setSpringerEmailInput(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleConfirmDecline}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md m3-ripple flex items-center justify-center space-x-1.5 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Wird gesendet...</span>
              </>
            ) : (
              <span>{isSpringerRole ? 'Als Springer absagen' : 'Absage bestätigen'}</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
