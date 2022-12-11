const { defineConfig } = require('koishi')

const secret = require('./koishi.secret')

module.exports = defineConfig({
  // Basic settings.
  prefix: '.',
  port: 21919,

  autoAssign: true,
  autoAuthorize: session => {
    if (secret.admin.includes(session.uid)) return 5
    else return 1
  },

  // Logger settings.
  logger: {
    levels: {
      command: 3,
    },
    showTime: 'MM/dd hh:mm:ss',
    showDiff: false,
  },

  // Plugins.
  plugins: {
    './koishi.tweaks': {},

    'adapter-onebot': secret.onebot,
    // 'database-mysql': secret.mysql,
    'help': { hidden: true, shortcut: false },

    './packages/aircon': {},
  },
})