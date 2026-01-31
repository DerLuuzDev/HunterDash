/**
 * SyncService
 * 
 * Handles synchronization of animal data from external sources (Wiki).
 * Integrates with scripts/sync-wiki-data.js for actual data fetching.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class SyncService {
    constructor() {
        this.status = 'idle'; // idle, syncing, success, error
        this.lastSync = null;
        this.lastError = null;
        this.animalDataPath = path.join(__dirname, '..', 'build-config', 'animal-data.json');
    }

    /**
     * Get current sync status
     */
    getStatus() {
        return {
            status: this.status,
            lastSync: this.lastSync,
            lastError: this.lastError
        };
    }

    /**
     * Check if animal data file exists and get its modification time
     */
    async checkForUpdates() {
        try {
            const stats = fs.statSync(this.animalDataPath);
            return {
                success: true,
                lastModified: stats.mtime,
                exists: true
            };
        } catch (error) {
            return {
                success: false,
                exists: false,
                error: error.message
            };
        }
    }

    /**
     * Run the wiki sync script
     * @param {Object} options - Sync options
     * @param {string} options.animal - Single animal ID to sync (optional)
     * @param {boolean} options.dryRun - If true, don't save changes
     */
    async syncAnimalData(options = {}) {
        return new Promise((resolve, reject) => {
            this.status = 'syncing';
            this.lastError = null;

            const scriptPath = path.join(__dirname, '..', 'scripts', 'sync-wiki-data.js');
            const args = [];

            if (options.dryRun) args.push('--dry-run');
            if (options.animal) args.push('--animal', options.animal);

            const child = spawn('node', [scriptPath, ...args], {
                cwd: path.join(__dirname, '..'),
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                if (code === 0) {
                    this.status = 'success';
                    this.lastSync = new Date();
                    resolve({
                        success: true,
                        output: stdout,
                        updatedAt: this.lastSync
                    });
                } else {
                    this.status = 'error';
                    this.lastError = stderr || `Process exited with code ${code}`;
                    resolve({
                        success: false,
                        error: this.lastError,
                        output: stdout
                    });
                }
            });

            child.on('error', (error) => {
                this.status = 'error';
                this.lastError = error.message;
                reject({
                    success: false,
                    error: error.message
                });
            });
        });
    }

    /**
     * Reload animal data from file (for runtime updates without restart)
     */
    async reloadAnimalData() {
        try {
            // Clear require cache to force reload
            delete require.cache[require.resolve(this.animalDataPath)];
            const data = require(this.animalDataPath);
            return {
                success: true,
                data: data,
                reloadedAt: new Date()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

const syncService = new SyncService();
module.exports = syncService;
