const secret = require('./koishi.secret')
const filters = secret.filters

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = (ctx) => {
  ctx.intersect((session) => {
    return !(session.platform == 'onebot' &&
      filters['duplicate-checker'].excludes.includes(session.guildId))
  }).plugin(require('./packages/duplicate-checker'))

  ctx.intersect((session) => {
    return session.platform == 'onebot' &&
      filters['s1coders'].includes.includes(session.guildId)
  }).plugin(require('./plugins.scoped/s1coders'))
}