const { STORAGE, POISSON } = require('../build-config/constants');

class HistoryService {
  constructor(storageService) {
    this.storage = storageService;
  }

  async saveToHistory(input, output) {
    try {
      const history = await this.getHistory();
      const entry = {
        id: Date.now().toString(),
        timestamp: output.timestamp || new Date().toISOString(),
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
      return { success: true, id: entry.id };
    } catch (error) {
      console.error('HistoryService: Fehler beim Speichern:', error);
      return { success: false, error: error.message };
    }
  }

  async getHistory(filters = {}) {
    try {
      const history = await this.storage.get(STORAGE.KEYS.CALCULATION_HISTORY) || [];

      if (filters.startDate || filters.endDate) {
        return history.filter(entry => {
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

  async getStatistics(period = 'all') {
    try {
      const history = await this.getHistory();
      const filteredHistory = this.filterByPeriod(history, period);

      if (filteredHistory.length === 0) {
        return { success: false, error: 'Keine historischen Daten' };
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
            start: filteredHistory[filteredHistory.length - 1].timestamp,
            end: filteredHistory[0].timestamp
          }
        }
      };
    } catch (error) {
      console.error('HistoryService: Fehler bei Statistik:', error);
      return { success: false, error: error.message };
    }
  }

  async getTimeSeries(categoryKey = null, aggregation = 'daily') {
    try {
      const history = await this.getHistory();

      const series = history.map(entry => {
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
}

const historyService = new HistoryService(require('./storage.service'));

module.exports = historyService;
