module.exports.name = 'ping'

/**
 * @param {import('koishi').Context} ctx
 */
module.exports.apply = ctx => {
  ctx.command('ping', '乒一下bot')
    .action(() => 'pong!')
}