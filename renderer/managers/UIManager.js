const UIManager = {
    getCurrentFormData() {
        return {
            n: parseFloat(document.getElementById('n').value),
            k_rare: parseFloat(document.getElementById('k_rare').value),
            p_rare: parseFloat(document.getElementById('p_rare').value),
            k_diamond: parseFloat(document.getElementById('k_diamond').value),
            p_diamond: parseFloat(document.getElementById('p_diamond').value),
            k_super: parseFloat(document.getElementById('k_super').value),
            p_super: parseFloat(document.getElementById('p_super').value),
            k_go: parseFloat(document.getElementById('k_go').value),
            p_go: parseFloat(document.getElementById('p_go').value)
        };
    },

    applyFormData(data) {
        if (data.n !== undefined) document.getElementById('n').value = data.n;
        if (data.k_rare !== undefined) document.getElementById('k_rare').value = data.k_rare;
        if (data.p_rare !== undefined) document.getElementById('p_rare').value = data.p_rare;
        if (data.k_diamond !== undefined) document.getElementById('k_diamond').value = data.k_diamond;
        if (data.p_diamond !== undefined) document.getElementById('p_diamond').value = data.p_diamond;
        if (data.k_super !== undefined) document.getElementById('k_super').value = data.k_super;
        if (data.p_super !== undefined) document.getElementById('p_super').value = data.p_super;
        if (data.k_go !== undefined) document.getElementById('k_go').value = data.k_go;
        if (data.p_go !== undefined) document.getElementById('p_go').value = data.p_go;
    },

    showHelpModal() {
        const helpModal = document.createElement('div');
        helpModal.className = 'settings-modal show';
        helpModal.innerHTML = `
            <div class="settings-content">
                <div class="settings-header">
                    <h2 class="settings-title">⌨️ Tastaturkürzel</h2>
                    <button class="settings-close" onclick="this.closest('.settings-modal').remove()">✕</button>
                </div>
                <ul style="line-height:2">
                    <li><strong>Ctrl+Z:</strong> Letzte Änderung rückgängig machen</li>
                    <li><strong>Ctrl+Y:</strong> Letzte Änderung wiederholen</li>
                    <li><strong>Ctrl+S:</strong> Historie als CSV exportieren</li>
                    <li><strong>Escape:</strong> Modals schließen</li>
                    <li><strong>F1:</strong> Hilfe anzeigen</li>
                </ul>
            </div>
        `;
        helpModal.onclick = (e) => {
            if (e.target === helpModal) helpModal.remove();
        };
        document.body.appendChild(helpModal);
    },

    setupPSliders() {
        const categories = ['rare', 'diamond', 'super', 'go'];
        categories.forEach(cat => {
            const slider = document.getElementById(`p_${cat}_slider`);
            const number = document.getElementById(`p_${cat}`);

            if (slider && number) {
                slider.addEventListener('input', () => {
                    number.value = slider.value;
                    Calculator.calculate();
                });

                number.addEventListener('input', () => {
                    slider.value = number.value;
                });
            }
        });
    },

    updateRatio(type, val) {
        const p = parseFloat(val);
        const el = document.getElementById('ratio_' + type);
        if (!el) return;

        if (!p || p <= 0) {
            el.textContent = '(1:∞)';
            return;
        }

        const ratio = Math.round(1 / p);
        el.textContent = `(1: ${ratio.toLocaleString('de-DE')})`;
    },

    closeAllDropdowns() {
        document.querySelectorAll('.preset-list.show').forEach(list => {
            list.classList.remove('show');
            const widget = list.closest('.stat-widget');
            if (widget) widget.style.zIndex = ''; // Reset z-index
        });
    }
};

window.UIManager = UIManager;
// Expose functions globally for compatibility with existing inline calls or other managers
window.getCurrentFormData = UIManager.getCurrentFormData;
window.applyFormData = UIManager.applyFormData;
window.showHelpModal = UIManager.showHelpModal;
window.updateRatio = UIManager.updateRatio;
window.closeAllDropdowns = UIManager.closeAllDropdowns;
