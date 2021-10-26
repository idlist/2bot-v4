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

/*
const { echo, contextify } = require('@koishijs/plugin-common')
const status = require('@koishijs/plugin-status')
*/

const onebot = require('@koishijs/plugin-adapter-onebot')
const mysql = require('@koishijs/plugin-database-mysql')

app.plugin(onebot, secret.onebot)
app.plugin(mysql, secret.mysql)
/*
app.plugin(echo)
app.plugin(contextify)
app.plugin(status)
*/

app.start()