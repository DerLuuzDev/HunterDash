const TooltipManager = {
    tooltips: {
        n: 'Gesamtzahl aller Harvests (Account-weit). Zu finden unter: Career > Statistics',
        k_rare: 'Anzahl deiner gefundenen Rares (Albino, Piebald, Melanistic)',
        p_rare: 'Wahrscheinlichkeit für Rares. Durchschnitt: 0.003 (1:333)',
        k_diamond: 'Anzahl deiner Diamonds (Top Rating)',
        p_diamond: 'Wahrscheinlichkeit für Diamonds. Durchschnitt: 0.01 (1:100)',
        k_super: 'Anzahl deiner Super Rares (Rare Fur + Diamond)',
        p_super: 'Wahrscheinlichkeit für Super Rares. Durchschnitt: 0.00003 (1:33.000)',
        k_go: 'Anzahl deiner Great Ones (Top 0.05% Größe)',
        p_go: 'Wahrscheinlichkeit für Great Ones. Durchschnitt: 0.00005 (1:20.000)'
    },

    show(inputId, element) {
        const tooltip = document.getElementById('tooltip');
        if (this.tooltips[inputId]) {
            tooltip.textContent = this.tooltips[inputId];
            tooltip.style.left = `${element.getBoundingClientRect().right + 10} px`;
            tooltip.style.top = `${element.getBoundingClientRect().top} px`;
            tooltip.classList.add('show');
        }
    },

    hide() {
        const tooltip = document.getElementById('tooltip');
        tooltip.classList.remove('show');
    },

    setup() {
        Object.keys(this.tooltips).forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                const label = input.previousElementSibling;
                if (label && label.tagName === 'LABEL') {
                    label.style.cursor = 'help';
                    label.addEventListener('mouseenter', (e) => this.show(inputId, label));
                    label.addEventListener('mouseleave', () => this.hide());
                }
            }
        });
    }
};

window.TooltipManager = TooltipManager;
