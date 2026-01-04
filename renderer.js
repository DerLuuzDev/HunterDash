document.addEventListener('DOMContentLoaded', async () => {
  init();
});

async function init() {
  await loadSettings();
  await loadLastValues();
  
  const calculateBtn = document.querySelector('button');
  if (calculateBtn) {
    calculateBtn.addEventListener('click', handleCalculate);
  }
  
  const inputs = document.querySelectorAll('input[type="number"]');
  inputs.forEach(input => {
    input.addEventListener('change', saveLastValues);
  });
  
  calculate();
}

async function getFormData() {
  const categories = [
    { key: 'rare' },
    { key: 'diamond' },
    { key: 'super' },
    { key: 'go' }
  ];
  
  const data = {
    n: document.getElementById('n').value
  };
  
  categories.forEach(cat => {
    data[`k_${cat.key}`] = document.getElementById(`k_${cat.key}`).value;
    data[`p_${cat.key}`] = document.getElementById(`p_${cat.key}`).value;
  });
  
  return data;
}

async function handleCalculate() {
  const data = await getFormData();
  await calculate(data);
  await saveLastValues();
}

async function calculate(data = null) {
  if (!data) {
    data = await getFormData();
  }
  
  const resultContainer = document.getElementById('result');
  resultContainer.innerHTML = '<p style="text-align:center">Berechne...</p>';
  
  try {
    let result;
    
    if (window.electronAPI && window.electronAPI.isElectron()) {
      const response = await window.electronAPI.calculate(data);
      
      if (response.success) {
        result = response.data;
      } else {
        result = calculatePoissonLocal(data);
      }
    } else {
      result = calculatePoissonLocal(data);
    }
    
    displayResults(result);
    animateHeatmap();
    
  } catch (error) {
    console.error('Berechnungsfehler:', error);
    resultContainer.innerHTML = `
      <div style="background:#fee2e2; border-left:4px solid #ef4444; padding:15px; border-radius:8px; color:#7f1d1d;">
        <strong>Fehler:</strong> ${error.message}
      </div>
    `;
  }
}

function calculatePoissonLocal(data) {
  const categories = [
    { key: 'rare', name: 'Rares', defaultP: 0.003 },
    { key: 'diamond', name: 'Diamonds', defaultP: 0.01 },
    { key: 'super', name: 'Super Rares', defaultP: 0.00003 },
    { key: 'go', name: 'Great Ones', defaultP: 0.00005 }
  ];
  
  const colorRanges = [
    { min: 2, color: '#16a34a', label: 'Sehr Glücklich' },
    { min: 0.5, color: '#a3e635', label: 'Glücklich' },
    { min: -0.5, color: '#facc15', label: 'Neutral' },
    { min: -2, color: '#f87171', label: 'Pech' },
    { min: -Infinity, color: '#b91c1c', label: 'Sehr Pech' }
  ];
  
  const interpretationRanges = [
    { min: 3, text: 'Absolut legendäres Glück! 🎉 Du bist ein Glücksritter!' },
    { min: 2, text: 'Super glücklicher als erwartet! 👍 Weiter so!' },
    { min: 0, text: 'Leicht glücklicher als erwartet. 😊 Solides Glück!' },
    { min: -2, text: 'Durchschnittliches Glück. 😌 Alles im grünen Bereich!' },
    { min: -3, text: 'Ein bisschen Pech gehabt, aber du schaffst das! 💪 Nächstes Mal mehr!' },
    { min: -Infinity, text: 'Viel Pech bisher, aber der nächste Grind wird episch! 🌟 Bleib dran!' }
  ];
  
  const n = parseFloat(data.n);
  const calculatedCategories = [];
  
  categories.forEach(cat => {
    const k = parseFloat(data[`k_${cat.key}`]);
    const p = parseFloat(data[`p_${cat.key}`]);
    
    const lambda = n * p;
    const sqrtLambda = Math.sqrt(lambda);
    const z = sqrtLambda > 0 ? (k - lambda) / sqrtLambda : 0;
    
    let colorInfo;
    for (const range of colorRanges) {
      if (z >= range.min) {
        colorInfo = range;
        break;
      }
    }
    
    calculatedCategories.push({
      name: cat.name,
      k,
      p,
      lambda,
      z,
      color: colorInfo.color,
      colorLabel: colorInfo.label
    });
  });
  
  const totalL = calculatedCategories.reduce((sum, cat) => sum + cat.z, 0);
  
  let interpretation;
  for (const interp of interpretationRanges) {
    if (totalL >= interp.min) {
      interpretation = interp.text;
      break;
    }
  }
  
  return {
    categories: calculatedCategories,
    totalL,
    interpretation
  };
}

function displayResults(result) {
  const resultContainer = document.getElementById('result');
  
  const html = `
    <h2>Dein Glück-Score</h2>
    <p><strong>Gesamt L: ${result.totalL.toFixed(2)}</strong></p>
    <p><strong>${result.interpretation}</strong></p>
    ${generateHeatmap(result.categories)}
    <p class="note">Poisson-Z-Score | p aus Datamines 2025/2026</p>
  `;
  
  resultContainer.innerHTML = html;
}

function generateHeatmap(categories) {
  const bars = categories.map(cat => {
    const heightPercent = Math.min(Math.max((cat.z + 4) / 8 * 100, 5), 95);
    return `
      <div class="heatmap-bar-wrapper">
        <div class="heatmap-bar" 
             style="height: ${heightPercent}%; background-color: ${cat.color};"
             data-height="${heightPercent}">
          <div class="heatmap-bar-value">${cat.z.toFixed(2)}</div>
        </div>
        <div class="heatmap-label">${cat.name}</div>
        <div class="heatmap-legend" style="color: ${cat.color}">${cat.colorLabel}</div>
      </div>
    `;
  }).join('');
  
  return `
    <div class="heatmap">
      <h3 class="heatmap-title">Glück-Heatmap</h3>
      <div class="heatmap-bars">
        ${bars}
      </div>
      <div class="heatmap-scale">
        <span class="scale-label">Sehr Glücklich</span>
        <div class="scale-gradient"></div>
        <span class="scale-label">Sehr Unglücklich</span>
      </div>
    </div>
  `;
}

function animateHeatmap() {
  document.querySelectorAll('.heatmap-bar').forEach((bar, index) => {
    const height = bar.getAttribute('data-height');
    bar.style.height = '0%';
    setTimeout(() => {
      bar.style.transition = 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      bar.style.height = height + '%';
    }, 100 + (index * 100));
  });
}

async function loadSettings() {
  try {
    let settings = {};
    
    if (window.electronAPI && window.electronAPI.isElectron()) {
      const response = await window.electronAPI.getSettings();
      settings = response.success ? response.data : {};
    } else if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('hunterdash-settings');
      settings = stored ? JSON.parse(stored) : {};
    }
    
    applyTheme(settings.theme || 'light');
    
  } catch (error) {
    console.error('Fehler beim Laden der Einstellungen:', error);
  }
}

async function saveSettings(newSettings) {
  try {
    if (window.electronAPI && window.electronAPI.isElectron()) {
      const response = await window.electronAPI.saveSettings(newSettings);
      return response.success;
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem('hunterdash-settings', JSON.stringify(newSettings));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Fehler beim Speichern der Einstellungen:', error);
    return false;
  }
}

async function loadLastValues() {
  try {
    let values = null;
    
    if (window.electronAPI && window.electronAPI.isElectron()) {
      const stored = localStorage.getItem('hunterdash-last-values');
      values = stored ? JSON.parse(stored) : null;
    } else if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('hunterdash-last-values');
      values = stored ? JSON.parse(stored) : null;
    }
    
    if (values) {
      applyLastValues(values);
    }
    
  } catch (error) {
    console.error('Fehler beim Laden der letzten Werte:', error);
  }
}

async function saveLastValues() {
  try {
    const data = await getFormData();
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('hunterdash-last-values', JSON.stringify(data));
    }
    
  } catch (error) {
    console.error('Fehler beim Speichern der letzten Werte:', error);
  }
}

function applyLastValues(values) {
  if (values.n !== undefined) {
    document.getElementById('n').value = values.n;
  }
  
  const categories = ['rare', 'diamond', 'super', 'go'];
  categories.forEach(key => {
    if (values[`k_${key}`] !== undefined) {
      const element = document.getElementById(`k_${key}`);
      if (element) element.value = values[`k_${key}`];
    }
    if (values[`p_${key}`] !== undefined) {
      const element = document.getElementById(`p_${key}`);
      if (element) element.value = values[`p_${key}`];
    }
  });
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.style.background = '#1f2937';
    document.body.style.color = '#f3f4f6';
    
    const container = document.querySelector('.container');
    if (container) {
      container.style.background = '#111827';
    }
    
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
      input.style.background = '#374151';
      input.style.color = '#f3f4f6';
      input.style.borderColor = '#4b5563';
    });
    
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      card.style.background = '#1f2937';
      card.style.color = '#f3f4f6';
    });
  } else {
    document.body.style.background = '#f0f2f5';
    document.body.style.color = '#333';
    
    const container = document.querySelector('.container');
    if (container) {
      container.style.background = '#fff';
    }
    
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
      input.style.background = '';
      input.style.color = '';
      input.style.borderColor = '';
    });
    
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      card.style.background = '#f9fafb';
      card.style.color = '';
    });
  }
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.ctrlKey) {
    handleCalculate();
  }
});

window.onerror = (message, source, lineno, colno, error) => {
  console.error('Globaler Fehler:', { message, source, lineno, colno, error });
  return false;
};
