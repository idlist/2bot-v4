const { App } = require('koishi')
const secret = require('./koishi.secret')

const app = new App({
  // Basic settings.
  prefix: '.',
  minSimilarity: 0,
  port: 21919,

  autoAssign: true,
  autoAuthorize: session => {
    if (secret.admin.includes(session.uid)) return 5
    else return 1
  },

  help: { hidden: true, shortcut: false },

  // Logger settings.
  logger: {
    levels: { command: 3 },
    showTime: 'MM/dd hh:mm:ss',
    showDiff: false
  }
})

app.plugin('adapter-onebot', secret.onebot)
app.plugin('database-mysql', secret.mysql)
app.plugin('blive', { pollInterval: 5000 })
app.start()