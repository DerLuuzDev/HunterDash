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
      THEME: 'hunterdash-theme'
    },
    DEFAULT_SETTINGS: {
      theme: 'light',
      autoSave: true,
      apiEnabled: false,
      apiEndpoint: 'http://localhost:3000'
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
  }
};
