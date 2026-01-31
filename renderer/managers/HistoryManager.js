/**
 * HistoryManager
 * 
 * Manages calculation history storage and export.
 */

const HistoryManager = {
    history: [],

    async loadHistory() {
        if (window.electronAPI?.history) {
            const response = await window.electronAPI.history.get();
            if (response.success) {
                this.history = response.data;
                this.renderHistory();
            }
        }
    },

    renderHistory() {
        const list = document.getElementById('historyList');
        if (!list) return;

        list.innerHTML = '';

        if (this.history.length === 0) {
            list.innerHTML = '<p style="text-align:center; padding:40px; color:var(--text-secondary)">Keine Berechnungshistorie vorhanden</p>';
            return;
        }

        this.history.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div>
                    <div class="history-date">${new Date(entry.timestamp).toLocaleDateString('de-DE', {
                day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            })}</div>
                    <div class="history-meta">Total Harvests: ${entry.input.n}</div>
                </div>
                <div class="history-l">${entry.output.totalL.toFixed(2)}</div>
            `;
            item.onclick = () => {
                if (typeof applyFormData === 'function') {
                    applyFormData(this.flattenInput(entry.input));
                }
                window.NavigationManager?.switchTab('calculator');
                window.Calculator?.calculate(false);
            };
            list.appendChild(item);
        });
    },

    flattenInput(input) {
        const flat = { n: input.n };
        if (input.categories) {
            input.categories.forEach(cat => {
                flat[`k_${cat.key}`] = cat.k;
                flat[`p_${cat.key}`] = cat.p;
            });
        }
        return flat;
    },

    async clearHistory() {
        if (!confirm('Möchtest du wirklich die gesamte Historie löschen?')) return;

        if (window.electronAPI?.history) {
            const response = await window.electronAPI.history.clear();
            if (response.success) {
                this.history = [];
                this.renderHistory();
                window.ToastManager?.show('Historie geleert', 'success');
            } else {
                window.ToastManager?.show('Fehler beim Löschen', 'error');
            }
        }
    },

    async exportCSV() {
        if (window.electronAPI?.history) {
            const response = await window.electronAPI.history.exportCSV();
            if (response.success) {
                this.downloadFile(response.data, response.filename, 'text/csv');
                window.ToastManager?.show('CSV exportiert', 'success');
            } else {
                window.ToastManager?.show(response.error, 'error');
            }
        }
    },

    async exportJSON() {
        if (window.electronAPI?.history) {
            const response = await window.electronAPI.history.exportJSON();
            if (response.success) {
                this.downloadFile(response.data, response.filename, 'application/json');
                window.ToastManager?.show('JSON exportiert', 'success');
            } else {
                window.ToastManager?.show(response.error, 'error');
            }
        }
    },

    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
};

export default HistoryManager;
