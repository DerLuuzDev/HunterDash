/**
 * Calculator
 * 
 * Core calculation engine for Poisson-based luck score computation.
 */

const Calculator = {
    DEFAULTS: {
        n: 15000,
        k_rare: 45,
        p_rare: 0.003,
        k_diamond: 150,
        p_diamond: 0.01,
        k_super: 1,
        p_super: 0.00003,
        k_go: 1,
        p_go: 0.00005
    },

    getLuckColorClass(z) {
        if (z >= 2) return 'very-lucky';
        if (z >= 0.5) return 'lucky';
        if (z >= -0.5) return 'neutral';
        if (z >= -2) return 'unlucky';
        return 'very-unlucky';
    },

    getLuckLabel(z) {
        if (z >= 2) return window.TranslationManager.t('luckLabelVeryLucky');
        if (z >= 0.5) return window.TranslationManager.t('luckLabelLucky');
        if (z >= -0.5) return window.TranslationManager.t('luckLabelNeutral');
        if (z >= -2) return window.TranslationManager.t('luckLabelUnlucky');
        return window.TranslationManager.t('luckLabelVeryUnlucky');
    },

    calculateBarWidth(z) {
        return Math.min(Math.max((z + 4) / 8 * 100, 15), 100);
    },

    getInterpretation(totalL) {
        if (totalL > 3) return window.TranslationManager.t('luckVeryLucky');
        if (totalL > 2) return window.TranslationManager.t('luckLucky');
        if (totalL > 0) return window.TranslationManager.t('luckSlightlyLucky');
        if (totalL > -2) return window.TranslationManager.t('luckAverage');
        if (totalL > -3) return window.TranslationManager.t('luckUnlucky');
        return window.TranslationManager.t('luckVeryUnlucky');
    },

    async calculate(saveHistory = true) {
        // getCurrentFormData should be available globally
        if (typeof window.getCurrentFormData !== 'function') {
            console.error('getCurrentFormData not available');
            return;
        }

        const data = window.getCurrentFormData();

        try {
            let result;

            if (window.electronAPI && window.electronAPI.isElectron()) {
                const response = await window.electronAPI.calculate(data, { saveHistory });
                if (response.success) {
                    result = response.data;
                } else {
                    result = this.calculatePoissonLocal(data);
                }
            } else {
                result = this.calculatePoissonLocal(data);
            }

            this.displayResults(result);

            if (window.SettingsManager.settings.animations) {
                this.animateBars();
            } else {
                document.querySelectorAll('.luck-bar-fill').forEach(bar => {
                    bar.style.width = bar.getAttribute('data-width');
                });
            }

        } catch (error) {
            console.error('Berechnungsfehler:', error);
            window.ToastManager.show('Berechnungsfehler: ' + error.message, 'error');
        }
    },

    calculatePoissonLocal(data) {
        const n = parseFloat(data.n);
        const categories = [
            { k: parseFloat(data.k_rare), p: parseFloat(data.p_rare), name: window.TranslationManager.t('catRares') },
            { k: parseFloat(data.k_diamond), p: parseFloat(data.p_diamond), name: window.TranslationManager.t('catDiamonds') },
            { k: parseFloat(data.k_super), p: parseFloat(data.p_super), name: window.TranslationManager.t('catSuperRares') },
            { k: parseFloat(data.k_go), p: parseFloat(data.p_go), name: window.TranslationManager.t('catGreatOnes') }
        ];

        let totalL = 0;

        categories.forEach(cat => {
            const lambda = n * cat.p;
            if (lambda === 0 || isNaN(lambda)) {
                cat.z = 0;
                cat.barWidth = 0;
                cat.luckColor = this.getLuckColorClass(0);
                cat.luckLabel = this.getLuckLabel(0);
                return;
            }

            const sqrtLambda = Math.sqrt(lambda);
            const z = sqrtLambda > 0 ? (cat.k - lambda) / sqrtLambda : 0;
            totalL += z;

            const luckColor = this.getLuckColorClass(z);
            const luckLabel = this.getLuckLabel(z);
            const barWidth = this.calculateBarWidth(z);

            cat.z = z;
            cat.barWidth = barWidth;
            cat.luckColor = luckColor;
            cat.luckLabel = luckLabel;
        });

        const interpretation = this.getInterpretation(totalL);

        return {
            categories,
            totalL,
            interpretation,
            timestamp: new Date().toISOString()
        };
    },

    displayResults(result) {
        const totalLColorClass = this.getLuckColorClass(result.totalL);
        const totalLColor = getComputedStyle(document.documentElement).getPropertyValue(`--${totalLColorClass}`).trim();

        const oldWidths = {};
        const existingBars = document.querySelectorAll('.luck-bar-fill');
        existingBars.forEach((bar, index) => {
            oldWidths[index] = bar.style.width || '0%';
        });

        let bars = '';
        result.categories.forEach((cat, index) => {
            const luckColor = this.getLuckColorClass(cat.z);
            const luckLabel = this.getLuckLabel(cat.z);
            const barWidth = this.calculateBarWidth(cat.z);
            const isSmall = barWidth < 60;
            const initialWidth = oldWidths[index] || '0%';

            bars += `
                <div class="luck-bar-container">
                    <div class="luck-label">${cat.name}</div>
                    <div class="luck-bar">
                        <div class="luck-bar-fill ${luckColor} ${isSmall ? 'small' : ''}" style="width: ${initialWidth}" data-width="${barWidth}%" data-text="${luckLabel} Z: ${cat.z.toFixed(2)}">
                            ${isSmall ? '' : `${luckLabel} Z: ${cat.z.toFixed(2)}`}
                        </div>
                    </div>
                </div>
            `;
        });

        const legend = `
            <div class="legend">
                <div class="legend-item">
                    <div class="legend-color very-unlucky"></div>${window.TranslationManager.t('legendVeryUnlucky')}
                </div>
                <div class="legend-item">
                    <div class="legend-color unlucky"></div>${window.TranslationManager.t('legendUnlucky')} Z&lt;-0.5
                </div>
                <div class="legend-item">
                    <div class="legend-color neutral"></div>${window.TranslationManager.t('legendAverage')} -0.5~0.5
                </div>
                <div class="legend-item">
                    <div class="legend-color lucky"></div>${window.TranslationManager.t('legendLucky')} Z≥0.5
                </div>
                <div class="legend-item">
                    <div class="legend-color very-lucky"></div>${window.TranslationManager.t('legendVeryLucky')}
                </div>
            </div>
        `;

        document.getElementById('result').innerHTML = `
            <div class="card">
                <div class="luck-title">${window.TranslationManager.t('luckScoreTitle')}</div>
                ${legend}
                ${bars}
                <div class="total-score" style="background: ${totalLColor};">
                    <strong>${window.TranslationManager.t('luckTotalL')}: ${result.totalL.toFixed(2)}</strong>
                    ${result.interpretation}
                </div>
                <p class="note">${window.TranslationManager.t('luckNote')}</p>
            </div>
        `;
    },

    animateBars() {
        document.querySelectorAll('.luck-bar-fill').forEach((bar, index) => {
            const width = bar.getAttribute('data-width');
            setTimeout(() => {
                bar.style.width = width;
            }, 200 + (index * 200));
        });
    },

    resetDefaults() {
        document.getElementById('n').value = this.DEFAULTS.n;
        document.getElementById('k_rare').value = this.DEFAULTS.k_rare;
        document.getElementById('p_rare').value = this.DEFAULTS.p_rare;
        document.getElementById('k_diamond').value = this.DEFAULTS.k_diamond;
        document.getElementById('p_diamond').value = this.DEFAULTS.p_diamond;
        document.getElementById('k_super').value = this.DEFAULTS.k_super;
        document.getElementById('p_super').value = this.DEFAULTS.p_super;
        document.getElementById('k_go').value = this.DEFAULTS.k_go;
        document.getElementById('p_go').value = this.DEFAULTS.p_go;

        const sliderDefaults = {
            p_rare_slider: this.DEFAULTS.p_rare,
            p_diamond_slider: this.DEFAULTS.p_diamond,
            p_super_slider: this.DEFAULTS.p_super,
            p_go_slider: this.DEFAULTS.p_go
        };

        Object.entries(sliderDefaults).forEach(([id, value]) => {
            const slider = document.getElementById(id);
            if (slider) slider.value = value;
        });

        // Update ratio displays
        if (typeof window.updateRatio === 'function') {
            ['rare', 'diamond', 'super', 'go'].forEach(type => {
                window.updateRatio(type, this.DEFAULTS[`p_${type}`]);
            });
        }

        this.calculate();
        window.ToastManager.show('Alle Werte zurückgesetzt', 'success');
    }
};

// Expose globally for compatibility
window.Calculator = Calculator;
