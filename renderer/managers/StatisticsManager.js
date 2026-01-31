/**
 * StatisticsManager
 * 
 * Handles statistics loading, rendering, and chart visualization.
 */

const StatisticsManager = {
    chart: null,

    async loadStatistics(period) {
        // Update active button styling
        const buttonContainer = document.getElementById('stats-period-buttons');
        if (buttonContainer) {
            buttonContainer.querySelectorAll('.action-button').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.period === period);
            });
        }

        if (window.electronAPI && window.electronAPI.history) {
            const statsResponse = await window.electronAPI.history.getStatistics(period);
            const seriesResponse = await window.electronAPI.history.getTimeSeries({
                categoryKey: null,
                aggregation: 'daily',
                period: period
            });

            if (statsResponse.success) {
                this.renderStatistics(statsResponse.data);
            } else {
                window.ToastManager.show('Keine Statistiken verfügbar', 'error');
            }

            if (seriesResponse.success) {
                this.renderChart(seriesResponse.data);
            }
        }
    },

    renderStatistics(stats) {
        const grid = document.getElementById('statGrid');
        const getTrend = (dir) => {
            if (dir === 'improving') return `📈 ${window.TranslationManager.t('statsTrendImproving')}`;
            if (dir === 'declining') return `📉 ${window.TranslationManager.t('statsTrendDeclining')}`;
            return `➡️ ${window.TranslationManager.t('statsTrendStable')}`;
        };

        grid.innerHTML = `
            <div class="stat-card">
                <h3>${window.TranslationManager.t('statsCalculations')}</h3>
                <div class="stat-value">${stats.count}</div>
            </div>
            <div class="stat-card">
                <h3>${window.TranslationManager.t('statsAvgL')}</h3>
                <div class="stat-value">${stats.totalL.mean.toFixed(2)}</div>
            </div>
            <div class="stat-card">
                <h3>${window.TranslationManager.t('statsMedianL')}</h3>
                <div class="stat-value">${stats.totalL.median.toFixed(2)}</div>
            </div>
            <div class="stat-card">
                <h3>${window.TranslationManager.t('statsStdDev')}</h3>
                <div class="stat-value">${stats.totalL.stdDev.toFixed(2)}</div>
            </div>
            <div class="stat-card">
                <h3>${window.TranslationManager.t('statsMinL')}</h3>
                <div class="stat-value">${stats.totalL.min.toFixed(2)}</div>
            </div>
            <div class="stat-card">
                <h3>${window.TranslationManager.t('statsMaxL')}</h3>
                <div class="stat-value">${stats.totalL.max.toFixed(2)}</div>
            </div>
            <div class="stat-card">
                <h3>${window.TranslationManager.t('statsTrend')}</h3>
                <div class="stat-value trend">
                    ${getTrend(stats.totalL.trend.direction)}
                </div>
            </div>
        `;
    },

    renderChart(data) {
        const canvas = document.getElementById('trendChart');
        if (!canvas) {
            console.error('trendChart canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        const style = getComputedStyle(document.body);
        const textColor = style.getPropertyValue('--text-primary').trim();
        const gridColor = style.getPropertyValue('--text-secondary').trim();
        const primary = style.getPropertyValue('--primary').trim();

        const hexToRgba = (hex, alpha) => {
            if (!hex || hex.length < 7) return `rgba(76, 175, 80, ${alpha})`;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const bgColor = hexToRgba(primary, 0.25);

        if (this.chart) {
            this.chart.destroy();
        }

        if (!data || !data.aggregated || data.aggregated.length === 0) {
            ctx.font = '16px Roboto, sans-serif';
            ctx.fillStyle = textColor || '#666';
            ctx.textAlign = 'center';
            ctx.fillText('Keine Daten für diesen Zeitraum vorhanden', canvas.width / 2, canvas.height / 2);
            return;
        }

        const labels = data.aggregated.map(p => {
            if (p.timestamp) {
                const date = new Date(p.timestamp);
                return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
            }
            return p.date || 'N/A';
        });
        const values = data.aggregated.map(p => p.avgL || p.value || 0);

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: window.TranslationManager.t('statsChartLabel') || 'Durchschnittliches L',
                    data: values,
                    borderColor: primary || '#4CAF50',
                    backgroundColor: bgColor,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: primary || '#4CAF50',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: textColor || '#333',
                            font: { family: 'Roboto', size: 14 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        padding: 16,
                        titleFont: { family: 'Roboto', size: 14, weight: 'bold' },
                        bodyFont: { family: 'Roboto', size: 13 },
                        callbacks: {
                            label: function (context) {
                                return `L-Score: ${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: gridColor || '#666', font: { family: 'Roboto', size: 11 } }
                    },
                    y: {
                        grid: { color: 'rgba(200, 200, 200, 0.15)' },
                        ticks: {
                            color: gridColor || '#666',
                            font: { family: 'Roboto', size: 11 },
                            callback: function (value) {
                                return value.toFixed(1);
                            }
                        }
                    }
                }
            }
        });
    },

    async resetStatistics() {
        const confirmed = confirm('⚠️ Statistiken zurücksetzen?\n\nAlle gespeicherten Berechnungen werden unwiderruflich gelöscht.\n\nFortfahren?');

        if (!confirmed) {
            return;
        }

        try {
            if (window.electronAPI && window.electronAPI.history) {
                const result = await window.electronAPI.history.clear();
                if (result.success) {
                    window.ToastManager.show('Statistiken erfolgreich zurückgesetzt!', 'success');
                    this.loadStatistics('all');
                } else {
                    window.ToastManager.show('Fehler beim Zurücksetzen: ' + (result.error || 'Unbekannt'), 'error');
                }
            } else {
                localStorage.removeItem('hunterdash-history');
                window.ToastManager.show('Statistiken erfolgreich zurückgesetzt!', 'success');
                this.loadStatistics('all');
            }
        } catch (error) {
            console.error('Reset error:', error);
            window.ToastManager.show('Fehler beim Zurücksetzen', 'error');
        }
    }
};

// Expose globally for compatibility
window.StatisticsManager = StatisticsManager;
