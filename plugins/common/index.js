module.exports.name = 'common'

/**
 * @param {import('koishi').Context} ctx
 */
module.exports.apply = ctx => {
  ctx.command('common', '常用功能')

  ctx.plugin(require('./hhsh'))
  ctx.command('common/hhsh')
}