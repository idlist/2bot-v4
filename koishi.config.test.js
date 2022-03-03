const { defineConfig } = require('koishi')
const secret = require('./koishi.secret')

module.exports = defineConfig({
  // Basic settings.
  prefix: '.',
  minSimilarity: 0,
  port: 21919,

  help: { hidden: true, shortcut: false },
  autoAssign: true,
  autoAuthorize: session => {
    if (secret.admin.includes(session.uid)) return 5
    else return 1
  },

  // Logger settings.
  logger: {
    levels: {
      command: 3,
      blive: 3,
    },
    showTime: 'MM/dd hh:mm:ss',
    showDiff: false,
  },

  // Plugins.
  plugins: {
    'adapter-onebot': secret.onebot,
    'database-mysql': secret.mysql,

    'blive': {
      useDatabase: false,
      pollInterval: 5000,
      subscriptions: {
        'onebot:2905168455': {
          '3449237': ['627957401'],
        },
      },
    },
  },
})