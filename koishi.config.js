const { defineConfig } = require('koishi')

const secret = require('./koishi.secret')
const filters = secret.filters

const dev = secret.dev
const discordConfig = dev ? {} : { 'adapter-discord': secret.discord }

module.exports = defineConfig({
  // Basic settings.
  prefix: dev ? '.' : '-',
  nickname: ['2bot', '阿尔博特', '阿尔伯特'],

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
    'group:tweaks': {
      './koishi.tweaks': {},
    },

    'group:infrastructures': {
      'server': { port: 21919 },
      'http': {},
      'adapter-onebot': secret.onebot,
      ...discordConfig,
      'database-mysql': secret.mysql,
      'assets-smms': secret.smms,
    },

    'group:official': {
      'help': { hidden: true, shortcut: false },
      'echo': {},
      'locales': {},
      'rate-limit': {},
      'admin': {},
      'schedule': {},
      'dialogue': { prefix: dev ? '.?' : '-?' },
      'dialogue-context': {},
    },

    'group:console': {
      'console': {},
      'status': {},
      'auth': { admin: { enabled: false } },
      'analytics': {},
    },

    'group:packages': {
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
      'blive': {},
      'animal-picture': {},
      'jrrp': {},
      'aircon': {},
      'duplicate-checker': {
        $filter: (session) => {
          const excludes = filters['duplicate-checker'].excludes
          return session.platform != 'onebot' || !excludes.includes(session.guildId)
        },
      },
    },

    'group:local': {
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
    },
  },
})