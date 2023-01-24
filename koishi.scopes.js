const secret = require('./koishi.secret')

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = (ctx) => {
  ctx.intersect((session) => {
    return session.platform != 'onebot' &&
      !secret.filters['duplicate-checker'].excludes.includes(session.guildId)
  }).plugin(require('./packages/duplicate-checker'))

  ctx.intersect((session) => {
    return session.platform == 'onebot' &&
      secret.filters['s1coders'].includes.includes(session.guildId)
  }).plugin(require('./plugins.scoped/s1coders'))
}