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
- History/Accounts automatically saved as JSON files
- Backup system: `STORAGE.HISTORY.BACKUP_DIR`, `STORAGE.HISTORY.MAX_BACKUPS = 10`
- Path: `app.getPath('userData')` → `~/.config/hunterdash/`
- Initialize: `historyService.userDataPath = userDataPath; historyService.initializeFileSystem();`

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
- New configs: `STORAGE.GRIND.ANIMALS`, `STORAGE.GRIND.TIPS`, `TEMPLATES.PRESETS`

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

**Next Update**: After next feature (e.g., [feature name])

### Concrete Triggers for HunterDash

**Update AGENTS.md when:**
- New service in `/services/` → Update Architecture section
- New manager in `index.html` → Update Manager Pattern section
- New IPC namespace in `main.js` → Update IPC Communication section
- New constants in `constants.js` → Update Configuration section
- New CSS patterns (e.g., Sub-Tabs) → Update Style Guidelines section
- New libraries (e.g., Chart.js) → Add new documentation section
- Build scripts change → Update Build Commands section
