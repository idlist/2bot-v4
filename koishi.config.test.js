const { resolve } = require('path')
const { defineConfig } = require('@koishijs/cli')
const { registerFont } = require('canvas')

const secret = require('./koishi.secret')

registerFont(resolve(__dirname, 'fonts/msyh.ttf'), { family: 'msyh' })

module.exports = defineConfig({
  // Basic settings
  prefix: '.',
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
    'adapter-onebot': secret.onebot,
    'database-mysql': secret.mysql,

    './koishi.tweaks': {}
  }
})