const { s } = require('koishi')

/**
 * @param {import('koishi').Context} ctx
 */

module.exports = ctx => {
  ctx
    .command('echo <message:text>', '复述', { authority: 2 })
    .action((_, message) => message ? s.unescape(message) : undefined)
}