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
      theme: 'dark',
      autoSave: true,
      apiEnabled: false,
      apiEndpoint: 'http://localhost:3000',
      autoHistory: true,
      grindEditableTips: false,
      grindShowCharts: true,
      overlayMode: false,
      minimizeToTray: false,
      audioFeedback: true,
      audioVolume: 0.5,
      animalLanguage: 'de',
      sessionHotkeys: {
        addKill: 'F7',
        addKill: 'F7',
        removeKill: 'F10', // Changed from F8
        togglePause: 'F9',
        endSession: 'F8'   // Changed from F10
      }
    },
    HISTORY: {
      MAX_ENTRIES: 10000,
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
      addKill: 'F7',
      removeKill: 'F10', // Changed from F8
      togglePause: 'F9',
      endSession: 'F8'   // Changed from F10
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
  },

  // Need Zone Reference Data for the Reference Tab
  REFERENCE: {
    MAPS: [
      // Base Game (Feb 2017)
      { id: 'hirschfelden', name: 'Hirschfelden', icon: '🦌', animals: ['red_deer', 'roe_deer', 'fallow_deer', 'wild_boar', 'european_rabbit', 'red_fox', 'ring_necked_pheasant', 'canada_goose', 'european_bison'] },
      { id: 'layton', name: 'Layton Lake District', icon: '🏕️', animals: ['whitetail', 'blacktail', 'moose', 'roosevelt_elk', 'black_bear', 'coyote', 'jackrabbit', 'mallard', 'turkey'] },
      // DLC Maps (chronological release order)
      { id: 'medved', name: 'Medved-Taiga', icon: '❄️', animals: ['brown_bear', 'moose', 'reindeer', 'wild_boar', 'musk_deer', 'eurasian_lynx', 'western_capercaillie', 'gray_wolf'] },
      { id: 'vurhonga', name: 'Vurhonga Savanna', icon: '🦁', animals: ['lion', 'cape_buffalo', 'gemsbok', 'springbok', 'blue_wildebeest', 'lesser_kudu', 'scrub_hare', 'warthog', 'side_striped_jackal'] },
      { id: 'parque', name: 'Parque Fernando', icon: '🌴', animals: ['red_deer', 'water_buffalo', 'axis_deer', 'cinnamon_teal', 'blackbuck', 'puma', 'collared_peccary', 'mule_deer'] },
      { id: 'yukon', name: 'Yukon Valley', icon: '🐻', animals: ['grizzly_bear', 'moose', 'plains_bison', 'caribou', 'gray_wolf', 'red_fox', 'canada_goose'] },
      { id: 'cuatro', name: 'Cuatro Colinas', icon: '🐗', animals: ['iberian_wolf', 'iberian_mouflon', 'red_deer', 'roe_deer', 'wild_boar', 'beceite_ibex', 'ronda_ibex', 'european_hare', 'ring_necked_pheasant'] },
      { id: 'silver_ridge', name: 'Silver Ridge Peaks', icon: '🏔️', animals: ['rocky_mountain_elk', 'mule_deer', 'mountain_lion', 'mountain_goat', 'bighorn_sheep', 'pronghorn', 'black_bear', 'plains_bison', 'turkey'] },
      { id: 'te_awaroa', name: 'Te Awaroa', icon: '🥝', animals: ['red_deer', 'feral_goat', 'feral_pig', 'sika_deer', 'fallow_deer', 'chamois', 'turkey'] },
      { id: 'rancho', name: 'Rancho del Arroyo', icon: '🌵', animals: ['whitetail', 'mule_deer', 'rio_grande_turkey', 'ring_necked_pheasant', 'antelope_jackrabbit', 'collared_peccary', 'bighorn_sheep', 'coyote', 'mexican_bobcat', 'pronghorn'] },
      { id: 'mississippi', name: 'Mississippi Acres', icon: '🐊', animals: ['whitetail', 'eastern_wild_turkey', 'bobwhite_quail', 'eastern_cottontail', 'gray_fox', 'raccoon', 'wild_hog', 'american_alligator', 'black_bear'] },
      { id: 'revontuli', name: 'Revontuli Coast', icon: '🌲', animals: ['whitetail', 'moose', 'brown_bear', 'eurasian_lynx', 'rock_ptarmigan', 'willow_ptarmigan', 'black_grouse', 'hazel_grouse', 'western_capercaillie', 'raccoon_dog', 'mountain_hare'] },
      { id: 'new_england', name: 'New England Mountains', icon: '🍂', animals: ['whitetail', 'black_bear', 'moose', 'bobcat', 'eastern_wild_turkey', 'eastern_cottontail', 'gray_fox', 'red_fox', 'coyote', 'ring_necked_pheasant', 'bobwhite_quail', 'raccoon'] },
      { id: 'emerald', name: 'Emerald Coast (Australia)', icon: '🦘', animals: ['red_deer', 'sambar_deer', 'javan_rusa', 'axis_deer', 'fallow_deer', 'banteng', 'feral_pig', 'feral_goat', 'hog_deer', 'red_fox', 'saltwater_crocodile', 'stubble_quail'] },
      { id: 'sundarpatan', name: 'Sundarpatan (Nepal)', icon: '🐅', animals: ['bengal_tiger', 'water_buffalo', 'himalayan_tahr', 'nilgai', 'blackbuck', 'indian_muntjac', 'blue_sheep', 'barasingha', 'snow_leopard', 'tibetan_fox', 'woolly_hare', 'wild_yak'] },
      { id: 'salzwiesen', name: 'Salzwiesen Park', icon: '🦆', animals: ['greylag_goose', 'tundra_bean_goose', 'ring_necked_pheasant', 'black_grouse', 'european_rabbit', 'raccoon', 'raccoon_dog', 'red_fox', 'goldeneye', 'eurasian_teal', 'mallard'] },
      { id: 'askiy', name: 'Askiy Ridge', icon: '🦬', animals: ['black_bear', 'bighorn_sheep', 'gray_wolf', 'manitoban_elk', 'moose', 'mule_deer', 'pronghorn', 'whitetail', 'wood_bison', 'woodland_caribou', 'mountain_goat', 'beaver'] },
      { id: 'scotland', name: 'Tòrr nan Sithean', icon: '🏴', animals: ['red_deer', 'roe_deer', 'fallow_deer', 'sika_deer', 'wild_boar', 'red_fox', 'feral_goat', 'mountain_hare', 'european_badger', 'black_grouse', 'ring_necked_pheasant'] }
    ],

    // Need Zone times: Each array contains {start, end} in 24h format
    // Times based on espis.de and community guides
    NEED_ZONES: {
      // Hirschfelden Animals (espis.de data)
      red_deer: {
        drink: [{ start: 5, end: 9 }],
        feed: [{ start: 17, end: 21 }],
        rest: [{ start: 9, end: 17 }, { start: 21, end: 5 }]
      },
      whitetail: {
        drink: [{ start: 5, end: 9 }, { start: 17, end: 21 }],
        feed: [{ start: 9, end: 17 }],
        rest: [{ start: 21, end: 5 }]
      },
      mule_deer: {
        drink: [{ start: 5, end: 9 }, { start: 17, end: 21 }],
        feed: [{ start: 9, end: 17 }],
        rest: [{ start: 21, end: 5 }]
      },
      blacktail: {
        drink: [{ start: 5, end: 9 }, { start: 17, end: 21 }],
        feed: [{ start: 9, end: 17 }],
        rest: [{ start: 21, end: 5 }]
      },
      roe_deer: {
        drink: [{ start: 13, end: 17 }],
        feed: [{ start: 13, end: 17 }, { start: 17, end: 21 }],
        rest: [{ start: 0, end: 3 }, { start: 3, end: 6 }, { start: 10, end: 13 }, { start: 21, end: 0 }]
      },
      fallow_deer: {
        drink: [{ start: 10, end: 13 }],
        feed: [{ start: 6, end: 10 }, { start: 17, end: 21 }],
        rest: [{ start: 0, end: 3 }, { start: 0.5, end: 6 }, { start: 13, end: 17 }, { start: 21, end: 0 }]
      },
      axis_deer: {
        drink: [{ start: 7, end: 11 }, { start: 15, end: 19 }],
        feed: [{ start: 11, end: 15 }],
        rest: [{ start: 19, end: 7 }]
      },
      sika_deer: {
        drink: [{ start: 5, end: 9 }, { start: 17, end: 21 }],
        feed: [{ start: 9, end: 17 }],
        rest: [{ start: 21, end: 5 }]
      },
      sambar_deer: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 20 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 20, end: 6 }]
      },
      reindeer: {
        drink: [{ start: 4, end: 8 }],
        feed: [{ start: 8, end: 12 }, { start: 16, end: 20 }],
        rest: [{ start: 0, end: 4 }, { start: 12, end: 16 }, { start: 20, end: 0 }]
      },
      caribou: {
        drink: [{ start: 6, end: 12 }, { start: 18, end: 21 }],
        feed: [{ start: 12, end: 18 }],
        rest: [{ start: 21, end: 6 }]
      },
      // Elk Family (Layton Lake / espis.de data)
      moose: {
        drink: [{ start: 12, end: 16 }],
        feed: [{ start: 4, end: 8 }, { start: 16, end: 20 }],
        rest: [{ start: 0, end: 4 }, { start: 8, end: 12 }, { start: 20, end: 0 }]
      },
      roosevelt_elk: {
        drink: [{ start: 4, end: 8 }],
        feed: [{ start: 8, end: 12 }, { start: 16, end: 20 }],
        rest: [{ start: 0, end: 4 }, { start: 12, end: 16 }, { start: 20, end: 0 }]
      },
      rocky_mountain_elk: {
        drink: [{ start: 4, end: 9 }, { start: 16, end: 20 }],
        feed: [{ start: 9, end: 16 }],
        rest: [{ start: 20, end: 4 }]
      },
      // Bears (Layton Lake / espis.de data)
      black_bear: {
        drink: [{ start: 4, end: 8 }],
        feed: [{ start: 0, end: 4 }, { start: 20, end: 0 }],
        rest: [{ start: 8, end: 12 }, { start: 12, end: 16 }, { start: 16, end: 20 }]
      },
      brown_bear: {
        drink: [{ start: 20, end: 0 }],
        feed: [{ start: 0, end: 4 }, { start: 4, end: 8 }],
        rest: [{ start: 8, end: 12 }, { start: 12, end: 16 }, { start: 16, end: 20 }]
      },
      grizzly_bear: {
        drink: [{ start: 5, end: 10 }, { start: 17, end: 21 }],
        feed: [{ start: 10, end: 17 }],
        rest: [{ start: 21, end: 5 }]
      },
      // Wild Boar & Pigs
      wild_boar: {
        drink: [{ start: 23, end: 3.5 }],
        feed: [{ start: 3, end: 7.5 }],
        rest: [{ start: 7.5, end: 23 }]
      },
      feral_pig: {
        drink: [{ start: 4, end: 8 }, { start: 20, end: 0 }],
        feed: [{ start: 8, end: 20 }],
        rest: [{ start: 0, end: 4 }]
      },
      wild_hog: {
        drink: [{ start: 4, end: 8 }, { start: 20, end: 0 }],
        feed: [{ start: 8, end: 20 }],
        rest: [{ start: 0, end: 4 }]
      },
      // Wolves & Canines (Medved-Taiga / espis.de)
      gray_wolf: {
        drink: [{ start: 17, end: 20 }],
        feed: [{ start: 0, end: 3 }, { start: 3, end: 6 }, { start: 20, end: 0 }],
        rest: [{ start: 6, end: 10 }, { start: 10, end: 14 }, { start: 14, end: 17 }]
      },
      coyote: {
        drink: [{ start: 0, end: 4 }],
        feed: [{ start: 4, end: 7 }, { start: 17, end: 20 }, { start: 20, end: 0 }],
        rest: [{ start: 7, end: 10 }, { start: 10, end: 14 }, { start: 14, end: 17 }]
      },
      red_fox: {
        drink: [{ start: 17, end: 20.5 }],
        feed: [{ start: 0, end: 7 }, { start: 20, end: 0 }],
        rest: [{ start: 7, end: 10.5 }]
      },
      gray_fox: {
        drink: [{ start: 5, end: 9 }, { start: 17, end: 21 }],
        feed: [{ start: 9, end: 17 }],
        rest: [{ start: 21, end: 5 }]
      },
      // Cats
      mountain_lion: {
        drink: [{ start: 4, end: 8 }, { start: 20, end: 0 }],
        feed: [{ start: 8, end: 20 }],
        rest: [{ start: 0, end: 4 }]
      },
      puma: {
        drink: [{ start: 4, end: 8 }, { start: 20, end: 0 }],
        feed: [{ start: 8, end: 20 }],
        rest: [{ start: 0, end: 4 }]
      },
      lion: {
        drink: [{ start: 4, end: 8 }, { start: 18, end: 22 }],
        feed: [{ start: 8, end: 18 }],
        rest: [{ start: 22, end: 4 }]
      },
      lynx: {
        drink: [{ start: 5, end: 9 }, { start: 20, end: 0 }],
        feed: [{ start: 9, end: 20 }],
        rest: [{ start: 0, end: 5 }]
      },
      bobcat: {
        drink: [{ start: 5, end: 9 }, { start: 20, end: 0 }],
        feed: [{ start: 9, end: 20 }],
        rest: [{ start: 0, end: 5 }]
      },
      mexican_bobcat: {
        drink: [{ start: 5, end: 9 }, { start: 20, end: 0 }],
        feed: [{ start: 9, end: 20 }],
        rest: [{ start: 0, end: 5 }]
      },
      eurasian_lynx: {
        drink: [{ start: 5, end: 9 }, { start: 20, end: 0 }],
        feed: [{ start: 9, end: 20 }],
        rest: [{ start: 0, end: 5 }]
      },
      // Bison/Buffalo
      plains_bison: {
        drink: [{ start: 7, end: 11 }, { start: 16, end: 20 }],
        feed: [{ start: 11, end: 16 }],
        rest: [{ start: 20, end: 7 }]
      },
      european_bison: {
        drink: [{ start: 6, end: 10 }],
        feed: [{ start: 0, end: 5 }],
        rest: [{ start: 10, end: 13 }]
      },
      water_buffalo: {
        drink: [{ start: 6, end: 10 }, { start: 15, end: 19 }],
        feed: [{ start: 10, end: 15 }],
        rest: [{ start: 19, end: 6 }]
      },
      cape_buffalo: {
        drink: [{ start: 6, end: 10 }, { start: 15, end: 19 }],
        feed: [{ start: 10, end: 15 }],
        rest: [{ start: 19, end: 6 }]
      },
      // Goats & Sheep
      mountain_goat: {
        drink: [{ start: 6, end: 10 }, { start: 15, end: 19 }],
        feed: [{ start: 10, end: 15 }],
        rest: [{ start: 19, end: 6 }]
      },
      bighorn_sheep: {
        drink: [{ start: 6, end: 10 }, { start: 15, end: 19 }],
        feed: [{ start: 10, end: 15 }],
        rest: [{ start: 19, end: 6 }]
      },
      feral_goat: {
        drink: [{ start: 6, end: 10 }, { start: 15, end: 19 }],
        feed: [{ start: 10, end: 15 }],
        rest: [{ start: 19, end: 6 }]
      },
      chamois: {
        drink: [{ start: 6, end: 10 }, { start: 15, end: 19 }],
        feed: [{ start: 10, end: 15 }],
        rest: [{ start: 19, end: 6 }]
      },
      iberian_mouflon: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 20 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 20, end: 6 }]
      },
      beceite_ibex: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 20 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 20, end: 6 }]
      },
      ronda_ibex: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 20 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 20, end: 6 }]
      },
      // African Animals
      gemsbok: {
        drink: [{ start: 8, end: 12 }, { start: 16, end: 20 }],
        feed: [{ start: 12, end: 16 }],
        rest: [{ start: 20, end: 8 }]
      },
      springbok: {
        drink: [{ start: 7, end: 11 }, { start: 15, end: 19 }],
        feed: [{ start: 11, end: 15 }],
        rest: [{ start: 19, end: 7 }]
      },
      blue_wildebeest: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 20 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 20, end: 6 }]
      },
      lesser_kudu: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 20 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 20, end: 6 }]
      },
      warthog: {
        drink: [{ start: 6, end: 10 }, { start: 14, end: 18 }],
        feed: [{ start: 10, end: 14 }],
        rest: [{ start: 18, end: 6 }]
      },
      // American Birds
      turkey: {
        drink: [{ start: 5, end: 9 }, { start: 16, end: 19 }],
        feed: [{ start: 9, end: 16 }],
        rest: [{ start: 19, end: 5 }]
      },
      eastern_wild_turkey: {
        drink: [{ start: 5, end: 9 }, { start: 16, end: 19 }],
        feed: [{ start: 9, end: 16 }],
        rest: [{ start: 19, end: 5 }]
      },
      rio_grande_turkey: {
        drink: [{ start: 5, end: 9 }, { start: 16, end: 19 }],
        feed: [{ start: 9, end: 16 }],
        rest: [{ start: 19, end: 5 }]
      },
      mallard: {
        drink: [{ start: 5, end: 9 }, { start: 17, end: 20 }],
        feed: [{ start: 9, end: 17 }],
        rest: [{ start: 20, end: 5 }]
      },
      canada_goose: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 20 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 20, end: 6 }]
      },
      pheasant: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 19 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 19, end: 6 }]
      },
      ring_necked_pheasant: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 19 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 19, end: 6 }]
      },
      // Small Mammals
      european_rabbit: {
        drink: [{ start: 5, end: 8 }, { start: 18, end: 21 }],
        feed: [{ start: 8, end: 18 }],
        rest: [{ start: 21, end: 5 }]
      },
      jackrabbit: {
        drink: [{ start: 5, end: 8 }, { start: 18, end: 21 }],
        feed: [{ start: 8, end: 18 }],
        rest: [{ start: 21, end: 5 }]
      },
      antelope_jackrabbit: {
        drink: [{ start: 5, end: 8 }, { start: 18, end: 21 }],
        feed: [{ start: 8, end: 18 }],
        rest: [{ start: 21, end: 5 }]
      },
      snowshoe_hare: {
        drink: [{ start: 5, end: 8 }, { start: 18, end: 21 }],
        feed: [{ start: 8, end: 18 }],
        rest: [{ start: 21, end: 5 }]
      },
      mountain_hare: {
        drink: [{ start: 5, end: 8 }, { start: 18, end: 21 }],
        feed: [{ start: 8, end: 18 }],
        rest: [{ start: 21, end: 5 }]
      },
      scrub_hare: {
        drink: [{ start: 5, end: 8 }, { start: 18, end: 21 }],
        feed: [{ start: 8, end: 18 }],
        rest: [{ start: 21, end: 5 }]
      },
      eastern_cottontail: {
        drink: [{ start: 5, end: 8 }, { start: 18, end: 21 }],
        feed: [{ start: 8, end: 18 }],
        rest: [{ start: 21, end: 5 }]
      },
      // Pronghorn
      pronghorn: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 20 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 20, end: 6 }]
      },
      blackbuck: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 20 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 20, end: 6 }]
      },
      // Misc
      collared_peccary: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 20 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 20, end: 6 }]
      },
      raccoon: {
        drink: [{ start: 20, end: 0 }, { start: 0, end: 4 }],
        feed: [{ start: 4, end: 20 }],
        rest: [{ start: 4, end: 20 }]
      },
      american_alligator: {
        drink: [{ start: 10, end: 14 }],
        feed: [{ start: 14, end: 20 }],
        rest: [{ start: 20, end: 10 }]
      },
      musk_deer: {
        drink: [{ start: 5, end: 9 }, { start: 17, end: 21 }],
        feed: [{ start: 9, end: 17 }],
        rest: [{ start: 21, end: 5 }]
      },
      iberian_wolf: {
        drink: [{ start: 5, end: 9 }, { start: 19, end: 23 }],
        feed: [{ start: 9, end: 19 }],
        rest: [{ start: 23, end: 5 }]
      },
      side_striped_jackal: {
        drink: [{ start: 5, end: 9 }, { start: 18, end: 22 }],
        feed: [{ start: 9, end: 18 }],
        rest: [{ start: 22, end: 5 }]
      },
      raccoon_dog: {
        drink: [{ start: 5, end: 9 }, { start: 18, end: 22 }],
        feed: [{ start: 9, end: 18 }],
        rest: [{ start: 22, end: 5 }]
      },
      hog_deer: {
        drink: [{ start: 5, end: 9 }, { start: 17, end: 21 }],
        feed: [{ start: 9, end: 17 }],
        rest: [{ start: 21, end: 5 }]
      },
      indian_muntjac: {
        drink: [{ start: 5, end: 9 }, { start: 17, end: 21 }],
        feed: [{ start: 9, end: 17 }],
        rest: [{ start: 21, end: 5 }]
      },
      javan_rusa: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 20 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 20, end: 6 }]
      },
      banteng: {
        drink: [{ start: 6, end: 10 }, { start: 15, end: 19 }],
        feed: [{ start: 10, end: 15 }],
        rest: [{ start: 19, end: 6 }]
      },
      western_capercaillie: {
        drink: [{ start: 5, end: 9 }, { start: 16, end: 19 }],
        feed: [{ start: 9, end: 16 }],
        rest: [{ start: 19, end: 5 }]
      },
      bobwhite_quail: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 19 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 19, end: 6 }]
      },
      rock_ptarmigan: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 19 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 19, end: 6 }]
      },
      goldeneye: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 19 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 19, end: 6 }]
      },
      black_grouse: {
        drink: [{ start: 5, end: 9 }, { start: 16, end: 19 }],
        feed: [{ start: 9, end: 16 }],
        rest: [{ start: 19, end: 5 }]
      },
      hazel_grouse: {
        drink: [{ start: 5, end: 9 }, { start: 16, end: 19 }],
        feed: [{ start: 9, end: 16 }],
        rest: [{ start: 19, end: 5 }]
      },
      cinnamon_teal: {
        drink: [{ start: 5, end: 9 }, { start: 17, end: 20 }],
        feed: [{ start: 9, end: 17 }],
        rest: [{ start: 20, end: 5 }]
      },
      harlequin_duck: {
        drink: [{ start: 5, end: 9 }, { start: 17, end: 20 }],
        feed: [{ start: 9, end: 17 }],
        rest: [{ start: 20, end: 5 }]
      },
      // Salzwiesen Park Animals (Waterfowl & Small Game)
      greylag_goose: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 20 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 20, end: 6 }]
      },
      tundra_bean_goose: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 20 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 20, end: 6 }]
      },
      eurasian_teal: {
        drink: [{ start: 5, end: 9 }, { start: 17, end: 20 }],
        feed: [{ start: 9, end: 17 }],
        rest: [{ start: 20, end: 5 }]
      },
      eurasian_wigeon: {
        drink: [{ start: 5, end: 9 }, { start: 17, end: 20 }],
        feed: [{ start: 9, end: 17 }],
        rest: [{ start: 20, end: 5 }]
      },
      tufted_duck: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 19 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 19, end: 6 }]
      },
      gadwall: {
        drink: [{ start: 5, end: 9 }, { start: 17, end: 20 }],
        feed: [{ start: 9, end: 17 }],
        rest: [{ start: 20, end: 5 }]
      },
      ferruginous_duck: {
        drink: [{ start: 5, end: 9 }, { start: 17, end: 20 }],
        feed: [{ start: 9, end: 17 }],
        rest: [{ start: 20, end: 5 }]
      },
      // Askiy Ridge Animals
      manitoban_elk: {
        drink: [{ start: 4, end: 8 }],
        feed: [{ start: 8, end: 16 }],
        rest: [{ start: 16, end: 4 }]
      },
      wood_bison: {
        drink: [{ start: 8, end: 12 }],
        feed: [{ start: 12, end: 20 }],
        rest: [{ start: 20, end: 8 }]
      },
      woodland_caribou: {
        drink: [{ start: 20, end: 0 }],
        feed: [{ start: 0, end: 12 }],
        rest: [{ start: 12, end: 20 }]
      },
      // Sundarpatan (Nepal) Animals
      bengal_tiger: {
        drink: [{ start: 4, end: 8 }, { start: 18, end: 22 }],
        feed: [{ start: 8, end: 18 }],
        rest: [{ start: 22, end: 4 }]
      },
      asian_water_buffalo: {
        drink: [{ start: 6, end: 10 }, { start: 15, end: 19 }],
        feed: [{ start: 10, end: 15 }],
        rest: [{ start: 19, end: 6 }]
      },
      himalayan_tahr: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 20 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 20, end: 6 }]
      },
      nilgai: {
        drink: [{ start: 6, end: 10 }, { start: 16, end: 20 }],
        feed: [{ start: 10, end: 16 }],
        rest: [{ start: 20, end: 6 }]
      },
      blue_sheep: {
        drink: [{ start: 6, end: 10 }, { start: 15, end: 19 }],
        feed: [{ start: 10, end: 15 }],
        rest: [{ start: 19, end: 6 }]
      },
      // Scotland (Tòrr nan Sithean) Animals
      red_grouse: {
        drink: [{ start: 5, end: 9 }, { start: 16, end: 19 }],
        feed: [{ start: 9, end: 16 }],
        rest: [{ start: 19, end: 5 }]
      }
    },

    // Animal display names (for UI) - with icons
    ANIMAL_NAMES: {
      // Deer Family
      red_deer: { en: 'Red Deer', de: 'Rothirsch', icon: '🦌' },
      whitetail: { en: 'Whitetail Deer', de: 'Weißwedelhirsch', icon: '🦌' },
      mule_deer: { en: 'Mule Deer', de: 'Maultierhirsch', icon: '🦌' },
      blacktail: { en: 'Blacktail Deer', de: 'Schwarzwedelhirsch', icon: '🦌' },
      roe_deer: { en: 'Roe Deer', de: 'Reh', icon: '🦌' },
      fallow_deer: { en: 'Fallow Deer', de: 'Damhirsch', icon: '🦌' },
      axis_deer: { en: 'Axis Deer', de: 'Axishirsch', icon: '🦌' },
      sika_deer: { en: 'Sika Deer', de: 'Sikahirsch', icon: '🦌' },
      sambar_deer: { en: 'Sambar Deer', de: 'Sambarhirsch', icon: '🦌' },
      reindeer: { en: 'Reindeer', de: 'Rentier', icon: '🦌' },
      caribou: { en: 'Caribou', de: 'Karibu', icon: '🦌' },
      musk_deer: { en: 'Musk Deer', de: 'Moschushirsch', icon: '🦌' },
      hog_deer: { en: 'Hog Deer', de: 'Schweinshirsch', icon: '🦌' },
      indian_muntjac: { en: 'Indian Muntjac', de: 'Muntjak', icon: '🦌' },
      javan_rusa: { en: 'Javan Rusa', de: 'Rusa', icon: '🦌' },
      // Elk/Moose
      moose: { en: 'Moose', de: 'Elch', icon: '🫎' },
      roosevelt_elk: { en: 'Roosevelt Elk', de: 'Roosevelt-Wapiti', icon: '🫎' },
      rocky_mountain_elk: { en: 'Rocky Mountain Elk', de: 'Rocky-Mountain-Wapiti', icon: '🫎' },
      manitoban_elk: { en: 'Manitoban Elk', de: 'Manitoba-Wapiti', icon: '🫎' },
      // Bears
      black_bear: { en: 'Black Bear', de: 'Schwarzbär', icon: '🐻' },
      brown_bear: { en: 'Brown Bear', de: 'Braunbär', icon: '🐻' },
      grizzly_bear: { en: 'Grizzly Bear', de: 'Grizzlybär', icon: '🐻' },
      // Wild Pigs
      wild_boar: { en: 'Wild Boar', de: 'Wildschwein', icon: '🐗' },
      feral_pig: { en: 'Feral Pig', de: 'Wildes Schwein', icon: '🐗' },
      wild_hog: { en: 'Wild Hog', de: 'Wild-Schwein', icon: '🐗' },
      warthog: { en: 'Warthog', de: 'Warzenschwein', icon: '🐗' },
      collared_peccary: { en: 'Collared Peccary', de: 'Halsbandpekari', icon: '🐗' },
      // Wolves/Canids
      gray_wolf: { en: 'Gray Wolf', de: 'Grauwolf', icon: '🐺' },
      iberian_wolf: { en: 'Iberian Wolf', de: 'Iberischer Wolf', icon: '🐺' },
      coyote: { en: 'Coyote', de: 'Kojote', icon: '🐺' },
      side_striped_jackal: { en: 'Side-Striped Jackal', de: 'Streifenschakal', icon: '🐺' },
      raccoon_dog: { en: 'Raccoon Dog', de: 'Marderhund', icon: '🦝' },
      // Foxes
      red_fox: { en: 'Red Fox', de: 'Rotfuchs', icon: '🦊' },
      gray_fox: { en: 'Gray Fox', de: 'Graufuchs', icon: '🦊' },
      // Big Cats
      mountain_lion: { en: 'Mountain Lion', de: 'Puma', icon: '🦁' },
      puma: { en: 'Puma', de: 'Puma', icon: '🦁' },
      lion: { en: 'Lion', de: 'Löwe', icon: '🦁' },
      bengal_tiger: { en: 'Bengal Tiger', de: 'Bengalischer Tiger', icon: '🐅' },
      lynx: { en: 'Lynx', de: 'Luchs', icon: '🐱' },
      bobcat: { en: 'Bobcat', de: 'Rotluchs', icon: '🐱' },
      mexican_bobcat: { en: 'Mexican Bobcat', de: 'Mexikanischer Rotluchs', icon: '🐱' },
      eurasian_lynx: { en: 'Eurasian Lynx', de: 'Eurasischer Luchs', icon: '🐱' },
      // Bison/Buffalo
      plains_bison: { en: 'Plains Bison', de: 'Präriebison', icon: '🦬' },
      european_bison: { en: 'European Bison', de: 'Wisent', icon: '🦬' },
      wood_bison: { en: 'Wood Bison', de: 'Waldbison', icon: '🦬' },
      water_buffalo: { en: 'Water Buffalo', de: 'Wasserbüffel', icon: '🐃' },
      asian_water_buffalo: { en: 'Asian Water Buffalo', de: 'Asiatischer Wasserbüffel', icon: '🐃' },
      cape_buffalo: { en: 'Cape Buffalo', de: 'Kaffernbüffel', icon: '🐃' },
      banteng: { en: 'Banteng', de: 'Banteng', icon: '🐃' },
      // Goats/Sheep
      mountain_goat: { en: 'Mountain Goat', de: 'Bergziege', icon: '🐐' },
      bighorn_sheep: { en: 'Bighorn Sheep', de: 'Dickhornschaf', icon: '🐐' },
      feral_goat: { en: 'Feral Goat', de: 'Wilde Ziege', icon: '🐐' },
      chamois: { en: 'Chamois', de: 'Gämse', icon: '🐐' },
      iberian_mouflon: { en: 'Iberian Mouflon', de: 'Iberischer Mufflon', icon: '🐐' },
      beceite_ibex: { en: 'Beceite Ibex', de: 'Beceite-Steinbock', icon: '🐐' },
      ronda_ibex: { en: 'Ronda Ibex', de: 'Ronda-Steinbock', icon: '🐐' },
      himalayan_tahr: { en: 'Himalayan Tahr', de: 'Himalaya-Tahr', icon: '🐐' },
      blue_sheep: { en: 'Blue Sheep', de: 'Blauschaf', icon: '🐐' },
      // Antelope
      gemsbok: { en: 'Gemsbok', de: 'Oryx', icon: '🦌' },
      springbok: { en: 'Springbok', de: 'Springbock', icon: '🦌' },
      blue_wildebeest: { en: 'Blue Wildebeest', de: 'Streifengnu', icon: '🦌' },
      lesser_kudu: { en: 'Lesser Kudu', de: 'Kleiner Kudu', icon: '🦌' },
      pronghorn: { en: 'Pronghorn', de: 'Gabelbock', icon: '🦌' },
      blackbuck: { en: 'Blackbuck', de: 'Hirschziegenantilope', icon: '🦌' },
      nilgai: { en: 'Nilgai', de: 'Nilgauantilope', icon: '🦌' },
      woodland_caribou: { en: 'Woodland Caribou', de: 'Waldkaribu', icon: '🦌' },
      // Birds - Turkey
      turkey: { en: 'Turkey', de: 'Truthahn', icon: '🦃' },
      eastern_wild_turkey: { en: 'Eastern Wild Turkey', de: 'Östlicher Wildtruthahn', icon: '🦃' },
      rio_grande_turkey: { en: 'Rio Grande Turkey', de: 'Rio-Grande-Truthahn', icon: '🦃' },
      // Birds - Ducks/Geese
      mallard: { en: 'Mallard', de: 'Stockente', icon: '🦆' },
      canada_goose: { en: 'Canada Goose', de: 'Kanadagans', icon: '🦆' },
      goldeneye: { en: 'Goldeneye', de: 'Schellente', icon: '🦆' },
      cinnamon_teal: { en: 'Cinnamon Teal', de: 'Zimtente', icon: '🦆' },
      harlequin_duck: { en: 'Harlequin Duck', de: 'Kragenente', icon: '🦆' },
      greylag_goose: { en: 'Greylag Goose', de: 'Graugans', icon: '🦆' },
      tundra_bean_goose: { en: 'Tundra Bean Goose', de: 'Tundra-Saatgans', icon: '🦆' },
      eurasian_teal: { en: 'Eurasian Teal', de: 'Krickente', icon: '🦆' },
      eurasian_wigeon: { en: 'Eurasian Wigeon', de: 'Pfeifente', icon: '🦆' },
      tufted_duck: { en: 'Tufted Duck', de: 'Reiherente', icon: '🦆' },
      gadwall: { en: 'Gadwall', de: 'Schnatterente', icon: '🦆' },
      ferruginous_duck: { en: 'Ferruginous Duck', de: 'Moorente', icon: '🦆' },
      // Birds - Other
      pheasant: { en: 'Pheasant', de: 'Fasan', icon: '🐦' },
      ring_necked_pheasant: { en: 'Ring-Necked Pheasant', de: 'Ringfasan', icon: '🐦' },
      western_capercaillie: { en: 'Western Capercaillie', de: 'Auerhuhn', icon: '🐦' },
      bobwhite_quail: { en: 'Bobwhite Quail', de: 'Virginiawachtel', icon: '🐦' },
      rock_ptarmigan: { en: 'Rock Ptarmigan', de: 'Alpenschneehuhn', icon: '🐦' },
      black_grouse: { en: 'Black Grouse', de: 'Birkhuhn', icon: '🐦' },
      hazel_grouse: { en: 'Hazel Grouse', de: 'Haselhuhn', icon: '🐦' },
      red_grouse: { en: 'Red Grouse', de: 'Schottisches Moorschneehuhn', icon: '🐦' },
      // Rabbits/Hares
      european_rabbit: { en: 'European Rabbit', de: 'Wildkaninchen', icon: '🐇' },
      jackrabbit: { en: 'Jackrabbit', de: 'Eselhase', icon: '🐇' },
      antelope_jackrabbit: { en: 'Antelope Jackrabbit', de: 'Antilopenhase', icon: '🐇' },
      snowshoe_hare: { en: 'Snowshoe Hare', de: 'Schneeschuhhase', icon: '🐇' },
      mountain_hare: { en: 'Mountain Hare', de: 'Schneehase', icon: '🐇' },
      scrub_hare: { en: 'Scrub Hare', de: 'Buschhase', icon: '🐇' },
      eastern_cottontail: { en: 'Eastern Cottontail', de: 'Baumwollschwanz', icon: '🐇' },
      // Other
      raccoon: { en: 'Raccoon', de: 'Waschbär', icon: '🦝' },
      american_alligator: { en: 'American Alligator', de: 'Mississippi-Alligator', icon: '🐊' }
    }
  }
};
