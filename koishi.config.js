const { defineConfig } = require('@koishijs/cli')
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
    // Official plugins.
    'adapter-onebot': secret.onebot,
    'adapter-discord': secret.discord,
    'database-mysql': secret.mysql,
    'assets-smms': secret.smms,
    'rate-limit': {},
    'teach': { prefix: '->' },
    'schedule': {},

    // Web console.
    'console': {},
    'status': {},

    // Local packages.
    'canvas': {
      fonts: [
        { path: 'fonts/SourceHanSans-Regular.otf', family: 'SHSans' },
        { path: 'fonts/Din1451Alt.ttf', family: 'Din' },
        { path: 'fonts/SourceHanSans-Heavy.otf', family: 'SHSans-Heavy' },
        { path: 'fonts/SourceHanSerif-Heavy.otf', family: 'SHSerif-Heavy' },
      ],
    },
    'gosen-choyen': {
      upper: { name: 'SHSans-Heavy' },
      lower: { name: 'SHSerif-Heavy' },
    },
    'duplicate-checker': { ...secret.ctx['duplicate-checker'] },
    'blive': {},
    'jrrp': {},
    'animal-picture': {},

    // Local plugins.
    './plugins/admin': {},
    './plugins/fun': {},
    './plugins/imgen': {},
    './plugins/about': {},
    './plugins/parrot': {},
    './plugins/who-talkative': {},
    './plugins/hexagram': { ...secret.ctx['hexagram'] },
    './plugins/ffxiv': {
      text: { name: 'SHSans' },
      number: { name: 'Din' },
    },

    // Scoped plugins.
    './plugins.scoped/s1coders': { ...secret.ctx['s1coders'] },

    // Customize plugin behaviours.
    './koishi.tweaks': {},
  },
})