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
  PhoneCall,
  Lock,
  Mail,
  SunMoon
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
                1. Wie funktioniert unser Trainingsplaner?
              </h2>
              <span className="text-xs text-neutral-500">Das Spiel- und Rotationsprinzip</span>
            </div>
          </div>
          <div className="text-sm text-neutral-700 dark:text-neutral-300 space-y-2 leading-relaxed">
            <p>
              An jedem Spieltag spielen wir in fest eingeteilten Trainingseinheiten auf dem Platz.
            </p>
            <p>
              In jeder Einheit spielen genau <strong>4 Spieler</strong>. Ein ausgeklügelter Plan sorgt dafür, dass jeder Spieler über die gesamte Saison gleich oft zu den verschiedenen Uhrzeiten spielt und alle paar Wochen planmäßig spielfrei hat.
            </p>
          </div>
        </div>

        {/* 2. Automatisch eingeteilt */}
        <div className="bg-white dark:bg-[var(--md-sys-color-surface)] p-5 sm:p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                2. Automatisch eingeteilt (Keine Bestätigung nötig)
              </h2>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Standardmäßig dabei</span>
            </div>
          </div>
          <div className="text-sm text-neutral-700 dark:text-neutral-300 space-y-2 leading-relaxed">
            <p>
              Laut Saisonplan bist du an deinen Spieltagen automatisch fest eingeteilt. Du musst deine Teilnahme <strong>nicht extra bestätigen</strong>.
            </p>
            <p>
              Nur wenn du an einem Spieltag verhindert bist, klickst du bitte rechtzeitig auf <strong>"Termin absagen"</strong>, damit ein Springer nachrücken kann.
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
              <strong>Keine Sorge:</strong> Niemand ist böse! Sobald du absagst, gibt das System deinen Platz frei und aktiviert automatisch den nächsten Nachrücker aus der Gruppe.
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
                4. Wer rückt nach? (Das flexible Springer-System)
              </h2>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Feste und faire Reihenfolge</span>
            </div>
          </div>
          <div className="text-sm text-neutral-700 dark:text-neutral-300 space-y-2.5 leading-relaxed">
            <p>
              Wenn jemand absagt, läuft automatisch folgende Kaskade ab (flexibel einstellbar von 0 bis 10 Springern pro Spieltag):
            </p>
            <ol className="space-y-1.5 list-decimal list-inside bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-200/60 dark:border-amber-900/60">
              <li><strong>1. Springer:</strong> Hat das Vorrecht, den frei gewordenen Platz sofort zu übernehmen.</li>
              <li><strong>2. Springer:</strong> Rückt nach, sobald der 1. Springer absagt oder keine Zeit hat.</li>
              <li><strong>Weitere Springer (z. B. 3. Springer):</strong> Werden schrittweise nacheinander aktiviert.</li>
              <li><strong>Offener Pool:</strong> Sagen alle Springer ab, wird der Platz für alle weiteren Gruppenmitglieder freigegeben.</li>
            </ol>
            <p>
              <strong>E-Mail-Direktversand:</strong> Springer können direkt aus der App per E-Mail benachrichtigt werden, sobald ein Platz frei wird – inklusive Klick-Link zum sofortigen Annehmen!
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
              Du bist beispielsweise um 18:00 Uhr eingeteilt, kannst aber an diesem Tag erst um 19:00 oder 20:00 Uhr spielen?
            </p>
            <p>
              Klicke auf <strong>"Tauschen"</strong> und wähle deine Wunsch-Uhrzeit. Ein Mitspieler aus der anderen Stunde kann deinen Tauschvorschlag mit einem Klick annehmen. Eure Plätze werden dann vollautomatisch getauscht.
            </p>
          </div>
        </div>

        {/* 6. Abwesenheiten */}
        <div className="bg-white dark:bg-[var(--md-sys-color-surface)] p-5 sm:p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold shrink-0">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                6. Abwesenheiten melden (Urlaub, Beruf, Krankheit)
              </h2>
              <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold">Menü-Reiter "Abwesenheiten"</span>
            </div>
          </div>
          <div className="text-sm text-neutral-700 dark:text-neutral-300 space-y-2 leading-relaxed">
            <p>
              Wenn du schon Wochen vorher weißt, dass du im Urlaub, auf Dienstreise oder verhindert bist:
            </p>
            <p>
              Klicke unten im Menü auf <strong>"Abwesenheiten"</strong>, wähle den betreffenden Spieltag aus und klicke auf <em>"Abwesenheit eintragen"</em>.
            </p>
            <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1 bg-sky-50/50 dark:bg-sky-950/20 p-3 rounded-2xl border border-sky-200/60 dark:border-sky-900/60">
              <li>• Die Termine im Auswahlfeld sind <strong>strikt nach Kalenderdatum</strong> sortiert.</li>
              <li>• Bei Auswahl von <strong>"Sonstiges"</strong> musst du keinen Grund zwingend angeben (Eingabe ist rein optional).</li>
              <li>• Der Trainingsplan weiß rechtzeitig Bescheid und teilt automatisch einen Springer für dich ein.</li>
            </ul>
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
              Du möchtest alle deine Trainings-Termine im Handy-Kalender (iPhone, Android oder Outlook) sehen?
            </p>
            <p>
              Klicke unten im Menü auf <strong>"Kalender"</strong> und tippe auf <strong>"Gesamte Saison abonnieren (.ics)"</strong>. Dein Smartphone trägt alle deine Spiele automatisch mit Erinnerung ein.
            </p>
          </div>
        </div>

        {/* 8. Login, Datenschutz & Sicherheit */}
        <div className="bg-white dark:bg-[var(--md-sys-color-surface)] p-5 sm:p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                8. Login & Sicherheit: Wie bin ich geschützt?
              </h2>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Persönlicher Direktzugang & Rechteschutz</span>
            </div>
          </div>
          <div className="text-sm text-neutral-700 dark:text-neutral-300 space-y-2 leading-relaxed">
            <p>
              <strong>Wie logge ich mich ein?</strong>
              <br />
              Über deinen <em>persönlichen Zugangslink (Magic Link)</em>, den du per WhatsApp oder E-Mail erhalten hast. Ein einfacher Klick reicht – du musst dir kein Passwort merken und bist sofort auf deinem Gerät eingeloggt.
            </p>
            <p>
              <strong>Kann jemand anderes aus Versehen meine Termine ändern?</strong>
              <br />
              <strong>Nein.</strong> Die App ist so abgesichert, dass jeder Spieler nur seine <em>eigenen</em> Termine absagen, annehmen oder tauschen kann. Der frühere "Benutzer wechseln"-Button wurde für normale Spieler komplett entfernt.
            </p>
            <p>
              <strong>Wie sind Administratoren geschützt?</strong>
              <br />
              Der Zugriff auf die Admin-Verwaltung ist durch eine persönliche PIN / ein Passwort geschützt. Wenn ein Administrator aus Supportgründen die Ansicht eines Spielers testet, wird oben permanent ein gut sichtbarer orangefarbener Hinweisbalken mit einem "Vorschau beenden"-Button eingeblendet.
            </p>
          </div>
        </div>

        {/* 9. Als App speichern */}
        <div className="bg-white dark:bg-[var(--md-sys-color-surface)] p-5 sm:p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                9. Als App auf dem Startbildschirm ablegen
              </h2>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Direkt neben WhatsApp ablegen</span>
            </div>
          </div>
          <div className="text-sm text-neutral-700 dark:text-neutral-300 space-y-2 leading-relaxed">
            <p>
              Damit du die Webseite nicht jedes Mal im Browser suchen musst, lege sie wie eine normale App auf deinem Startbildschirm ab:
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

        {/* 10. Design & Systemeinstellung */}
        <div className="bg-white dark:bg-[var(--md-sys-color-surface)] p-5 sm:p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <SunMoon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                10. Hell- & Dunkel-Design (Systemeinstellung)
              </h2>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Automatische Anpassung</span>
            </div>
          </div>
          <div className="text-sm text-neutral-700 dark:text-neutral-300 space-y-2 leading-relaxed">
            <p>
              Die App passt sich standardmäßig automatisch dem Erscheinungsbild deines Smartphones oder Computers an (Hellmodus bei Tag, Dunkelmodus bei Nacht oder Systemeinstellung).
            </p>
            <p>
              Oben in der Kopfzeile kannst du mit dem Sonnen-/Mond-Symbol jederzeit mit einem Klick zwischen Hell- und Dunkelmodus wechseln.
            </p>
          </div>
        </div>

        {/* 11. Ansprechpartner */}
        <div className="bg-white dark:bg-[var(--md-sys-color-surface)] p-5 sm:p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                11. Du hast Fragen oder kommst nicht weiter?
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
