# 🎾 Tennis Trainingsplaner

Eine moderne React-Web-App mit **Google Material Design 3** und **Datenbankanbindung** zur intelligenten 3-Stunden-Planung für 15 Tennisspieler.

Entwickelt für die Montagsrunde mit **1 Platz, Trainer Ralf/Thomas und 3x 60 Minuten** (18:00–19:00, 19:00–20:00, 20:00–21:00).

---

## ✨ Features im Überblick

### 1. 🦘 Automatisierter Nachrücker-Workflow (Springer-Automat)
- **1-Klick-Absage:** Wenn ein Spieler verhindert ist, klickt er einfach auf `[Absagen]`.
- **Echtzeit-Nachrücken:**
  - Der **1. Springer** erhält automatisch Vorrang und ein Pop-up / Banner zum Einspringen.
  - Lehnt der 1. Springer ab, geht die Option automatisch an den **2. Springer**.
  - Lehnt auch dieser ab, wird der Platz für alle freigegeben (oder für den Spieler mit "Frei").
  - Bei Zusage fliegen Konfetti 🎉 und der Plan ist sofort aktuell.

### 2. 🎨 Google Material Design & Vereinsfarben-Anpassung
- **Material You / Material 3 Ästhetik:** Große abgerundete Oberflächen, Tonwert-Paletten, Elevation-Schatten, animierte Micro-Interaktionen.
- **Vereinsfarben-Presets:**
  - 🔴 **Rot-Weiß** (z. B. TC Rot-Weiß)
  - 🟢 **Grün-Weiß** (z. B. TC Grün-Weiß)
  - 🔵 **Blau-Weiß** (z. B. TC Blau-Weiß)
  - 🟡 **Schwarz-Gelb** (z. B. TC Schwarz-Gelb)
  - 🎾 **Sandplatz & Navy** (Roland-Garros-Style)
  - 🏆 **Wimbledon** (Championship Green & Purple)
  - 🎨 **Individuelle Farbwahl:** Eigener Hex-Colorpicker für Vereins-Haupt- und Akzentfarbe.
- **Dark Mode & Light Mode:** Vollwertige Unterstützung für helle und dunkle Umgebungen.

### 3. 📅 Die gesamte 15-Spieler-Rotationsmatrix (Winter 2026/2027)
- **1:1 vorbefüllt:** Alle 15 Spieler eurer Runde (*André O., Andre R., Bernd, Florian, Heiko, Ingo, Jörg B., Jörg S., Kai, Lasse, Michael, Sascha, Stephan, Thorsten, Timo*) und alle Montage von Oktober 2026 bis April 2027 sind exakt nach eurer mathematischen Excel-Rotationsmatrix hinterlegt.
- **Filter:** Ein Klick auf "Nur meine Termine" zeigt Florian sofort alle Montage, an denen er spielt.

### 4. 🌴 Urlaubs- & Abwesenheitsplaner
- Spieler können Urlaube oder Dienstreisen Wochen im Voraus eintragen.
- Das System markiert diese Termine und schlägt Springer schon vorab vor.

### 5. 🔄 Zeitslot-Tauschbörse ("Slot-Swap")
- Wer um 18:00 Uhr eingeteilt ist, aber erst ab 19:00 oder 20:00 Uhr spielen kann, kann eine direkte Tauschanfrage stellen.

### 6. 📱 WhatsApp-Export mit 1 Klick
- Erzeugt eine WhatsApp-taugliche, mit Emojis formatierte Aufstellung der Woche und öffnet WhatsApp direkt per Knopfdruck.

### 7. 👤 Schneller Benutzerwechsel
- Oben rechts kann zwischen allen 15 Spielern gewechselt werden – ideal zum Testen oder für Vereinsmitglieder ohne Login-Hürde.

---

## 🗄️ Datenbankanbindung (Supabase / PostgreSQL)

Die App funktioniert **ohne Konfiguration sofort lokal** (Daten werden persistent im Browser gespeichert).

Für eine echte Live-Synchronisation über alle Smartphones der 15 Spieler:
1. Kostenloses Projekt auf [supabase.com](https://supabase.com) erstellen.
2. In Supabase im **SQL Editor** das mitgelieferte Schema ausführen:
   - Du findest das Skript in den **App-Einstellungen ⚙️ ➔ SQL-Schema anzeigen** oder in `src/services/supabase.ts`.
3. In der Web-App unter **Einstellungen ⚙️** deine **Supabase URL** und deinen **Anon Key** eintragen und auf *Speichern* klicken.
4. Fertig! Alle Änderungen an den Slots werden nun in Echtzeit über WebSockets an alle Smartphones übertragen.

---

## 🚀 Lokale Entwicklung & Start

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Produktions-Build erstellen
npm run build
```

Der Server läuft standardmäßig unter: **http://localhost:5173**
