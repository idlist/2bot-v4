module.exports.name = 'fun'

/**
 * @param {import('koishi').Context} ctx
 */
module.exports.apply = (ctx) => {
  ctx.command('fun', '趣味功能')

  ctx.plugin(require('./poke'))
  ctx.command('fun/poke')

  ctx.plugin(require('./hhsh'))
  ctx.command('fun/hhsh')

  ctx.plugin(require('./silly'))
  ctx.command('fun/silly')

  ctx.plugin(require('./choose'))
  ctx.command('fun/choose')

  ctx.plugin(require('./bing'))
  ctx.command('fun/bing')
}