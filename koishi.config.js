const { defineConfig } = require('@koishijs/cli')
const { registerFont } = require('canvas')

const secret = require('./koishi.secret')

registerFont('./fonts/msyh.ttf', { family: 'msyh' })

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
    'assets-smms': secret.smms,
    // 'schedule': {},
    'teach': { prefix: '->' },

    // Local plugins
    'ffxiv': {},
    './plugins/admin': {},
    './plugins/about': {},
    './plugins/parrot': {},
    './plugins/fun': {},

    // Customize plugin behaviours
    './koishi.tweaks': {}
  }
})