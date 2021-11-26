module.exports.name = 'ffxiv'

/**
 * @param {import('koishi').Context} ctx
 */
module.exports.apply = ctx => {
  ctx.command('ff', 'FFXIV 功能')

  ctx.plugin(require('./random-gate'))
  ctx.plugin(require('./random-card'))
  ctx.plugin(require('./fashion-report'))
  ctx.plugin(require('./simulate-melding'))
  ctx.plugin(require('./search-wiki'))
  ctx.plugin(require('./search-item'))
}