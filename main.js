const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { WINDOW, API, STORAGE, APP_NAME, APP_VERSION, ICONS, DEV } = require('./build-config/constants');
const calculationService = require('./services/calculation.service');
const { validatePoissonInput, validateSettings } = require('./utils/validator');

let mainWindow;
let settings = { ...STORAGE.DEFAULT_SETTINGS };

function createWindow() {
  mainWindow = new BrowserWindow({
    width: WINDOW.DEFAULT_WIDTH,
    height: WINDOW.DEFAULT_HEIGHT,
    minWidth: WINDOW.MIN_WIDTH,
    minHeight: WINDOW.MIN_HEIGHT,
    center: WINDOW.CENTER,
    resizable: WINDOW.RESIZABLE,
    frame: WINDOW.FRAME,
    titleBarStyle: WINDOW.TITLE_BAR_STYLE,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false
    },
    icon: process.platform === 'win32' ? ICONS.WINDOWS : ICONS.LINUX,
    autoHideMenuBar: true
  });

  mainWindow.setTitle(APP_NAME);

  mainWindow.loadFile('index.html');
  mainWindow.removeMenu();

  if (DEV.ENABLE_DEV_TOOLS && process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  setupIpcHandlers();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  saveSettingsToFile();
});

function setupIpcHandlers() {
  ipcMain.handle('api:calculate', async (event, data) => {
    try {
      const validation = validatePoissonInput(data);
      
      if (!validation.valid) {
        return {
          success: false,
          error: 'Ungültige Eingabedaten',
          validationErrors: validation.errors
        };
      }

      let result;
      
      if (settings.apiEnabled && API.ENABLE_BACKEND) {
        const apiService = require('./services/api.service');
        apiService.setBaseUrl(settings.apiEndpoint || API.BASE_URL);
        
        const apiResult = await apiService.calculatePoisson(validation.data);
        
        if (apiResult.success) {
          result = apiResult.data;
        } else {
          console.log('API-Fallback: Berechne lokal');
          result = calculationService.calculatePoisson(validation.data);
        }
      } else {
        result = calculationService.calculatePoisson(validation.data);
      }
      
      return {
        success: true,
        data: result
      };
      
    } catch (error) {
      console.error('Berechnungsfehler:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('storage:save-settings', async (event, newSettings) => {
    try {
      const validation = validateSettings(newSettings);
      
      if (!validation.valid) {
        return {
          success: false,
          error: 'Ungültige Einstellungen',
          validationErrors: validation.errors
        };
      }
      
      settings = { ...settings, ...validation.data };
      const saved = saveSettingsToFile();
      
      return {
        success: saved,
        data: settings
      };
      
    } catch (error) {
      console.error('Einstellungs-Speicherfehler:', error);
      return {
        success: false,
        error: error.message
      };
    }
  });

  ipcMain.handle('storage:get-settings', async () => {
    return {
      success: true,
      data: settings
    };
  });

  ipcMain.handle('app:get-info', async () => {
    return {
      success: true,
      data: {
        name: APP_NAME,
        version: APP_VERSION,
        platform: process.platform,
        arch: process.arch,
        electronVersion: process.versions.electron,
        nodeVersion: process.versions.node,
        chromeVersion: process.versions.chrome
      }
    };
  });

  ipcMain.handle('app:open-devtools', async () => {
    if (mainWindow) {
      mainWindow.webContents.openDevTools();
      return { success: true };
    }
    return { success: false, error: 'Kein Fenster verfügbar' };
  });
}

function loadSettingsFromFile() {
  const userDataPath = app.getPath('userData');
  const settingsPath = path.join(userDataPath, 'settings.json');
  
  try {
    if (fs.existsSync(settingsPath)) {
      const fileContent = fs.readFileSync(settingsPath, 'utf-8');
      const loadedSettings = JSON.parse(fileContent);
      settings = { ...STORAGE.DEFAULT_SETTINGS, ...loadedSettings };
      console.log('Einstellungen geladen:', settingsPath);
    }
  } catch (error) {
    console.error('Fehler beim Laden der Einstellungen:', error);
    settings = { ...STORAGE.DEFAULT_SETTINGS };
  }
  
  return settings;
}

function saveSettingsToFile() {
  const userDataPath = app.getPath('userData');
  const settingsPath = path.join(userDataPath, 'settings.json');
  
  try {
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    console.log('Einstellungen gespeichert:', settingsPath);
    return true;
  } catch (error) {
    console.error('Fehler beim Speichern der Einstellungen:', error);
    return false;
  }
}

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  if (mainWindow) {
    dialog.showErrorBox('Fehler', `Ein unerwarteter Fehler ist aufgetreten: ${error.message}`);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
