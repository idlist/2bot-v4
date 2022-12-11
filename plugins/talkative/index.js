module.exports.name = 'who-talkative'

module.exports.using = ['database']

/**
 * @param {import('koishi').Context} ctx
 */
module.exports.apply = (ctx) => {
  ctx.command('talkative', '话痨统计')
    .usage('看看群里谁最话痨')

  ctx.plugin(require('./database'))

  ctx = ctx.channel()
  ctx.plugin(require('./stats'))
  ctx.plugin(require('./message'))
}