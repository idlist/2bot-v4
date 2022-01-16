module.exports.name = 'ffxiv'

module.exports.using = ['canvas']

/**
 * @param {import('koishi').Context} ctx
 * @param {import('./index').Config} config
 */
module.exports.apply = (ctx, config) => {
  ctx.command('ff', 'FFXIV 功能')

  ctx.plugin(require('./random-gate'))
  ctx.plugin(require('./random-card'))
  ctx.plugin(require('./fashion-report'))
  ctx.plugin(require('./simulate-melding'))
  ctx.plugin(require('./search-wiki'))
  ctx.plugin(require('./search-item'))
  ctx.plugin(require('./logs'), config)
  ctx.plugin(require('./market'), config)
  ctx.plugin(require('./market-list'), config)
  ctx.plugin(require('./roll'))
  ctx.plugin(require('./misc'))
}