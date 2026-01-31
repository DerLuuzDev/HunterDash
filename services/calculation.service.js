const { POISSON } = require('../build-config/constants');

class CalculationService {
  constructor(historyService = null) {
    this.historyService = historyService;
  }

  setHistoryService(historyService) {
    this.historyService = historyService;
  }

  async calculatePoisson(data, saveHistory = true, accountId = null) {
    const n = parseFloat(data.n); // Total Harvests
    const categories = [];

    POISSON.CATEGORIES.forEach(cat => {
      const k = parseFloat(data[`k_${cat.key}`]); // Deine Treffer
      const p = parseFloat(data[`p_${cat.key}`]); // Wahrscheinlichkeit aus Constants

      // 1. Erwartungswert (Mean)
      const lambda = n * p;

      // 2. VERBESSERUNG: Binomiale Standardabweichung
      // Genauer für feste Anzahl Versuche (n) als die einfache Poisson-Wurzel
      const sigma = Math.sqrt(n * p * (1 - p));

      // 3. VERBESSERUNG: Z-Score mit Stetigkeitskorrektur (Continuity Correction)
      // WICHTIG für "Great Ones" & "Super Rares" (kleine Zahlen):
      // Verhindert, dass 1 oder 2 Treffer den Score unrealistisch explodieren lassen.
      let z = 0;

      if (sigma > 0) {
        const diff = k - lambda;
        // Wir ziehen 0.5 vom absoluten Abstand ab (Richtung Null), aber nicht unter 0
        const correctedDiff = Math.max(0, Math.abs(diff) - 0.5);

        // Vorzeichen wiederherstellen (+ für Glück, - für Pech)
        const sign = diff >= 0 ? 1 : -1;

        z = (correctedDiff * sign) / sigma;
      } else {
        // Falls sigma 0 ist (z.B. p=0 oder n=0), ist z auch 0
        z = 0;
      }

      const color = this.getZScoreColor(z);

      categories.push({
        name: cat.name,
        k,
        p,
        lambda,
        sigma,
        z,
        color
      });
    });

    // Gesamt-Score summieren
    const totalL = categories.reduce((sum, cat) => sum + cat.z, 0);
    const interpretation = this.getInterpretation(totalL);

    const result = {
      categories,
      totalL,
      interpretation,
      timestamp: new Date().toISOString()
    };

    if (saveHistory && this.historyService) {
      await this.historyService.saveToHistory(data, result, accountId);
    }

    return result;
  }

  getZScoreColor(z) {
    for (const range of POISSON.COLOR_RANGES) {
      if (z >= range.min) {
        return { color: range.color, label: range.label };
      }
    }
    return { color: '#b91c1c', label: 'Unbekannt' }; // Fallback Rot
  }

  getInterpretation(totalL) {
    for (const interp of POISSON.INTERPRETATION) {
      if (totalL >= interp.min) {
        return interp.text;
      }
    }
    // Fallback: Letzter Eintrag im Array
    return POISSON.INTERPRETATION[POISSON.INTERPRETATION.length - 1].text;
  }

  calculateBarPercent(z) {
    // Skaliert Z (-4 bis +4) auf 0% bis 100% für die Balken
    return Math.min(Math.max((z + 4) / 8 * 100, 0), 100);
  }

  formatResultHTML(result) {
    const legend = this.generateLegend();
    const details = this.generateDetails(result.categories);
    const chartVertical = this.generateVerticalChart(result.categories);
    const chartHorizontal = this.generateHorizontalChart(result.categories);

    return `
      <h2>Dein Glück-Score</h2>
      ${legend}
      ${details}
      <h3>Balken-Visualisierung (vertikal für Handy / horizontal für PC)</h3>
      <div class="chart-vertical">${chartVertical}</div>
      <div class="chart-horizontal">${chartHorizontal}</div>
      <p><strong>Gesamt L: ${result.totalL.toFixed(2)}</strong></p>
      <p><strong>${result.interpretation}</strong></p>
      <p class="note">Binomial Z-Score (Korr.) | p aus Datamines 2025/2026</p>
    `;
  }

  generateLegend() {
    return `
      <div class="legend">
        ${POISSON.COLOR_RANGES.map(range => `
          <div class="legend-item">
            <div class="legend-color" style="background:${range.color}"></div>
            ${range.label}
          </div>
        `).join('')}
      </div>
    `;
  }

  generateDetails(categories) {
    return categories.map(cat => `
      <div class="heat" style="background-color:${cat.color.color}">
        ${cat.name}: λ=${cat.lambda.toFixed(1)}, Z=${cat.z.toFixed(2)}
      </div>
    `).join('');
  }

  generateVerticalChart(categories) {
    return categories.map(cat => {
      const widthPercent = this.calculateBarPercent(cat.z);
      return `
        <div class="bar-container">
          <div class="bar" style="background:${cat.color.color}" data-width="${widthPercent}">${cat.z.toFixed(2)}</div>
        </div>
      `;
    }).join('');
  }

  generateHorizontalChart(categories) {
    return categories.map(cat => {
      const heightPercent = this.calculateBarPercent(cat.z);
      return `
        <div class="chart-column">
          <div class="bar-container">
            <div class="bar" style="background:${cat.color.color}" data-height="${heightPercent}">${cat.z.toFixed(2)}</div>
          </div>
          <div class="category-label">${cat.name}</div>
        </div>
      `;
    }).join('');
  }

  animateCharts() {
    // Animation für vertikale Balken (Width)
    document.querySelectorAll('.chart-vertical .bar').forEach(bar => {
      const width = bar.getAttribute('data-width');
      setTimeout(() => {
        bar.style.width = width + '%';
      }, 50);
    });

    // Animation für horizontale Balken (Height)
    document.querySelectorAll('.chart-horizontal .bar').forEach(bar => {
      const height = bar.getAttribute('data-height');
      setTimeout(() => {
        bar.style.height = height + '%';
      }, 50);
    });
  }
}

const calculationService = new CalculationService();

module.exports = calculationService;