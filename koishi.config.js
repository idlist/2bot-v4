const { defineConfig } = require('koishi')

const secret = require('./koishi.secret')
const { filters } = require('./koishi.secret')

module.exports = defineConfig({
  // Basic settings.
  prefix: '-',
  nickname: ['2bot', '阿尔博特', '阿尔伯特'],
  port: 21919,

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
    './koishi.tweaks': null,

    // Infrastructures.
    'adapter-onebot': secret.onebot,
    'adapter-discord': secret.discord,
    'database-mysql': secret.mysql,
    'assets-smms': secret.smms,

    // Official plugins.
    'help': { hidden: true, shortcut: false },
    'echo': null,
    'locales': null,
    'rate-limit': null,
    'admin': null,
    'schedule': null,
    'dialogue': { prefix: '?' },

    // Scoped official plugins.
    'group:novelai': {
      $filter: filters['novelai'],
      'novelai': { token: secret.novelai.token, model: 'furry' },
    },

    // Web console
    'console': null,
    'status': null,

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
    'blive': { sessdata: secret.blive.sessdata },
    'animal-picture': null,
    'jrrp': null,
    'aircon': null,

    // Local scoped packages
    'group:checker': {
      $filter: filters['duplicate-checker'],
      'duplicate-checker': null,
    },

    // Local plugins.
    './plugins/about': null,
    './plugins/admin': null,
    './plugins/ffxiv': {
      text: { name: 'SHSans' },
      number: { name: 'Din' },
    },
    './plugins/fun': null,
    './plugins/hexagram': { font: 'SHSans' },
    './plugins/imgen': null,
    './plugins/is-this-npm-package-exists': null,
    './plugins/parrot': null,
    './plugins/talkative': null,

    // Local scoped plugins.
    'group:s1coders': {
      $filter: filters['s1coders'],
      './plugins.scoped/s1coders': {},
    },
  },
})