const { GRIND, STORAGE } = require('../build-config/constants');
const fs = require('fs');
const path = require('path');

class GrindService {
  constructor(storageService, userDataPath = null) {
    this.storage = storageService;
    this.customTips = {};
    this.settings = { ...GRIND.DEFAULT_SETTINGS };
    this.userDataPath = userDataPath;
    this.sessionsFilePath = null;
    this.settingsFilePath = null;
    this.backupDir = null;
    this.memorySessions = [];

    if (userDataPath) {
      this.initializeFileSystem();
    }
  }

  initializeFileSystem() {
    this.sessionsFilePath = path.join(this.userDataPath, GRIND.FILENAME);
    this.settingsFilePath = path.join(this.userDataPath, 'grind-settings.json');
    this.backupDir = path.join(this.userDataPath, GRIND.BACKUP_DIR);

    try {
      if (!fs.existsSync(this.userDataPath)) {
        fs.mkdirSync(this.userDataPath, { recursive: true });
      }

      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }

      this.loadFromFile();
      this.loadSettingsFromFile();
    } catch (error) {
      console.error('GrindService: Fehler beim Initialisieren des Dateisystems:', error);
    }
  }

  async getSettings() {
    try {
      // Always return the in-memory settings (loaded from file on init)
      return { success: true, data: this.settings };
    } catch (error) {
      console.error('GrindService: Fehler beim Laden der Einstellungen:', error);
      return { success: false, error: error.message };
    }
  }

  async saveSettings(settings) {
    try {
      // Deep merge for nested objects like sessionHotkeys
      const mergedSettings = { ...this.settings };

      Object.keys(settings).forEach(key => {
        if (typeof settings[key] === 'object' && settings[key] !== null && !Array.isArray(settings[key])) {
          // Deep merge nested objects
          mergedSettings[key] = { ...mergedSettings[key], ...settings[key] };
        } else {
          mergedSettings[key] = settings[key];
        }
      });

      this.settings = mergedSettings;

      // Save to file system (persistent across restarts)
      this.saveSettingsToFile();

      console.log('GrindService: Settings gespeichert:', JSON.stringify(mergedSettings.sessionHotkeys));
      return { success: true };
    } catch (error) {
      console.error('GrindService: Fehler beim Speichern der Einstellungen:', error);
      return { success: false, error: error.message };
    }
  }

  loadSettingsFromFile() {
    if (!this.settingsFilePath || !fs.existsSync(this.settingsFilePath)) {
      console.log('GrindService: Keine Settings-Datei gefunden, verwende Defaults');
      return;
    }

    try {
      const fileContent = fs.readFileSync(this.settingsFilePath, 'utf-8');
      const storedSettings = JSON.parse(fileContent);
      this.settings = { ...GRIND.DEFAULT_SETTINGS, ...storedSettings };
      console.log('GrindService: Settings aus Datei geladen:', this.settingsFilePath);
      console.log('GrindService: Hotkeys:', JSON.stringify(this.settings.sessionHotkeys));
    } catch (error) {
      console.error('GrindService: Fehler beim Laden der Settings aus Datei:', error);
    }
  }

  saveSettingsToFile() {
    if (!this.settingsFilePath) return;

    try {
      fs.writeFileSync(this.settingsFilePath, JSON.stringify(this.settings, null, 2));
      console.log('GrindService: Settings gespeichert:', this.settingsFilePath);
    } catch (error) {
      console.error('GrindService: Fehler beim Speichern der Settings in Datei:', error);
    }
  }

  getTips() {
    return {
      success: true,
      data: GRIND.TIPS
    };
  }

  async getCustomTips() {
    try {
      const stored = await this.storage.get('grind-custom-tips');
      this.customTips = stored || {};
      return { success: true, data: this.customTips };
    } catch (error) {
      console.error('GrindService: Fehler beim Laden der benutzerdefinierten Tipps:', error);
      return { success: false, error: error.message };
    }
  }

  async saveCustomTip(animalId, content) {
    try {
      this.customTips[animalId] = content;
      await this.storage.set('grind-custom-tips', this.customTips);
      return { success: true };
    } catch (error) {
      console.error('GrindService: Fehler beim Speichern des benutzerdefinierten Tipps:', error);
      return { success: false, error: error.message };
    }
  }

  async resetCustomTip(animalId) {
    try {
      delete this.customTips[animalId];
      await this.storage.set('grind-custom-tips', this.customTips);
      return { success: true };
    } catch (error) {
      console.error('GrindService: Fehler beim Zurücksetzen des Tipps:', error);
      return { success: false, error: error.message };
    }
  }

  calculateExpectedKills(data) {
    const { currentKills, spawnChance, confidence } = data;

    if (currentKills < 0 || spawnChance <= 0 || spawnChance > 1) {
      return {
        success: false,
        error: 'Ungültige Eingabewerte'
      };
    }

    const expectedKills = 1 / spawnChance;
    const remainingKills = Math.max(0, expectedKills - currentKills);

    const stdDev = Math.sqrt(expectedKills);
    const zScore = this.getConfidenceZScore(confidence);

    const minKills = Math.max(0, expectedKills - zScore * stdDev);
    const maxKills = expectedKills + zScore * stdDev;

    const currentProbability = 1 - Math.exp(-spawnChance * currentKills);

    return {
      success: true,
      data: {
        expected: expectedKills,
        remaining: remainingKills,
        min: minKills,
        max: maxKills,
        probability: currentProbability,
        distribution: this.generateDistribution(expectedKills, stdDev)
      }
    };
  }

  getConfidenceZScore(confidence) {
    const zScores = {
      0.95: 1.96,
      0.99: 2.58
    };
    return zScores[confidence] || 1.96;
  }

  generateDistribution(expected, stdDev) {
    const data = [];
    for (let i = 0; i <= 20; i++) {
      const kills = expected + (i - 10) * (stdDev / 2);
      const probability = Math.exp(-Math.pow(kills - expected, 2) / (2 * stdDev * stdDev)) / (stdDev * Math.sqrt(2 * Math.PI));
      data.push({
        kills: Math.round(kills),
        probability: probability
      });
    }
    return data;
  }

  async saveSession(session) {
    try {
      const sessions = await this.getSessions().then(r => r.data || []);

      // Prüfe ob Session bereits existiert (anhand ID)
      const existingIndex = sessions.findIndex(s => s.id === session.id);

      if (existingIndex !== -1) {
        // Aktualisiere existierende Session
        sessions[existingIndex] = session;
      } else {
        // Neue Session hinzufügen
        sessions.unshift(session);
        if (sessions.length > GRIND.MAX_SESSIONS) {
          sessions.pop();
        }
      }

      await this.storage.set(STORAGE.KEYS.GRIND_SESSIONS, sessions);

      if (this.userDataPath) {
        await this.saveToFile(sessions);
      }

      return { success: true };
    } catch (error) {
      console.error('GrindService: Fehler beim Speichern der Session:', error);
      return { success: false, error: error.message };
    }
  }

  async getSessions() {
    try {
      let sessions;

      if (this.userDataPath && this.memorySessions.length > 0) {
        sessions = this.memorySessions;
      } else {
        sessions = await this.storage.get(STORAGE.KEYS.GRIND_SESSIONS) || [];
      }

      return { success: true, data: sessions };
    } catch (error) {
      console.error('GrindService: Fehler beim Laden der Sessions:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async deleteSession(sessionId) {
    try {
      const sessions = await this.getSessions().then(r => r.data || []);
      const filtered = sessions.filter(s => s.id !== sessionId);
      await this.storage.set(STORAGE.KEYS.GRIND_SESSIONS, filtered);

      if (this.userDataPath) {
        await this.saveToFile(filtered);
      }

      return { success: true };
    } catch (error) {
      console.error('GrindService: Fehler beim Löschen der Session:', error);
      return { success: false, error: error.message };
    }
  }

  async clearSessions() {
    try {
      await this.storage.set(STORAGE.KEYS.GRIND_SESSIONS, []);

      if (this.userDataPath) {
        await this.saveToFile([]);
      }

      return { success: true };
    } catch (error) {
      console.error('GrindService: Fehler beim Leeren der Sessions:', error);
      return { success: false, error: error.message };
    }
  }

  getAnimals() {
    return {
      success: true,
      data: GRIND.ANIMALS
    };
  }

  getTemplates() {
    try {
      return {
        success: true,
        data: GRIND.SESSION_TEMPLATES
      };
    } catch (error) {
      console.error('GrindService: Fehler beim Laden der Templates:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async saveCustomTemplate(template) {
    try {
      const templates = await this.storage.get('grind-custom-templates') || [];
      templates.push(template);
      await this.storage.set('grind-custom-templates', templates);
      return { success: true };
    } catch (error) {
      console.error('GrindService: Fehler beim Speichern des Templates:', error);
      return { success: false, error: error.message };
    }
  }

  async getCustomTemplates() {
    try {
      const templates = await this.storage.get('grind-custom-templates') || [];
      return { success: true, data: templates };
    } catch (error) {
      console.error('GrindService: Fehler beim Laden der benutzerdefinierten Templates:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async deleteCustomTemplate(templateId) {
    try {
      const templates = await this.storage.get('grind-custom-templates') || [];
      const filtered = templates.filter(t => t.id !== templateId);
      await this.storage.set('grind-custom-templates', filtered);
      return { success: true };
    } catch (error) {
      console.error('GrindService: Fehler beim Löschen des Templates:', error);
      return { success: false, error: error.message };
    }
  }

  async getActiveSession(name) {
    try {
      const sessions = await this.getSessions().then(r => r.data || []);
      const activeSession = sessions.find(s =>
        s.name === name &&
        (s.status === GRIND.SESSION_STATUS.RUNNING || s.status === GRIND.SESSION_STATUS.PAUSED)
      );
      return activeSession || null;
    } catch (error) {
      console.error('GrindService: Fehler beim Suchen der aktiven Session:', error);
      return null;
    }
  }

  async validateSessionName(name) {
    if (!name || name.trim() === '') {
      return { valid: false, error: 'Bitte gib einen Session-Namen ein' };
    }

    const activeSession = await this.getActiveSession(name);
    if (activeSession) {
      return {
        valid: false,
        error: 'Dieser Name wird bereits für eine aktive/pausierte Session verwendet'
      };
    }

    return { valid: true };
  }

  async pauseSession(sessionId) {
    try {
      const sessions = await this.getSessions().then(r => r.data || []);
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);

      if (sessionIndex === -1) {
        return { success: false, error: 'Session nicht gefunden' };
      }

      sessions[sessionIndex].status = GRIND.SESSION_STATUS.PAUSED;
      await this.storage.set(STORAGE.KEYS.GRIND_SESSIONS, sessions);

      if (this.userDataPath) {
        await this.saveToFile(sessions);
      }

      return { success: true };
    } catch (error) {
      console.error('GrindService: Fehler beim Pausieren der Session:', error);
      return { success: false, error: error.message };
    }
  }

  async resumeSession(sessionId) {
    try {
      const sessions = await this.getSessions().then(r => r.data || []);
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);

      if (sessionIndex === -1) {
        return { success: false, error: 'Session nicht gefunden' };
      }

      sessions[sessionIndex].status = GRIND.SESSION_STATUS.RUNNING;
      await this.storage.set(STORAGE.KEYS.GRIND_SESSIONS, sessions);

      if (this.userDataPath) {
        await this.saveToFile(sessions);
      }

      return { success: true };
    } catch (error) {
      console.error('GrindService: Fehler beim Fortsetzen der Session:', error);
      return { success: false, error: error.message };
    }
  }

  async cancelSession(sessionId) {
    try {
      const sessions = await this.getSessions().then(r => r.data || []);
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);

      if (sessionIndex === -1) {
        return { success: false, error: 'Session nicht gefunden' };
      }

      sessions[sessionIndex].status = GRIND.SESSION_STATUS.CANCELLED;
      await this.storage.set(STORAGE.KEYS.GRIND_SESSIONS, sessions);

      if (this.userDataPath) {
        await this.saveToFile(sessions);
      }

      return { success: true };
    } catch (error) {
      console.error('GrindService: Fehler beim Abbrechen der Session:', error);
      return { success: false, error: error.message };
    }
  }

  loadFromFile() {
    if (!this.sessionsFilePath || !fs.existsSync(this.sessionsFilePath)) {
      console.log('GrindService: Keine Sessions-Datei gefunden');
      return;
    }

    try {
      const fileContent = fs.readFileSync(this.sessionsFilePath, 'utf-8');
      const sessions = JSON.parse(fileContent);
      this.memorySessions = Array.isArray(sessions) ? sessions : [];
      console.log(`GrindService: ${this.memorySessions.length} Sessions aus Datei geladen:`, this.sessionsFilePath);

      this.migrateFromLocalStorage();
    } catch (error) {
      console.error('GrindService: Fehler beim Laden aus Datei:', error);
      this.memorySessions = [];
    }
  }

  async saveToFile(sessions) {
    if (!this.sessionsFilePath) return;

    try {
      fs.writeFileSync(this.sessionsFilePath, JSON.stringify(sessions, null, 2));
      this.memorySessions = sessions;
      console.log('GrindService: Sessions gespeichert:', this.sessionsFilePath);
      return true;
    } catch (error) {
      console.error('GrindService: Fehler beim Speichern in Datei:', error);
      return false;
    }
  }

  async migrateFromLocalStorage() {
    try {
      const localStorageSessions = await this.storage.get(STORAGE.KEYS.GRIND_SESSIONS);

      if (localStorageSessions && localStorageSessions.length > 0 && this.memorySessions.length === 0) {
        console.log('GrindService: Migriere Sessions von localStorage zu Dateisystem...');
        await this.saveToFile(localStorageSessions);
        console.log(`GrindService: ${localStorageSessions.length} Sessions migriert`);
      }
    } catch (error) {
      console.error('GrindService: Fehler bei Migration:', error);
    }
  }

  async createBackup() {
    if (!this.backupDir || this.memorySessions.length === 0) {
      return { success: false, error: 'Keine Daten zum Backup' };
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFilename = `grind-sessions-backup-${timestamp}.json`;
      const backupPath = path.join(this.backupDir, backupFilename);

      fs.writeFileSync(backupPath, JSON.stringify(this.memorySessions, null, 2));
      console.log('GrindService: Backup erstellt:', backupPath);

      await this.cleanOldBackups();

      return { success: true, path: backupPath };
    } catch (error) {
      console.error('GrindService: Fehler beim Erstellen des Backups:', error);
      return { success: false, error: error.message };
    }
  }

  async cleanOldBackups() {
    if (!fs.existsSync(this.backupDir)) return;

    try {
      const files = fs.readdirSync(this.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('grind-sessions-backup-') && file.endsWith('.json'))
        .map(file => ({
          filename: file,
          path: path.join(this.backupDir, file),
          time: fs.statSync(path.join(this.backupDir, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

      const filesToDelete = backupFiles.slice(GRIND.MAX_BACKUPS);

      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log('GrindService: Altes Backup gelöscht:', file.filename);
      });
    } catch (error) {
      console.error('GrindService: Fehler beim Bereinigen alter Backups:', error);
    }
  }
}

module.exports = GrindService;
