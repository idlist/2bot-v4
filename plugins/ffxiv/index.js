const { registerFont } = require('canvas')

registerFont('./fonts/msyh.ttf', { family: 'ffxiv-text' })
registerFont('./fonts/bahnschrift.ttf', { family: 'ffxiv-number' })

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
  ctx.plugin(require('./logs'))
  ctx.plugin(require('./market'))
  ctx.plugin(require('./market-list'))
  ctx.plugin(require('./misc'))
}