module.exports.name = 'who-talkative'

module.exports.using = ['database']

/**
 * @param {import('koishi').Context} ctx
 */
module.exports.apply = ctx => {
  ctx.plugin(require('./database'))

  ctx = ctx.channel()
  ctx.plugin(require('./stats'))
  ctx.plugin(require('./message'))
}