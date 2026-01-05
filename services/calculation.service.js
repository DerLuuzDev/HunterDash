const { POISSON } = require('../build-config/constants');

class CalculationService {
  constructor(historyService = null) {
    this.historyService = historyService;
  }

  setHistoryService(historyService) {
    this.historyService = historyService;
  }

  async calculatePoisson(data, saveHistory = true, accountId = null) {
    const n = parseFloat(data.n);
    const categories = [];
    
    POISSON.CATEGORIES.forEach(cat => {
      const k = parseFloat(data[`k_${cat.key}`]);
      const p = parseFloat(data[`p_${cat.key}`]);
      
      const lambda = n * p;
      const sqrtLambda = Math.sqrt(lambda);
      const z = sqrtLambda > 0 ? (k - lambda) / sqrtLambda : 0;
      
      const color = this.getZScoreColor(z);
      
      categories.push({
        name: cat.name,
        k,
        p,
        lambda,
        sqrtLambda,
        z,
        color
      });
    });
    
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
    return { color: '#b91c1c', label: 'Unbekannt' };
  }
  
  getInterpretation(totalL) {
    for (const interp of POISSON.INTERPRETATION) {
      if (totalL >= interp.min) {
        return interp.text;
      }
    }
    return POISSON.INTERPRETATION[POISSON.INTERPRETATION.length - 1].text;
  }
  
  calculateBarPercent(z) {
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
      <p class="note">Poisson-Z-Score | p aus Datamines 2025/2026</p>
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
      <div class="heat" style="background-color:${cat.color.color}">${cat.name}: λ=${cat.lambda.toFixed(0)}, Z=${cat.z.toFixed(2)}</div>
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
    document.querySelectorAll('.chart-vertical .bar').forEach(bar => {
      const width = bar.getAttribute('data-width');
      setTimeout(() => {
        bar.style.width = width + '%';
      }, 50);
    });
    
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
