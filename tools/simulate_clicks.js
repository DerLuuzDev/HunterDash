const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf-8');

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: 'usable',
  url: 'file://' + path.resolve(__dirname, '..', 'index.html'),
  pretendToBeVisual: true,
  beforeParse(window) {
    // Minimal mocks for electronAPI used by the app
    window.electronAPI = {
      isElectron: () => false,
      calculate: async (data) => ({ success: false }),
      templates: {
        get: async () => ({ success: true, data: [] })
      },
      history: {
        get: async () => ({ success: true, data: [] }),
        getStatistics: async (period) => ({ success: true, data: { count: 0, totalL: { mean:0, median:0, stdDev:0, min:0, max:0, trend: { direction: 'stable' } } } }),
        getTimeSeries: async () => ({ success: true, data: { aggregated: [] } }),
        exportCSV: async () => ({ success: true, data: 'a,b\n1,2', filename: 'history.csv' }),
        exportJSON: async () => ({ success: true, data: '[]', filename: 'history.json' }),
        clear: async () => ({ success: true })
      },
      accounts: {
        get: async () => ({ success: true, data: [] }),
        getStatistics: async () => ({ success: true, data: {} }),
        compare: async () => ({ success: true, data: {} }),
        listBackups: async () => ({ success: true, data: [] }),
        restoreBackup: async () => ({ success: true }),
        createBackup: async () => ({ success: true })
      }
    };

    // stub Chart to avoid loading external script
    window.Chart = function () { this.destroy = () => {}; };

    // Basic URL.createObjectURL stub used by downloadFile
    window.URL.createObjectURL = function () { return 'blob://fake'; };
    window.URL.revokeObjectURL = function () { /* noop for jsdom */ };
    // Provide localStorage stub for jsdom environment
    window.localStorage = {
      _data: {},
      setItem(key, val) { this._data[key] = String(val); },
      getItem(key) { return this._data.hasOwnProperty(key) ? this._data[key] : null; },
      removeItem(key) { delete this._data[key]; }
    };
    // Stub ResizeObserver for Chart.js
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

const win = dom.window;
const doc = win.document;

function wait(ms) { return new Promise(res => setTimeout(res, ms)); }

(async () => {
  // give scripts time to run
  await wait(600);

  const results = [];

  function safeClick(sel) {
    const el = doc.querySelector(sel);
    if (!el) return { selector: sel, found: false };
    try { el.click(); return { selector: sel, found: true }; } catch (e) { return { selector: sel, found: true, error: e.message }; }
  }

  // Simulate opening settings
  results.push({ action: 'click-settings-open', ...safeClick('.settings-button') });
  await wait(100);
  results.push({ action: 'click-settings-close', ...safeClick('.settings-close') });

  // Toggle settings toggles
  results.push({ action: 'toggle-anim', ...safeClick('#animToggle') });
  results.push({ action: 'toggle-ripple', ...safeClick('#rippleToggle') });
  results.push({ action: 'toggle-dark', ...safeClick('#darkToggle') });

  // Switch tabs
  results.push({ action: 'switch-to-templates', ...safeClick('button[data-tab="templates"]') });
  await wait(100);
  results.push({ action: 'switch-to-history', ...safeClick('button[data-tab="history"]') });
  await wait(100);
  results.push({ action: 'switch-to-accounts', ...safeClick('button[data-tab="accounts"]') });
  await wait(100);
  results.push({ action: 'switch-to-calculator', ...safeClick('button[data-tab="calculator"]') });

  // Preset dropdowns
  results.push({ action: 'show-presets-rare', ...safeClick('.preset-button') });

  // Undo/Redo
  results.push({ action: 'undo', ok: !!(win.UndoRedoManager && typeof win.UndoRedoManager.undo === 'function') });
  if (win.UndoRedoManager && win.UndoRedoManager.undo) { try { win.UndoRedoManager.undo(); } catch(e) { results.push({ action: 'undo-error', error: e.message }); } }
  results.push({ action: 'redo', ok: !!(win.UndoRedoManager && typeof win.UndoRedoManager.redo === 'function') });
  if (win.UndoRedoManager && win.UndoRedoManager.redo) { try { win.UndoRedoManager.redo(); } catch(e) { results.push({ action: 'redo-error', error: e.message }); } }

  // History export/clear (calls mocks)
  try { await win.HistoryManager.exportCSV(); results.push({ action: 'history-export-csv', ok: true }); } catch(e) { results.push({ action: 'history-export-csv', ok:false, error: e.message }); }
  try { await win.HistoryManager.exportJSON(); results.push({ action: 'history-export-json', ok: true }); } catch(e) { results.push({ action: 'history-export-json', ok:false, error: e.message }); }

  // Statistics load
  try { await win.StatisticsManager.loadStatistics('all'); results.push({ action: 'statistics-load', ok:true }); } catch(e) { results.push({ action: 'statistics-load', ok:false, error: e.message }); }

  // Calculator run
  try { await win.Calculator.calculate(); results.push({ action: 'calculator-calc', ok:true }); } catch(e) { results.push({ action: 'calculator-calc', ok:false, error: e.message }); }

  await wait(400);

  // Inspect result DOM for total-score and legend
  const totalScore = doc.querySelector('.total-score');
  const legend = doc.querySelector('.legend');
  const bars = Array.from(doc.querySelectorAll('.luck-bar-container')).map(n => n.textContent.trim());

  console.log('\n=== Simulation Results ===');
  console.log(JSON.stringify(results, null, 2));
  console.log('\nDOM Check:');
  console.log('total-score found:', !!totalScore);
  if (totalScore) console.log('total-score text:', totalScore.textContent.trim().slice(0,200));
  console.log('legend found:', !!legend);
  console.log('bars count:', bars.length);
  if (bars.length) console.log('bars:', bars.slice(0,5));

  process.exit(0);
})();
