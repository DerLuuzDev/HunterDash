/**
 * GrindManager
 * 
 * Handles grind session management, simulation, and tips.
 */

const GrindManager = {
    sessionTimer: null,
    autoSaveInterval: null,
    sessionStartTime: null,
    sessionKills: 0,
    isSessionRunning: false,
    sessionName: null,
    sessionTemplate: null,
    isSessionPaused: false,
    pauseStartTime: null,
    pausedDuration: 0,
    currentSessionId: null,
    simulationChart: null,
    tips: {},
    customTips: {},
    settings: {},
    animals: [],
    templates: [],
    hotkeyListeners: {},
    openGroups: new Set(),
    // Loot Tracking
    sessionDiamonds: 0,
    sessionRares: 0,
    sessionGreatOnes: 0,
    sessionEvents: [],

    async init() {
        await this.loadSettings();
        await this.loadTips();
        await this.loadAnimals();
        await this.loadCustomTips();
        await this.loadSessions();
        await this.loadTemplates();
        this.setupTemplateDropdown();
        this.setupHotkeyListeners();
    },

    async loadSettings() {
        try {
            if (window.electronAPI && window.electronAPI.grind) {
                const response = await window.electronAPI.grind.getSettings();
                if (response.success) {
                    this.settings = response.data;
                }
            }
        } catch (error) {
            console.error('GrindManager: Fehler beim Laden der Einstellungen:', error);
        }
    },

    async loadTips() {
        try {
            if (window.electronAPI && window.electronAPI.grind) {
                const response = await window.electronAPI.grind.getTips();
                if (response.success) {
                    this.tips = response.data;
                    this.renderTips();
                }
            } else {
                this.tips = this.getFallbackTips();
                this.renderTips();
            }
        } catch (error) {
            console.error('GrindManager: Fehler beim Laden der Tipps:', error);
        }
    },

    async loadAnimals() {
        try {
            if (window.electronAPI && window.electronAPI.grind) {
                const response = await window.electronAPI.grind.getAnimals();
                if (response.success) {
                    this.animals = response.data;
                    this.renderAnimalDropdown();
                }
            }
        } catch (error) {
            console.error('GrindManager: Fehler beim Laden der Tiere:', error);
        }
    },

    async loadCustomTips() {
        try {
            if (window.electronAPI && window.electronAPI.grind) {
                const response = await window.electronAPI.grind.getCustomTips();
                if (response.success) {
                    this.customTips = response.data;
                }
            }
        } catch (error) {
            console.error('GrindManager: Fehler beim Laden der benutzerdefinierten Tipps:', error);
        }
    },

    async loadSessions() {
        try {
            if (window.electronAPI && window.electronAPI.grind) {
                const response = await window.electronAPI.grind.getSessions();
                if (response.success) {
                    this.renderSessions(response.data);
                }
            } else {
                const sessions = JSON.parse(localStorage.getItem('grind-sessions') || '[]');
                this.renderSessions(sessions);
            }
        } catch (error) {
            console.error('GrindManager: Fehler beim Laden der Sessions:', error);
        }
    },

    async loadTemplates() {
        try {
            if (window.electronAPI && window.electronAPI.grind) {
                const response = await window.electronAPI.grind.getTemplates();
                if (response.success) {
                    this.templates = response.data;
                }
            }
        } catch (error) {
            console.error('GrindManager: Fehler beim Laden der Templates:', error);
        }
    },

    setupTemplateDropdown() {
        const templateDropdown = document.getElementById('session-template');
        const animalDropdown = document.getElementById('session-animal');
        const nameInput = document.getElementById('session-name');
        const animalGroup = document.getElementById('animal-select-group');

        if (!templateDropdown || !animalDropdown || !nameInput) return;

        if (this.animals && this.animals.length > 0) {
            const lang = window.SettingsManager.settings?.language || 'de';
            animalDropdown.innerHTML = this.animals.map(animal => {
                const name = lang === 'de' && animal.nameDe ? animal.nameDe : animal.name;
                return `<option value="${animal.id}">${animal.icon} ${name}</option>`;
            }).join('');
        }

        templateDropdown.addEventListener('change', () => {
            const templateId = templateDropdown.value;

            if (templateId === 'go-tier') {
                animalGroup.style.display = 'block';
                this.updateSessionNameFromTemplate(templateId);
            } else if (templateId === 'custom') {
                animalGroup.style.display = 'none';
            } else {
                animalGroup.style.display = 'none';
                this.updateSessionNameFromTemplate(templateId);
            }
        });

        if (animalDropdown) {
            animalDropdown.addEventListener('change', () => {
                if (templateDropdown.value === 'go-tier') {
                    this.updateSessionNameFromTemplate('go-tier');
                }
            });
        }
    },

    updateSessionNameFromTemplate(templateId) {
        const nameInput = document.getElementById('session-name');
        const animalSelect = document.getElementById('session-animal');
        if (!nameInput || !animalSelect) return;

        if (templateId === 'go-tier') {
            const animal = this.animals.find(a => a.id === animalSelect.value);
            if (animal) {
                const lang = window.SettingsManager.settings?.language || 'de';
                const name = lang === 'de' && animal.nameDe ? animal.nameDe : animal.name;
                nameInput.value = `GO ${name}`;
            }
        } else if (templateId && templateId !== '') {
            const template = this.templates && this.templates.find(t => t.id === templateId);
            if (template) {
                nameInput.value = template.name;
            }
        }
    },

    setupHotkeyListeners() {
        if (window.electronAPI && window.electronAPI.onGrindHotkey) {
            if (this.hotkeyListeners.addKill) {
                window.electronAPI.removeGrindHotkeyListener('grind:add-kill', this.hotkeyListeners.addKill);
            }
            if (this.hotkeyListeners.removeKill) {
                window.electronAPI.removeGrindHotkeyListener('grind:remove-kill', this.hotkeyListeners.removeKill);
            }
            if (this.hotkeyListeners.togglePause) {
                window.electronAPI.removeGrindHotkeyListener('grind:toggle-pause', this.hotkeyListeners.togglePause);
            }
            if (this.hotkeyListeners.endSession) {
                window.electronAPI.removeGrindHotkeyListener('grind:end-session', this.hotkeyListeners.endSession);
            }
            // Remove old listeners for loot if they exist (safety check)
            if (this.hotkeyListeners.addDiamond) window.electronAPI.removeGrindHotkeyListener('grind:add-diamond', this.hotkeyListeners.addDiamond);
            if (this.hotkeyListeners.addRare) window.electronAPI.removeGrindHotkeyListener('grind:add-rare', this.hotkeyListeners.addRare);
            if (this.hotkeyListeners.addGreatOne) window.electronAPI.removeGrindHotkeyListener('grind:add-greatone', this.hotkeyListeners.addGreatOne);

            this.hotkeyListeners.addKill = () => this.addKill();
            this.hotkeyListeners.removeKill = () => this.removeKill();
            this.hotkeyListeners.togglePause = () => this.togglePause();
            this.hotkeyListeners.endSession = () => this.endSession();

            this.hotkeyListeners.addDiamond = () => this.addSpecialKill('diamond');
            this.hotkeyListeners.addRare = () => this.addSpecialKill('rare');
            this.hotkeyListeners.addGreatOne = () => this.finishGreatOneRun();

            window.electronAPI.onGrindHotkey('grind:add-kill', this.hotkeyListeners.addKill);
            window.electronAPI.onGrindHotkey('grind:remove-kill', this.hotkeyListeners.removeKill);
            window.electronAPI.onGrindHotkey('grind:toggle-pause', this.hotkeyListeners.togglePause);
            window.electronAPI.onGrindHotkey('grind:end-session', this.hotkeyListeners.endSession);

            // Listen for potential backend events
            window.electronAPI.onGrindHotkey('grind:add-diamond', this.hotkeyListeners.addDiamond);
            window.electronAPI.onGrindHotkey('grind:add-rare', this.hotkeyListeners.addRare);
            window.electronAPI.onGrindHotkey('grind:add-greatone', this.hotkeyListeners.addGreatOne);
        }

        if (this.inAppKeyHandler) {
            document.removeEventListener('keydown', this.inAppKeyHandler);
        }

        this.inAppKeyHandler = (e) => {
            if (!this.isSessionRunning) return;

            if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

            const hotkeys = window.SettingsManager.settings?.sessionHotkeys || {};
            const pressedKey = this.formatKeyEvent(e);

            console.log('Hotkey pressed:', pressedKey);

            if (pressedKey === hotkeys.addKill) {
                e.preventDefault();
                this.addKill();
            } else if (pressedKey === hotkeys.removeKill) {
                e.preventDefault();
                this.removeKill();
            } else if (pressedKey === hotkeys.togglePause) {
                e.preventDefault();
                this.togglePause();
            } else if (pressedKey === hotkeys.endSession) {
                e.preventDefault();
                this.endSession();
            } else if (pressedKey === hotkeys.addDiamond) {
                e.preventDefault();
                this.addSpecialKill('diamond');
            } else if (pressedKey === hotkeys.addRare) {
                e.preventDefault();
                this.addSpecialKill('rare');
            } else if (pressedKey === hotkeys.addGreatOne) {
                e.preventDefault();
                this.finishGreatOneRun();
            }
        };

        document.addEventListener('keydown', this.inAppKeyHandler);
    },

    formatKeyEvent(event) {
        const parts = [];
        if (event.ctrlKey || event.metaKey) parts.push('Ctrl');
        if (event.altKey) parts.push('Alt');
        if (event.shiftKey) parts.push('Shift');

        const code = event.code;

        console.log(`🔍 formatKeyEvent: Key: "${event.key}", Code: "${code}"`);

        if (code === 'Space') parts.push('Space');
        else if (code) parts.push(code);
        else parts.push(event.key || 'Unknown');

        return parts.join(' + ');
    },

    renderTips() {
        Object.keys(this.tips).forEach(key => {
            const contentDiv = document.getElementById(`tip-content-${key}`);
            if (contentDiv) {
                contentDiv.innerHTML = this.customTips[key] || this.tips[key];
            }
        });
    },

    renderAnimalDropdown() {
        const dropdown = document.getElementById('sim-animal');
        if (!dropdown) return;

        const lang = window.SettingsManager.settings?.language || 'de';
        dropdown.innerHTML = this.animals.map(animal => {
            const name = lang === 'de' && animal.nameDe ? animal.nameDe : animal.name;
            return `<option value="${animal.id}">${animal.icon} ${name} (p=${animal.spawnChance})</option>`;
        }).join('');

        dropdown.addEventListener('change', () => {
            const selectedAnimal = this.animals.find(a => a.id === dropdown.value);
            if (selectedAnimal) {
                document.getElementById('sim-spawn-chance').value = selectedAnimal.spawnChance;
            }
        });
    },

    updateAnimalDropdowns() {
        const sessionAnimal = document.getElementById('session-animal');
        if (sessionAnimal && this.animals && this.animals.length > 0) {
            const currentValue = sessionAnimal.value;
            const lang = window.SettingsManager.settings?.language || 'de';
            sessionAnimal.innerHTML = this.animals.map(animal => {
                const name = lang === 'de' && animal.nameDe ? animal.nameDe : animal.name;
                return `<option value="${animal.id}">${animal.icon} ${name}</option>`;
            }).join('');
            if (currentValue) sessionAnimal.value = currentValue;

            const templateDropdown = document.getElementById('session-template');
            if (templateDropdown && templateDropdown.value === 'go-tier') {
                this.updateSessionNameFromTemplate('go-tier');
            }
        }

        const simAnimal = document.getElementById('sim-animal');
        if (simAnimal && this.animals && this.animals.length > 0) {
            const currentValue = simAnimal.value;
            const lang = window.SettingsManager.settings?.language || 'de';
            simAnimal.innerHTML = this.animals.map(animal => {
                const name = lang === 'de' && animal.nameDe ? animal.nameDe : animal.name;
                return `<option value="${animal.id}">${animal.icon} ${name} (p=${animal.spawnChance})</option>`;
            }).join('');
            if (currentValue) simAnimal.value = currentValue;
        }
    },

    renderSessions(sessions) {
        const listContainer = document.getElementById('grindSessionsList');
        if (!listContainer) return;

        if (sessions.length === 0) {
            listContainer.innerHTML = '<p class="note" style="text-align: center; padding: 20px;">Keine Sessions vorhanden</p>';
            return;
        }

        const groups = {};
        sessions.forEach(session => {
            const name = session.name || 'Unbenannt';
            if (!groups[name]) {
                groups[name] = [];
            }
            groups[name].push(session);
        });

        let html = '';
        Object.entries(groups).forEach(([name, groupSessions]) => {
            // Sort Ascending to assign Run Numbers
            groupSessions.sort((a, b) => a.timestamp - b.timestamp);
            groupSessions.forEach((s, index) => s.runNumber = index + 1);

            // Sort Descending for Display
            groupSessions.sort((a, b) => b.timestamp - a.timestamp);

            const totalKills = groupSessions.reduce((sum, s) => sum + (s.kills || 0), 0);
            const totalDuration = groupSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
            const avgKph = totalDuration > 0 ? (totalKills / (totalDuration / 3600000)) : 0;
            const hasActive = groupSessions.some(s => s.status === 'running' || s.status === 'paused');

            // Calculate Loot Totals
            const totalDiamonds = groupSessions.reduce((sum, s) => sum + (s.diamonds || 0), 0);
            const totalRares = groupSessions.reduce((sum, s) => sum + (s.rares || 0), 0);
            const totalGOs = groupSessions.reduce((sum, s) => sum + (s.greatOnes || 0), 0);

            let lootSummary = '';
            const lootParts = [];
            if (totalDiamonds > 0) lootParts.push(`<span class="loot-badge diamond">💎 ${totalDiamonds}</span>`);
            if (totalRares > 0) lootParts.push(`<span class="loot-badge rare">✨ ${totalRares}</span>`);
            if (totalGOs > 0) lootParts.push(`<span class="loot-badge greatone">🔥 ${totalGOs}</span>`);
            if (lootParts.length > 0) lootSummary = `<div class="grind-session-loot-summary">${lootParts.join('')}</div>`;

            // Always render as group
            html += `
                <div class="grind-session-group">
                    <div class="grind-session-group-header" onclick="GrindManager.toggleGroup('${name}')">
                        <div class="grind-session-info">
                            <div class="grind-session-name">
                                🏆 ${name} (${groupSessions.length} Runs)
                                ${hasActive ? '<span class="status-badge running">🟢 Aktiv</span>' : ''}
                            </div>
                            <div class="grind-session-stats" style="font-weight: bold; color: var(--primary-dark);">
                                Gesamt: ${totalKills} Kills in ${this.formatDuration(totalDuration)}
                            </div>
                            ${lootSummary}
                        </div>
                        <div class="grind-session-actions">
                            <button class="action-button" onclick="event.stopPropagation(); GrindManager.continueGroup('${name}')">
                                ▶️ Fortsetzen
                            </button>
                            <span class="toggle-icon">▼</span>
                        </div>
                    </div>
                    <div class="grind-session-group-details" id="group-${name.replace(/\s+/g, '-')}" style="display: ${this.openGroups.has(name) ? 'block' : 'none'};">
                        ${groupSessions.map(session => this.renderSingleSession(session, true)).join('')}
                    </div>
                </div>
            `;
        });

        listContainer.innerHTML = html;
    },

    renderSingleSession(session, isNested = false) {
        // Loot Summary for Single Session
        let lootHtml = '';
        const lootParts = [];
        if (session.diamonds > 0) lootParts.push(`<span class="loot-badge diamond small">💎 ${session.diamonds}</span>`);
        if (session.rares > 0) lootParts.push(`<span class="loot-badge rare small">✨ ${session.rares}</span>`);
        if (session.greatOnes > 0) lootParts.push(`<span class="loot-badge greatone small">🔥 ${session.greatOnes}</span>`);
        if (lootParts.length > 0) lootHtml = `<div class="grind-session-loot">${lootParts.join('')}</div>`;

        const displayName = session.runNumber ? `Run #${session.runNumber}` : (session.name || 'Unbenannt');

        return `
            <div class="grind-session-item ${session.status || ''} ${isNested ? 'nested' : ''}">
                <div class="grind-session-info">
                    <div class="grind-session-name">
                        ${displayName}
                        ${this.getStatusBadge(session.status)}
                    </div>
                    <div class="grind-session-date">${new Date(session.timestamp).toLocaleString('de-DE')}</div>
                    <div class="grind-session-stats">
                        ${session.kills} Kills in ${this.formatDuration(session.duration)} (${(session.kph || 0).toFixed(1)} K/h)
                    </div>
                    ${lootHtml}
                </div>
                <div class="grind-session-actions">
                    ${session.status === 'paused' ? `
                        <button class="action-button" style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);" onclick="GrindManager.resumeSession('${session.id}')">
                            ▶️
                        </button>
                    ` : ''}
                    <button class="action-button secondary" onclick="GrindManager.deleteSession('${session.id}')">🗑️</button>
                </div>
            </div>
        `;
    },

    toggleGroup(name) {
        const details = document.getElementById(`group-${name.replace(/\s+/g, '-')}`);
        if (details) {
            const isHidden = details.style.display === 'none';
            details.style.display = isHidden ? 'block' : 'none';

            if (isHidden) {
                this.openGroups.add(name);
            } else {
                this.openGroups.delete(name);
            }
        }
    },

    async continueGroup(name) {
        this.switchSubTab('timer');

        // Try to find animal by name and select it
        if (this.animals) {
            const animal = this.animals.find(a =>
                a.name === name ||
                (a.nameDe && a.nameDe === name) ||
                a.id === name
            );

            if (animal) {
                const animalSelect = document.getElementById('session-animal');
                if (animalSelect) {
                    animalSelect.value = animal.id;
                }
            }
        }

        // Fallback or explicit name set
        const nameInput = document.getElementById('session-name');
        if (nameInput) nameInput.value = name;

        setTimeout(async () => {
            await this.startSession();
        }, 100);

        window.ToastManager.show(`Session "${name}" wird fortgesetzt...`, 'info');
    },

    getStatusBadge(status) {
        if (!status || status === 'completed') return '';

        const statusLabels = {
            running: '🟢 Läuft',
            paused: '⏸️ Pausiert',
            cancelled: '❌ Abgebrochen'
        };

        return `<span class="status-badge ${status}">${statusLabels[status] || status}</span>`;
    },

    showSessionConflictDialog(name, session, statusText) {
        return new Promise((resolve) => {
            const message =
                `Eine Session "${name}" ist bereits ${statusText}.\n\n` +
                `Kills: ${session.kills || 0}\n` +
                `Status: ${statusText}\n\n` +
                `[OK] = Session fortsetzen\n` +
                `[Abbrechen] = Anderen Namen wählen`;

            if (confirm(message)) {
                resolve('continue');
            } else {
                resolve('rename');
            }
        });
    },

    getFallbackTips() {
        return {
            general: `
                <p><strong>📖 ${window.TranslationManager.t('tipsBasics')}:</strong></p>
                <p>${window.TranslationManager.t('tipsRespawnDesc')}</p>
                <ul>
                    <li><strong>${window.TranslationManager.t('tipsRespawnTime')}:</strong> ${window.TranslationManager.t('tipsRespawnDesc')}</li>
                    <li><strong>${window.TranslationManager.t('tipsQuality')}:</strong> ${window.TranslationManager.t('tipsQualityDesc')}</li>
                    <li><strong>${window.TranslationManager.t('tipsHighOnly')}:</strong> ${window.TranslationManager.t('tipsHighOnlyDesc')}</li>
                </ul>
                <p><strong>💡 ${window.TranslationManager.t('tipsProTip')}:</strong> ${window.TranslationManager.t('tipsProTipDesc')}</p>
            `
        };
    },

    toggleTip(key) {
        const tipElement = document.querySelector(`[data-tip="${key}"]`);
        if (tipElement) {
            tipElement.classList.toggle('open');
        }
    },

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },

    async startSession() {
        const animalSelect = document.getElementById('session-animal');
        const animalId = animalSelect ? animalSelect.value : '';
        let name = '';

        if (animalId && this.animals) {
            const animal = this.animals.find(a => a.id === animalId);
            const lang = window.SettingsManager?.settings?.language || 'de';
            name = animal ? (lang === 'de' && animal.nameDe ? animal.nameDe : animal.name) : animalId;
        } else {
            // Fallback or legacy name input
            const nameInput = document.getElementById('session-name');
            if (nameInput) name = nameInput.value.trim();
        }

        // Auto-fill hidden name input for compatibility
        const nameInput = document.getElementById('session-name');
        if (nameInput) nameInput.value = name;

        const templateId = document.getElementById('session-template').value;

        if (!name) {
            window.ToastManager.show('Bitte wähle ein Tier aus', 'error');
            return;
        }

        if (window.electronAPI && window.electronAPI.grind) {
            const existingResponse = await window.electronAPI.grind.getActiveSession(name);

            if (existingResponse.success && existingResponse.data) {
                const session = existingResponse.data;
                const statusText = session.status === 'paused' ? 'pausiert' : 'aktiv';
                const choice = await this.showSessionConflictDialog(name, session, statusText);

                if (choice === 'continue') {
                    await this.resumeSession(session.id);
                    return;
                } else {
                    document.getElementById('session-name').focus();
                    document.getElementById('session-name').select();
                    window.ToastManager.show('Bitte wähle einen anderen Namen', 'info');
                    return;
                }
            }
        }

        this.sessionName = name;
        this.sessionTemplate = templateId;
        this.currentSessionId = Date.now().toString();
        this.sessionStartTime = Date.now();
        this.sessionKills = 0;
        this.isSessionRunning = true;
        this.isSessionPaused = false;
        this.pausedDuration = 0;
        // Initialize loot tracking
        this.sessionDiamonds = 0;
        this.sessionRares = 0;
        this.sessionGreatOnes = 0;
        this.sessionEvents = [];

        const initialSession = {
            id: this.currentSessionId,
            name: this.sessionName,
            status: 'running',
            templateId: this.sessionTemplate,
            timestamp: this.sessionStartTime,
            kills: this.sessionKills,
            duration: 0,
            kph: 0,
            pausedDuration: 0
        };
        await this.saveSession(initialSession);

        document.getElementById('session-duration').textContent = '00:00:00';
        document.getElementById('session-kills').textContent = '0';
        document.getElementById('session-kph').textContent = '0.0';

        document.getElementById('session-start-container').style.display = 'none';
        document.getElementById('session-controls-active').style.display = 'flex';

        this.sessionTimer = setInterval(() => this.updateTimer(), 1000);

        this.autoSaveInterval = setInterval(async () => {
            if (this.isSessionRunning && !this.isSessionPaused) {
                await this.autoSaveSession();
            }
        }, 30000);

        if (window.electronAPI && window.electronAPI.grind) {
            await window.electronAPI.grind.registerHotkeys();
        }

        window.ToastManager.show(`Session "${name}" gestartet!`, 'success');
    },

    addKill() {
        if (!this.isSessionRunning || this.isSessionPaused) return;

        this.sessionKills++;
        document.getElementById('session-kills').textContent = this.sessionKills;

        this.playKillAudio();
        this.updateKPH();

        window.ToastManager.show(window.TranslationManager.t('toastKillAdded'), 'info');
    },

    removeKill() {
        if (!this.isSessionRunning || this.isSessionPaused) return;

        this.sessionKills = Math.max(0, this.sessionKills - 1);
        document.getElementById('session-kills').textContent = this.sessionKills;

        this.playRemoveKillAudio();
        this.updateKPH();
        window.ToastManager.show(window.TranslationManager.t('toastKillRemoved'), 'info');
    },

    addBulkKills(amount) {
        if (!this.isSessionRunning || this.isSessionPaused) return;

        const parsedAmount = parseInt(amount, 10);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            window.ToastManager.show('Bitte gib eine gültige Anzahl ein', 'error');
            return;
        }

        this.sessionKills += parsedAmount;
        document.getElementById('session-kills').textContent = this.sessionKills;

        this.playKillAudio();
        this.updateKPH();

        window.ToastManager.show(`+${parsedAmount} Kills hinzugefügt`, 'success');

        // Clear the input
        const bulkInput = document.getElementById('bulk-kill-input');
        if (bulkInput) bulkInput.value = '';
    },

    addSpecialKill(type) {
        if (!this.isSessionRunning || this.isSessionPaused) return;

        // Add kill count
        this.sessionKills++;
        document.getElementById('session-kills').textContent = this.sessionKills;

        // Track special loot
        const typeLabels = {
            diamond: { counter: 'sessionDiamonds', icon: '💎', label: 'Diamond' },
            rare: { counter: 'sessionRares', icon: '✨', label: 'Rare' },
            greatone: { counter: 'sessionGreatOnes', icon: '🔥', label: 'Great One' }
        };

        const lootType = typeLabels[type];
        if (lootType) {
            this[lootType.counter]++;

            // Log event
            this.sessionEvents.push({
                timestamp: Date.now(),
                type: type,
                killNumber: this.sessionKills
            });

            window.ToastManager.show(`${lootType.icon} ${lootType.label} gefunden!`, 'success');
        }

        this.playSpecialKillAudio();
        this.updateKPH();
        this.updateLootDisplay();
    },

    updateLootDisplay() {
        const lootDisplay = document.getElementById('session-loot-display');
        if (!lootDisplay) return;

        const parts = [];
        if (this.sessionDiamonds > 0) parts.push(`💎 ${this.sessionDiamonds}`);
        if (this.sessionRares > 0) parts.push(`✨ ${this.sessionRares}`);
        if (this.sessionGreatOnes > 0) parts.push(`🔥 ${this.sessionGreatOnes}`);

        lootDisplay.textContent = parts.length > 0 ? parts.join(' | ') : '—';
        lootDisplay.style.display = parts.length > 0 ? 'block' : 'none';
    },

    playSpecialKillAudio() {
        try {
            const settings = window.SettingsManager.settings || {};
            if (settings.audioFeedback && settings.audioVolume > 0) {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                // Higher pitch for special kills
                oscillator.frequency.value = 1200;
                oscillator.type = 'sine';

                const volume = settings.audioVolume || 0.5;
                gainNode.gain.setValueAtTime(volume * 0.4, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.25);
            }
        } catch (error) {
            console.error('Fehler beim Abspielen des Special-Kill Audio-Signals:', error);
        }
    },

    playKillAudio() {
        try {
            const settings = window.SettingsManager.settings || {};
            if (settings.audioFeedback && settings.audioVolume > 0) {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = 880;
                oscillator.type = 'sine';

                const volume = settings.audioVolume || 0.5;
                gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.15);
            }
        } catch (error) {
            console.error('Fehler beim Abspielen des Audio-Signals:', error);
        }
    },

    playRemoveKillAudio() {
        try {
            const settings = window.SettingsManager.settings || {};
            if (settings.audioFeedback && settings.audioVolume > 0) {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = 440;
                oscillator.type = 'sine';

                const volume = settings.audioVolume || 0.5;
                gainNode.gain.setValueAtTime(volume * 0.25, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.12);
            }
        } catch (error) {
            console.error('Fehler beim Abspielen des Remove-Kill Audio-Signals:', error);
        }
    },

    updateTimer() {
        if (!this.sessionStartTime) return;

        const elapsed = Date.now() - this.sessionStartTime - this.pausedDuration;
        document.getElementById('session-duration').textContent = this.formatDuration(elapsed);

        this.updateKPH();
    },

    updateKPH() {
        const elapsed = Date.now() - this.sessionStartTime - this.pausedDuration;
        const hours = elapsed / (1000 * 60 * 60);
        const kph = hours > 0 ? (this.sessionKills / hours) : 0;
        document.getElementById('session-kph').textContent = kph.toFixed(1);
    },

    async autoSaveSession() {
        if (!this.isSessionRunning || !this.currentSessionId) return;

        const duration = Date.now() - this.sessionStartTime - this.pausedDuration;
        const hours = duration / (1000 * 60 * 60);
        const kph = hours > 0 ? (this.sessionKills / hours) : 0;

        const session = {
            id: this.currentSessionId,
            name: this.sessionName,
            status: this.isSessionPaused ? 'paused' : 'running',
            templateId: this.sessionTemplate,
            timestamp: this.sessionStartTime,
            kills: this.sessionKills,
            duration: duration,
            kph: kph,
            pausedDuration: this.pausedDuration,
            // Loot Data
            diamonds: this.sessionDiamonds,
            rares: this.sessionRares,
            greatOnes: this.sessionGreatOnes,
            events: this.sessionEvents
        };

        await this.saveSession(session);
    },

    async endSession() {
        if (!this.isSessionRunning) return;

        clearInterval(this.sessionTimer);
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }

        const duration = Date.now() - this.sessionStartTime - this.pausedDuration;
        const hours = duration / (1000 * 60 * 60);
        const kph = hours > 0 ? (this.sessionKills / hours) : 0;

        const session = {
            id: this.currentSessionId || Date.now().toString(),
            name: this.sessionName,
            status: 'completed',
            templateId: this.sessionTemplate,
            timestamp: Date.now(),
            kills: this.sessionKills,
            duration: duration,
            kph: kph,
            pausedDuration: this.pausedDuration,
            // Loot Data
            diamonds: this.sessionDiamonds,
            rares: this.sessionRares,
            greatOnes: this.sessionGreatOnes,
            events: this.sessionEvents
        };

        await this.saveSession(session);

        if (window.electronAPI && window.electronAPI.grind) {
            await window.electronAPI.grind.unregisterHotkeys();
        }

        this.isSessionRunning = false;
        this.sessionStartTime = null;
        this.sessionKills = 0;
        this.sessionName = null;
        this.sessionTemplate = null;
        this.currentSessionId = null;
        this.isSessionPaused = false;
        this.pauseStartTime = null;
        this.pausedDuration = 0;

        // Reset loot
        this.sessionDiamonds = 0;
        this.sessionRares = 0;
        this.sessionGreatOnes = 0;
        this.sessionEvents = [];
        this.updateLootDisplay();

        document.getElementById('session-start-container').style.display = 'block';
        document.getElementById('session-controls-active').style.display = 'none';

        document.getElementById('last-session').textContent =
            `${session.kills} Kills in ${this.formatDuration(session.duration)}`;

        document.getElementById('session-info').style.display = 'block';

        window.ToastManager.show(`Session beendet: ${session.kills} Kills`, 'success');
    },

    async togglePause() {
        if (this.isSessionPaused) {
            await this.resumeSession();
        } else {
            await this.pauseSession();
        }
    },

    async pauseSession() {
        if (!this.isSessionRunning || this.isSessionPaused) return;

        this.isSessionPaused = true;
        this.pauseStartTime = Date.now();
        clearInterval(this.sessionTimer);

        await this.autoSaveSession();

        if (window.electronAPI && window.electronAPI.grind && this.currentSessionId) {
            await window.electronAPI.grind.pauseSession(this.currentSessionId);
        }

        const btnPause = document.getElementById('btn-pause-session');
        const resumeText = window.TranslationManager.t('grindResume');
        btnPause.textContent = '▶️ ' + resumeText;
        btnPause.setAttribute('data-i18n', 'grindResume');
        window.ToastManager.show(window.TranslationManager.t('toastSessionPaused'), 'info');
    },

    async resumeSession(sessionId = null) {
        if (sessionId) {
            const response = await window.electronAPI.grind.getSessions();
            if (response.success) {
                const session = response.data.find(s => s.id === sessionId);
                if (session) {
                    this.currentSessionId = session.id;
                    this.sessionName = session.name;
                    this.sessionTemplate = session.templateId;
                    this.sessionKills = session.kills;
                    this.pausedDuration = session.pausedDuration || 0;

                    // Load Loot Data
                    this.sessionDiamonds = session.diamonds || 0;
                    this.sessionRares = session.rares || 0;
                    this.sessionGreatOnes = session.greatOnes || 0;
                    this.sessionEvents = session.events || [];

                    if (session.timestamp) {
                        this.sessionStartTime = session.timestamp;
                    } else {
                        const estimatedStartTime = Date.now() - (session.duration || 0) - this.pausedDuration;
                        this.sessionStartTime = estimatedStartTime;
                    }
                }
            }
        } else {
            if (this.pauseStartTime && !this.sessionStartTime) {
                const estimatedElapsed = this.pausedDuration || 0;
                this.sessionStartTime = Date.now() - estimatedElapsed;
            }
        }

        if (this.pauseStartTime) {
            this.pausedDuration += Date.now() - this.pauseStartTime;
            this.pauseStartTime = null;
        }

        this.isSessionPaused = false;
        this.isSessionRunning = true;

        this.sessionTimer = setInterval(() => this.updateTimer(), 1000);

        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        this.autoSaveInterval = setInterval(async () => {
            if (this.isSessionRunning && !this.isSessionPaused) {
                await this.autoSaveSession();
            }
        }, 30000);

        document.getElementById('session-duration').textContent = this.formatDuration(
            Date.now() - this.sessionStartTime - this.pausedDuration
        );
        document.getElementById('session-kills').textContent = this.sessionKills;
        this.updateKPH();
        this.updateLootDisplay();

        document.getElementById('session-start-container').style.display = 'none';
        document.getElementById('session-controls-active').style.display = 'flex';
        const btnPause = document.getElementById('btn-pause-session');
        const pauseText = window.TranslationManager.t('grindPause');
        btnPause.textContent = '⏸️ ' + pauseText;
        btnPause.setAttribute('data-i18n', 'grindPause');

        if (window.electronAPI && window.electronAPI.grind && this.currentSessionId) {
            await window.electronAPI.grind.resumeSession(this.currentSessionId);
            await window.electronAPI.grind.registerHotkeys();
        }

        const msg = window.TranslationManager.t('toastSessionResumed') + ': ' + this.sessionName;
        window.ToastManager.show(msg, 'success');
    },

    async saveSession(session) {
        try {
            if (window.electronAPI && window.electronAPI.grind) {
                await window.electronAPI.grind.saveSession(session);
                await this.loadSessions();
            } else {
                const sessions = JSON.parse(localStorage.getItem('grind-sessions') || '[]');
                const existingIndex = sessions.findIndex(s => s.id === session.id);

                if (existingIndex !== -1) {
                    sessions[existingIndex] = session;
                } else {
                    sessions.push(session);
                }
                localStorage.setItem('grind-sessions', JSON.stringify(sessions));
                this.renderSessions(sessions);
            }
        } catch (error) {
            console.error('GrindManager: Fehler beim Speichern der Session:', error);
            if (session.status === 'completed') {
                window.ToastManager.show('Fehler beim Speichern der Session', 'error');
            }
        }
    },

    async deleteSession(id) {
        try {
            if (window.electronAPI && window.electronAPI.grind) {
                await window.electronAPI.grind.deleteSession(id);
                await this.loadSessions();
            } else {
                const sessions = JSON.parse(localStorage.getItem('grind-sessions') || '[]');
                const filtered = sessions.filter(s => s.id !== id);
                localStorage.setItem('grind-sessions', JSON.stringify(filtered));
                this.renderSessions(filtered);
            }
            window.ToastManager.show('Session gelöscht', 'info');
        } catch (error) {
            console.error('GrindManager: Fehler beim Löschen der Session:', error);
            window.ToastManager.show('Fehler beim Löschen der Session', 'error');
        }
    },

    async finishGreatOneRun() {
        if (!this.isSessionRunning || this.isSessionPaused) return;

        // Log the Great One
        this.addSpecialKill('greatone');

        // Optional: Short delay for effect
        await new Promise(resolve => setTimeout(resolve, 1500));

        // End the session
        await this.endSession();

        window.ToastManager.show('🏆 Great One Run erfolgreich beendet!', 'success');

        // Return to overview (optional, or stay on timer but inactive)
        // this.switchSubTab('sessions');
    },

    async clearSessions() {
        if (!confirm('Möchtest du wirklich alle Sessions löschen?')) return;

        try {
            if (window.electronAPI && window.electronAPI.grind) {
                await window.electronAPI.grind.clearSessions();
            } else {
                localStorage.setItem('grind-sessions', JSON.stringify([]));
            }
            await this.loadSessions();
            window.ToastManager.show('Alle Sessions gelöscht', 'success');
        } catch (error) {
            console.error('GrindManager: Fehler beim Löschen der Sessions:', error);
            window.ToastManager.show('Fehler beim Löschen der Sessions', 'error');
        }
    },

    async exportSessions() {
        try {
            let sessions = [];

            if (window.electronAPI && window.electronAPI.grind) {
                const response = await window.electronAPI.grind.getSessions();
                if (response.success) {
                    sessions = response.data || [];
                } else {
                    throw new Error(response.error || 'Fehler beim Laden der Sessions');
                }
            } else {
                sessions = JSON.parse(localStorage.getItem('grind-sessions') || '[]');
            }

            if (sessions.length === 0) {
                window.ToastManager.show('Keine Sessions zum Exportieren vorhanden', 'info');
                return;
            }

            const BOM = '\uFEFF';
            const header = 'Name,Datum,Status,Kills,Dauer (Sekunden),Dauer (Format),K/h';
            const rows = sessions.map(s => {
                const durationSec = Math.round((s.duration || 0) / 1000);
                const hours = Math.floor(durationSec / 3600);
                const minutes = Math.floor((durationSec % 3600) / 60);
                const secs = durationSec % 60;
                const durationFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                const kph = s.kph ? s.kph.toFixed(2) : '0.00';
                const date = new Date(s.timestamp).toLocaleString('de-DE');
                const status = s.status || 'unknown';
                const name = (s.name || 'Unnamed').replace(/,/g, ';');

                return `${name},${date},${status},${s.kills || 0},${durationSec},${durationFormatted},${kph}`;
            });

            const csv = BOM + header + '\n' + rows.join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `grind-sessions-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            window.ToastManager.show(`${sessions.length} Sessions exportiert`, 'success');
        } catch (error) {
            console.error('GrindManager: Fehler beim Export:', error);
            window.ToastManager.show('Fehler beim Export: ' + error.message, 'error');
        }
    },

    async simulate() {
        try {
            const animalId = document.getElementById('sim-animal').value;
            const currentKills = parseFloat(document.getElementById('sim-current-kills').value) || 0;
            const spawnChance = parseFloat(document.getElementById('sim-spawn-chance').value);
            const confidence = parseFloat(document.getElementById('sim-confidence').value);

            if (!window.electronAPI || !window.electronAPI.grind) {
                window.ToastManager.show('Nur im Electron-Modus verfügbar', 'error');
                return;
            }

            const response = await window.electronAPI.grind.simulate({
                animalId,
                currentKills,
                spawnChance,
                confidence
            });

            if (response.success) {
                this.displaySimulationResult(response.data);
                window.ToastManager.show('Simulation abgeschlossen', 'success');
            }
        } catch (error) {
            console.error('GrindManager: Fehler bei Simulation:', error);
            window.ToastManager.show('Fehler bei Simulation', 'error');
        }
    },

    displaySimulationResult(result) {
        document.getElementById('sim-expected').textContent = result.expected.toFixed(0);
        document.getElementById('sim-min').textContent = result.min.toFixed(0);
        document.getElementById('sim-max').textContent = result.max.toFixed(0);
        document.getElementById('sim-probability').textContent = (result.currentProbability * 100).toFixed(4) + '%';

        const resultDiv = document.getElementById('simulation-result');
        resultDiv.style.display = 'block';

        if (result.data && result.data.length > 0) {
            const chartContainer = document.getElementById('sim-chart-container');
            chartContainer.style.display = 'block';

            if (this.simulationChart) {
                this.simulationChart.destroy();
            }

            const ctx = document.getElementById('simulation-chart').getContext('2d');
            this.simulationChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: result.data.map(d => d.kills),
                    datasets: [{
                        label: 'Wahrscheinlichkeit',
                        data: result.data.map(d => d.probability),
                        backgroundColor: 'rgba(26, 95, 42, 0.6)',
                        borderColor: '#1a5f2a',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Wahrscheinlichkeit'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Kills'
                            }
                        }
                    }
                }
            });
        }
    },

    switchSubTab(subtabName) {
        document.querySelectorAll('.grind-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.subtab === subtabName);
        });

        document.querySelectorAll('.grind-subtab-content').forEach(content => {
            content.classList.toggle('active', content.id === `subtab-${subtabName}`);
        });
    }
};

// Expose globally for compatibility
window.GrindManager = GrindManager;
