/**
 * TemplateManager
 * 
 * Handles template loading, saving, and application for calculator presets.
 */

const TemplateManager = {
    templates: [],
    presets: {
        rare: [
            { label: 'Durchschnitt (1:333)', value: 0.003 },
            { label: 'Glücklich (1:250)', value: 0.004 },
            { label: 'Pech (1:500)', value: 0.002 }
        ],
        diamond: [
            { label: 'Durchschnitt (1:100)', value: 0.01 },
            { label: 'Glücklich (1:80)', value: 0.0125 },
            { label: 'Pech (1:150)', value: 0.0067 }
        ],
        super: [
            { label: 'Durchschnitt (1:33.000)', value: 0.00003 },
            { label: 'Glücklich (1:25.000)', value: 0.00004 }
        ],
        go: [
            { label: 'Durchschnitt (1:20.000)', value: 0.00005 },
            { label: 'Glücklich (1:15.000)', value: 0.000066667 }
        ]
    },

    async loadTemplates() {
        if (window.electronAPI && window.electronAPI.templates) {
            const response = await window.electronAPI.templates.get();
            if (response.success) {
                this.templates = response.data;
                this.renderTemplates();
            }
        }
    },

    renderTemplates() {
        const grid = document.getElementById('templateGrid');
        grid.innerHTML = '';

        if (this.templates.length === 0) {
            grid.innerHTML = `
                <div class="template-empty">
                    <div class="template-empty-icon">📋</div>
                    <div class="template-empty-text">${window.TranslationManager.t('templatesEmpty') || 'Keine Vorlagen verfügbar'}</div>
                    <div class="template-empty-hint">${window.TranslationManager.t('templatesEmptyHint') || 'Vorlagen werden geladen...'}</div>
                </div>
            `;
            return;
        }

        const presetTemplates = this.templates.filter(t => !t.isCustom);
        const customTemplates = this.templates.filter(t => t.isCustom);

        const formatRatio = (p) => {
            if (!p || p <= 0) return '∞';
            return Math.round(1 / p).toLocaleString('de-DE');
        };

        const createValuePreview = (data) => {
            if (!data) return '';
            return `
                <div class="template-values">
                    <div class="template-value-item">
                        <span class="template-value-label">Harvests</span>
                        <span class="template-value-data">${(data.n || 0).toLocaleString('de-DE')}</span>
                    </div>
                    <div class="template-value-item">
                        <span class="template-value-label">Rares</span>
                        <span class="template-value-data">${data.k_rare || 0} (1:${formatRatio(data.p_rare)})</span>
                    </div>
                    <div class="template-value-item">
                        <span class="template-value-label">Diamonds</span>
                        <span class="template-value-data">${data.k_diamond || 0} (1:${formatRatio(data.p_diamond)})</span>
                    </div>
                    <div class="template-value-item">
                        <span class="template-value-label">Great Ones</span>
                        <span class="template-value-data">${data.k_go || 0} (1:${formatRatio(data.p_go)})</span>
                    </div>
                </div>
            `;
        };

        const createCard = (template) => {
            const icon = template.isCustom ? '⭐' : '📦';
            const badgeClass = template.isCustom ? 'custom' : 'standard';
            const badgeText = template.isCustom
                ? (window.TranslationManager.t('templateCustom') || 'Eigene')
                : (window.TranslationManager.t('templateStandard') || 'Standard');

            const deleteBtn = template.isCustom ? `
                <button class="template-btn delete" onclick="event.stopPropagation(); TemplateManager.deleteTemplate('${template.id}')" title="Löschen">
                    🗑️
                </button>
            ` : '';

            return `
                <div class="template-card ${template.isCustom ? 'custom' : 'preset'}">
                    <span class="template-icon">${icon}</span>
                    <div class="template-name">${template.name}</div>
                    <div class="template-badges">
                        <span class="template-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <div class="template-description">${template.description || ''}</div>
                    ${createValuePreview(template.data)}
                    <div class="template-actions">
                        <button class="template-btn primary" onclick="TemplateManager.applyTemplate('${template.id}')">
                            ✨ ${window.TranslationManager.t('templateApply') || 'Anwenden'}
                        </button>
                        ${deleteBtn}
                    </div>
                </div>
            `;
        };

        if (presetTemplates.length > 0) {
            const presetSection = document.createElement('div');
            presetSection.className = 'template-section';
            presetSection.innerHTML = `
                <div class="template-section-header">
                    <span class="section-icon">📦</span>
                    <h3>${window.TranslationManager.t('templatePresets') || 'Standard-Vorlagen'}</h3>
                    <span class="section-count">${presetTemplates.length}</span>
                </div>
                <div class="template-grid">
                    ${presetTemplates.map(createCard).join('')}
                </div>
            `;
            grid.appendChild(presetSection);
        }

        if (customTemplates.length > 0) {
            const customSection = document.createElement('div');
            customSection.className = 'template-section';
            customSection.innerHTML = `
                <div class="template-section-header">
                    <span class="section-icon">⭐</span>
                    <h3>${window.TranslationManager.t('templateCustom') || 'Eigene Vorlagen'}</h3>
                    <span class="section-count">${customTemplates.length}</span>
                </div>
                <div class="template-grid">
                    ${customTemplates.map(createCard).join('')}
                </div>
            `;
            grid.appendChild(customSection);
        }
    },

    async applyTemplate(id) {
        const template = this.templates.find(t => t.id === id);
        if (template) {
            window.applyFormData(template.data);
            window.NavigationManager.switchTab('calculator');
            window.Calculator.calculate();
            window.ToastManager.show(`Template "${template.name}" angewendet`, 'success');
        }
    },

    async deleteTemplate(id) {
        const template = this.templates.find(t => t.id === id);
        if (!template) return;

        if (!template.isCustom) {
            window.ToastManager.show('Standard-Vorlagen können nicht gelöscht werden', 'error');
            return;
        }

        if (!confirm(`Vorlage "${template.name}" wirklich löschen?`)) return;

        try {
            if (window.electronAPI && window.electronAPI.templates) {
                const response = await window.electronAPI.templates.delete(id);
                if (response.success) {
                    await this.loadTemplates();
                    window.ToastManager.show(`Vorlage "${template.name}" gelöscht`, 'success');
                } else {
                    throw new Error(response.error || 'Löschen fehlgeschlagen');
                }
            }
        } catch (error) {
            console.error('TemplateManager: Fehler beim Löschen:', error);
            window.ToastManager.show('Fehler beim Löschen der Vorlage', 'error');
        }
    },

    showPresets(category) {
        const dropdown = document.getElementById(`presets_${category}`);
        const widget = dropdown.closest('.stat-widget');
        const existingList = document.querySelector('.preset-list.show');

        window.closeAllDropdowns();

        if (existingList !== dropdown) {
            dropdown.classList.add('show');
            if (widget) widget.style.zIndex = '100';

            if (dropdown.innerHTML === '') {
                const presets = this.presets[category] || [];
                dropdown.innerHTML = presets.map(p => `
                    <li class="preset-item" onclick="TemplateManager.applyPreset('${category}', ${p.value}, '${category}')">
                        <span>${p.label}</span>
                    </li>
                `).join('');
            }
        }
    },

    applyPreset(category, value, id) {
        const input = document.getElementById(`p_${category}`);
        const slider = document.getElementById(`p_${category}_slider`);

        if (input) {
            input.value = value;
            if (typeof window.updateRatio === 'function') {
                window.updateRatio(category, value);
            }
        }

        if (slider) slider.value = value;

        window.Calculator.calculate();
        window.closeAllDropdowns();
        window.ToastManager.show(window.TranslationManager.t('toastPresetApplied'), 'info');
    },

    showCreateModal() {
        const modal = document.getElementById('templateModal');
        modal.classList.add('show');
        document.getElementById('template-name').value = '';
        document.getElementById('template-description').value = '';
        const defaults = window.Calculator.DEFAULTS;
        document.getElementById('tpl-n').value = defaults.n;
        document.getElementById('tpl-k_rare').value = defaults.k_rare;
        document.getElementById('tpl-p_rare').value = defaults.p_rare;
        document.getElementById('tpl-k_diamond').value = defaults.k_diamond;
        document.getElementById('tpl-p_diamond').value = defaults.p_diamond;
        document.getElementById('tpl-k_super').value = defaults.k_super;
        document.getElementById('tpl-p_super').value = defaults.p_super;
        document.getElementById('tpl-k_go').value = defaults.k_go;
        document.getElementById('tpl-p_go').value = defaults.p_go;
    },

    closeModal() {
        const modal = document.getElementById('templateModal');
        modal.classList.remove('show');
    },

    createFromCurrent() {
        const modal = document.getElementById('templateModal');
        modal.classList.add('show');
        document.getElementById('template-name').value = '';
        document.getElementById('template-description').value = '';
        document.getElementById('tpl-n').value = document.getElementById('n').value;
        document.getElementById('tpl-k_rare').value = document.getElementById('k_rare').value;
        document.getElementById('tpl-p_rare').value = document.getElementById('p_rare').value;
        document.getElementById('tpl-k_diamond').value = document.getElementById('k_diamond').value;
        document.getElementById('tpl-p_diamond').value = document.getElementById('p_diamond').value;
        document.getElementById('tpl-k_super').value = document.getElementById('k_super').value;
        document.getElementById('tpl-p_super').value = document.getElementById('p_super').value;
        document.getElementById('tpl-k_go').value = document.getElementById('k_go').value;
        document.getElementById('tpl-p_go').value = document.getElementById('p_go').value;
    },

    async saveNewTemplate() {
        const name = document.getElementById('template-name').value.trim();
        const description = document.getElementById('template-description').value.trim();

        if (!name) {
            window.ToastManager.show('Bitte gib einen Namen ein', 'error');
            return;
        }

        const data = {
            n: parseFloat(document.getElementById('tpl-n').value) || 0,
            k_rare: parseFloat(document.getElementById('tpl-k_rare').value) || 0,
            p_rare: parseFloat(document.getElementById('tpl-p_rare').value) || 0,
            k_diamond: parseFloat(document.getElementById('tpl-k_diamond').value) || 0,
            p_diamond: parseFloat(document.getElementById('tpl-p_diamond').value) || 0,
            k_super: parseFloat(document.getElementById('tpl-k_super').value) || 0,
            p_super: parseFloat(document.getElementById('tpl-p_super').value) || 0,
            k_go: parseFloat(document.getElementById('tpl-k_go').value) || 0,
            p_go: parseFloat(document.getElementById('tpl-p_go').value) || 0
        };

        try {
            if (window.electronAPI && window.electronAPI.templates) {
                const response = await window.electronAPI.templates.save(name, {
                    description,
                    data,
                    isCustom: true
                });

                if (response.success) {
                    this.closeModal();
                    await this.loadTemplates();
                    window.ToastManager.show(`Vorlage "${name}" erstellt`, 'success');
                } else {
                    throw new Error(response.error || 'Speichern fehlgeschlagen');
                }
            } else {
                const templates = JSON.parse(localStorage.getItem('custom-templates') || '[]');
                templates.push({
                    id: 'custom-' + Date.now(),
                    name,
                    description,
                    data,
                    isCustom: true
                });
                localStorage.setItem('custom-templates', JSON.stringify(templates));
                this.closeModal();
                await this.loadTemplates();
                window.ToastManager.show(`Vorlage "${name}" erstellt`, 'success');
            }
        } catch (error) {
            console.error('TemplateManager: Fehler beim Speichern:', error);
            window.ToastManager.show('Fehler beim Speichern: ' + error.message, 'error');
        }
    }
};

// Expose globally for compatibility
window.TemplateManager = TemplateManager;
