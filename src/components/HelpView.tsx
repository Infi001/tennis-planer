import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowLeftRight, 
  Plane, 
  Calendar, 
  Smartphone, 
  ShieldCheck, 
  Users, 
  Clock, 
  AlertCircle,
  Sparkles,
  Share,
  PlusSquare,
  PhoneCall
} from 'lucide-react';

export const HelpView: React.FC = () => {
  const { theme, currentUser } = useApp();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-[var(--md-sys-color-surface)] p-6 sm:p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm text-center space-y-3">
        <div 
          className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-white shadow-sm"
          style={{ backgroundColor: theme.primary }}
        >
          <HelpCircle className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight">
          Hilfe & Anleitung
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 max-w-xl mx-auto leading-relaxed">
          Hier findest du einfache Erklärungen zu allen Funktionen unseres Trainingsplaners – Schritt für Schritt erklärt.
        </p>
      </div>

      {/* Guide Cards Grid */}
      <div className="space-y-4">

        {/* 1. Grundprinzip */}
        <div className="bg-white dark:bg-[var(--md-sys-color-surface)] p-5 sm:p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              🎾
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                1. Wie funktioniert unsere Montagsrunde?
              </h2>
              <span className="text-xs text-neutral-500">Das Spiel- und Rotationsprinzip</span>
            </div>
          </div>
          <div className="text-sm text-neutral-700 dark:text-neutral-300 space-y-2 leading-relaxed">
            <p>
              Jeden Montag spielen wir in <strong>3 Einheiten (18:00, 19:00 und 20:00 Uhr)</strong> auf Platz 1 mit unserem Trainer.
            </p>
            <p>
              In jeder Einheit spielen genau <strong>4 Spieler</strong>. Ein ausgeklügelter Plan sorgt dafür, dass jeder Spieler über die gesamte Saison gleich oft zu den verschiedenen Uhrzeiten spielt und alle paar Wochen planmäßig spielfrei hat.
            </p>
          </div>
        </div>

        {/* 2. Zusagen */}
        <div className="bg-white dark:bg-[var(--md-sys-color-surface)] p-5 sm:p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                2. Zusagen ("Ich bin dabei")
              </h2>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Grüner Button mit Haken</span>
            </div>
          </div>
          <div className="text-sm text-neutral-700 dark:text-neutral-300 space-y-2 leading-relaxed">
            <p>
              Wenn du am Montag spielen kannst, klicke einfach auf den grünen Button <strong>"Zusagen"</strong> (oder oben im Kasten auf <em>"Ich bin dabei 👍"</em>).
            </p>
            <p>
              Dein Status ändert sich auf <strong>"Dabei ✅"</strong>. So wissen deine 3 Mitspieler und der Trainer sofort Bescheid, dass deine 4er-Gruppe vollzählig ist.
            </p>
          </div>
        </div>

        {/* 3. Absagen */}
        <div className="bg-white dark:bg-[var(--md-sys-color-surface)] p-5 sm:p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                3. Absagen (Wenn du verhindert bist)
              </h2>
              <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">Roter Button mit Kreuz</span>
            </div>
          </div>
          <div className="text-sm text-neutral-700 dark:text-neutral-300 space-y-2 leading-relaxed">
            <p>
              Du bist krank, verletzt oder hast einen wichtigen Termin? Klicke auf <strong>"Absagen"</strong>.
            </p>
            <p>
              <strong>Keine Sorge:</strong> Niemand ist böse! Sobald du absagst, gibt das System deinen Platz frei und schlägt automatisch den nächsten Springer aus der Gruppe vor.
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 p-2.5 rounded-xl">
              💡 <em>Umentschieden?</em> Solange dein Platz noch von keinem Springer angenommen wurde, kannst du jederzeit mit <strong>"Doch dabei!"</strong> wieder zusagen.
            </p>
          </div>
        </div>

        {/* 4. Das Springer-System */}
        <div className="bg-white dark:bg-[var(--md-sys-color-surface)] p-5 sm:p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              🦘
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                4. Wer rückt nach? (Die Springer-Reihenfolge)
              </h2>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Feste und faire Reihenfolge</span>
            </div>
          </div>
          <div className="text-sm text-neutral-700 dark:text-neutral-300 space-y-2.5 leading-relaxed">
            <p>
              Wenn jemand absagt, läuft automatisch folgende Reihenfolge ab:
            </p>
            <ol className="space-y-1.5 list-decimal list-inside bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-200/60 dark:border-amber-900/60">
              <li><strong>1. Springer (Priorität 1):</strong> Hat das allererste Vorrecht, den freien Platz anzunehmen.</li>
              <li><strong>2. Springer (Priorität 2):</strong> Ist an der Reihe, wenn Springer 1 absagt oder keine Zeit hat.</li>
              <li><strong>Spielfrei (Priorität 3):</strong> Wer laut Plan Pause hat, kann freiwillig einspringen.</li>
              <li><strong>Offener Pool (Priorität 4):</strong> Reagieren die Springer nicht, darf jedes beliebige Vereinsmitglied einspringen.</li>
            </ol>
            <p>
              Wenn du an der Reihe bist, siehst du ganz oben im Wochenplan einen großen gelben Kasten mit dem Button <strong>"Platz annehmen 🎾"</strong>.
            </p>
          </div>
        </div>

        {/* 5. Tauschen */}
        <div className="bg-white dark:bg-[var(--md-sys-color-surface)] p-5 sm:p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                5. Uhrzeit tauschen mit einem Mitspieler
              </h2>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">Button "Tauschen"</span>
            </div>
          </div>
          <div className="text-sm text-neutral-700 dark:text-neutral-300 space-y-2 leading-relaxed">
            <p>
              Du bist um 18:00 Uhr eingeteilt, kannst aber an diesem Tag erst um 19:00 oder 20:00 Uhr?
            </p>
            <p>
              Klicke auf <strong>"Tauschen"</strong> und wähle deine Wunsch-Uhrzeit. Ein Mitspieler aus der anderen Stunde kann deinen Tauschvorschlag mit einem Klick annehmen. Eure Plätze werden dann automatisch getauscht.
            </p>
          </div>
        </div>

        {/* 6. Urlaub */}
        <div className="bg-white dark:bg-[var(--md-sys-color-surface)] p-5 sm:p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold shrink-0">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                6. Urlaub & geplante Abwesenheiten
              </h2>
              <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold">Menü-Reiter "Urlaub"</span>
            </div>
          </div>
          <div className="text-sm text-neutral-700 dark:text-neutral-300 space-y-2 leading-relaxed">
            <p>
              Wenn du schon Wochen vorher weißt, dass du im Urlaub oder auf Dienstreise bist:
            </p>
            <p>
              Klicke unten im Menü auf <strong>"Urlaub"</strong>, wähle den betreffenden Montag aus und klicke auf <em>"Abwesenheit speichern"</em>.
            </p>
            <p>
              Der Trainingsplan weiß dann frühzeitig Bescheid und teilt automatisch einen Springer für dich ein.
            </p>
          </div>
        </div>

        {/* 7. Kalender */}
        <div className="bg-white dark:bg-[var(--md-sys-color-surface)] p-5 sm:p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                7. Termine im Smartphone-Kalender speichern
              </h2>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Menü-Reiter "Kalender"</span>
            </div>
          </div>
          <div className="text-sm text-neutral-700 dark:text-neutral-300 space-y-2 leading-relaxed">
            <p>
              Du möchtest alle deine Montags-Termine im Handy-Kalender (iPhone, Android oder Outlook) sehen?
            </p>
            <p>
              Klicke unten im Menü auf <strong>"Kalender"</strong> und tippe auf den großen Button <strong>"Gesamte Saison abonnieren (.ics)"</strong>. Dein Smartphone trägt alle deine Spiele automatisch mit Erinnerung ein.
            </p>
          </div>
        </div>

        {/* 8. App Icon auf dem Startbildschirm */}
        <div className="bg-white dark:bg-[var(--md-sys-color-surface)] p-5 sm:p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                8. Als App auf dem Startbildschirm speichern
              </h2>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Direkt neben WhatsApp ablegen</span>
            </div>
          </div>
          <div className="text-sm text-neutral-700 dark:text-neutral-300 space-y-2 leading-relaxed">
            <p>
              Damit du die Webseite nicht jedes Mal im Browser suchen musst, lege sie wie eine normale App auf deinem Bildschirm ab:
            </p>
            <ul className="space-y-2 bg-neutral-50 dark:bg-neutral-800 p-3.5 rounded-2xl text-xs sm:text-sm">
              <li className="flex items-start gap-2">
                <span className="font-bold text-neutral-900 dark:text-neutral-100">Auf dem iPhone:</span>
                <span>Unten in Safari auf das Teilen-Symbol <Share className="w-3.5 h-3.5 inline mx-0.5" /> tippen, nach unten scrollen und auf <strong>"Zum Home-Bildschirm"</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5" /> tippen.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-neutral-900 dark:text-neutral-100">Auf Android:</span>
                <span>Oben rechts auf die drei Punkte (⋮) tippen und <strong>"Zum Startbildschirm hinzufügen"</strong> auswählen.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 9. Ansprechpartner */}
        <div className="bg-white dark:bg-[var(--md-sys-color-surface)] p-5 sm:p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                9. Du hast Fragen oder kommst nicht weiter?
              </h2>
              <span className="text-xs text-neutral-500">Deine Ansprechpartner</span>
            </div>
          </div>
          <div className="text-sm text-neutral-700 dark:text-neutral-300 space-y-2 leading-relaxed">
            <p>
              Wende dich einfach an unsere beiden Organisatoren:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs">
                  TI
                </div>
                <div>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100">Timo</div>
                  <div className="text-xs text-neutral-500">1. Administrator & Organisation</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-xs">
                  FL
                </div>
                <div>
                  <div className="font-bold text-neutral-900 dark:text-neutral-100">Florian</div>
                  <div className="text-xs text-neutral-500">2. Administrator & Technik</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
