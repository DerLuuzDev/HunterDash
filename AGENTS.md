# HunterDash - Agent Development Guidelines

This file contains essential information for AI agents working on the HunterDash codebase.

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
renderer.js             - UI logic, DOM manipulation
services/               - Business logic classes
  - calculation.service.js
  - api.service.js
  - storage.service.js
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
- Global handlers in main.js for `uncaughtException` and `unhandledRejection`

### IPC Communication
- All IPC endpoints use `namespace:action` pattern
- Examples: `api:calculate`, `storage:save-settings`, `app:get-info`
- Use `ipcMain.handle()` in main process
- Use `ipcRenderer.invoke()` in preload
- Always check `response.success` before using data

Example IPC handler:
```javascript
ipcMain.handle('api:calculate', async (event, data) => {
  try {
    const validation = validatePoissonInput(data);
    if (!validation.valid) {
      return { success: false, error: 'Ungültige Eingabedaten', validationErrors: validation.errors };
    }
    const result = calculationService.calculatePoisson(validation.data);
    return { success: true, data: result };
  } catch (error) {
    console.error('Berechnungsfehler:', error);
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

### Validation Pattern
- Use validator utility functions
- Return `{ valid: boolean, data?: any, errors?: any[] }`
- Import from `utils/validator.js`

Example:
```javascript
const { validateNumber, validatePoissonInput } = require('./utils/validator');

const validation = validatePoissonInput(data);
if (!validation.valid) {
  return { success: false, error: 'Ungültige Eingabedaten', validationErrors: validation.errors };
}
```

### Service Pattern
- Classes with business logic methods
- Instantiate then export the instance
- Use async/await for operations

### UI Development (renderer.js)
- Use `DOMContentLoaded` for initialization
- Access electronAPI via `window.electronAPI`
- Check `window.electronAPI && window.electronAPI.isElectron()` before use
- Fallback to localStorage for web-only scenarios

### Configuration
- All constants in `build-config/constants.js`
- Environment variables with fallbacks: `process.env.API_BASE_URL || 'http://localhost:3000'`
- Use `STORAGE.DEFAULT_SETTINGS` for default values

### Code Quality
- Prefer descriptive naming over comments
- Keep functions focused and single-purpose
- Use template literals for multi-line HTML
- Handle edge cases (division by zero, undefined values)
