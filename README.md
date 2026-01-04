# HunterDash 🦌

COTW Glück-Rechner für Desktop & Mobile - Berechne dein Glück in theHunter: Call of the Wild!

## Features

- ✅ **Poisson Z-Score Berechnung** für Rares, Diamonds, Super Rares & Great Ones
- 🎨 **Modernes UI** mit animierten Charts (vertikal für Mobile, horizontal für Desktop)
- 💾 **Lokale Datenspeicherung** (Eingaben & Einstellungen)
- 🌓 **Light/Dark Mode** Unterstützung
- 🖥️ **Cross-Platform**: Windows & Linux (Android in Vorbereitung)
- 🔌 **Backend-fertig**: REST API & WebSocket vorbereitet
- 🧩 **Modular & Erweiterbar** - Einfaches Hinzufügen neuer Features

## Installation

```bash
# Abhängigkeiten installieren
npm install

# App starten
npm start

# Entwicklung mit DevTools
npm run dev
```

## Builds

```bash
# Windows Installer (NSIS)
npm run build:win

# Linux AppImage
npm run build:linux

# Alle Builds
npm run build:all
```

## Projektstruktur

```
COTW-Begleiter/
├── main.js                      # Electron Hauptprozess
├── preload.js                   # Context Bridge (IPC)
├── renderer.js                  # UI-Logik
├── index.html                   # UI & CSS
├── services/
│   ├── calculation.service.js   # Poisson-Berechnung
│   ├── api.service.js           # Backend-Kommunikation
│   └── storage.service.js       # Daten-Speicherung
├── utils/
│   ├── icons.js                 # SVG→PNG Konvertierung
│   └── validator.js             # Eingabe-Validierung
├── build-config/
│   ├── constants.js             # App-Konstanten
│   └── electron-builder.js      # Build-Konfiguration
└── assets/icons/                # Icons
```

## API Integration

Für Backend-Integration:

1. **REST API** (`services/api.service.js`):
   - Setze `API.ENABLE_BACKEND = true` in `build-config/constants.js`
   - Passe `API.BASE_URL` an
   - Endpunkte:
     - `POST /api/calculate` - Berechnungs-Request
     - `GET /api/health` - Health Check

2. **WebSocket** (Optional):
   - Setze `WEBSOCKET.ENABLED = true`
   - Passe `WEBSOCKET.URL` an
   - Nachrichtformat: `{ id, type, data }`

## Android-Migration

### Tauri (Empfohlen)
- `renderer.js` + `index.html` direkt übernehmbar
- `services/` → Rust-Module umschreiben
- `main.js` → `src-tauri/src/main.rs` ersetzen

### Capacitor
- Web-App aus `index.html` + `renderer.js`
- Native Plugins für Android
- `npm run prepare:mobile` vorbereitet Assets

## Konfiguration

### Umgebungsvariablen
```bash
API_BASE_URL=http://localhost:3000
WS_URL=ws://localhost:3000/ws
```

### App-Einstellungen
Speicherort: `<UserDir>/HunterDash/settings.json`

```json
{
  "theme": "light",
  "autoSave": true,
  "apiEnabled": false,
  "apiEndpoint": "http://localhost:3000"
}
```

## Development

```bash
# DevTools öffnen
Strg+Shift+I (Windows/Linux)
Cmd+Option+I (macOS)

# oder via IPC API
await window.electronAPI.openDevTools()
```

## License

MIT

## Credits

- Poisson Z-Score Berechnung basierend on COTW Datamines 2025/2026
- Icon: Hirsch-Emoji 🦌
- UI: Inter Font Family
