# HunterDash - Agent Development Guidelines

This file contains essential information for AI agents working on HunterDash codebase.

## Build Commands

```bash
# Run the application
npm start

# Run with DevTools enabled (development mode)
npm run dev

# Build Windows NSIS installer
npm run build:win

# Build Linux AppImage
npm run build:linux

# Build all platforms
npm run build:all

# Generate PNG icons from SVG source
npm run generate:icons
```

Note: No testing or linting frameworks are currently configured in this project.

## Code Style Guidelines

### Module System
- Use CommonJS (`require`/`module.exports`)
- Named imports for Electron modules
- Import configuration from `build-config/constants.js`

Example:
```javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const { WINDOW, API, POISSON } = require('./build-config/constants');
```

### Naming Conventions
- Variables/Functions/Methods: `camelCase`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Files: `camelCase.js` (code), `kebab-case.js` (assets)
- UI Managers: `Manager` suffix (e.g., NavigationManager, GrindManager)

Service instantiation pattern:
```javascript
const calculationService = new CalculationService();
module.exports = calculationService;
```

### Formatting
- 2-space indentation
- 100-120 character line length
- Use spaces, not tabs
- German error messages, English code
- Minimal inline comments

### Architecture
```
main.js                 - Electron main process, window creation, IPC handlers
preload.js              - Context bridge (electronAPI)
index.html              - UI structure, CSS, inline JavaScript
services/               - Business logic classes
  - calculation.service.js
  - storage.service.js
  - history.service.js      # File system storage & time series
  - account.service.js       # Account management & backups
  - template.service.js      # Template presets
  - grind.service.js         # Grind helper (tips, timer, simulator, sessions)
  - api.service.js
utils/                  - Utility functions
  - validator.js
  - icons.js
build-config/           - Configuration constants
  - constants.js
```

### Error Handling
- Use try-catch blocks for async operations
- Return standardized response objects:
  ```javascript
  {
    success: boolean,
    data?: any,
    error?: string,
    validationErrors?: any[]
  }
  ```
- Log errors with `console.error()`
- Show user notifications via `ToastManager.show(message, type)`
- Global handlers in main.js for `uncaughtException` and `unhandledRejection`

### IPC Communication
- All IPC endpoints use `namespace:action` pattern
- Namespaces: `api:*`, `storage:*`, `history:*`, `accounts:*`, `templates:*`, `grind:*`
- Use `ipcMain.handle()` in main process
- Use `ipcRenderer.invoke()` in preload
- Always check `response.success` before using data
- Provide default values for options: `const { key = null } = options || {}`

Example IPC handler:
```javascript
ipcMain.handle('history:get-timeseries', async (event, options = null) => {
  try {
    const { categoryKey = null, aggregation = 'daily', period = 'all' } = options || {};
    const series = await historyService.getTimeSeries(categoryKey, aggregation, period);
    return series;
  } catch (error) {
    console.error('TimeSeries-Fehler:', error);
    return { success: false, error: error.message };
  }
});
```

### Electron Security
- `nodeIntegration: false`
- `contextIsolation: true`
- `sandbox: false`
- Never expose Node APIs directly to renderer
- Use `contextBridge.exposeInMainWorld()` for renderer access

### File System Storage Pattern
- Dual storage: `storageService` (localStorage) + File System (`userDataPath`)
- History/Accounts/Grind-Sessions automatically saved as JSON files
- Backup system: `STORAGE.HISTORY.BACKUP_DIR`, `STORAGE.HISTORY.MAX_BACKUPS = 10`, `GRIND.BACKUP_DIR`, `GRIND.MAX_BACKUPS = 10`
- Path: `app.getPath('userData')` → `~/.config/hunterdash/`
- Initialize History: `historyService.userDataPath = userDataPath; historyService.initializeFileSystem();`
- Initialize Grind: `grindService = new GrindService(storageService, userDataPath);`

### Chart.js Integration
- Chart.js CDN: `<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js">`
- Canvas: `<canvas id="chartId"></canvas>` in `.chart-container` div
- Manager method pattern:
  ```javascript
  if (this.chart) this.chart.destroy();
  this.chart = new Chart(ctx, { type: 'line', data: {...}, options: {...} });
  ```

### Sub-Tabs CSS Pattern
- Main navigation: `.nav-tabs`, `.nav-tab`, `.nav-tab.active`, `.nav-tab:hover`
- Tab content: `.tab-content { display: none; }`, `.tab-content.active { display: block; }`
- Sub-tabs: `.account-tabs`, `.account-tab`, `.grind-tabs`, `.grind-tab`
- Sub-content: `.subtab-content`, `.grind-subtab-content` + `.active`
- Animation: `@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`

### Manager Pattern
- Global exposures at end of index.html:
  ```javascript
  window.SettingsManager = SettingsManager;
  window.Calculator = Calculator;
  window.NavigationManager = NavigationManager;
  window.HistoryManager = HistoryManager;
  window.AccountManager = AccountManager;
  window.GrindManager = GrindManager;
  window.TemplateManager = TemplateManager;
  window.ToastManager = ToastManager;
  window.StatisticsManager = StatisticsManager;
  ```
- `switchTab(tabName)` in NavigationManager for main tab switching
- `switchSubTab(subtabName)` for sub-tab switching (Accounts, Grind)

### UI Development
- All UI managers in `<script>` tag in index.html
- Use `DOMContentLoaded` for initialization
- Access electronAPI via `window.electronAPI`
- Check `window.electronAPI && window.electronAPI.isElectron()` before use
- Fallback to localStorage for web-only scenarios

### Configuration
- All constants in `build-config/constants.js`
- Environment variables with fallbacks: `process.env.API_BASE_URL || 'http://localhost:3000'`
- Use `STORAGE.DEFAULT_SETTINGS` for default values
- New configs: `STORAGE.GRIND.ANIMALS`, `STORAGE.GRIND.TIPS`, `TEMPLATES.PRESETS`, `GRIND.FILENAME`, `GRIND.BACKUP_DIR`, `GRIND.MAX_BACKUPS`

### Code Quality
- Prefer descriptive naming over comments
- Keep functions focused and single-purpose
- Use template literals for multi-line HTML
- Handle edge cases (division by zero, undefined values)

## Documentation Maintenance

### When to Update AGENTS.md

**ALWAYS after:**
- New services added (e.g., grind.service.js)
- New managers added (e.g., GrindManager, StatisticsManager)
- Architecture changes (new folders, file system storage, etc.)
- IPC namespace changes (new namespaces, API changes)
- New libraries (e.g., Chart.js integration)
- Code style changes (new patterns, conventions)
- Build process changes (new scripts, dependencies)

**REGULARLY:**
- Monthly audit - Verify everything is still current
- Per sprint/feature - After each major feature

**OPTIONALLY:**
- Small bugfixes (only if they change patterns)
- UI tweaks (only on structural changes)

### Update Strategy

**Strategy: "Per Feature + Monthly Audit" (Recommended)**

**Daily Work:**
- After each feature/major update:
  1. What changed? (Services, Managers, IPC, Patterns)
  2. Open AGENTS.md and update relevant sections
  3. 5-10 minutes effort per feature

**Monthly:**
- Read AGENTS.md completely
- Verify: Is everything still correct? Is anything missing?
- ~15-20 minutes audit

**Before Release:**
- Final check before release
- Bring everything up to date

### Update Log Template

Use this template for quick logging after each update:

```
YYYY-MM-DD: [Feature Name] [added/updated/removed]
- [Service 1] created/modified
- [Manager 1] created/modified
- [Pattern/Library/IPC] updated
- [Specific changes]
```

### Example: HunterDash Update Log

```
2025-01-05: Grind Helper feature added
- grind.service.js created
- GrindManager, StatisticsManager added to index.html
- Chart.js integration documented
- Sub-tabs CSS pattern added
- IPC namespaces: grind:* extended
- File system storage pattern documented
```

```
2026-01-06: Grind Sessions persistent storage added
- grind.service.js extended with file system storage
- GRIND.FILENAME, GRIND.BACKUP_DIR, GRIND.MAX_BACKUPS added to constants
- GrindService constructor accepts userDataPath parameter
- Session data persists across app restarts via JSON file
- Backup system for grind sessions implemented
- Auto-backup on app exit (before-quit event)
```

```
2026-01-06: Session Naming, Fortsetzung & Hotkeys
- Session Templates (vorgegeben + benutzerdefiniert) hinzugefügt
- Session-Fortsetzung implementiert (manueller Button)
- Status-System (running/paused/completed/cancelled)
- Global Hotkeys (konfigurierbar, auch wenn minimiert)
- Audio-Feedback (Bing-Ton, Lautstärke regelbar)
- Overlay-Modus (always on top)
- GRIND.SESSION_TEMPLATES, GRIND.DEFAULT_HOTKEYS, GRIND.SESSION_STATUS
- STORAGE.DEFAULT_SETTINGS erweitert (overlayMode, audioFeedback, sessionHotkeys)
- grind.service.js: Template-Management, Session-Status-Management
- main.js: globalShortcut integration, hotkeyManager, window control
- preload.js: Neue IPC Endpoints (templates, hotkeys, audio)
- index.html: UI Erweiterungen (Timer-Tab, Settings-Modal, Sessions-List)
- SettingsManager: Overlay-Modus, Audio-Steuerung, Hotkey-Aufnahme
```

**Next Update**: After next feature (e.g., [feature name])

```
2026-01-06: Bug-Fixes - Navigation & Manager Timing
- Manager-Exposur VOR DOMContentLoaded verschoben (Lines 4470-4479)
- Alte duplizierte Exposur entfernt
- Debug-Logging in DOMContentLoaded hinzugefügt
- Navigation Bug behoben (Manager verfügbar beim Aufruf)
- AGENTS.md erweitert um "Common Pitfalls & Prevention" Abschnitt
- Checklisten für Manager-Exposur-Timing und Event-Listener-Positionierung
```

```
2026-01-06: Timer UI Redesign & Session-Fortsetzung Fix
- Timer UI komplett überarbeitet mit neuen CSS-Klassen:
  - `.session-start-container`: Prominenter Start-Button (volle Breite)
  - `.session-controls-active`: Container für aktive Session-Controls
  - `.session-controls-row`: Zwei-Zeilen-Layout (Kill-Buttons oben, Pause/Ende unten)
  - `.kill-btn`: Größere, farbcodierte Kill-Buttons (rot für +1, grau für -1)
  - `.action-button.danger`: Rote Markierung für Beenden-Button
- `continueGroup()` Methode erweitert:
  - Wechselt jetzt zum Timer-Tab (`switchSubTab('timer')`)
  - Setzt Session-Name und startet Session automatisch
- UI-Container-Visibility statt Button-Disabled:
  - `session-start-container` wird bei aktiver Session ausgeblendet
  - `session-controls-active` wird bei aktiver Session angezeigt
```

### Common Pitfalls & Prevention

**⚠️ Bug: Manager-Navigation bricht nach AI-Änderungen**

**Ursache:**
- Duplizierte `window.ManagerName = ManagerName` Exposur
- Manager werden VOR ihrer Definition im globalen Scope exponiert
- Cross-Manager-Abhängigkeiten (z.B. `NavigationManager` → `GrindManager`)

**Vorbeugung:**
1. ✅ Manager Exposur nur EINMAL am Ende aller Definitionen (empfohlen: Zeile ~4500)
2. ✅ Alle Manager-Definitionen VOR der Exposur abschließen
3. ✅ Cross-Manager-Aufrufe nur NACH der Exposur
4. ✅ Bei neuen Managern: Exposur-Block am Ende erweitern

**Exposur-Block-Muster:**
```javascript
// Am Ende vom Script (nach ALLEN Manager-Definitionen)
window.SettingsManager = SettingsManager;
window.Calculator = Calculator;
window.NavigationManager = NavigationManager;
// ... alle Manager
window.GrindManager = GrindManager;  // NEUER Manager hier hinzufügen!
```

**❌ NICHT tun:**
```javascript
// FALSCH - Frühe Exposur
const NavigationManager = { ... };
window.NavigationManager = NavigationManager;  // ❌

// FALSCH - Manager noch nicht definiert
NavigationManager.switchTab('grind');  // Ruft GrindManager.switchSubTab auf
const GrindManager = { ... };  // ✗ Zu spät!
```

**Checkliste nach AI-Änderungen:**
- [ ] Nur EINER Exposur-Block am Ende?
- [ ] ALLE Manager im Exposur-Block enthalten?
- [ ] Keine frühen Exposuren vorhanden (mit `grep -n "Expose to global"` prüfen)?
- [ ] Alle Manager vor Exposur definiert?
- [ ] Keine Cross-Manager-Aufrufe VOR Exposur?

---

**⚠️ Bug: Zeilennummern-Verschiebungen nach Code-Entfernungen**

**Ursache:**
- AI verwendet oft absolute Zeilennummern (z.B. "Line 2797")
- Nach Code-Entfernungen verschieben sich alle nachfolgenden Zeilennummern
- Führt zu falschen Referenzen und Edits an falschen Stellen

**Vorbeugung:**
1. ✅ Relative Positionen statt absoluter Zeilennummern verwenden
2. ✅ Text-Suche statt Zeilennummern (z.B. `grep -n "Pattern"`)
3. ✅ Kontext prüfen mit `sed -n 'Linie,p' file`
4. ✅ Nach Edits mit `grep` überprüfen, ob Änderungen korrekt sind

**Beispiel:**
```bash
# SCHLECHT - Absolute Zeilennummer
Line 2797 entfären (könnte nach Editen falsch sein)

# GUT - Text-Suche mit Kontext
grep -n "window.NavigationManager = NavigationManager;" file
# Ausgabe: 2797:        window.NavigationManager = NavigationManager;
# Dann mit Kontext prüfen:
sed -n '2795,2800p' file
```

**Checkliste nach Code-Entfernungen:**
- [ ] Text-Suche statt absoluter Zeilennummern?
- [ ] Kontext mit `sed -n 'Start,Ende'p'` überprüft?
- [ ] Mit `grep` überprüft, ob alle Exposuren gefunden?
- [ ] Nach Edits mit `grep` nochmal überprüft, ob korrekt?

---

**⚠️ Bug: Manager-Exposur NACH DOMContentLoaded führt zu Timing-Problemen**

**Ursache:**
- Manager werden NACH dem DOMContentLoaded-Block exponiert
- DOMContentLoaded feuert, aber Manager sind noch nicht verfügbar (Race Condition)
- Inline onclick-Handler können nicht auf Manager zugreifen
- Führt zu `undefined` Fehlern oder stummer Fehler

**Vorbeugung:**
1. ✅ Manager-Exposur immer VOR dem DOMContentLoaded-Block platzieren
2. ✅ Manager SOFORT nach ihrer Definition exponieren
3. ✅ Nie Manager-Exposur nach Event-Listener-Registrierung platzieren
4. ✅ Debug-Logging hinzufügen, um Manager-Verfügbarkeit zu prüfen

**Falsches Muster:**
```javascript
// FALSCH - Manager Exposur NACH DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    SettingsManager.load();
    Calculator.calculate();
});

// Manager werden hier exponiert - ZU SPÄT!
window.Calculator = Calculator;
window.NavigationManager = NavigationManager;
```

**Korrektes Muster:**
```javascript
// KORREKT - Manager Exposur VOR DOMContentLoaded
// Alle Manager werden SOFORT exponiert
window.Calculator = Calculator;
window.NavigationManager = NavigationManager;
window.GrindManager = GrindManager;
// ... alle Manager

document.addEventListener('DOMContentLoaded', function() {
    console.log('Managers available:', {
        Calculator: typeof Calculator,
        NavigationManager: typeof NavigationManager,
        GrindManager: typeof GrindManager
    });
    
    SettingsManager.load();
    Calculator.calculate();
    // ...
});
```

**WICHTIG:** Die Reihenfolge innerhalb von DOMContentLoaded spielt keine Rolle, solange die Manager VOR dem Block exponiert sind. DOMContentLoaded feuert NACHDEM das gesamte Script geladen wurde.

**Checkliste nach Manager-Exposur-Änderungen:**
- [ ] Alle Manager VOR DOMContentLoaded-Block exponiert?
- [ ] Keine duplizierten Exposuren?
- [ ] Debug-Logging hinzugefügt zur Prüfung der Manager-Verfügbarkeit?
- [ ] Event-Listener NACH Manager-Exposur registriert?
- [ ] Inline onclick-Handler können auf alle Manager zugreifen?

---

**⚠️ Bug: Duplizierte/unvollständige Manager-Exposur**

**Ursache:**
- Manager werden mehrfach exponiert (früh + spät)
- Frühe Exposur ist unvollständig (fehlt einige Manager)
- Führt zu `undefined` Fehlern wenn auf noch nicht exponierte Manager zugegriffen wird
- Cross-Manager-Aufrufe (z.B. `NavigationManager` → `GrindManager`) schlagen fehl

**Vorbeugung:**
1. ✅ Manager Exposur nur EINMAL am Ende aller Definitionen (empfohlen: Zeile ~4500)
2. ✅ ALLE Manager im selben Exposur-Block exponieren
3. ✅ Alle frühen Exposuren entfernen, wenn vorhanden
4. ✅ Alle Manager-Definitionen VOR der Exposur abschließen
5. ✅ Cross-Manager-Aufrufe nur NACH vollständiger Exposur

**Falsches Muster:**
```javascript
// FALSCH - Frühe, unvollständige Exposur
const Calculator = { ... };
window.Calculator = Calculator;  // ❌

const NavigationManager = { ... };
// NavigationManager fehlt! ❌

const GrindManager = { ... };
// GrindManager fehlt! ❌

// Später nochmal Exposur
window.Calculator = Calculator;
window.NavigationManager = NavigationManager;
window.GrindManager = GrindManager;
```

**Korrektes Muster:**
```javascript
// KORREKT - Nur eine vollständige Exposur am Ende
const Calculator = { ... };
const NavigationManager = { ... };
const GrindManager = { ... };

// ... alle Event-Listener, etc.

// Am Ende vom Script (nach ALLEN Manager-Definitionen):
window.Calculator = Calculator;
window.NavigationManager = NavigationManager;
window.GrindManager = GrindManager;
window.SettingsManager = SettingsManager;
// ... alle Manager
```

**WICHTIG:** Nach Code-Entfernungen verschieben sich die Zeilennummern!
- Verwende relative Positionen oder Text-Suche, nicht absolute Zeilennummern
- Prüfe mit `grep -n "Expose to global"`, ob alle frühen Exposuren entfernt sind
- Prüfe mit `grep -n "window\..*Manager"`, ob nur EINER Exposur-Block existiert

**Checkliste nach AI-Änderungen:**
- [ ] Nur EINER Exposur-Block am Ende?
- [ ] ALLE Manager im Exposur-Block enthalten?
- [ ] Keine frühen Exposuren vorhanden (mit `grep -n "Expose to global"` prüfen)?
- [ ] Alle Manager vor Exposur definiert?
- [ ] Keine Cross-Manager-Aufrufe VOR Exposur?

---

**⚠️ Bug: Tippfehler in Property-Namen führen zu fehlenden UI-Elementen**

**Ursache:**
- Tippfehler zwischen Variable/Methodenname und Zugriff
- `interpretation` vs `interpretation` (ohne/mit zweitem 'a')
- Führt zu `undefined` Werten im UI

**Vorbeugung:**
1. ✅ Konsistente Schreibweise von Property-Namen
2. ✅ Copy-Paste statt Tippen bei Property-Namen
3. ✅ Nach Änderungen: Überprüfen ob alle Zugriffe konsistent sind
4. ✅ Optional: TypeScript oder JSDoc für Typ-Sicherheit

**Beispiel:**
```javascript
// DEFINITION
getInterpretation(totalL) { ... }  // mit 't' am Ende

// ZUGRIFF - Alle konsistent!
const interpretation = this.getInterpretation(totalL);  // ✅
result.interpretation  // ✅ mit 't'
${result.interpretation}  // ✅ mit 't'

// ❌ NICHT:
result.interpretation  // ❌ ohne 't'
${result.interpretation}  // ❌ ohne 't'
```

**Checkliste nach UI-Änderungen:**
- [ ] Alle Property-Zugriffe konsistent?
- [ ] Keine Tippfehler in Variable-/Methodennamen?
- [ ] UI-Test: Werden alle Werte korrekt angezeigt?

---

### Concrete Triggers for HunterDash

**Update AGENTS.md when:**
- New service in `/services/` → Update Architecture section
- New manager in `index.html` → Update Manager Pattern section
- New IPC namespace in `main.js` → Update IPC Communication section
- New constants in `constants.js` → Update Configuration section
- New CSS patterns (e.g., Sub-Tabs) → Update Style Guidelines section
- New libraries (e.g., Chart.js) → Add new documentation section
- Build scripts change → Update Build Commands section
