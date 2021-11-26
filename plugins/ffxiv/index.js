module.exports.name = 'ffxiv'

/**
 * @param {import('koishi').Context} ctx
 */
module.exports.apply = ctx => {
  ctx.command('ff', 'FFXIV 功能')

  ctx.plugin('./fashion-report')
}