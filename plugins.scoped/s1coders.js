/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  ctx.plugin(require('./gacha'))
  ctx.plugin(require('./tigang'))
}