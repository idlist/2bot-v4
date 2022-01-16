module.exports.name = 'ffxiv-game'

/**
 * @param {import('koishi').Context} ctx
 */
module.exports.apply = ctx => {
  ctx.command('ffgame', 'FFXIV 娱乐功能')
    .alias('fg')

  ctx.plugin('./roll')
}