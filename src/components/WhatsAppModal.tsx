import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getWeekSlotKeys } from '../utils/slotTimeUtils';
import { formatWeekDate } from '../utils/dateUtils';
import { X, Copy, Check, MessageSquare, ExternalLink } from 'lucide-react';

interface WhatsAppModalProps {
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ onClose }) => {
  const { selectedWeek, players, theme, springerCount } = useApp();
  const [copied, setCopied] = useState(false);

  if (!selectedWeek) return null;

  const getPlayerName = (id: string, isGuest?: boolean, guestName?: string) => {
    if (isGuest) return guestName || 'Gastspieler';
    return players.find(p => p.id === id)?.name || 'Unbekannt';
  };

  const slotKeys = getWeekSlotKeys(selectedWeek);
  const slotsText = slotKeys.map((slotKey, idx) => {
    const assignments = selectedWeek.slots[slotKey] || [];
    const activeList = assignments.map(a => {
      const name = getPlayerName(a.playerId, a.isGuest, a.guestName);
      if (a.status === 'confirmed') return `${name} 👍`;
      if (a.status === 'substitute') return `${name} (Springer) 🦘`;
      if (a.status === 'declined') return `❌ ${name} (Ausfall)`;
      return name;
    });

    const activeCount = assignments.filter(a => a.status !== 'declined').length;
    const missing = Math.max(0, 4 - activeCount);
    if (missing > 0) {
      activeList.push(`⚠️ ${missing} ${missing === 1 ? 'Platz frei' : 'Plätze frei'}!`);
    }

    return `⏰ *#${idx + 1} (${slotKey} Uhr):*\n${activeList.length > 0 ? activeList.join(', ') : '_Noch keine Spieler eingeteilt_'}`;
  }).join('\n\n');

  const sp1Name = getPlayerName(selectedWeek.springer1.playerId);
  const sp2Name = getPlayerName(selectedWeek.springer2.playerId);
  const freiName = getPlayerName(selectedWeek.frei.playerId);

  const courtDescription = theme.courtInfo ? ` • ${theme.courtInfo}` : '';
  const dateLine = `📅 ${formatWeekDate(selectedWeek)} (${slotKeys.length} Std.${courtDescription})`;

  const springerLines = [
    ...(springerCount >= 1 ? [`🟡 *1. Springer:* ${sp1Name}`] : []),
    ...(springerCount >= 2 ? [`🟡 *2. Springer:* ${sp2Name}`] : []),
    ...(springerCount >= 3 ? [`🟡 *3. Springer:* ${freiName}`] : [`💤 *Spielfrei:* ${freiName}`]),
  ].join('\n');

  const whatsAppText = `🎾 *${theme.clubName}${theme.groupName ? ` • ${theme.groupName}` : ''}*
${dateLine}

${slotsText}

${springerLines}

👉 *Bitte Zu- oder Absagen in der WebApp verwalten!*`;

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsAppText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(whatsAppText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[var(--md-sys-color-surface)] rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                WhatsApp Nachricht
              </h3>
              <p className="text-xs text-neutral-500">
                Fertig formatierte Vorschau für {formatWeekDate(selectedWeek)}
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

        {/* Text Area Preview */}
        <div className="relative">
          <textarea
            readOnly
            value={whatsAppText}
            rows={12}
            className="w-full text-xs font-mono p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 resize-none focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-1">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center justify-center space-x-1.5 transition-all m3-ripple"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'In die Zwischenablage kopiert!' : 'Text kopieren'}</span>
          </button>

          <button
            onClick={handleOpenWhatsApp}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center space-x-1.5 shadow-md transition-all m3-ripple"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Direkt in WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
};
