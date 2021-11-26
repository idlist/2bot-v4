const { defineConfig } = require('@koishijs/cli')

const secret = require('./secret')

module.exports = defineConfig({
  // basic settings
  prefix: '.',
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

  // logger settings
  logger: {
    levels: {
      command: 3
    },
    showTime: 'MM/dd hh:mm:ss',
    showDiff: false
  },

  // plugins
  plugins: {
    // official plugins
    'adapter-onebot': secret.onebot,
    'database-mysql': secret.mysql

    // test plugins
  }
})