const { DateTime } = require('luxon')

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  ctx.command('admin/ping', '看看 2bot 是不是又挂了')
    .action(() => `Pong! [${DateTime.local().toFormat('LL/dd TT')}]`)
}