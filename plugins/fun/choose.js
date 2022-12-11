const { Random } = require('koishi')

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = (ctx) => {
  ctx.command('choose <...options>', '帮我选')
    .shortcut('帮我选', { fuzzy: true })
    .usage('让 2bot 从几个选项中帮你选一个')
    .example('choose 肯德基 麦当劳  从肯德基和麦当劳中选一个')
    .action(({ session }, ...options) => {
      if (!options.length) return session.execute('help choose')
      const name = session.author.nickname || session.author.username
      return `2bot 帮 ${name} 选了 ${Random.pick(options)}。`
    })
}