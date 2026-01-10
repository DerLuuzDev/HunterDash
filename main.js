const { app, BrowserWindow, ipcMain, dialog, globalShortcut, Tray, Menu, nativeImage } = require('electron');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { WINDOW, API, STORAGE, APP_NAME, APP_VERSION, ICONS, DEV } = require('./build-config/constants');
const calculationService = require('./services/calculation.service');
const storageService = require('./services/storage.service');
const historyService = require('./services/history.service');
const templateService = require('./services/template.service');
const accountServiceFactory = require('./services/account.service');
const GrindService = require('./services/grind.service');
const { validatePoissonInput, validateSettings } = require('./utils/validator');

let mainWindow;
let tray = null;
let settings = { ...STORAGE.DEFAULT_SETTINGS };
let accountService = null;
let grindService = null;
calculationService.setHistoryService(historyService);

// Enable Wayland Global Shortcuts Portal support
app.commandLine.appendSwitch('enable-features', 'GlobalShortcutsPortal');

function createTray() {
  if (tray) return;

  const iconPath = process.platform === 'win32'
    ? path.join(__dirname, ICONS.WINDOWS)
    : path.join(__dirname, ICONS.LINUX);

  let icon;
  try {
    icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) {
      console.warn('Tray icon is empty, using default');
      icon = nativeImage.createEmpty();
    }
    // Resize for tray (16x16 is standard)
    icon = icon.resize({ width: 16, height: 16 });
  } catch (error) {
    console.error('Error loading tray icon:', error);
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);
  tray.setToolTip(APP_NAME);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Öffnen / Open',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Beenden / Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  // Click on tray icon to show window
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  console.log('Tray created successfully');
}

const hotkeyManager = {
  registered: {},
  callbacks: {},

  register(hotkey, name, callback) {
    try {
      if (this.registered[hotkey]) {
        globalShortcut.unregister(hotkey);
      }
      const result = globalShortcut.register(hotkey, callback);
      if (result) {
        this.registered[hotkey] = name;
        this.callbacks[name] = callback;
        console.log(`Hotkey registriert: ${hotkey} (${name})`);
      } else {
        console.error(`Hotkey konnte nicht registriert werden: ${hotkey}`);
      }
      return result;
    } catch (error) {
      console.error('Fehler beim Registrieren des Hotkeys:', error);
      return false;
    }
  },

  unregister(hotkey) {
    try {
      globalShortcut.unregister(hotkey);
      const name = this.registered[hotkey];
      delete this.registered[hotkey];
      delete this.callbacks[name];
      console.log(`Hotkey entregistriert: ${hotkey}`);
    } catch (error) {
      console.error('Fehler beim Entregistrieren des Hotkeys:', error);
    }
  },

  unregisterAll() {
    try {
      globalShortcut.unregisterAll();
      this.registered = {};
      this.callbacks = {};
      console.log('Alle Hotkeys entregistriert');
    } catch (error) {
      console.error('Fehler beim Entregistrieren aller Hotkeys:', error);
    }
  }
};

function initializeHistoryService() {
  const userDataPath = app.getPath('userData');
  historyService.userDataPath = userDataPath;
  historyService.initializeFileSystem();
  console.log('HistoryService initialisiert mit userDataPath:', userDataPath);
}

function initializeGrindService() {
  const userDataPath = app.getPath('userData');
  grindService = new GrindService(storageService, userDataPath);
  console.log('GrindService initialisiert mit userDataPath:', userDataPath);
}

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

  // Handle close event - minimize to tray if enabled
  mainWindow.on('close', (event) => {
    if (settings.minimizeToTray && !app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      console.log('Window hidden to tray');
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startLocalServer() {
  const SERVER_PORT = 35353;
  const server = http.createServer((req, res) => {
    // Set CORS headers just in case
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const url = req.url; // e.g. /api/trigger/add-kill

    if (url.startsWith('/api/trigger/')) {
      const action = url.split('/').pop(); // add-kill
      const eventMap = {
        'add-kill': 'grind:add-kill',
        'remove-kill': 'grind:remove-kill',
        'toggle-pause': 'grind:toggle-pause',
        'end-session': 'grind:end-session'
      };

      const ipcEvent = eventMap[action];

      if (ipcEvent && mainWindow) {
        mainWindow.webContents.send(ipcEvent);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, action: action }));
        console.log(`External trigger received: ${action}`);
      } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid action or window not ready' }));
      }
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  server.listen(SERVER_PORT, '127.0.0.1', () => {
    console.log(`Local trigger server running on http://127.0.0.1:${SERVER_PORT}`);
  });

  server.on('error', (e) => {
    console.error('Local server error:', e);
  });
}

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // Load settings first so we know if tray is enabled
    loadSettingsFromFile();

    initializeHistoryService();
    initializeGrindService();
    initializeAccountService();
    createWindow();
    setupIpcHandlers();
    startLocalServer();

    // Create tray if minimize-to-tray is enabled
    if (settings.minimizeToTray) {
      createTray();
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      } else if (mainWindow) {
        mainWindow.show();
      }
    });
  });
}

app.on('before-quit', () => {
  app.isQuitting = true;
  saveSettingsToFile();
  if (accountService) {
    accountService.checkAndCreateAutoBackup();
  }
  if (historyService) {
    historyService.createBackup();
  }
  if (grindService) {
    grindService.createBackup();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function setupIpcHandlers() {
  ipcMain.handle('api:calculate', async (event, data, options = {}) => {
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
      // Determine if history should be saved: check option override first, then settings
      const shouldSaveHistory = options.saveHistory !== undefined ? options.saveHistory : settings.autoHistory;

      if (settings.apiEnabled && API.ENABLE_BACKEND) {
        const apiService = require('./services/api.service');
        apiService.setBaseUrl(settings.apiEndpoint || API.BASE_URL);

        const apiResult = await apiService.calculatePoisson(validation.data);

        if (apiResult.success) {
          result = apiResult.data;
        } else {
          console.log('API-Fallback: Berechne lokal');
          result = await calculationService.calculatePoisson(validation.data, shouldSaveHistory);
        }
      } else {
        result = await calculationService.calculatePoisson(validation.data, shouldSaveHistory);
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

  ipcMain.handle('history:get-stats', async (event, options = {}) => {
    try {
      const { accountId, period } = options;
      const stats = await historyService.getStats(accountId, period);
      return stats;
    } catch (error) {
      console.error('Statistics-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('history:get-stats-markdown', async (event, options = {}) => {
    try {
      const { accountId, period } = options;
      const statsResult = await historyService.getStats(accountId, period);
      if (!statsResult.success) {
        return statsResult;
      }
      const markdown = await historyService.formatStatsMarkdown(statsResult.data);
      return { success: true, data: markdown };
    } catch (error) {
      console.error('Statistics-Markdown-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

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

  ipcMain.handle('history:list-backups', async () => {
    try {
      return await historyService.listBackups();
    } catch (error) {
      console.error('History-ListBackups-Fehler:', error);
      return { success: false, error: error.message, data: [] };
    }
  });

  ipcMain.handle('history:restore-backup', async (event, backupFileName) => {
    try {
      return await historyService.restoreBackup(backupFileName);
    } catch (error) {
      console.error('History-RestoreBackup-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('history:create-backup', async () => {
    try {
      return await historyService.createBackup();
    } catch (error) {
      console.error('History-CreateBackup-Fehler:', error);
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
      const result = await accountService.saveAccount(name, data);
      if (result.success) {
        const savedAccount = result.data.find(a => a.name === name);
        if (savedAccount) {
          const flatData = accountService.convertToFlatData(savedAccount.data);
          await calculationService.calculatePoisson(flatData, true, savedAccount.id);
        }
      }
      return result;
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

  ipcMain.handle('accounts:update-by-id', async (event, accountId, updateData) => {
    try {
      const result = await accountService.updateAccountById(accountId, updateData);
      if (result.success) {
        const updatedAccount = result.data;
        if (updatedAccount) {
          const flatData = accountService.convertToFlatData(updatedAccount.data);
          await calculationService.calculatePoisson(flatData, true, updatedAccount.id);
        }
      }
      return result;
    } catch (error) {
      console.error('Account-Update-Fehler:', error);
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

  ipcMain.handle('grind:get-tips', async () => {
    try {
      return grindService.getTips();
    } catch (error) {
      console.error('Grind-Tips-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grind:get-custom-tips', async () => {
    try {
      return await grindService.getCustomTips();
    } catch (error) {
      console.error('Grind-CustomTips-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grind:save-custom-tip', async (event, animalId, content) => {
    try {
      return await grindService.saveCustomTip(animalId, content);
    } catch (error) {
      console.error('Grind-SaveCustomTip-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grind:reset-custom-tip', async (event, animalId) => {
    try {
      return await grindService.resetCustomTip(animalId);
    } catch (error) {
      console.error('Grind-ResetCustomTip-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grind:simulate', async (event, data) => {
    try {
      return grindService.calculateExpectedKills(data);
    } catch (error) {
      console.error('Grind-Simulation-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grind:save-session', async (event, session) => {
    try {
      return await grindService.saveSession(session);
    } catch (error) {
      console.error('Grind-Session-Save-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grind:get-sessions', async () => {
    try {
      return await grindService.getSessions();
    } catch (error) {
      console.error('Grind-Sessions-Laden-Fehler:', error);
      return { success: false, error: error.message, data: [] };
    }
  });

  ipcMain.handle('grind:delete-session', async (event, sessionId) => {
    try {
      return await grindService.deleteSession(sessionId);
    } catch (error) {
      console.error('Grind-Session-Löschen-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grind:clear-sessions', async () => {
    try {
      return await grindService.clearSessions();
    } catch (error) {
      console.error('Grind-Sessions-Leeren-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grind:get-settings', async () => {
    try {
      return await grindService.getSettings();
    } catch (error) {
      console.error('Grind-Settings-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grind:save-settings', async (event, settings) => {
    try {
      return await grindService.saveSettings(settings);
    } catch (error) {
      console.error('Grind-Settings-Save-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grind:get-animals', async () => {
    try {
      return grindService.getAnimals();
    } catch (error) {
      console.error('Grind-Animals-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grind:get-templates', async () => {
    try {
      return grindService.getTemplates();
    } catch (error) {
      console.error('Grind-Templates-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grind:get-custom-templates', async () => {
    try {
      return await grindService.getCustomTemplates();
    } catch (error) {
      console.error('Grind-Custom-Templates-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grind:save-custom-template', async (event, template) => {
    try {
      return await grindService.saveCustomTemplate(template);
    } catch (error) {
      console.error('Grind-Custom-Template-Save-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grind:delete-custom-template', async (event, templateId) => {
    try {
      return await grindService.deleteCustomTemplate(templateId);
    } catch (error) {
      console.error('Grind-Custom-Template-Delete-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grind:get-active-session', async (event, name) => {
    try {
      const session = await grindService.getActiveSession(name);
      return { success: true, data: session };
    } catch (error) {
      console.error('Grind-Active-Session-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grind:validate-session-name', async (event, name) => {
    try {
      return await grindService.validateSessionName(name);
    } catch (error) {
      console.error('Grind-Validate-Session-Name-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grind:pause-session', async (event, sessionId) => {
    try {
      return await grindService.pauseSession(sessionId);
    } catch (error) {
      console.error('Grind-Pause-Session-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grind:resume-session', async (event, sessionId) => {
    try {
      return await grindService.resumeSession(sessionId);
    } catch (error) {
      console.error('Grind-Resume-Session-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grind:cancel-session', async (event, sessionId) => {
    try {
      return await grindService.cancelSession(sessionId);
    } catch (error) {
      console.error('Grind-Cancel-Session-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grind:register-hotkeys', async (event, hotkeys) => {
    try {
      hotkeyManager.unregisterAll();

      const currentSettings = await grindService.getSettings();
      const settingsHotkeys = (currentSettings.success && currentSettings.data?.sessionHotkeys)
        ? currentSettings.data.sessionHotkeys
        : STORAGE.DEFAULT_SETTINGS.sessionHotkeys;

      console.log('Registriere Hotkeys:', settingsHotkeys);

      // Convert UI format (e.g., "Ctrl + ^") to Electron format
      const convertToElectronFormat = (key) => {
        if (!key) return '';

        // If already in Electron format, just handle special chars
        if (key.includes('CommandOrControl')) {
          let converted = key
            .replace(/DeadCircumflex/g, '`')
            .replace(/\^/g, '`')  // ^ is on Backquote key on German keyboards
            .replace(/°/g, '`');  // ° is Shift+^ on German keyboards
          console.log(`Converting hotkey (already electron format): "${key}" -> "${converted}"`);
          return converted;
        }

        // Convert from UI format
        let converted = key
          .replace(/Ctrl/g, 'CommandOrControl')
          .replace(/ \+ /g, '+')
          .replace(/DeadCircumflex/g, '`')
          .replace(/\^/g, '`')  // ^ is on Backquote key on German keyboards
          .replace(/°/g, '`')   // ° is Shift+^ on German keyboards
          .replace(/´/g, '=');  // ´ is on Equal key on German keyboards

        // Don't convert standalone "Control" if it's part of "CommandOrControl"
        if (!converted.includes('CommandOrControl')) {
          converted = converted.replace(/Control/g, 'CommandOrControl');
        }

        console.log(`Converting hotkey: "${key}" -> "${converted}"`);
        return converted;
      };

      const registerHotkey = (uiKey, name, eventName) => {
        // Skip empty or undefined hotkeys
        if (!uiKey || uiKey.trim() === '') {
          console.log(`Skipping empty hotkey for ${name}`);
          return;
        }
        const electronKey = convertToElectronFormat(uiKey);
        if (!electronKey || electronKey.trim() === '') {
          console.log(`Skipping invalid hotkey conversion for ${name}`);
          return;
        }
        console.log(`Versuche Hotkey zu registrieren: ${electronKey} (${name})`);
        hotkeyManager.register(electronKey, name, () => {
          mainWindow.webContents.send(eventName);
        });
      };

      registerHotkey(settingsHotkeys.addKill, 'addKill', 'grind:add-kill');
      registerHotkey(settingsHotkeys.removeKill, 'removeKill', 'grind:remove-kill');
      registerHotkey(settingsHotkeys.togglePause, 'togglePause', 'grind:toggle-pause');
      registerHotkey(settingsHotkeys.endSession, 'endSession', 'grind:end-session');

      return { success: true };
    } catch (error) {
      console.error('Grind-Register-Hotkeys-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grind:unregister-hotkeys', async () => {
    try {
      hotkeyManager.unregisterAll();
      return { success: true };
    } catch (error) {
      console.error('Grind-Unregister-Hotkeys-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('grind:update-hotkeys', async (event, newHotkeys) => {
    try {
      const response = await grindService.getSettings();
      if (response.success) {
        const settings = response.data;
        settings.sessionHotkeys = { ...settings.sessionHotkeys, ...newHotkeys };
        await grindService.saveSettings(settings);

        // If hotkeys are currently active (session running), re-register them
        const hadActiveHotkeys = Object.keys(hotkeyManager.registered).length > 0;
        if (hadActiveHotkeys) {
          hotkeyManager.unregisterAll();

          const convertToElectronFormat = (key) => {
            if (!key) return '';

            // If already in Electron format, just handle special chars
            if (key.includes('CommandOrControl')) {
              let converted = key
                .replace(/DeadCircumflex/g, '`')
                .replace(/\^/g, '`')  // ^ is on Backquote key on German keyboards
                .replace(/°/g, '`');  // ° is Shift+^ on German keyboards
              console.log(`Converting hotkey (already electron format): "${key}" -> "${converted}"`);
              return converted;
            }

            // Convert from UI format
            let converted = key
              .replace(/Ctrl/g, 'CommandOrControl')
              .replace(/ \+ /g, '+')
              .replace(/DeadCircumflex/g, '`')
              .replace(/\^/g, '`')  // ^ is on Backquote key on German keyboards
              .replace(/°/g, '`')   // ° is Shift+^ on German keyboards
              .replace(/´/g, '=');  // ´ is on Equal key on German keyboards

            // Don't convert standalone "Control" if it's part of "CommandOrControl"
            if (!converted.includes('CommandOrControl')) {
              converted = converted.replace(/Control/g, 'CommandOrControl');
            }

            console.log(`Converting hotkey: "${key}" -> "${converted}"`);
            return converted;
          };

          const registerHotkey = (uiKey, name, eventName) => {
            // Skip empty or undefined hotkeys
            if (!uiKey || uiKey.trim() === '') {
              console.log(`Skipping empty hotkey for ${name}`);
              return;
            }
            const electronKey = convertToElectronFormat(uiKey);
            if (!electronKey || electronKey.trim() === '') {
              console.log(`Skipping invalid hotkey conversion for ${name}`);
              return;
            }
            console.log(`Versuche Hotkey zu registrieren: ${electronKey} (${name})`);
            hotkeyManager.register(electronKey, name, () => {
              mainWindow.webContents.send(eventName);
            });
          };

          registerHotkey(settings.sessionHotkeys.addKill, 'addKill', 'grind:add-kill');
          registerHotkey(settings.sessionHotkeys.removeKill, 'removeKill', 'grind:remove-kill');
          registerHotkey(settings.sessionHotkeys.togglePause, 'togglePause', 'grind:toggle-pause');
          registerHotkey(settings.sessionHotkeys.endSession, 'endSession', 'grind:end-session');

          console.log('Hotkeys wurden nach Update neu registriert');

          console.log('Hotkeys wurden nach Update neu registriert');
        }

        return { success: true };
      }
      return { success: false, error: 'Einstellungen konnten nicht geladen werden' };
    } catch (error) {
      console.error('Grind-Update-Hotkeys-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('window:set-always-on-top', (event, alwaysOnTop) => {
    try {
      if (mainWindow) {
        mainWindow.setAlwaysOnTop(alwaysOnTop);
        mainWindow.setVisibleOnAllWorkspaces(alwaysOnTop);
        return { success: true };
      }
      return { success: false, error: 'Hauptfenster nicht gefunden' };
    } catch (error) {
      console.error('Window-Set-Always-On-Top-Fehler:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('window:set-minimize-to-tray', (event, enabled) => {
    try {
      settings.minimizeToTray = enabled;
      saveSettingsToFile();

      if (enabled) {
        createTray();
      } else if (tray) {
        tray.destroy();
        tray = null;
        console.log('Tray destroyed');
      }

      return { success: true };
    } catch (error) {
      console.error('Window-Set-Minimize-To-Tray-Fehler:', error);
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
