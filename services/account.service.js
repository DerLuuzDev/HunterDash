const { STORAGE, POISSON } = require('../build-config/constants');
const fs = require('fs');
const path = require('path');

class AccountService {
  constructor(storageService, userDataPath) {
    this.storage = storageService;
    this.userDataPath = userDataPath;
    this.accountsFilePath = path.join(userDataPath, 'accounts.json');
    this.backupDir = path.join(userDataPath, 'backups', 'accounts');
    this.backupIntervalDays = 30;

    this.ensureDirectories();
    this.loadAccountsFromFile();
  }

  ensureDirectories() {
    try {
      if (!fs.existsSync(this.userDataPath)) {
        fs.mkdirSync(this.userDataPath, { recursive: true });
      }

      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }
    } catch (error) {
      console.error('AccountService: Fehler beim Erstellen der Verzeichnisse:', error);
    }
  }

  async getAccounts() {
    return this.accounts || [];
  }

  async loadAccountsFromFile() {
    try {
      if (fs.existsSync(this.accountsFilePath)) {
        const fileContent = fs.readFileSync(this.accountsFilePath, 'utf-8');
        this.accounts = JSON.parse(fileContent);
        console.log(`AccountService: ${this.accounts.length} Accounts aus Datei geladen:`, this.accountsFilePath);
      } else {
        this.accounts = [];
        console.log('AccountService: Keine Accounts-Datei gefunden, leeres Array initialisiert');
      }
    } catch (error) {
      console.error('AccountService: Fehler beim Laden der Accounts aus Datei:', error);
      this.accounts = [];
    }
  }

  async saveAccountsToFile(createBackup = false) {
    try {
      if (createBackup) {
        await this.createBackup();
      }

      const fileContent = JSON.stringify(this.accounts, null, 2);
      fs.writeFileSync(this.accountsFilePath, fileContent, 'utf-8');
      console.log(`AccountService: ${this.accounts.length} Accounts in Datei gespeichert:`, this.accountsFilePath);
      return true;
    } catch (error) {
      console.error('AccountService: Fehler beim Speichern der Accounts in Datei:', error);
      return false;
    }
  }

  async createBackup() {
    try {
      if (!fs.existsSync(this.accountsFilePath)) {
        console.log('AccountService: Keine Accounts-Datei vorhanden, überspringe Backup');
        return;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const backupFileName = `accounts-backup-${timestamp}.json`;
      const backupPath = path.join(this.backupDir, backupFileName);

      fs.copyFileSync(this.accountsFilePath, backupPath);
      console.log(`AccountService: Backup erstellt: ${backupPath}`);

      await this.cleanOldBackups();
    } catch (error) {
      console.error('AccountService: Fehler beim Erstellen des Backups:', error);
    }
  }

  async cleanOldBackups() {
    try {
      const backupFiles = fs.readdirSync(this.backupDir);
      const maxAge = this.backupIntervalDays * 24 * 60 * 60 * 1000;
      const now = Date.now();

      backupFiles.forEach(file => {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtimeMs > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`AccountService: Altes Backup gelöscht: ${file}`);
        }
      });
    } catch (error) {
      console.error('AccountService: Fehler beim Bereinigen alter Backups:', error);
    }
  }

  async checkAndCreateAutoBackup() {
    if (!fs.existsSync(this.accountsFilePath)) {
      console.log('AccountService: Keine Accounts-Datei vorhanden, überspringe Backup');
      return;
    }

    const now = new Date();
    const lastBackupFile = path.join(this.backupDir, '.last-backup');

    try {
      if (fs.existsSync(lastBackupFile)) {
        const lastBackupTime = parseInt(fs.readFileSync(lastBackupFile, 'utf-8'));
        const daysSinceLastBackup = (now.getTime() - lastBackupTime) / (24 * 60 * 60 * 1000);

        if (daysSinceLastBackup >= this.backupIntervalDays) {
          await this.createBackup();
          fs.writeFileSync(lastBackupFile, now.getTime().toString());
          console.log('AccountService: Automatisches Backup erstellt');
        }
      } else {
        await this.createBackup();
        fs.writeFileSync(lastBackupFile, now.getTime().toString());
        console.log('AccountService: Erstes Backup erstellt');
      }
    } catch (error) {
      console.error('AccountService: Fehler beim Prüfen automatisches Backup:', error);
    }
  }

  async getAccount(id) {
    try {
      const accounts = await this.getAccounts();
      return accounts.find(a => a.id === id) || null;
    } catch (error) {
      console.error('AccountService: Fehler beim Suchen:', error);
      return null;
    }
  }

  async saveAccount(name, data) {
    try {
      const accounts = await this.getAccounts();

      const existingIndex = accounts.findIndex(a => a.name === name);

      const account = {
        id: existingIndex >= 0 ? accounts[existingIndex].id : Date.now().toString(),
        name,
        data: this.sanitizeAccountData(data),
        timestamp: new Date().toISOString(),
        lastUpdated: existingIndex >= 0 ? new Date().toISOString() : undefined
      };

      if (existingIndex >= 0) {
        accounts[existingIndex] = account;
      } else {
        accounts.push(account);
      }

      this.accounts = accounts;
      await this.saveAccountsToFile(false);

      return { success: true, data: accounts };
    } catch (error) {
      console.error('AccountService: Fehler beim Speichern:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteAccount(id) {
    try {
      const accounts = await this.getAccounts();
      const filtered = accounts.filter(a => a.id !== id);

      this.accounts = filtered;
      await this.saveAccountsToFile(false);

      return { success: true, data: filtered };
    } catch (error) {
      console.error('AccountService: Fehler beim Löschen:', error);
      return { success: false, error: error.message };
    }
  }

  async updateAccount(id, name, data) {
    try {
      const accounts = await this.getAccounts();
      const index = accounts.findIndex(a => a.id === id);

      if (index < 0) {
        return { success: false, error: 'Account nicht gefunden' };
      }

      accounts[index] = {
        ...accounts[index],
        name,
        data: this.sanitizeAccountData(data),
        lastUpdated: new Date().toISOString()
      };

      this.accounts = accounts;
      await this.saveAccountsToFile(false);

      return { success: true, data: accounts };
    } catch (error) {
      console.error('AccountService: Fehler beim Aktualisieren:', error);
      return { success: false, error: error.message };
    }
  }

  async compareAccounts(accountId1, accountId2, calculationService) {
    try {
      const accounts = await this.getAccounts();
      const acc1 = accounts.find(a => a.id === accountId1);
      const acc2 = accounts.find(a => a.id === accountId2);

      if (!acc1 || !acc2) {
        return { success: false, error: 'Ein oder beide Accounts nicht gefunden' };
      }

      // Convert sanitized account data back to flat structure for calculation service
      const flatData1 = this.convertToFlatData(acc1.data);
      const flatData2 = this.convertToFlatData(acc2.data);

      const result1 = await calculationService.calculatePoisson(flatData1);
      const result2 = await calculationService.calculatePoisson(flatData2);

      const difference = this.calculateDifference(result1, result2);

      return {
        success: true,
        data: {
          account1: {
            id: acc1.id,
            name: acc1.name,
            lastUpdated: acc1.lastUpdated || acc1.timestamp,
            result: result1
          },
          account2: {
            id: acc2.id,
            name: acc2.name,
            lastUpdated: acc2.lastUpdated || acc2.timestamp,
            result: result2
          },
          difference,
          winner: result1.totalL > result2.totalL ? 'account1' : result2.totalL > result1.totalL ? 'account2' : 'tie'
        }
      };
    } catch (error) {
      console.error('AccountService: Fehler beim Vergleich:', error);
      return { success: false, error: error.message };
    }
  }

  async getAccountStatistics(accountId, calculationService) {
    try {
      const account = await this.getAccount(accountId);
      if (!account) {
        return { success: false, error: 'Account nicht gefunden' };
      }

      // Convert sanitized account data back to flat structure for calculation service
      const flatData = this.convertToFlatData(account.data);
      const result = await calculationService.calculatePoisson(flatData);

      return {
        success: true,
        data: {
          account: {
            id: account.id,
            name: account.name,
            lastUpdated: account.lastUpdated || account.timestamp
          },
          statistics: {
            totalL: result.totalL,
            interpretation: result.interpretation,
            categories: result.categories.map(cat => ({
              name: cat.name,
              z: cat.z,
              lambda: cat.lambda,
              k: cat.k,
              p: cat.p,
              luckLabel: this.getLuckLabel(cat.z)
            }))
          }
        }
      };
    } catch (error) {
      console.error('AccountService: Fehler bei Statistik:', error);
      return { success: false, error: error.message };
    }
  }

  sanitizeAccountData(data) {
    return {
      n: data.n,
      categories: POISSON.CATEGORIES.map(cat => ({
        key: cat.key,
        k: data[`k_${cat.key}`],
        p: data[`p_${cat.key}`]
      }))
    };
  }

  convertToFlatData(sanitizedData) {
    const flatData = {
      n: sanitizedData.n
    };

    if (sanitizedData.categories && Array.isArray(sanitizedData.categories)) {
      sanitizedData.categories.forEach(cat => {
        flatData[`k_${cat.key}`] = cat.k;
        flatData[`p_${cat.key}`] = cat.p;
      });
    }

    return flatData;
  }

  calculateDifference(result1, result2) {
    const differences = {
      totalL: result1.totalL - result2.totalL,
      categories: []
    };

    result1.categories.forEach(cat1 => {
      const cat2 = result2.categories.find(c => c.name === cat1.name);
      if (cat2) {
        differences.categories.push({
          name: cat1.name,
          zDifference: cat1.z - cat2.z,
          lambdaDifference: cat1.lambda - cat2.lambda,
          kDifference: cat1.k - cat2.k
        });
      }
    });

    return differences;
  }

  getLuckLabel(z) {
    if (z >= 2) return 'Sehr glücklich';
    if (z >= 0.5) return 'Glücklich';
    if (z >= -0.5) return 'Neutral';
    if (z >= -2) return 'Unglücklich';
    return 'Sehr unglücklich';
  }

  async restoreBackup(backupFileName) {
    try {
      const backupPath = path.join(this.backupDir, backupFileName);

      if (!fs.existsSync(backupPath)) {
        return { success: false, error: 'Backup nicht gefunden' };
      }

      const backupContent = fs.readFileSync(backupPath, 'utf-8');
      const accounts = JSON.parse(backupContent);

      this.accounts = accounts;
      await this.saveAccountsToFile(false);

      return { success: true, data: accounts };
    } catch (error) {
      console.error('AccountService: Fehler beim Wiederherstellen des Backups:', error);
      return { success: false, error: error.message };
    }
  }

  async listBackups() {
    try {
      if (!fs.existsSync(this.backupDir)) {
        return { success: true, data: [] };
      }

      const backupFiles = fs.readdirSync(this.backupDir).filter(file => file.endsWith('.json') && !file.startsWith('.'));
      const backups = backupFiles.map(file => {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          fileName: file,
          filePath,
          size: stats.size,
          createdAt: stats.mtime
        };
      }).sort((a, b) => b.createdAt - a.createdAt);

      return { success: true, data: backups };
    } catch (error) {
      console.error('AccountService: Fehler beim Auflisten der Backups:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
}

let accountService = null;

module.exports = {
  getInstance: (storageService, userDataPath) => {
    if (!accountService) {
      accountService = new AccountService(storageService, userDataPath);
    }
    return accountService;
  },
  resetInstance: () => {
    accountService = null;
  }
};
