import React from 'react';
import { X, Scale } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ImpressumModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { theme } = useApp();
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-full border border-neutral-100 dark:border-neutral-800">
        
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-neutral-500" />
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Impressum</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-sm text-neutral-600 dark:text-neutral-400">
          
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base mb-2">Angaben gemäß § 5 TMG / DDG</h3>
            <p className="mb-1">Dieses Online-Tool ("{theme.clubName} Trainingsplaner") dient ausschließlich der internen, rein privaten Organisation einer geschlossenen Sportgruppe.</p>
            <p>Es handelt sich hierbei um <strong>kein geschäftsmäßiges Telemedium</strong>. Das Angebot ist nicht-kommerziell, enthält keine Werbung und ist nicht für die breite Öffentlichkeit bestimmt.</p>
          </div>

          <div>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base mb-2">Verantwortlich für den Betrieb:</h3>
            <p>Florian Herold<br />
            (Interne Projektleitung)</p>
            <p className="mt-2 text-xs opacity-75">
              *Eine vollständige Postanschrift entfällt aufgrund der Ausnahme für familiäre und rein private Zwecke nach dem Digitale-Dienste-Gesetz (DDG).*
            </p>
          </div>

          <div>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base mb-2">Datenschutz</h3>
            <p>
              Dieses Tool speichert lediglich die Vornamen und Zuweisungen der Gruppenmitglieder zur Organisation des Trainings. Die Daten sind passwort-/token-geschützt und für Außenstehende nicht zugänglich. Es werden keine Tracker oder Analysetools Dritter eingesetzt.
            </p>
          </div>

        </div>

        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white transition-colors m3-ripple"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
