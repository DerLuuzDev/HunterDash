const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  calculate: (data) => ipcRenderer.invoke('api:calculate', data),

  saveSettings: (settings) => ipcRenderer.invoke('storage:save-settings', settings),

  getSettings: () => ipcRenderer.invoke('storage:get-settings'),

  getAppInfo: () => ipcRenderer.invoke('app:get-info'),

  openDevTools: () => ipcRenderer.invoke('app:open-devtools'),

  isElectron: () => true,

  getPlatform: () => process.platform,

  history: {
    get: (filters) => ipcRenderer.invoke('history:get', filters),
    getStatistics: (period) => ipcRenderer.invoke('history:get-statistics', period),
    getTimeSeries: (categoryKey, aggregation) => ipcRenderer.invoke('history:get-timeseries', categoryKey, aggregation),
    clear: () => ipcRenderer.invoke('history:clear'),
    exportCSV: () => ipcRenderer.invoke('history:export-csv'),
    exportJSON: () => ipcRenderer.invoke('history:export-json')
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
  }
});
