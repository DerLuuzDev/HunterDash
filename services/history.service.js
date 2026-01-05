const { STORAGE, POISSON } = require('../build-config/constants');
const fs = require('fs');
const path = require('path');

class HistoryService {
  constructor(storageService, userDataPath = null) {
    this.storage = storageService;
    this.userDataPath = userDataPath;
    this.historyFilePath = null;
    this.backupDir = null;
    this.memoryHistory = [];

    if (userDataPath) {
      this.initializeFileSystem();
    }
  }

  initializeFileSystem() {
    this.historyFilePath = path.join(this.userDataPath, STORAGE.HISTORY.FILENAME);
    this.backupDir = path.join(this.userDataPath, STORAGE.HISTORY.BACKUP_DIR);

    try {
      if (!fs.existsSync(this.userDataPath)) {
        fs.mkdirSync(this.userDataPath, { recursive: true });
      }

      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }

      this.loadFromFile();
    } catch (error) {
      console.error('HistoryService: Fehler beim Initialisieren des Dateisystems:', error);
    }
  }

  async saveToHistory(input, output, accountId = null) {
    try {
      const history = await this.getHistory();
      const entry = {
        id: Date.now().toString(),
        timestamp: output.timestamp || new Date().toISOString(),
        accountId: accountId,
        input: this.sanitizeInput(input),
        output: {
          totalL: output.totalL,
          categories: output.categories.map(c => ({
            name: c.name,
            z: c.z,
            lambda: c.lambda,
            k: c.k,
            p: c.p
          })),
          interpretation: output.interpretation
        }
      };

      history.unshift(entry);
      if (history.length > STORAGE.HISTORY.MAX_ENTRIES) {
        history.pop();
      }

      await this.storage.set(STORAGE.KEYS.CALCULATION_HISTORY, history);

      if (this.userDataPath) {
        await this.saveToFile(history);
      }

      return { success: true, id: entry.id };
    } catch (error) {
      console.error('HistoryService: Fehler beim Speichern:', error);
      return { success: false, error: error.message };
    }
  }

  async getHistory(filters = {}) {
    try {
      let history;

      if (this.userDataPath && this.memoryHistory.length > 0) {
        history = this.memoryHistory;
      } else {
        history = await this.storage.get(STORAGE.KEYS.CALCULATION_HISTORY) || [];
      }

      if (filters.accountId) {
        history = history.filter(entry => entry.accountId === filters.accountId);
      }

      if (filters.startDate || filters.endDate) {
        history = history.filter(entry => {
          const entryDate = new Date(entry.timestamp);
          if (filters.startDate && entryDate < filters.startDate) return false;
          if (filters.endDate && entryDate > filters.endDate) return false;
          return true;
        });
      }

      return history;
    } catch (error) {
      console.error('HistoryService: Fehler beim Laden:', error);
      return [];
    }
  }

  async getEntryById(id) {
    try {
      const history = await this.getHistory();
      return history.find(entry => entry.id === id) || null;
    } catch (error) {
      console.error('HistoryService: Fehler beim Suchen:', error);
      return null;
    }
  }

  async deleteEntry(id) {
    try {
      const history = await this.getHistory();
      const filtered = history.filter(entry => entry.id !== id);
      await this.storage.set(STORAGE.KEYS.CALCULATION_HISTORY, filtered);
      return { success: true };
    } catch (error) {
      console.error('HistoryService: Fehler beim Löschen:', error);
      return { success: false, error: error.message };
    }
  }

  async clearHistory() {
    try {
      await this.storage.set(STORAGE.KEYS.CALCULATION_HISTORY, []);
      return { success: true };
    } catch (error) {
      console.error('HistoryService: Fehler beim Leeren:', error);
      return { success: false, error: error.message };
    }
  }

  async getStats(accountId = null, period = 'all') {
    try {
      const history = await this.getHistory({ accountId });
      const filteredHistory = this.filterByPeriod(history, period);

      if (filteredHistory.length === 0) {
        return { success: false, error: 'Keine historischen Daten für diesen Zeitraum' };
      }

      const totalLScores = filteredHistory.map(entry => entry.output.totalL);

      return {
        success: true,
        data: {
          count: filteredHistory.length,
          totalL: {
            mean: this.calculateMean(totalLScores),
            median: this.calculateMedian(totalLScores),
            stdDev: this.calculateStdDev(totalLScores),
            min: Math.min(...totalLScores),
            max: Math.max(...totalLScores),
            trend: this.calculateTrend(totalLScores)
          },
          categories: this.calculateCategoryStatistics(filteredHistory),
          period: {
            start: filteredHistory.length > 0 ? filteredHistory[filteredHistory.length - 1].timestamp : null,
            end: filteredHistory.length > 0 ? filteredHistory[0].timestamp : null
          }
        }
      };
    } catch (error) {
      console.error('HistoryService: Fehler bei Statistik:', error);
      return { success: false, error: error.message };
    }
  }

  async formatStatsMarkdown(statsData) {
    const { count, totalL, categories, period } = statsData;
    const startDate = period.start ? new Date(period.start).toLocaleDateString('de-DE') : 'N/A';
    const endDate = period.end ? new Date(period.end).toLocaleDateString('de-DE') : 'N/A';

    let md = ` # Statistik-Report\n\n`;
    md += `**Zeitraum:** ${startDate} - ${endDate}\n`;
    md += `**Anzahl der Berechnungen:** ${count}\n\n`;

    md += ` ## Gesamtglück (Total L)\n`;
    md += `- **Durchschnitt:** ${totalL.mean.toFixed(2)}\n`;
    md += `- **Median:** ${totalL.median.toFixed(2)}\n`;
    md += `- **Min/Max:** ${totalL.min.toFixed(2)} / ${totalL.max.toFixed(2)}\n`;
    md += `- **Trend:** ${totalL.trend.direction} (${totalL.trend.slope})\n\n`;

    md += ` ## Kategorien (Z-Scores)\n`;
    md += `| Kategorie | Durchschnitt | Median | StdAbw | Min | Max |\n`;
    md += `|---|---|---|---|---|---|\n`;

    for (const key in categories) {
      const cat = categories[key];
      const catInfo = POISSON.CATEGORIES.find(c => c.key === key);
      const catName = catInfo ? catInfo.name : key;
      md += `| ${catName} | ${cat.mean.toFixed(2)} | ${cat.median.toFixed(2)} | ${cat.stdDev.toFixed(2)} | ${cat.min.toFixed(2)} | ${cat.max.toFixed(2)} |\n`;
    }

    return md;
  }


  async getTimeSeries(categoryKey = null, aggregation = 'daily', period = 'all') {
    try {
      const history = await this.getHistory();
      const filteredHistory = this.filterByPeriod(history, period);

      const series = filteredHistory.map(entry => {
        const dataPoint = {
          timestamp: entry.timestamp,
          totalL: entry.output.totalL
        };

        if (categoryKey) {
          const category = entry.output.categories.find(c =>
            c.name.toLowerCase().includes(categoryKey.toLowerCase())
          );
          if (category) {
            dataPoint.categoryZ = category.z;
            dataPoint.categoryLambda = category.lambda;
          }
        }

        return dataPoint;
      });

      return {
        success: true,
        data: {
          series,
          aggregated: this.aggregateByPeriod(series, aggregation)
        }
      };
    } catch (error) {
      console.error('HistoryService: Fehler bei Zeitreihen:', error);
      return { success: false, error: error.message };
    }
  }

  async exportToCSV() {
    try {
      const history = await this.getHistory();

      if (history.length === 0) {
        return { success: false, error: 'Keine Daten zum Exportieren' };
      }

      const headers = ['ID', 'Datum', 'Total Harvests', 'Rares (Z)', 'Diamonds (Z)', 'Super Rares (Z)', 'Great Ones (Z)', 'Total L', 'Interpretation'];
      const rows = history.map(entry => {
        const rareZ = entry.output.categories.find(c => c.name === 'Rares')?.z || 0;
        const diamondZ = entry.output.categories.find(c => c.name === 'Diamonds')?.z || 0;
        const superZ = entry.output.categories.find(c => c.name === 'Super Rares')?.z || 0;
        const goZ = entry.output.categories.find(c => c.name === 'Great Ones')?.z || 0;

        return [
          entry.id,
          new Date(entry.timestamp).toLocaleDateString('de-DE'),
          entry.input.n,
          rareZ.toFixed(2),
          diamondZ.toFixed(2),
          superZ.toFixed(2),
          goZ.toFixed(2),
          entry.output.totalL.toFixed(2),
          entry.output.interpretation
        ].join(',');
      });

      const csv = [headers.join(','), ...rows].join('\n');
      return { success: true, data: csv, filename: `hunterdash-history-${Date.now()}.csv` };
    } catch (error) {
      console.error('HistoryService: Fehler beim CSV-Export:', error);
      return { success: false, error: error.message };
    }
  }

  async exportToJSON() {
    try {
      const history = await this.getHistory();

      if (history.length === 0) {
        return { success: false, error: 'Keine Daten zum Exportieren' };
      }

      const data = {
        app: 'HunterDash',
        version: require('../build-config/constants').APP_VERSION,
        exportDate: new Date().toISOString(),
        entries: history
      };

      return { 
        success: true, 
        data: JSON.stringify(data, null, 2), 
        filename: `hunterdash-export-${Date.now()}.json` 
      };
    } catch (error) {
      console.error('HistoryService: Fehler beim JSON-Export:', error);
      return { success: false, error: error.message };
    }
  }

  sanitizeInput(data) {
    return {
      n: data.n,
      categories: POISSON.CATEGORIES.map(cat => ({
        key: cat.key,
        k: data[`k_${cat.key}`],
        p: data[`p_${cat.key}`]
      }))
    };
  }

  filterByPeriod(history, period) {
    if (period === 'all') return history;

    const now = new Date();
    const cutoff = new Date();

    switch (period) {
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoff.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return history;
    }

    return history.filter(entry => new Date(entry.timestamp) >= cutoff);
  }

  calculateMean(values) {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  calculateStdDev(values) {
    const mean = this.calculateMean(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  calculateTrend(values) {
    if (values.length < 2) return { slope: 0, direction: 'stable' };

    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = values.reduce((sum, _, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    return {
      slope: slope.toFixed(4),
      direction: slope > 0.1 ? 'improving' : slope < -0.1 ? 'declining' : 'stable'
    };
  }

  calculateCategoryStatistics(history) {
    const categories = {};
    
    POISSON.CATEGORIES.forEach(cat => {
      const zScores = history.map(entry => {
        const category = entry.output.categories.find(c => c.name === cat.name);
        return category ? category.z : 0;
      });

      categories[cat.key] = {
        mean: this.calculateMean(zScores),
        median: this.calculateMedian(zScores),
        stdDev: this.calculateStdDev(zScores),
        min: Math.min(...zScores),
        max: Math.max(...zScores)
      };
    });

    return categories;
  }

  aggregateByPeriod(series, period = 'daily') {
    const grouped = {};

    series.forEach(point => {
      const date = new Date(point.timestamp);
      let key;

      if (period === 'daily') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else if (period === 'monthly') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = date.toISOString().split('T')[0];
      }

      if (!grouped[key]) {
        grouped[key] = { timestamp: key, totalL: [], count: 0 };
      }
      grouped[key].totalL.push(point.totalL);
      grouped[key].count++;
    });

    return Object.values(grouped).map(group => ({
      timestamp: group.timestamp,
      avgL: group.totalL.reduce((a, b) => a + b, 0) / group.count,
      count: group.count
    })).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  loadFromFile() {
    if (!this.historyFilePath || !fs.existsSync(this.historyFilePath)) {
      console.log('HistoryService: Keine Historie-Datei gefunden');
      return;
    }

    try {
      const fileContent = fs.readFileSync(this.historyFilePath, 'utf-8');
      const history = JSON.parse(fileContent);
      this.memoryHistory = Array.isArray(history) ? history : [];
      console.log(`HistoryService: ${this.memoryHistory.length} Einträge aus Datei geladen:`, this.historyFilePath);

      this.migrateFromLocalStorage();
    } catch (error) {
      console.error('HistoryService: Fehler beim Laden aus Datei:', error);
      this.memoryHistory = [];
    }
  }

  async saveToFile(history) {
    if (!this.historyFilePath) return;

    try {
      fs.writeFileSync(this.historyFilePath, JSON.stringify(history, null, 2));
      this.memoryHistory = history;
      console.log('HistoryService: Historie gespeichert:', this.historyFilePath);
      return true;
    } catch (error) {
      console.error('HistoryService: Fehler beim Speichern in Datei:', error);
      return false;
    }
  }

  async migrateFromLocalStorage() {
    try {
      const localStorageHistory = await this.storage.get(STORAGE.KEYS.CALCULATION_HISTORY);

      if (localStorageHistory && localStorageHistory.length > 0 && this.memoryHistory.length === 0) {
        console.log('HistoryService: Migriere Historie von localStorage zu Dateisystem...');
        await this.saveToFile(localStorageHistory);
        console.log(`HistoryService: ${localStorageHistory.length} Einträge migriert`);
      }
    } catch (error) {
      console.error('HistoryService: Fehler bei Migration:', error);
    }
  }

  async createBackup() {
    if (!this.backupDir || this.memoryHistory.length === 0) {
      return { success: false, error: 'Keine Daten zum Backup' };
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFilename = `history-backup-${timestamp}.json`;
      const backupPath = path.join(this.backupDir, backupFilename);

      fs.writeFileSync(backupPath, JSON.stringify(this.memoryHistory, null, 2));
      console.log('HistoryService: Backup erstellt:', backupPath);

      await this.cleanOldBackups();

      return { success: true, path: backupPath };
    } catch (error) {
      console.error('HistoryService: Fehler beim Erstellen des Backups:', error);
      return { success: false, error: error.message };
    }
  }

  async cleanOldBackups() {
    if (!fs.existsSync(this.backupDir)) return;

    try {
      const files = fs.readdirSync(this.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('history-backup-') && file.endsWith('.json'))
        .map(file => ({
          filename: file,
          path: path.join(this.backupDir, file),
          time: fs.statSync(path.join(this.backupDir, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

      const filesToDelete = backupFiles.slice(STORAGE.HISTORY.MAX_BACKUPS);

      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log('HistoryService: Altes Backup gelöscht:', file.filename);
      });
    } catch (error) {
      console.error('HistoryService: Fehler beim Bereinigen alter Backups:', error);
    }
  }

  listBackups() {
    if (!fs.existsSync(this.backupDir)) {
      return { success: true, data: [] };
    }

    try {
      const files = fs.readdirSync(this.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('history-backup-') && file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            filename: file,
            path: filePath,
            size: stats.size,
            created: stats.mtime,
            entries: 0
          };
        })
        .sort((a, b) => b.created - a.created);

      backupFiles.forEach(backup => {
        try {
          const content = fs.readFileSync(backup.path, 'utf-8');
          const history = JSON.parse(content);
          backup.entries = Array.isArray(history) ? history.length : 0;
        } catch (error) {
          backup.entries = 0;
        }
      });

      return { success: true, data: backupFiles };
    } catch (error) {
      console.error('HistoryService: Fehler beim Auflisten der Backups:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async restoreBackup(backupFilename) {
    if (!fs.existsSync(this.backupDir)) {
      return { success: false, error: 'Backup-Verzeichnis nicht gefunden' };
    }

    try {
      const backupPath = path.join(this.backupDir, backupFilename);

      if (!fs.existsSync(backupPath)) {
        return { success: false, error: 'Backup-Datei nicht gefunden' };
      }

      const backupContent = fs.readFileSync(backupPath, 'utf-8');
      const history = JSON.parse(backupContent);

      if (!Array.isArray(history)) {
        return { success: false, error: 'Ungültiges Backup-Format' };
      }

      await this.saveToFile(history);
      await this.storage.set(STORAGE.KEYS.CALCULATION_HISTORY, history);

      console.log(`HistoryService: ${history.length} Einträge aus Backup wiederhergestellt:`, backupFilename);

      return { success: true, data: history };
    } catch (error) {
      console.error('HistoryService: Fehler beim Wiederherstellen des Backups:', error);
      return { success: false, error: error.message };
    }
  }
}

const historyService = new HistoryService(require('./storage.service'));

module.exports = historyService;
