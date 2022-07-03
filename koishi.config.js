const { defineConfig } = require('koishi')
const secret = require('./koishi.secret')

module.exports = defineConfig({
  // Basic settings.
  prefix: '-',
  nickname: ['2bot', '阿尔博特', '阿尔伯特'],
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
    levels: { command: 3 },
    showTime: 'MM/dd hh:mm:ss',
    showDiff: false,
  },

  // Plugins.
  plugins: {
    // Tweak behaviors.
    './koishi.tweaks': {},

    // Infrastructures.
    'adapter-onebot': secret.onebot,
    'adapter-discord': secret.discord,
    'database-mysql': secret.mysql,
    'assets-smms': secret.smms,

    // Environment plugins.
    'admin': {},
    'echo': {},
    'locales': {},
    'rate-limit': {},


    // Functional plugins.
    'schedule': {},
    'teach': { prefix: '->' },

    // Web console.
    'console': {},
    'status': {},

    // Local packages.
    'aircon': {},
    'animal-picture': {},
    'blive': {},
    'canvas': {
      fonts: [
        { path: 'fonts/SourceHanSans-Regular.otf', family: 'SHSans' },
        { path: 'fonts/Din1451Alt.ttf', family: 'Din' },
        { path: 'fonts/SourceHanSans-Heavy.otf', family: 'SHSans-Heavy' },
        { path: 'fonts/SourceHanSerif-Heavy.otf', family: 'SHSerif-Heavy' },
      ],
    },
    'duplicate-checker': { ...secret.ctx['duplicate-checker'] },
    'gosen-choyen': {
      upper: { name: 'SHSans-Heavy' },
      lower: { name: 'SHSerif-Heavy' },
    },
    'jrrp': {},

    // Local plugins.
    './plugins/about': {},
    './plugins/admin': {},
    './plugins/ffxiv': {
      text: { name: 'SHSans' },
      number: { name: 'Din' },
    },
    './plugins/fun': {},
    './plugins/hexagram': { font: 'SHSans' },
    './plugins/imgen': {},
    './plugins/is-this-npm-package-exists': {},
    './plugins/parrot': {},
    './plugins/talkative': {},

    // Scoped plugins.
    './plugins.scoped/s1coders': { ...secret.ctx['s1coders'] },
  },
})