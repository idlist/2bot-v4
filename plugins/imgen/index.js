module.exports.name = 'imgen'

/**
 * @param {import('koishi').Context} ctx
 */
module.exports.apply = ctx => {
  ctx.command('imgen', '草图生成')

  ctx.plugin(require('./low-high-eq'))
  ctx.command('imgen/lheq')
}