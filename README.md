# HunterDash 🦌

**Der ultimative Begleiter für theHunter: Call of the Wild**

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/DerLuuz/HunterDash?style=for-the-badge&color=22c55e)](https://github.com/DerLuuz/HunterDash/releases)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux-blue?style=for-the-badge)](https://github.com/DerLuuz/HunterDash/releases)
[![License](https://img.shields.io/github/license/DerLuuz/HunterDash?style=for-the-badge)](LICENSE)

HunterDash ist ein modernes Overlay- und Tracking-Tool für *theHunter: Call of the Wild*. Es hilft dir, deinen Grind zu optimieren, dein Glück (L-Score) zu berechnen und deine Statistiken im Blick zu behalten – alles in einer App.

![HunterDash Screenshot](https://github.com/DerLuuz/HunterDash/blob/Beta-Updates-Sync/assets/screenshots/Grind-Helper-Screenshot.png?raw=true)

## ✨ Hauptfunktionen

### 🧮 Glücks-Rechner
Berechne die Wahrscheinlichkeit deiner Spawns!
- **Z-Score Berechnung**: Analysiere Rares, Diamonds, Super Rares & Great Ones.
- **Detaillierte Interpretation**: Erfahre, ob du "Pech" oder "Glück" hast.
- **Account-Vergleich**: Vergleiche deine Stats mit denen von Freunden.

### ⏱️ Grind Tracker & Overlay
Optimiere deine Sessions mit dem integrierten Tracker.
- **Session Timer**: Erfasse deine Spielzeit automatisch.
- **Kills/h Berechnung**: Live-Tracking deiner Effizienz.
- **Pausen-Funktion**: Pausiere den Timer automatisch oder manuell.
- **Overlay-Modus**: Pinne HunterDash über dein Spiel ("Always on Top").

### 📈 Statistiken & Historie
- **Interaktive Charts**: Kombinierte Ansicht von **L-Score (Glück)** und **Grind-Effizienz (Kills/h)**.
- **Detail-Analyse**: Stündliche Auflösung für detaillierte Trends.
- **Export**: Speichere deine Daten als CSV oder JSON.

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

## 🗺️ Roadmap & Pläne
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
