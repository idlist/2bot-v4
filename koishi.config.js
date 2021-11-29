const { defineConfig } = require('@koishijs/cli')

const secret = require('./koishi.secret')

module.exports = defineConfig({
  // Basic settings
  prefix: '-',
  nickname: ['2bot', '阿尔博特', '阿尔伯特'],
  minSimilarity: 0,

  autoAssign: true,
  autoAuthorize: session => {
    if (secret.admin.includes(session.uid)) return 5
    else return 1
  },

  help: {
    hidden: true,
    shortcut: false
  },

  // Logger settings
  logger: {
    levels: {
      command: 3
    },
    showTime: 'MM/dd hh:mm:ss',
    showDiff: false
  },

  // Plugins
  plugins: {
    // official plugins
    'adapter-onebot': secret.onebot,
    'database-mysql': secret.mysql,

    // Local plugins
    'ffxiv': {},
    './plugins/admin': {},
    './plugins/about': {},
    './plugins/parrot': {},

    // Customize plugin behaviours
    './koishi.tweaks': {}
  }
})