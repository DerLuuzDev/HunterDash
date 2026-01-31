/**
 * DashboardManager
 * 
 * Handles the Dashboard/Home screen displaying:
 * - Welcome message with time-based greeting
 * - Quick action to resume or start new grind session
 * - 7-day activity chart
 * - Daily tip from the grind tips collection
 */

const DashboardManager = {
    activityChart: null,

    async init() {
        await this.update();
    },

    async update() {
        this.updateGreeting();
        await this.updateQuickAction();
        await this.updateActivityChart();
        await this.updateDailyTip();
    },

    updateGreeting() {
        const greetingEl = document.getElementById('dashboard-greeting');
        if (!greetingEl) return;

        const hour = new Date().getHours();
        let greeting;
        let emoji;

        if (hour < 6) {
            greeting = window.TranslationManager?.t('greetingNight') || 'Gute Nacht';
            emoji = '🌙';
        } else if (hour < 12) {
            greeting = window.TranslationManager?.t('greetingMorning') || 'Guten Morgen';
            emoji = '☀️';
        } else if (hour < 18) {
            greeting = window.TranslationManager?.t('greetingAfternoon') || 'Guten Tag';
            emoji = '🌤️';
        } else {
            greeting = window.TranslationManager?.t('greetingEvening') || 'Guten Abend';
            emoji = '🌅';
        }

        greetingEl.innerHTML = `${emoji} ${greeting}, <span class="greeting-highlight">Jäger!</span>`;
    },

    async updateQuickAction() {
        const quickActionEl = document.getElementById('dashboard-quick-action');
        if (!quickActionEl) return;

        try {
            if (window.electronAPI && window.electronAPI.grind) {
                const sessionsResult = await window.electronAPI.grind.getSessions();

                if (sessionsResult.success && sessionsResult.data) {
                    const activeSession = sessionsResult.data.find(s =>
                        s.status === 'running' || s.status === 'paused'
                    );

                    if (activeSession) {
                        const statusIcon = activeSession.status === 'paused' ? '⏸️' : '▶️';
                        const statusText = activeSession.status === 'paused' ? 'Pausiert' : 'Aktiv';

                        quickActionEl.innerHTML = `
                            <div class="quick-action-card resume">
                                <div class="quick-action-icon">🎯</div>
                                <div class="quick-action-content">
                                    <div class="quick-action-label">Session fortsetzen</div>
                                    <div class="quick-action-title">${activeSession.name || activeSession.animal || 'Grind Session'}</div>
                                    <div class="quick-action-meta">
                                        <span>${statusIcon} ${statusText}</span>
                                        <span>•</span>
                                        <span>${activeSession.kills || 0} Kills</span>
                                    </div>
                                </div>
                                <button class="quick-action-btn" onclick="DashboardManager.resumeSession('${activeSession.id}')">
                                    Fortsetzen →
                                </button>
                            </div>
                        `;
                        return;
                    }
                }
            }

            // Fallback: No active session
            quickActionEl.innerHTML = `
                <div class="quick-action-card new">
                    <div class="quick-action-icon">🚀</div>
                    <div class="quick-action-content">
                        <div class="quick-action-label">Bereit für die Jagd?</div>
                        <div class="quick-action-title">Neuen Grind starten</div>
                        <div class="quick-action-meta">
                            <span>Timer, Kill-Counter & Tipps</span>
                        </div>
                    </div>
                    <button class="quick-action-btn" onclick="DashboardManager.startNewGrind()">
                        Grind starten →
                    </button>
                </div>
            `;
        } catch (error) {
            console.error('Dashboard: Quick Action Update Error:', error);
        }
    },

    async updateActivityChart() {
        const chartContainer = document.getElementById('dashboard-chart');
        if (!chartContainer) return;

        try {
            let chartData = [];

            if (window.electronAPI && window.electronAPI.history) {
                const result = await window.electronAPI.history.getTimeSeries({ period: 'week', aggregation: 'daily' });

                if (result.success && result.data?.aggregated) {
                    chartData = result.data.aggregated;
                }
            }

            // Fill missing days with zeros for last 7 days
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const dayData = chartData.find(d => d.timestamp === dateStr);
                last7Days.push({
                    label: date.toLocaleDateString('de-DE', { weekday: 'short' }),
                    value: dayData?.count || 0
                });
            }

            const ctx = chartContainer.getContext('2d');

            if (this.activityChart) {
                this.activityChart.destroy();
            }

            const isDark = document.body.classList.contains('dark-mode');
            const primaryColor = isDark ? '#22c55e' : '#16a34a';
            const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
            const textColor = isDark ? '#86efac' : '#475569';

            this.activityChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: last7Days.map(d => d.label),
                    datasets: [{
                        label: 'Berechnungen',
                        data: last7Days.map(d => d.value),
                        backgroundColor: primaryColor,
                        borderRadius: 8,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { color: textColor }
                        },
                        y: {
                            beginAtZero: true,
                            grid: { color: gridColor },
                            ticks: {
                                color: textColor,
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Dashboard: Activity Chart Error:', error);
            chartContainer.parentElement.innerHTML = '<p class="chart-error">Keine Aktivitätsdaten verfügbar</p>';
        }
    },

    async updateDailyTip() {
        const tipEl = document.getElementById('dashboard-tip');
        if (!tipEl) return;

        try {
            let tips = [];

            if (window.electronAPI && window.electronAPI.grind) {
                const result = await window.electronAPI.grind.getTips();
                if (result.success && result.data) {
                    // Flatten tips from all animals
                    tips = Object.values(result.data).flat();
                }
            }

            // Fallback tips
            if (tips.length === 0) {
                tips = [
                    'Nutze Need Zones zur richtigen Tageszeit für höhere Erfolgschancen.',
                    'Great Ones spawnen bei ca. 1 von 10.000 Kills.',
                    'Die Poisson-Verteilung hilft, dein Glück besser einzuschätzen.',
                    'Bleib geduldig – gute Trophäen brauchen Zeit!'
                ];
            }

            // Use date as seed for "daily" random
            const today = new Date().toDateString();
            const seed = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
            const randomTip = tips[seed % tips.length];

            tipEl.innerHTML = `
                <div class="tip-card">
                    <div class="tip-icon">💡</div>
                    <div class="tip-content">
                        <div class="tip-label">Tipp des Tages</div>
                        <div class="tip-text">${randomTip}</div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Dashboard: Daily Tip Error:', error);
        }
    },

    resumeSession(sessionId) {
        // Navigate to Grind tab and continue the session
        const grindNavItem = document.querySelector('.nav-item[onclick*="grind"]');
        if (grindNavItem) {
            NavigationManager.switchTab('grind', grindNavItem);
            // GrindManager should auto-detect and show the active session
        }
    },

    startNewGrind() {
        const grindNavItem = document.querySelector('.nav-item[onclick*="grind"]');
        if (grindNavItem) {
            NavigationManager.switchTab('grind', grindNavItem);
        }
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardManager;
}
