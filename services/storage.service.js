const { STORAGE } = require('../build-config/constants');

class StorageService {
  constructor() {
    this.useLocalStorage = typeof window !== 'undefined' && 'localStorage' in window;
    this.memoryStorage = {};
  }
  
  async get(key) {
    try {
      if (this.useLocalStorage) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
      return this.memoryStorage[key] || null;
    } catch (error) {
      console.error(`Storage: Fehler beim Lesen von ${key}:`, error);
      return null;
    }
  }
  
  async set(key, value) {
    try {
      if (this.useLocalStorage) {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        this.memoryStorage[key] = value;
      }
      return true;
    } catch (error) {
      console.error(`Storage: Fehler beim Speichern von ${key}:`, error);
      return false;
    }
  }
  
  async remove(key) {
    try {
      if (this.useLocalStorage) {
        localStorage.removeItem(key);
      } else {
        delete this.memoryStorage[key];
      }
      return true;
    } catch (error) {
      console.error(`Storage: Fehler beim Löschen von ${key}:`, error);
      return false;
    }
  }
  
  async clear() {
    try {
      if (this.useLocalStorage) {
        localStorage.clear();
      } else {
        this.memoryStorage = {};
      }
      return true;
    } catch (error) {
      console.error('Storage: Fehler beim Leeren:', error);
      return false;
    }
  }
  
  async getSettings() {
    const settings = await this.get(STORAGE.KEYS.SETTINGS);
    return settings || { ...STORAGE.DEFAULT_SETTINGS };
  }
  
  async saveSettings(settings) {
    const currentSettings = await this.getSettings();
    const mergedSettings = { ...currentSettings, ...settings };
    return await this.set(STORAGE.KEYS.SETTINGS, mergedSettings);
  }
  
  async getLastValues() {
    return await this.get(STORAGE.KEYS.LAST_VALUES);
  }
  
  async saveLastValues(values) {
    return await this.set(STORAGE.KEYS.LAST_VALUES, values);
  }
  
  async getTheme() {
    return await this.get(STORAGE.KEYS.THEME) || 'light';
  }
  
  async setTheme(theme) {
    return await this.set(STORAGE.KEYS.THEME, theme);
  }
}

const storageService = new StorageService();

module.exports = storageService;
