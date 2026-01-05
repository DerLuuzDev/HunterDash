const { GRIND, STORAGE } = require('../build-config/constants');

class GrindService {
  constructor(storageService) {
    this.storage = storageService;
    this.customTips = {};
    this.settings = GRIND.DEFAULT_SETTINGS;
  }

  async getSettings() {
    try {
      const storedSettings = await this.storage.get(STORAGE.KEYS.GRIND_SETTINGS);
      if (storedSettings) {
        this.settings = { ...GRIND.DEFAULT_SETTINGS, ...storedSettings };
      }
      return { success: true, data: this.settings };
    } catch (error) {
      console.error('GrindService: Fehler beim Laden der Einstellungen:', error);
      return { success: false, error: error.message };
    }
  }

  async saveSettings(settings) {
    try {
      const mergedSettings = { ...this.settings, ...settings };
      this.settings = mergedSettings;
      await this.storage.set(STORAGE.KEYS.GRIND_SETTINGS, mergedSettings);
      return { success: true };
    } catch (error) {
      console.error('GrindService: Fehler beim Speichern der Einstellungen:', error);
      return { success: false, error: error.message };
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
      const sessions = await this.storage.get(STORAGE.KEYS.GRIND_SESSIONS) || [];
      sessions.unshift(session);
      if (sessions.length > GRIND.MAX_SESSIONS) {
        sessions.pop();
      }
      await this.storage.set(STORAGE.KEYS.GRIND_SESSIONS, sessions);
      return { success: true };
    } catch (error) {
      console.error('GrindService: Fehler beim Speichern der Session:', error);
      return { success: false, error: error.message };
    }
  }

  async getSessions() {
    try {
      const sessions = await this.storage.get(STORAGE.KEYS.GRIND_SESSIONS) || [];
      return { success: true, data: sessions };
    } catch (error) {
      console.error('GrindService: Fehler beim Laden der Sessions:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async deleteSession(sessionId) {
    try {
      const sessions = await this.storage.get(STORAGE.KEYS.GRIND_SESSIONS) || [];
      const filtered = sessions.filter(s => s.id !== sessionId);
      await this.storage.set(STORAGE.KEYS.GRIND_SESSIONS, filtered);
      return { success: true };
    } catch (error) {
      console.error('GrindService: Fehler beim Löschen der Session:', error);
      return { success: false, error: error.message };
    }
  }

  async clearSessions() {
    try {
      await this.storage.set(STORAGE.KEYS.GRIND_SESSIONS, []);
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
}

module.exports = GrindService;
