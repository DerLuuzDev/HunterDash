# HunterDash 🦌 - Der #1 COTW Grind Helper & Overlay

**Der ultimative Begleiter für theHunter: Call of the Wild**

[![Codeberg release (latest by date)](https://img.shields.io/codeberg/v/DerLuuz/HunterDash?style=for-the-badge&color=22c55e)](https://codeberg.org/DerLuuz/HunterDash/releases)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux-blue?style=for-the-badge)](https://codeberg.org/DerLuuz/HunterDash/releases)

HunterDash ist ein modernes **Overlay- und Tracking-Tool** für *theHunter: Call of the Wild*. Es hilft dir, deinen **Great One Grind** zu optimieren, dein Glück (L-Score) zu berechnen und deine Statistiken im Blick zu behalten – die perfekte Alternative zu Population Scanner, aber 100% sicher und ohne Game-Files-Modifikation.

![HunterDash Grind Tracker Overlay - Dark Mode UI](https://github.com/DerLuuz/HunterDash/blob/Beta-Updates-Sync/assets/screenshots/Grind-Helper-Screenshot.png?raw=true)

## ✨ Hauptfunktionen

### 🧮 Luck Calculator & Spawn-Wahrscheinlichkeiten
Berechne die Wahrscheinlichkeit deiner Spawns und vergleiche dein RNG!
- **Z-Score Berechnung**: Analysiere Rares, Diamonds, Super Rares & Great Ones.
- **Detaillierte Interpretation**: Erfahre, ob du "Pech" oder "Glück" hast (RNG-Analyse).
- **Account-Vergleich**: Vergleiche deine Harvest-Stats mit denen von Freunden.

### ⏱️ Grind Tracker, Session Timer & Overlay
Optimiere deine Sessions mit dem integrierten **Grind Helper**.
- **Session Timer**: Erfasse deine Spielzeit automatisch für effizientes **Great One Grinding**.
- **Kills/h Berechnung**: Live-Tracking deiner Effizienz (Kills per Hour).
- **Pausen-Funktion**: Pausiere den Timer automatisch oder manuell.
- **Overlay-Modus**: Pinne HunterDash als **Overlay** über dein Spiel ("Always on Top").

### 📈 Erweiterte Statistiken & Kills/h Analyse
- **Interaktive Charts**: Kombinierte Ansicht von **L-Score (Glück)** und **Grind-Effizienz**.
- **Detail-Analyse**: Stündliche Auflösung für detaillierte Trends und **Herd Management**.
- **Export**: Speichere deine Daten als CSV oder JSON für Excel/Sheets.

### ⌨️ Globale Hotkeys
Steuere die App, ohne das Spiel zu verlassen:
- `F5`: **Kill hinzufügen** (+1)
- `F6`: **Letzten Kill entfernen** (-1)
- `F7`: **Timer pausieren / fortsetzen**
- `F8`: **Session beenden / speichern**

*(Hotkeys sind in den Einstellungen anpassbar)*

---

## 🚀 Installation

### Windows
1. Lade den neuesten Installer von den [Releases](https://github.com/DerLuuz/HunterDash/releases) herunter.
2. Führe die `.exe` aus.
3. HunterDash startet automatisch.

### Linux
1. Lade das `.AppImage` herunter.
2. Mache die Datei ausführbar: `chmod +x HunterDash-*.AppImage`.
3. Starte die App.

---

## 🛠️ Für Entwickler

### Setup
```bash
# Repository klonen
git clone https://github.com/DerLuuz/HunterDash.git
cd HunterDash

# Abhängigkeiten installieren
npm install

# Starten (Dev Mode)
npm run dev
```

### Build Commands
```bash
npm run build:win   # Windows Installer
npm run build:linux # Linux AppImage
npm run build:all   # Alle Plattformen
```

### Tech Stack
- **Core**: Electron, Node.js
- **Frontend**: HTML5, Vanilla CSS (Glassmorphism UI), Chart.js
- **Data**: Lokales Dateisystem (JSON), keine Cloud-Cloud-Abhängigkeit

---

## � Screenshots & Einblicke

| **🎯 Glücks-Rechner** | **⏱️ Grind Session Tracker** |
|:---:|:---:|
| ![HunterDash Luck Calculator](https://github.com/DerLuuz/HunterDash/blob/Beta-Updates-Sync/assets/screenshots/Luck-Score.png?raw=true) | ![HunterDash Session Tracker](https://github.com/DerLuuz/HunterDash/blob/Beta-Updates-Sync/assets/screenshots/Sessions.png?raw=true) |

| **📈 Statistics Dashboard** | **📃 Verlauf** |
|:---:|:---:|
| ![HunterDash Statistics](https://github.com/DerLuuz/HunterDash/blob/Beta-Updates-Sync/assets/screenshots/Statistiken.png?raw=true) | ![Modern Glassmorphism Design](https://github.com/DerLuuz/HunterDash/blob/Beta-Updates-Sync/assets/screenshots/Historie.png?raw=true) |

---

## �🗺️ Roadmap & Pläne
- [x] Grind Session Tracker
- [x] Overlay Mode
- [x] Statistiken & Charts
- [ ] Android Companion App (via Tauri)
- [ ] WebSocket API für Streamer

## ❤️ Credits
- **Idee & Entwicklung**: [DerLuuz](https://github.com/DerLuuz)
- **Datenbasis**: Basierend auf aktuellen COTW Datamines (2025/2026)
- **Design Inspiration**: Modern Glassmorphism & Gaming UIs

---
*HunterDash steht in keiner Verbindung zu Expansive Worlds oder Avalanche Studios.*
