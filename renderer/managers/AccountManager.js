/**
 * AccountManager
 * 
 * Handles account CRUD operations, comparison, and sub-tab navigation.
 */

const AccountManager = {
    accounts: [],

    switchSubTab(subtabName) {
        document.querySelectorAll('.account-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.subtab === subtabName);
        });

        document.querySelectorAll('.subtab-content').forEach(content => {
            content.classList.toggle('active', content.id === `subtab-${subtabName}`);
        });

        if (subtabName === 'statistics') {
            window.StatisticsManager.loadStatistics('all');
        } else if (subtabName === 'compare') {
            if (this.accounts.length === 0) {
                this.loadAccounts();
            }
            this.updateCompareSelects();
        } else if (subtabName === 'save') {
            this.updateSavePreview();
        }
    },

    updateSavePreview() {
        const data = window.getCurrentFormData();

        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) {
                const displayValue = (value !== undefined && !isNaN(value)) ? value : 0;
                el.textContent = displayValue;
            }
        };

        setText('previewN', data.n);
        setText('previewRares', data.k_rare);
        setText('previewDiamonds', data.k_diamond);
        setText('previewSuper', data.k_super);
        setText('previewGO', data.k_go);
    },

    async loadAccounts() {
        if (window.electronAPI && window.electronAPI.accounts) {
            try {
                const response = await window.electronAPI.accounts.get();
                if (response.success) {
                    this.accounts = response.data || [];
                    console.log('Accounts geladen:', this.accounts);
                    this.renderAccounts();

                    const compareSubTab = document.getElementById('subtab-compare');
                    if (compareSubTab && compareSubTab.classList.contains('active')) {
                        setTimeout(() => {
                            this.updateCompareSelects();
                        }, 100);
                    }
                } else {
                    console.error('Fehler beim Laden der Accounts:', response.error);
                    window.ToastManager.show('Fehler beim Laden der Accounts', 'error');
                }
            } catch (error) {
                console.error('Exception beim Laden der Accounts:', error);
                window.ToastManager.show('Fehler beim Laden der Accounts', 'error');
            }
        }
    },

    renderAccounts() {
        const list = document.getElementById('accountList');

        if (!list) {
            console.error('accountList Element nicht gefunden!');
            return;
        }

        list.innerHTML = '';

        if (!this.accounts || !Array.isArray(this.accounts)) {
            console.warn('this.accounts ist kein Array:', this.accounts);
            list.innerHTML = `<p style="text-align:center; padding:40px; color:var(--text-secondary)">${window.TranslationManager.t('accountNoAccounts')}</p>`;
            return;
        }

        if (this.accounts.length === 0) {
            list.innerHTML = `<p style="text-align:center; padding:40px; color:var(--text-secondary)">${window.TranslationManager.t('accountNoAccounts')}</p>`;
            return;
        }

        console.log('Renderiere', this.accounts.length, 'Accounts');
        const dateLocale = window.SettingsManager.settings?.language === 'en' ? 'en-US' : 'de-DE';

        this.accounts.forEach(account => {
            const card = document.createElement('div');
            card.className = 'account-card';
            card.innerHTML = `
                <div class="account-info">
                    <div class="account-name">${account.name}</div>
                    <div class="account-meta">${window.TranslationManager.t('accountLastUpdated')}: ${new Date(account.lastUpdated || account.timestamp).toLocaleDateString(dateLocale)}</div>
                </div>
                <div class="account-actions">
                    <button class="account-action-button">📋</button>
                    <button class="account-action-button delete">🗑️</button>
                </div>
            `;

            const loadBtn = card.querySelector('.account-action-button:first-child');
            const deleteBtn = card.querySelector('.account-action-button.delete');

            if (loadBtn) {
                loadBtn.onclick = () => AccountManager.loadAccount(account.id);
            }

            if (deleteBtn) {
                deleteBtn.onclick = () => AccountManager.deleteAccount(account.id);
            }

            list.appendChild(card);
        });
    },

    async saveCurrentAsAccount() {
        console.log('===== Account speichern gestartet =====');

        const nameInput = document.getElementById('accountName');
        const name = nameInput.value.trim();

        console.log('Account-Name:', name);

        if (!name) {
            console.warn('Kein Account-Name angegeben');
            window.ToastManager.show('Bitte gib einen Account-Namen ein', 'error');
            return;
        }

        const data = window.getCurrentFormData();

        console.log('Formulardaten:', data);

        if (window.electronAPI && window.electronAPI.accounts) {
            try {
                console.log('Sende Speicher-Anfrage an Backend...');
                const response = await window.electronAPI.accounts.save(name, data);
                console.log('Backend-Response:', response);

                if (response.success) {
                    console.log('Speichern erfolgreich!');
                    nameInput.value = '';

                    this.accounts = Array.isArray(response.data) ? response.data : this.accounts;

                    console.log('this.accounts nach Update:', this.accounts);

                    this.renderAccounts();
                    console.log('renderAccounts() aufgerufen');

                    requestAnimationFrame(() => {
                        console.log('requestAnimationFrame: updateCompareSelects() aufrufen');
                        this.updateCompareSelects();
                        console.log('updateCompareSelects() abgeschlossen');

                        window.ToastManager.show(`Account "${name}" gespeichert`, 'success');
                        console.log('===== Account speichern erfolgreich abgeschlossen =====');
                    });
                } else {
                    console.error('Backend-Fehler:', response.error);
                    window.ToastManager.show(response.error, 'error');
                }
            } catch (error) {
                console.error('Exception beim Speichern:', error);
                console.error('Stack:', error.stack);
                window.ToastManager.show('Fehler beim Speichern', 'error');
            }
        } else {
            console.warn('electronAPI oder electronAPI.accounts nicht verfügbar');
            window.ToastManager.show('Account-Funktionalität nicht verfügbar', 'error');
        }
    },

    async deleteAccount(id) {
        if (!confirm('Möchtest du diesen Account wirklich löschen?')) return;

        if (window.electronAPI && window.electronAPI.accounts) {
            try {
                console.log('===== Account löschen =====');
                console.log('Account-ID:', id);

                const response = await window.electronAPI.accounts.delete(id);
                console.log('Delete-Response:', response);

                if (response.success) {
                    this.accounts = Array.isArray(response.data) ? response.data : this.accounts;

                    console.log('this.accounts nach Löschen:', this.accounts);

                    this.renderAccounts();

                    requestAnimationFrame(() => {
                        this.updateCompareSelects();
                        window.ToastManager.show('Account gelöscht', 'success');
                        console.log('===== Account löschen erfolgreich abgeschlossen =====');
                    });
                } else {
                    console.error('Fehler beim Löschen:', response.error);
                    window.ToastManager.show(response.error, 'error');
                }
            } catch (error) {
                console.error('Exception beim Löschen:', error);
                console.error('Stack:', error.stack);
                window.ToastManager.show('Fehler beim Löschen', 'error');
            }
        }
    },

    async loadAccount(id) {
        const account = this.accounts.find(a => a.id === id);
        if (account) {
            window.applyFormData(account.data);
            window.NavigationManager.switchTab('calculator');
            window.Calculator.calculate(false);
            window.ToastManager.show(`Account "${account.name}" geladen`, 'success');
        }
    },

    updateCompareSelects() {
        const select1 = document.getElementById('compareAccount1');
        const select2 = document.getElementById('compareAccount2');

        if (!select1 || !select2) {
            console.error('Account-Vergleich Dropdowns nicht gefunden!');
            return;
        }

        if (!this.accounts || !Array.isArray(this.accounts)) {
            console.warn('Keine Accounts verfügbar zum Aktualisieren');
            select1.innerHTML = '<option value="">Keine Accounts</option>';
            select2.innerHTML = '<option value="">Keine Accounts</option>';
            return;
        }

        if (this.accounts.length === 0) {
            console.log('Keine Accounts vorhanden');
            select1.innerHTML = '<option value="">Keine Accounts gespeichert</option>';
            select2.innerHTML = '<option value="">Keine Accounts gespeichert</option>';
            return;
        }

        console.log('Aktualisiere Compare-Selects mit', this.accounts.length, 'Accounts');

        let options1 = '<option value="">Account 1 auswählen...</option>';
        let options2 = '<option value="">Account 2 auswählen...</option>';

        this.accounts.forEach(account => {
            options1 += `<option value="${account.id}">${account.name}</option>`;
            options2 += `<option value="${account.id}">${account.name}</option>`;
        });

        select1.innerHTML = options1;
        select2.innerHTML = options2;

        console.log('Compare-Selects aktualisiert');
    },

    async compare() {
        const id1 = document.getElementById('compareAccount1').value;
        const id2 = document.getElementById('compareAccount2').value;

        if (!id1 || !id2) {
            window.ToastManager.show('Bitte wähle zwei Accounts zum Vergleichen aus', 'error');
            return;
        }

        if (id1 === id2) {
            window.ToastManager.show('Bitte wähle zwei verschiedene Accounts', 'error');
            return;
        }

        if (window.electronAPI && window.electronAPI.accounts) {
            const response = await window.electronAPI.accounts.compare(id1, id2);
            if (response.success) {
                this.renderComparison(response.data);
            } else {
                window.ToastManager.show(response.error, 'error');
            }
        }
    },

    renderComparison(data) {
        const container = document.getElementById('comparisonResult');
        const isAccount1Winner = data.winner === 'account1';
        const isAccount2Winner = data.winner === 'account2';

        const getBarColor = (z) => {
            if (z >= 2) return 'var(--very-lucky)';
            if (z >= 1) return 'var(--lucky)';
            if (z >= -1) return 'var(--neutral)';
            if (z >= -2) return 'var(--unlucky)';
            return 'var(--very-unlucky)';
        };

        const getProgressWidth = (z) => Math.min(100, Math.max(5, ((z + 3) / 6) * 100));

        const generateCategoryHTML = (categories) => categories.map((cat, i) => `
            <div class="compare-category-item" style="animation-delay: ${0.3 + i * 0.1}s">
                <div class="compare-category-header">
                    <span class="compare-category-name">${cat.name}</span>
                    <span class="compare-category-value" style="color: ${getBarColor(cat.z)}">${cat.z >= 0 ? '+' : ''}${cat.z.toFixed(2)}</span>
                </div>
                <div class="compare-progress-bar">
                    <div class="compare-progress-fill" style="width: ${getProgressWidth(cat.z)}%; background: ${getBarColor(cat.z)}"></div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="compare-result-container" style="margin-top: 24px;">
                <div class="compare-vs-container">
                    <div class="compare-account-card ${isAccount1Winner ? 'winner' : ''}">
                        <div class="compare-account-header">
                            <span class="compare-account-name">${data.account1.name}</span>
                            ${isAccount1Winner ? '<span class="compare-winner-badge">🏆 Gewinner</span>' : ''}
                        </div>
                        <div class="compare-total-score">
                            <div class="compare-total-label">Total L Score</div>
                            <div class="compare-total-value">${data.account1.result.totalL.toFixed(2)}</div>
                        </div>
                        <div class="compare-categories">
                            ${generateCategoryHTML(data.account1.result.categories)}
                        </div>
                    </div>

                    <div class="compare-vs-indicator">
                        <div class="compare-vs-circle">VS</div>
                    </div>

                    <div class="compare-account-card ${isAccount2Winner ? 'winner' : ''}">
                        <div class="compare-account-header">
                            <span class="compare-account-name">${data.account2.name}</span>
                            ${isAccount2Winner ? '<span class="compare-winner-badge">🏆 Gewinner</span>' : ''}
                        </div>
                        <div class="compare-total-score">
                            <div class="compare-total-label">Total L Score</div>
                            <div class="compare-total-value">${data.account2.result.totalL.toFixed(2)}</div>
                        </div>
                        <div class="compare-categories">
                            ${generateCategoryHTML(data.account2.result.categories)}
                        </div>
                    </div>
                </div>

                <div class="compare-zscore-section">
                    <div class="compare-zscore-title">📊 Z-Score Vergleich</div>
                    ${data.account1.result.categories.map((cat1, i) => {
            const cat2 = data.account2.result.categories[i];
            const width1 = Math.min(100, Math.max(5, ((cat1.z + 3) / 6) * 100));
            const width2 = Math.min(100, Math.max(5, ((cat2.z + 3) / 6) * 100));
            return `
                            <div class="compare-zscore-row" style="animation-delay: ${0.2 + i * 0.1}s">
                                <div class="compare-zscore-label">${cat1.name}</div>
                                <div class="compare-zscore-bar-container">
                                    <div class="compare-zscore-bar" style="width: ${width1}%; background: ${getBarColor(cat1.z)}"></div>
                                </div>
                                <div class="compare-zscore-value" style="color: ${getBarColor(cat1.z)}">${cat1.z >= 0 ? '+' : ''}${cat1.z.toFixed(2)}</div>
                                <div class="compare-zscore-bar-container">
                                    <div class="compare-zscore-bar" style="width: ${width2}%; background: ${getBarColor(cat2.z)}"></div>
                                </div>
                                <div class="compare-zscore-value" style="color: ${getBarColor(cat2.z)}">${cat2.z >= 0 ? '+' : ''}${cat2.z.toFixed(2)}</div>
                            </div>
                        `;
        }).join('')}
                    <div class="compare-zscore-legend">
                        <div class="compare-zscore-legend-item">
                            <div class="compare-zscore-legend-dot" style="background: var(--primary)"></div>
                            ${data.account1.name}
                        </div>
                        <div class="compare-zscore-legend-item">
                            <div class="compare-zscore-legend-dot" style="background: var(--secondary)"></div>
                            ${data.account2.name}
                        </div>
                    </div>
                </div>

                <div class="compare-diff-grid">
                    <div class="compare-diff-card" style="animation-delay: 0.4s">
                        <div class="compare-diff-label">Total L Unterschied</div>
                        <div class="compare-diff-value ${data.difference.totalL > 0 ? 'positive' : data.difference.totalL < 0 ? 'negative' : 'neutral'}">
                            ${data.difference.totalL >= 0 ? '+' : ''}${data.difference.totalL.toFixed(2)}
                        </div>
                    </div>
                    ${data.difference.categories.map((cat, i) => `
                        <div class="compare-diff-card" style="animation-delay: ${0.5 + i * 0.1}s">
                            <div class="compare-diff-label">${cat.name}</div>
                            <div class="compare-diff-value ${cat.zDifference > 0 ? 'positive' : cat.zDifference < 0 ? 'negative' : 'neutral'}">
                                ${cat.zDifference >= 0 ? '+' : ''}${cat.zDifference.toFixed(2)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    getLuckColor(z) {
        const style = getComputedStyle(document.body);
        if (z >= 2) return style.getPropertyValue('--very-lucky').trim();
        if (z >= 0.5) return style.getPropertyValue('--lucky').trim();
        if (z >= -0.5) return style.getPropertyValue('--neutral').trim();
        if (z >= -2) return style.getPropertyValue('--unlucky').trim();
        return style.getPropertyValue('--very-unlucky').trim();
    }
};

// Expose globally for compatibility
window.AccountManager = AccountManager;
