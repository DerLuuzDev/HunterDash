module.exports = {
  APP_NAME: 'HunterDash',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'COTW Glück-Rechner für Desktop & Mobile',
  APP_ID: 'de.hunterdash.calculator',

  WINDOW: {
    DEFAULT_WIDTH: 800,
    DEFAULT_HEIGHT: 600,
    MIN_WIDTH: 400,
    MIN_HEIGHT: 600,
    CENTER: true,
    RESIZABLE: true,
    FRAME: true,
    TITLE_BAR_STYLE: 'default',
    HIDE_MENU_BAR: true
  },

  ICONS: {
    WINDOWS: 'assets/icons/hunterdash.ico',
    LINUX: 'assets/icons/hunterdash.png',
    SVG_SOURCE: 'assets/icons/hunterdash.svg'
  },

  API: {
    BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
    ENDPOINTS: {
      CALCULATE: '/api/calculate',
      HEALTH: '/api/health'
    },
    ENABLE_BACKEND: false,
    TIMEOUT: 5000
  },

  WEBSOCKET: {
    ENABLED: false,
    URL: process.env.WS_URL || 'ws://localhost:3000/ws',
    RECONNECT_INTERVAL: 5000,
    MAX_RECONNECT_ATTEMPTS: 5
  },

  STORAGE: {
    KEYS: {
      SETTINGS: 'hunterdash-settings',
      LAST_VALUES: 'hunterdash-last-values',
      THEME: 'hunterdash-theme',
      CALCULATION_HISTORY: 'hunterdash-history',
      TEMPLATES: 'hunterdash-templates',
      ACCOUNTS: 'hunterdash-accounts',
      UNDO_STACK: 'hunterdash-undo',
      REDO_STACK: 'hunterdash-redo',
      GRIND_SESSIONS: 'grind-sessions',
      GRIND_SETTINGS: 'grind-settings'
    },
    DEFAULT_SETTINGS: {
      theme: 'light',
      autoSave: true,
      apiEnabled: false,
      apiEndpoint: 'http://localhost:3000',
      autoHistory: true,
      grindEditableTips: false,
      grindShowCharts: true,
      overlayMode: false,
      audioFeedback: true,
      audioVolume: 0.5,
      animalLanguage: 'de',
      sessionHotkeys: {
        addKill: 'F7',
        removeKill: 'F8',
        togglePause: 'F9',
        endSession: 'F10'
      }
    },
    HISTORY: {
      MAX_ENTRIES: 180,
      AUTO_SAVE: true,
      FILENAME: 'history.json',
      BACKUP_DIR: 'backups/history',
      MAX_BACKUPS: 10,
      BACKUP_INTERVAL_DAYS: 7
    },
    UNDO_REDO: {
      MAX_STACK_SIZE: 50
    }
  },

  POISSON: {
    CATEGORIES: [
      { key: 'rare', name: 'Rares', defaultP: 0.003 },
      { key: 'diamond', name: 'Diamonds', defaultP: 0.01 },
      { key: 'super', name: 'Super Rares', defaultP: 0.00003 },
      { key: 'go', name: 'Great Ones', defaultP: 0.00005 }
    ],
    COLOR_RANGES: [
      { min: 2, color: '#16a34a', label: 'Sehr Glücklich (Z≥2)' },
      { min: 0.5, color: '#a3e635', label: 'Glücklich (Z≥0.5)' },
      { min: -0.5, color: '#facc15', label: 'Neutral (-0.5≤Z≤0.5)' },
      { min: -2, color: '#f87171', label: 'Pech (-2≤Z<-0.5)' },
      { min: -Infinity, color: '#b91c1c', label: 'Sehr Pech (Z<-2)' }
    ],
    INTERPRETATION: [
      { min: 3, text: 'Absolut legendäres Glück! 🎉 Du bist ein Glücksritter!' },
      { min: 2, text: 'Super glücklicher als erwartet! 👍 Weiter so!' },
      { min: 0, text: 'Leicht glücklicher als erwartet. 😊 Solides Glück!' },
      { min: -2, text: 'Durchschnittliches Glück. 😌 Alles im grünen Bereich!' },
      { min: -3, text: 'Ein bisschen Pech gehabt, aber du schaffst das! 💪 Nächstes Mal mehr!' },
      { min: -Infinity, text: 'Viel Pech bisher, aber der nächste Grind wird episch! 🌟 Bleib dran!' }
    ]
  },

  DEV: {
    ENABLE_DEV_TOOLS: true,
    LOG_LEVEL: 'info'
  },

  TEMPLATES: {
    PRESETS: [
      {
        id: 'new-player',
        name: 'Neuer Spieler',
        description: 'Für Spieler unter 5000 Harvests',
        data: {
          n: 2500,
          k_rare: 8,
          p_rare: 0.003,
          k_diamond: 25,
          p_diamond: 0.01,
          k_super: 0,
          p_super: 0.00003,
          k_go: 0,
          p_go: 0.00005
        }
      },
      {
        id: 'average',
        name: 'Durchschnittlicher Spieler',
        description: 'Für Spieler mit 10000-20000 Harvests',
        data: {
          n: 15000,
          k_rare: 45,
          p_rare: 0.003,
          k_diamond: 150,
          p_diamond: 0.01,
          k_super: 0,
          p_super: 0.00003,
          k_go: 0,
          p_go: 0.00005
        }
      },
      {
        id: 'veteran',
        name: 'Veteran',
        description: 'Für Spieler mit 20000+ Harvests',
        data: {
          n: 35000,
          k_rare: 105,
          p_rare: 0.003,
          k_diamond: 350,
          p_diamond: 0.01,
          k_super: 1,
          p_super: 0.00003,
          k_go: 1,
          p_go: 0.00005
        }
      },
      {
        id: 'lucky',
        name: 'Glücklicher Spieler',
        description: 'Für überdurchschnittlich glückliche Werte',
        data: {
          n: 10000,
          k_rare: 50,
          p_rare: 0.005,
          k_diamond: 200,
          p_diamond: 0.02,
          k_super: 1,
          p_super: 0.00003,
          k_go: 1,
          p_go: 0.00005
        }
      }
    ]
  },

  P_PRESETS: {
    rare: [
      { label: 'Durchschnitt (1:333)', value: 0.003 },
      { label: 'Glücklich (1:250)', value: 0.004 },
      { label: 'Pech (1:500)', value: 0.002 }
    ],
    diamond: [
      { label: 'Durchschnitt (1:100)', value: 0.01 },
      { label: 'Glücklich (1:80)', value: 0.0125 },
      { label: 'Pech (1:150)', value: 0.0067 }
    ],
    super: [
      { label: 'Durchschnitt (1:33.000)', value: 0.00003 },
      { label: 'Glücklich (1:25.000)', value: 0.00004 }
    ],
    go: [
      { label: 'Durchschnitt (1:20.000)', value: 0.00005 },
      { label: 'Glücklich (1:15.000)', value: 0.000067 }
    ]
  },

  GRIND: {
    FILENAME: 'grind-sessions.json',
    BACKUP_DIR: 'backups/grind',
    MAX_BACKUPS: 10,
    SESSION_TEMPLATES: [
      { id: 'go-tier', name: 'GO [Tier]', icon: '🏆', animalBased: true },
      { id: 'general', name: 'General Grind', icon: '🎯', animalBased: false },
      { id: 'practice', name: 'Practice', icon: '🎮', animalBased: false },
      { id: 'speedrun', name: 'Speedrun', icon: '⚡', animalBased: false }
    ],
    DEFAULT_HOTKEYS: {
      addKill: 'F7',
      removeKill: 'F8',
      togglePause: 'F9',
      endSession: 'F10'
    },
    SESSION_STATUS: {
      RUNNING: 'running',
      PAUSED: 'paused',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled'
    },
    ANIMALS: [
      // Great Ones - Official List (Stand: Januar 2026)
      { id: 'whitetail', name: 'Whitetail Deer', nameDe: 'Weißwedelhirsch', icon: '🦌', spawnChance: 0.00005, releaseDate: '2020-04' },
      { id: 'reddeer', name: 'Red Deer', nameDe: 'Rothirsch', icon: '🦌', spawnChance: 0.00005, releaseDate: '2021-11' },
      { id: 'blackbear', name: 'Black Bear', nameDe: 'Schwarzbär', icon: '🐻', spawnChance: 0.00005, releaseDate: '2022-06' },
      { id: 'moose', name: 'Moose', nameDe: 'Elch', icon: '🫎', spawnChance: 0.00005, releaseDate: '2022-12' },
      { id: 'fallowdeer', name: 'Fallow Deer', nameDe: 'Damhirsch', icon: '🦌', spawnChance: 0.00005, releaseDate: '2023-06' },
      { id: 'tahr', name: 'Tahr', nameDe: 'Tahr', icon: '🐐', spawnChance: 0.00005, releaseDate: '2024-06' },
      { id: 'redfox', name: 'Red Fox', nameDe: 'Rotfuchs', icon: '🦊', spawnChance: 0.00005, releaseDate: '2024-12' },
      { id: 'pheasant', name: 'Ring-Necked Pheasant', nameDe: 'Ringfasan', icon: '🐦', spawnChance: 0.00005, releaseDate: '2024-12' },
      { id: 'muledeer', name: 'Mule Deer', nameDe: 'Maultierhirsch', icon: '🦌', spawnChance: 0.00005, releaseDate: '2025-06' },
      { id: 'graywolf', name: 'Gray Wolf', nameDe: 'Grauwolf', icon: '🐺', spawnChance: 0.00005, releaseDate: '2025-10' },
      { id: 'wildboar', name: 'Wild Boar', nameDe: 'Wildschwein', icon: '🐗', spawnChance: 0.00005, releaseDate: '2025-12' }
    ],
    TIPS: {
      general: `
        <p><strong>📖 Grundlagen des Herd-Managements:</strong></p>
        <p>Herden in COTW verhalten sich wie echte Tierpopulationen. Wenn du eine Herd überjagst, kann es dauern, bis sie sich neu formiert.</p>
        <ul>
          <li><strong>Respawn-Time:</strong> Herden spawnen meist nach 2-4 Stunden neu</li>
          <li><strong>Qualität beeinflussen:</strong> Kills von niedriger Qualität (z.B. 2-5 Score) ziehen den Durchschnitt der Herde runter</li>
          <li><strong>High-Only:</strong> Fokussiere dich auf nur High-Scoring-Tiere für bessere Chancen</li>
        </ul>
        <p><strong>💡 Pro-Tipp:</strong> Überprüfe regelmäßig die Respawn-Zeiten deiner bevorzugten Zonen!</p>
      `,
      wildboar: `
        <p><strong>🐗 Wildschwein GO-Grind:</strong></p>
        <p>Wildschweine sind eines der besten Tiere für GO-Farming aufgrund ihrer hohen Spawn-Rate und guten Herdengröße.</p>
        <ul>
          <li><strong>Konzenriere dich auf Männchen:</strong> Nur männliche Wildschweine können GOs werden</li>
          <li><strong>Vermeide Weibchen-Kills:</strong> Weibchen-Kills zählen nicht zur Herdenqualität</li>
          <li><strong>Optimale Zonen:</strong> Hirschfelden, Layton Lake District</li>
          <li><strong>Herdengröße:</strong> 8-12 Tiere pro Herd typisch</li>
        </ul>
        <p><strong>📊 Statistik:</strong> Spawn-Chance ≈ 1:20.000 (p = 0.00005)</p>
      `,
      bear: `
        <p><strong>🐻 Bären GO-Grind:</strong></p>
        <p>Bären sind seltener als Wildschweine, aber GOs sind lohnenswert.</p>
        <ul>
          <li><strong>Konzenriere dich auf Männchen:</strong> Nur männliche Bären können GOs werden</li>
          <li><strong>Bären-Essen:</strong> Schaffe einen Bärenfutterplatz in deiner Reserve</li>
          <li><strong>Night-Grind:</strong> Bären sind nachts aktiver</li>
          <li><strong>Optimale Zonen:</strong> Hirschfelden, Yukon Valley</li>
        </ul>
        <p><strong>📊 Statistik:</strong> Spawn-Chance ≈ 1:33.000 (p = 0.00003)</p>
      `,
      moose: `
        <p><strong>🫎 Elch GO-Grind:</strong></p>
        <p>Elche haben eine mittlere Spawn-Rate und sind gut für GO-Farming.</p>
        <ul>
          <li><strong>Konzenriere dich auf Männchen:</strong> Nur männliche Elche können GOs werden</li>
          <li><strong>Ruf-Lock:</strong> Nutze Elchrufe, um sie anzulocken</li>
          <li><strong>Water-Edge:</strong> Elche trinken oft am Wasserufer</li>
          <li><strong>Optimale Zonen:</strong> Hirschfelden, Yukon Valley</li>
        </ul>
        <p><strong>📊 Statistik:</strong> Spawn-Chance ≈ 1:33.000 (p = 0.00003)</p>
      `,
      lion: `
        <p><strong>🦁 Löwen GO-Grind:</strong></p>
        <p>Löwen sind die seltensten GOs, aber sehr wertvoll.</p>
        <ul>
          <li><strong>Nur Männchen:</strong> Nur männliche Löwen können GOs werden</li>
          <li><strong>Respawn:</strong> Löwen-Herden respawnen nach 4-6 Stunden</li>
          <li><strong>Optimale Zonen:</strong> Vurhonga Savanna, Bushuza</li>
          <li><strong>Grind-Strategie:</strong> Überjage nicht zu schnell, Herdenqualität ist wichtig</li>
        </ul>
        <p><strong>📊 Statistik:</strong> Spawn-Chance ≈ 1:50.000 (p = 0.00002)</p>
      `,
      bison: `
        <p><strong>🌿 Bison GO-Grind:</strong></p>
        <p>Bisons haben eine hohe Spawn-Rate, aber große Herden sind schwer zu finden.</p>
        <ul>
          <li><strong>Herdengröße:</strong> 10-20 Tiere pro Herd typisch</li>
          <li><strong>Optimale Zonen:</strong> Layton Lake, Yukon Valley</li>
          <li><strong>Grind-Strategie:</strong> Konzentriere dich auf die größten Herden</li>
        </ul>
        <p><strong>📊 Statistik:</strong> Spawn-Chance ≈ 1:25.000 (p = 0.00004)</p>
      `,
      whitetail: `
        <p><strong>🦌 Weißwedelhirsch GO-Grind:</strong></p>
        <p>Weißwedelhirsche sind häufig, aber GOs sind wertvoll.</p>
        <ul>
          <li><strong>Herdengröße:</strong> 6-10 Tiere pro Herd typisch</li>
          <li><strong>Optimale Zonen:</strong> Hirschfelden, Layton Lake</li>
          <li><strong>Grind-Strategie:</strong> Fokus auf High-Score-Böcke</li>
        </ul>
        <p><strong>📊 Statistik:</strong> Spawn-Chance ≈ 1:33.000 (p = 0.00003)</p>
      `,
      redfox: `
        <p><strong>🦊 Rotfuchs GO-Grind:</strong></p>
        <p>Füchse sind klein, aber GOs sind seltene Schätze.</p>
        <ul>
          <li><strong>Herdengröße:</strong> 4-8 Tiere pro Herd typisch</li>
          <li><strong>Optimale Zonen:</strong> Hirschfelden, Yukon Valley</li>
          <li><strong>Grind-Strategie:</strong> Nutze Fuchsrufe, um sie anzulocken</li>
        </ul>
        <p><strong>📊 Statistik:</strong> Spawn-Chance ≈ 1:25.000 (p = 0.00004)</p>
      `,
      blackbear: `
        <p><strong>🐻‍❄️ Schwarzbären GO-Grind:</strong></p>
        <p>Schwarzbären sind ähnlich wie normale Bären, aber mit leichter Variation.</p>
        <ul>
          <li><strong>Konzenriere dich auf Männchen:</strong> Nur männliche Schwarzbären können GOs werden</li>
          <li><strong>Bären-Essen:</strong> Schaffe einen Schwarzbärenfutterplatz</li>
          <li><strong>Night-Grind:</strong> Schwarzbären sind nachts aktiver</li>
          <li><strong>Optimale Zonen:</strong> Hirschfelden, Yukon Valley</li>
        </ul>
        <p><strong>📊 Statistik:</strong> Spawn-Chance ≈ 1:33.000 (p = 0.00003)</p>
      `,
      caribou: `
        <p><strong>🫎 Rentier GO-Grind:</strong></p>
        <p>Rentiere haben eine mittlere Spawn-Rate.</p>
        <ul>
          <li><strong>Herdengröße:</strong> 8-12 Tiere pro Herd typisch</li>
          <li><strong>Optimale Zonen:</strong> Yukon Valley, Medved Taiga</li>
          <li><strong>Grind-Strategie:</strong> Konzentriere dich auf die großen Herden</li>
        </ul>
        <p><strong>📊 Statistik:</strong> Spawn-Chance ≈ 1:33.000 (p = 0.00003)</p>
      `,
      fallowdeer: `
        <p><strong>🦌 Damhirsch GO-Grind:</strong></p>
        <p>Damhirsche sind häufig, aber GOs sind wertvoll.</p>
        <ul>
          <li><strong>Herdengröße:</strong> 6-10 Tiere pro Herd typisch</li>
          <li><strong>Optimale Zonen:</strong> Hirschfelden, Layton Lake</li>
          <li><strong>Grind-Strategie:</strong> Fokus auf High-Score-Hirsche</li>
        </ul>
        <p><strong>📊 Statistik:</strong> Spawn-Chance ≈ 1:33.000 (p = 0.00003)</p>
      `,
      roebuck: `
        <p><strong>🦌 Rehbock GO-Grind:</strong></p>
        <p>Rehböcke sind klein, aber GOs sind seltene Schätze.</p>
        <ul>
          <li><strong>Herdengröße:</strong> 4-8 Tiere pro Herd typisch</li>
          <li><strong>Optimale Zonen:</strong> Hirschfelden, Medved Taiga</li>
          <li><strong>Grind-Strategie:</strong> Nutze Rehrufe, um sie anzulocken</li>
        </ul>
        <p><strong>📊 Statistik:</strong> Spawn-Chance ≈ 1:33.000 (p = 0.00003)</p>
      `,
      whitetaildoe: `
        <p><strong>🦌 Weißwedelhirsch-Kuh GO-Grind:</strong></p>
        <p>Weißwedelhirsch-Kühe sind häufig, aber GOs sind sehr selten.</p>
        <ul>
          <li><strong>Herdengröße:</strong> 6-10 Tiere pro Herd typisch</li>
          <li><strong>Optimale Zonen:</strong> Hirschfelden, Layton Lake</li>
          <li><strong>Grind-Strategie:</strong> Fokus auf High-Score-Kühe</li>
        </ul>
        <p><strong>📊 Statistik:</strong> Spawn-Chance ≈ 1:33.000 (p = 0.00003)</p>
      `,
      blacktaildeer: `
        <p><strong>🦌 Schwarzschwanzhirsch GO-Grind:</strong></p>
        <p>Schwarzschwanzhirsche sind in bestimmten Zonen häufig.</p>
        <ul>
          <li><strong>Herdengröße:</strong> 6-10 Tiere pro Herd typisch</li>
          <li><strong>Optimale Zonen:</strong> Yukon Valley, Medved Taiga</li>
          <li><strong>Grind-Strategie:</strong> Fokus auf High-Score-Hirsche</li>
        </ul>
        <p><strong>📊 Statistik:</strong> Spawn-Chance ≈ 1:33.000 (p = 0.00003)</p>
      `,
      puma: `
        <p><strong>🐱 Puma GO-Grind:</strong></p>
        <p>Pumas sind seltene Raubtiere, aber GOs sind wertvoll.</p>
        <ul>
          <li><strong>Respawn:</strong> Puma-Herden respawnen nach 4-6 Stunden</li>
          <li><strong>Optimale Zonen:</strong> Silver Ridge Peaks, Yukon Valley</li>
          <li><strong>Grind-Strategie:</strong> Überjage nicht zu schnell, Herdenqualität ist wichtig</li>
        </ul>
        <p><strong>📊 Statistik:</strong> Spawn-Chance ≈ 1:50.000 (p = 0.00002)</p>
      `,
      coyote: `
        <p><strong>🐺 Kojote GO-Grind:</strong></p>
        <p>Kojoten sind häufige Raubtiere, aber GOs sind selten.</p>
        <ul>
          <li><strong>Herdengröße:</strong> 4-8 Tiere pro Herd typisch</li>
          <li><strong>Optimale Zonen:</strong> Hirschfelden, Yukon Valley</li>
          <li><strong>Grind-Strategie:</strong> Nutze Kojotenrufe, um sie anzulocken</li>
        </ul>
        <p><strong>📊 Statistik:</strong> Spawn-Chance ≈ 1:25.000 (p = 0.00004)</p>
      `,
      bobcat: `
        <p><strong>🐱 Rotluchs GO-Grind:</strong></p>
        <p>Rotluchse sind seltene Raubtiere, aber GOs sind wertvoll.</p>
        <ul>
          <li><strong>Herdengröße:</strong> 4-8 Tiere pro Herd typisch</li>
          <li><strong>Optimale Zonen:</strong> Yukon Valley, Medved Taiga</li>
          <li><strong>Grind-Strategie:</strong> Nutze Luchsrufe, um sie anzulocken</li>
        </ul>
        <p><strong>📊 Statistik:</strong> Spawn-Chance ≈ 1:33.000 (p = 0.00003)</p>
      `,
      europeanbison: `
        <p><strong>🌿 Wisent GO-Grind:</strong></p>
        <p>Wisente sind selten, aber GOs sind sehr wertvoll.</p>
        <ul>
          <li><strong>Herdengröße:</strong> 10-20 Tiere pro Herd typisch</li>
          <li><strong>Optimale Zonen:</strong> Hirschfelden, Medved Taiga</li>
          <li><strong>Grind-Strategie:</strong> Konzentriere dich auf die größten Herden</li>
        </ul>
        <p><strong>📊 Statistik:</strong> Spawn-Chance ≈ 1:25.000 (p = 0.00004)</p>
      `
    },
    STORAGE_KEY: 'grind-sessions',
    MAX_SESSIONS: 50,
    DEFAULT_SETTINGS: {
      editableTips: false,
      showCharts: true
    }
  }
};
