const { defineConfig } = require('@koishijs/cli')

const secret = require('./koishi.secret')

module.exports = defineConfig({
  // Basic settings.
  prefix: '-',
  nickname: ['2bot', '阿尔博特', '阿尔伯特'],
  minSimilarity: 0,
  port: 21919,

  autoAssign: true,
  autoAuthorize: session => {
    if (secret.admin.includes(session.uid)) return 5
    else return 1
  },

  help: {
    hidden: true,
    shortcut: false
  },

  // Logger settings.
  logger: {
    levels: {
      command: 3
    },
    showTime: 'MM/dd hh:mm:ss',
    showDiff: false
  },

  // Plugins.
  plugins: {
    // Official plugins.
    'adapter-onebot': secret.onebot,
    'database-mysql': secret.mysql,
    'assets-smms': secret.smms,
    'teach': { prefix: '->' },
    'schedule': {},

    // Local packages.
    'canvas': {
      fonts: [
        { path: 'fonts/MSYH.ttf', family: 'msyh' },
        { path: 'fonts/Bahnschrift.ttf', family: 'bahnschrift' },
        { path: 'fonts/SourceHanSans-Heavy.otf', family: 'sans-heavy' },
        { path: 'fonts/SourceHanSerif-Heavy.otf', family: 'serif-heavy' }
      ]
    },

    // Local plugins.
    './plugins/ffxiv': {
      fonts: {
        text: { name: 'msyh' },
        number: { name: 'bahnschrift' }
      }
    },
    './plugins/admin': {},
    './plugins/about': {},
    './plugins/parrot': {},
    './plugins/fun': {},

    // Customize plugin behaviours.
    './koishi.tweaks': {}
  }
})