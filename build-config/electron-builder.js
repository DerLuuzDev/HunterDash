const { APP_NAME, APP_ID, APP_VERSION, ICONS } = require('./constants');

module.exports = {
  appId: APP_ID,
  productName: APP_NAME,
  copyright: `Copyright © ${new Date().getFullYear()} HunterDash Team`,
  artifactName: `${APP_NAME}-${APP_VERSION}-\${arch}.\${ext}`,
  
  compression: 'maximum',
  
  asar: true,
  asarUnpack: [
    'assets/icons/*',
    'build-config/**/*'
  ],
  
  files: [
    'main.js',
    'preload.js',
    'renderer.js',
    'index.html',
    'package.json',
    'services/**/*',
    'utils/**/*',
    'build-config/**/*',
    'assets/**/*'
  ],
  
  afterPack: './build-config/after-pack.js',
  afterSign: './build-config/after-sign.js',
  
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      }
    ],
    icon: ICONS.WINDOWS,
    artifactName: `${APP_NAME}-Setup-${APP_VERSION}-\${arch}.\${ext}`
  },
  
  linux: {
    target: [
      'AppImage'
    ],
    icon: ICONS.LINUX,
    category: 'Utility',
    synopsis: 'COTW Glück-Rechner',
    description: 'Berechne dein Glück in theHunter: Call of the Wild',
    maintainer: 'HunterDash Team <info@hunterdash.de>'
  },
  
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    perMachine: false,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: APP_NAME,
    
    installerIcon: ICONS.WINDOWS,
    uninstallerIcon: ICONS.WINDOWS,
    installerHeaderIcon: ICONS.WINDOWS,
    
    installerLanguages: ['de_DE', 'en_US'],
    language: '1031',
    
    deleteAppDataOnUninstall: false,
    runAfterFinish: true,
    
    license: 'LICENSE'
  },
  
  publish: {
    provider: 'github',
    owner: 'hunterdash',
    repo: 'hunterdash'
  }
};
