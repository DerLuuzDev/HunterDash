const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { WINDOW, API, STORAGE, APP_NAME, APP_VERSION, ICONS, DEV } = require('./build-config/constants');
const calculationService = require('./services/calculation.service');
const storageService = require('./services/storage.service');
const historyService = require('./services/history.service');
const templateService = require('./services/template.service');
const accountServiceFactory = require('./services/account.service');
const { validatePoissonInput, validateSettings } = require('./utils/validator');

let mainWindow;
let settings = { ...STORAGE.DEFAULT_SETTINGS };
let accountService = null;

calculationService.setHistoryService(historyService);

function initializeAccountService() {
  const userDataPath = app.getPath('userData');
  accountService = accountServiceFactory.getInstance(storageService, userDataPath);
  console.log('AccountService initialisiert mit userDataPath:', userDataPath);
}

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
  initializeAccountService();
  createWindow();
  setupIpcHandlers();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  saveSettingsToFile();
  if (accountService) {
    accountService.checkAndCreateAutoBackup();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
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
          result = await calculationService.calculatePoisson(validation.data, settings.autoHistory);
        }
      } else {
        result = await calculationService.calculatePoisson(validation.data, settings.autoHistory);
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

  ipcMain.handle('history:get', async (event, filters) => {
    try {
      const history = await historyService.getHistory(filters);
      return { success: true, data: history };
    } catch (error) {
      console.error('History-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('history:get-statistics', async (event, period) => {
    try {
      const stats = await historyService.getStatistics(period);
      return stats;
    } catch (error) {
      console.error('Statistics-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('history:get-timeseries', async (event, categoryKey, aggregation) => {
    try {
      const series = await historyService.getTimeSeries(categoryKey, aggregation);
      return series;
    } catch (error) {
      console.error('TimeSeries-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('history:clear', async () => {
    try {
      return await historyService.clearHistory();
    } catch (error) {
      console.error('History-Clear-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('history:export-csv', async () => {
    try {
      return await historyService.exportToCSV();
    } catch (error) {
      console.error('CSV-Export-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('history:export-json', async () => {
    try {
      return await historyService.exportToJSON();
    } catch (error) {
      console.error('JSON-Export-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('templates:get', async () => {
    try {
      const templates = await templateService.getTemplates();
      return { success: true, data: templates };
    } catch (error) {
      console.error('Templates-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('templates:save', async (event, name, data) => {
    try {
      return await templateService.saveTemplate(name, data);
    } catch (error) {
      console.error('Template-Save-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('templates:delete', async (event, id) => {
    try {
      return await templateService.deleteTemplate(id);
    } catch (error) {
      console.error('Template-Delete-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('accounts:get', async () => {
    try {
      const accounts = await accountService.getAccounts();
      return { success: true, data: accounts };
    } catch (error) {
      console.error('Accounts-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('accounts:save', async (event, name, data) => {
    try {
      return await accountService.saveAccount(name, data);
    } catch (error) {
      console.error('Account-Save-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('accounts:delete', async (event, id) => {
    try {
      return await accountService.deleteAccount(id);
    } catch (error) {
      console.error('Account-Delete-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('accounts:compare', async (event, accountId1, accountId2) => {
    try {
      return await accountService.compareAccounts(accountId1, accountId2, calculationService);
    } catch (error) {
      console.error('Account-Compare-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('accounts:get-statistics', async (event, accountId) => {
    try {
      return await accountService.getAccountStatistics(accountId, calculationService);
    } catch (error) {
      console.error('Account-Statistics-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('accounts:list-backups', async () => {
    try {
      return await accountService.listBackups();
    } catch (error) {
      console.error('Account-ListBackups-Fehler:', error);
      return { success: false, error: error.message, data: [] };
    }
  });

  ipcMain.handle('accounts:restore-backup', async (event, backupFileName) => {
    try {
      return await accountService.restoreBackup(backupFileName);
    } catch (error) {
      console.error('Account-RestoreBackup-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('accounts:create-backup', async () => {
    try {
      await accountService.createBackup();
      return { success: true };
    } catch (error) {
      console.error('Account-CreateBackup-Fehler:', error);
      return { success: false, error: error.message };
    }
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
