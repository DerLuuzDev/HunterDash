# Changelog

Alle bemerkenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).

---

## [1.2.0] - 2026-01-24

Dieses Update bringt ein komplettes Tier-Daten Overhaul, den neuen Need Zone Visualizer und poliert die Benutzeroberfläche.
*This update brings a complete animal data overhaul, the new Need Zone Visualizer, and polishes the UI.*

## ✨ Highlights

### 🦌 COTW Tier-Daten Overhaul
- **Kartenspezifische Need Zones:** Jedes Tier hat jetzt eigene Need Zone-Zeiten pro Karte – endlich akkurate Daten für jedes Reservat!
- **Vollständige Statistiken:** Trophy Ratings, Klassen, Levels, Fellfarben und Köder für alle Tiere auf einen Blick.
- **Moderne SVG-Icons:** Schönere, skalierbare Tier-Icons ersetzen die alten Emojis.
- **Neue Reservate:** Salzwiesen, Askiy Ridge und Tòrr nan Sithean vollständig hinzugefügt.

### 🗺️ Need Zone Visualizer
- **Interaktive Timeline:** Alle Need Zones einer Karte als visuelle Zeitleiste – ideal für die Jagdplanung.
- **Echtzeit-Indikator:** Zeigt die aktuelle Ingame-Uhrzeit direkt in der Timeline an.
- **Tier-Details auf Klick:** Klicke ein Tier an für Trophy-Scores, Fellfarben und empfohlene Köder.

### 🐛 Bugfixes & Improvements
- **Timeline-Alignment:** Der Zeitindikator ist jetzt exakt mit dem Slider synchron.
- **Modernisierte Dropdowns:** Template-Auswahl mit schickem Custom-Dropdown statt Browser-Standard.
- **Performance:** Schnelleres Laden der Tier-Daten durch optimierte JSON-Struktur.
- **Statistik-Charts:** Leere States und Datenformatierung korrigiert.

---

## 📥 Installation

**Windows:**
Lade die `HunterDash Setup 1.2.0.exe` herunter und führe sie aus. Deine alten Daten bleiben erhalten.

**Linux:**
Lade das `.AppImage` herunter, mache es ausführbar (`chmod +x HunterDash-1.2.0.AppImage`) und starte es.

---

**Full Changelog**: https://github.com/DerLuuz/HunterDash/compare/v1.1.0-beta.1...v1.2.0

---

## [1.1.0-beta.1] - 2026-01-10

### ✨ Neu

- **Globale Hotkeys**: F5 (Kill+), F6 (Kill-), F7 (Pause), F8 (Ende) - auch aus dem Spiel steuerbar
- **Overlay-Modus**: "Always on Top" für Gaming-Sessions
- **Audio-Feedback**: Optionaler Bing-Ton bei Kill-Registrierung
- **Session Templates**: Vordefinierte und benutzerdefinierte Session-Vorlagen
- **Internationalisierung**: Grundgerüst für Mehrsprachigkeit
- **Minimize to Tray**: App läuft im Hintergrund weiter

### 🔧 Verbesserungen

- **Session-Status-System**: Running/Paused/Completed/Cancelled Tracking
- **Persistente Sessions**: Grind-Sessions überleben App-Neustarts
- **Backup-System**: Automatische Backups für Sessions (max. 10)

---

## [1.0.1] - 2026-01-07

### ✨ Neu

- **Account-Management**: Speichere und vergleiche mehrere Accounts
- **History-Service**: Verlauf aller Berechnungen mit Zeitstempel
- **Template-Service**: Wiederverwendbare Vorlagen für häufige Eingaben
- **Grind-Service**: Session-Management für Great One Grinding

### 🔧 Verbesserungen

- **AGENTS.md**: Entwickler-Dokumentation für AI-Assistenten
- **Chart.js Integration**: Interaktive Statistik-Visualisierung
- **Renderer Modul**: Separates `renderer/app.js` für Frontend-Logik

---

## [1.0.0] - 2026-01-01

### 🎉 Erste Version

- **Luck Calculator**: Z-Score Berechnung für COTW Spawns
- **Spawn-Wahrscheinlichkeiten**: Rares, Diamonds, Super Rares, Great Ones
- **Account-Vergleich**: Vergleiche Harvest-Stats
- **Glassmorphism UI**: Modernes, dunkles Design
- **Electron App**: Windows Installer & Linux AppImage

---

[1.2.0]: https://github.com/DerLuuz/HunterDash/compare/v1.1.0-beta.1...v1.2.0
[1.1.0-beta.1]: https://github.com/DerLuuz/HunterDash/compare/v1.0.1...v1.1.0-beta.1
[1.0.1]: https://github.com/DerLuuz/HunterDash/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/DerLuuz/HunterDash/releases/tag/v1.0.0
