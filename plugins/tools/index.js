module.exports.name = 'tools'

/**
 * @param {import('koishi').Context} ctx
 */
module.exports.apply = (ctx) => {
  ctx.command('tools', '（不）实用工具')

  ctx.plugin(require('./base16384'))
  ctx.command('tools/b16384')

  ctx.plugin(require('./probe'))
  ctx.command('tools/probe')
}