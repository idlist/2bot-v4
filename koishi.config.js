const { defineConfig } = require('koishi')

const secret = require('./koishi.secret')
const filters = secret.filters

const dev = secret.dev
const discordConfig = dev ? {} : { 'adapter-discord': secret.discord }

module.exports = defineConfig({
  // Basic settings.
  prefix: dev ? '.' : '-',
  nickname: ['2bot', '阿尔博特', '阿尔伯特'],
  port: 21919,

  autoAssign: true,
  autoAuthorize: (session) => {
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
    'database-mysql': secret.mysql,
    'assets-smms': secret.smms,
    ...discordConfig,

    // Official plugins.
    'help': { hidden: true, shortcut: false },
    'echo': {},
    'locales': {},
    'rate-limit': {},
    'admin': {},
    'schedule': {},
    'dialogue': { prefix: dev ? '.?' : '-?' },
    'dialogue-context': {},

    // Web console
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
    'blive': { sessdata: secret.blive.sessdata },
    'animal-picture': {},
    'jrrp': {},
    'aircon': {},

    // Local plugins.
    './plugins/about': {},
    './plugins/admin': {},
    './plugins/ffxiv': {
      text: { name: 'SHSans' },
      number: { name: 'Din' },
    },
    './plugins/fun': {},
    './plugins/tools': {},
    './plugins/hexagram': { font: 'SHSans' },
    './plugins/imgen': {},
    './plugins/is-this-npm-package-exists': {},
    './plugins/parrot': {},
    './plugins/talkative': {},

    // Scoped plugins.
    './koishi.scopes': {},
  },
})