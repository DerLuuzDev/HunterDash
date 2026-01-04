const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  calculate: (data) => ipcRenderer.invoke('api:calculate', data),
  
  saveSettings: (settings) => ipcRenderer.invoke('storage:save-settings', settings),
  
  getSettings: () => ipcRenderer.invoke('storage:get-settings'),
  
  getAppInfo: () => ipcRenderer.invoke('app:get-info'),
  
  openDevTools: () => ipcRenderer.invoke('app:open-devtools'),
  
  isElectron: () => true,
  
  getPlatform: () => process.platform
});
