const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  calculate: (data, options) => ipcRenderer.invoke('api:calculate', data, options),

  saveSettings: (settings) => ipcRenderer.invoke('storage:save-settings', settings),

  getSettings: () => ipcRenderer.invoke('storage:get-settings'),

  getAppInfo: () => ipcRenderer.invoke('app:get-info'),

  openDevTools: () => ipcRenderer.invoke('app:open-devtools'),

  isElectron: () => true,

  getPlatform: () => process.platform,

  history: {
    get: (filters) => ipcRenderer.invoke('history:get', filters),
    getStatistics: (options) => ipcRenderer.invoke('history:get-stats', options),
    getStatisticsMarkdown: (options) => ipcRenderer.invoke('history:get-stats-markdown', options),
    getTimeSeries: (options) => ipcRenderer.invoke('history:get-timeseries', options),
    clear: () => ipcRenderer.invoke('history:clear'),
    exportCSV: () => ipcRenderer.invoke('history:export-csv'),
    exportJSON: () => ipcRenderer.invoke('history:export-json'),
    listBackups: () => ipcRenderer.invoke('history:list-backups'),
    restoreBackup: (backupFileName) => ipcRenderer.invoke('history:restore-backup', backupFileName),
    createBackup: () => ipcRenderer.invoke('history:create-backup')
  },

  templates: {
    get: () => ipcRenderer.invoke('templates:get'),
    save: (name, data) => ipcRenderer.invoke('templates:save', name, data),
    delete: (id) => ipcRenderer.invoke('templates:delete', id)
  },

  accounts: {
    get: () => ipcRenderer.invoke('accounts:get'),
    save: (name, data) => ipcRenderer.invoke('accounts:save', name, data),
    delete: (id) => ipcRenderer.invoke('accounts:delete', id),
    compare: (accountId1, accountId2) => ipcRenderer.invoke('accounts:compare', accountId1, accountId2),
    getStatistics: (accountId) => ipcRenderer.invoke('accounts:get-statistics', accountId),
    listBackups: () => ipcRenderer.invoke('accounts:list-backups'),
    restoreBackup: (backupFileName) => ipcRenderer.invoke('accounts:restore-backup', backupFileName),
    createBackup: () => ipcRenderer.invoke('accounts:create-backup')
  },

  grind: {
    getTips: () => ipcRenderer.invoke('grind:get-tips'),
    getCustomTips: () => ipcRenderer.invoke('grind:get-custom-tips'),
    saveCustomTip: (animalId, content) => ipcRenderer.invoke('grind:save-custom-tip', animalId, content),
    resetCustomTip: (animalId) => ipcRenderer.invoke('grind:reset-custom-tip', animalId),
    simulate: (data) => ipcRenderer.invoke('grind:simulate', data),
    saveSession: (session) => ipcRenderer.invoke('grind:save-session', session),
    getSessions: () => ipcRenderer.invoke('grind:get-sessions'),
    deleteSession: (sessionId) => ipcRenderer.invoke('grind:delete-session', sessionId),
    clearSessions: () => ipcRenderer.invoke('grind:clear-sessions'),
    getSettings: () => ipcRenderer.invoke('grind:get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('grind:save-settings', settings),
    getAnimals: () => ipcRenderer.invoke('grind:get-animals'),
    getTemplates: () => ipcRenderer.invoke('grind:get-templates'),
    getCustomTemplates: () => ipcRenderer.invoke('grind:get-custom-templates'),
    saveCustomTemplate: (template) => ipcRenderer.invoke('grind:save-custom-template', template),
    deleteCustomTemplate: (templateId) => ipcRenderer.invoke('grind:delete-custom-template', templateId),
    getActiveSession: (name) => ipcRenderer.invoke('grind:get-active-session', name),
    validateSessionName: (name) => ipcRenderer.invoke('grind:validate-session-name', name),
    pauseSession: (sessionId) => ipcRenderer.invoke('grind:pause-session', sessionId),
    resumeSession: (sessionId) => ipcRenderer.invoke('grind:resume-session', sessionId),
    cancelSession: (sessionId) => ipcRenderer.invoke('grind:cancel-session', sessionId),
    registerHotkeys: (hotkeys) => ipcRenderer.invoke('grind:register-hotkeys', hotkeys),
    unregisterHotkeys: () => ipcRenderer.invoke('grind:unregister-hotkeys'),
    updateHotkeys: (hotkeys) => ipcRenderer.invoke('grind:update-hotkeys', hotkeys)
  },
  setAlwaysOnTop: (alwaysOnTop) => ipcRenderer.invoke('window:set-always-on-top', alwaysOnTop),
  setMinimizeToTray: (enabled) => ipcRenderer.invoke('window:set-minimize-to-tray', enabled),
  onGrindHotkey: (channel, callback) => {
    const validChannels = ['grind:add-kill', 'grind:remove-kill', 'grind:toggle-pause', 'grind:end-session'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },
  removeGrindHotkeyListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  },

  sync: {
    getStatus: () => ipcRenderer.invoke('sync:status'),
    check: () => ipcRenderer.invoke('sync:check'),
    run: (options) => ipcRenderer.invoke('sync:run', options),
    reload: () => ipcRenderer.invoke('sync:reload')
  }
});
