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
        const t = window.TranslationManager?.t || (key => key);
        if (z >= 2) return t('luckLabelVeryLucky');
        if (z >= 0.5) return t('luckLabelLucky');
        if (z >= -0.5) return t('luckLabelNeutral');
        if (z >= -2) return t('luckLabelUnlucky');
        return t('luckLabelVeryUnlucky');
    },

    calculateBarWidth(z) {
        return Math.min(Math.max((z + 4) / 8 * 100, 15), 100);
    },

    getInterpretation(totalL) {
        const t = window.TranslationManager?.t || (key => key);
        if (totalL > 3) return t('luckVeryLucky');
        if (totalL > 2) return t('luckLucky');
        if (totalL > 0) return t('luckSlightlyLucky');
        if (totalL > -2) return t('luckAverage');
        if (totalL > -3) return t('luckUnlucky');
        return t('luckVeryUnlucky');
    },

    async calculate(saveHistory = true) {
        // getCurrentFormData should be available globally
        if (typeof getCurrentFormData !== 'function') {
            console.error('getCurrentFormData not available');
            return;
        }

        const data = getCurrentFormData();

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

            if (window.SettingsManager?.settings?.animations) {
                this.animateBars();
            } else {
                document.querySelectorAll('.luck-bar-fill').forEach(bar => {
                    bar.style.width = bar.getAttribute('data-width');
                });
            }

        } catch (error) {
            console.error('Berechnungsfehler:', error);
            window.ToastManager?.show('Berechnungsfehler: ' + error.message, 'error');
        }
    },

    calculatePoissonLocal(data) {
        const t = window.TranslationManager?.t || (key => key);
        const n = parseFloat(data.n);
        const categories = [
            { k: parseFloat(data.k_rare), p: parseFloat(data.p_rare), name: t('catRares') },
            { k: parseFloat(data.k_diamond), p: parseFloat(data.p_diamond), name: t('catDiamonds') },
            { k: parseFloat(data.k_super), p: parseFloat(data.p_super), name: t('catSuperRares') },
            { k: parseFloat(data.k_go), p: parseFloat(data.p_go), name: t('catGreatOnes') }
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

            cat.z = z;
            cat.barWidth = this.calculateBarWidth(z);
            cat.luckColor = this.getLuckColorClass(z);
            cat.luckLabel = this.getLuckLabel(z);
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
        const t = window.TranslationManager?.t || (key => key);
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
                    <div class="legend-color very-unlucky"></div>${t('legendVeryUnlucky')}
                </div>
                <div class="legend-item">
                    <div class="legend-color unlucky"></div>${t('legendUnlucky')} Z&lt;-0.5
                </div>
                <div class="legend-item">
                    <div class="legend-color neutral"></div>${t('legendAverage')} -0.5~0.5
                </div>
                <div class="legend-item">
                    <div class="legend-color lucky"></div>${t('legendLucky')} Z≥0.5
                </div>
                <div class="legend-item">
                    <div class="legend-color very-lucky"></div>${t('legendVeryLucky')}
                </div>
            </div>
        `;

        const resultEl = document.getElementById('result');
        if (resultEl) {
            resultEl.innerHTML = `
                <div class="card">
                    <div class="luck-title">${t('luckScoreTitle')}</div>
                    ${legend}
                    ${bars}
                    <div class="total-score" style="background: ${totalLColor};">
                        <strong>${t('luckTotalL')}: ${result.totalL.toFixed(2)}</strong>
                        ${result.interpretation}
                    </div>
                    <p class="note">${t('luckNote')}</p>
                </div>
            `;
        }
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
        // Reset number inputs
        const fields = ['n', 'k_rare', 'p_rare', 'k_diamond', 'p_diamond', 'k_super', 'p_super', 'k_go', 'p_go'];
        fields.forEach(field => {
            const el = document.getElementById(field);
            if (el) el.value = this.DEFAULTS[field];
        });

        // Reset sliders
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
        if (typeof updateRatio === 'function') {
            ['rare', 'diamond', 'super', 'go'].forEach(type => {
                updateRatio(type, this.DEFAULTS[`p_${type}`]);
            });
        }

        this.calculate();
        window.ToastManager?.show('Alle Werte zurückgesetzt', 'success');
    }
};

export default Calculator;
