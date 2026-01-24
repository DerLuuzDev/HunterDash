# Changelog

Alle bemerkenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).

---

## [1.2.0] - 2026-01-24

### ✨ Neu (Features)

#### 🦌 COTW Tier-Daten Overhaul
- **Kartenspezifische Need Zones**: Jedes Tier hat jetzt eigene Need Zone-Zeiten pro Karte mit `_default` Fallback
- **Vollständige Tierstatistiken**: Trophy Ratings (Bronze bis Diamond/Great One), Klassen, Levels, Fellfarben und Köder für alle Tiere
- **SVG Tier-Icons**: Moderne, skalierbare Icons für alle Tierarten anstelle von Emojis
- **Neue Reservate**: Salzwiesen, Askiy Ridge und Tòrr nan Sithean vollständig hinzugefügt

#### 🗺️ Need Zone Visualizer
- **Interaktiver Timeline-View**: Visuelle Darstellung aller Need Zones pro Karte
- **Echtzeit-Indikator**: Zeigt aktuelle Spielzeit im Timeline-View
- **Tier-Detail-Modal**: Klicke auf ein Tier für detaillierte Statistiken, Fellfarben und empfohlene Köder
- **Kartenauswahl**: Schneller Wechsel zwischen allen COTW-Reservaten

#### 📊 Verbesserte Statistiken
- **Dual-Axis Charts**: L-Score und Kills/h Effizienz in kombinierter Ansicht
- **Dynamische Aggregation**: Automatische stündliche/tägliche Auflösung basierend auf Datenmenge
- **Grind Session Progress**: Visualisierung der Session-Effizienz über Zeit

### 🔧 Verbesserungen

- **Modernisierte Dropdowns**: Template-Auswahl jetzt mit Custom-Dropdown statt nativen Selects
- **Timeline-Alignment Fix**: Zeitindikator exakt synchron mit Timeline-Slider
- **Bessere Touch-Unterstützung**: Optimierte Interaktionen für Touch-Geräte
- **Performance**: Schnelleres Laden der Tier-Daten durch optimierte JSON-Struktur

### 🐛 Bugfixes

- **Navigation Timing**: Manager-Exposur vor DOMContentLoaded behebt Race Conditions
- **Timer UI**: Kill-Buttons und Session-Controls korrekt positioniert
- **Session-Fortsetzung**: `continueGroup()` wechselt automatisch zum Timer-Tab
- **Hotkey-Mapping**: F8 beendet Session, F10 für Kill-Entfernung (korrigiert)
- **Statistik-Chart**: Leere States und Datenformatierung korrigiert

### 📦 Technisch

- **Neue Datenstruktur**: `animal-data.json` mit `needZones[mapKey]._default` Pattern
- **Reference Service**: Neuer `reference.service.js` für Tier-Daten und Bildpfade
- **Translations**: `build-config/translations.js` für mehrsprachige Tier- und Kartennamen
- **Batch-Scripts**: Automatisierte Daten-Migration und Validierung

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
