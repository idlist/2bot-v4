const { App, Logger } = require('koishi')

const secret = require('./secret')

const app = new App({
  prefix: '>',
  minSimilarity: 0,
  autoAssign: true,
  autoAuthorize: session => {
    if (secret.admin.includes(session.uid)) return 5
    else return 1
  },
})

Logger.levels = {
  base: 2,
  command: 3
}

const onebot = require('@koishijs/plugin-onebot')
const mysql = require('@koishijs/plugin-mysql')
const { echo, contextify } = require('@koishijs/plugin-common')
const status = require('@koishijs/plugin-status')

app.plugin(onebot, secret.onebot)
app.plugin(mysql, secret.mysql)
app.plugin(echo)
app.plugin(contextify)
app.plugin(status)

app.start()