const { s1coders, adminGroup } = require('../../koishi.secret')

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  ctx = ctx.platform('onebot').guild(s1coders, ...adminGroup)

  ctx.plugin(require('./tigang'))
  ctx.plugin(require('./gacha'))
  ctx.plugin(require('./hexagram'))
}