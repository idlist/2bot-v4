const Status = {}

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  ctx
    .command('ffgame.roll [teamsize]', '模拟 Roll 点')
    .alias('fg.roll')
    .option('stop', '-s 停止 Roll 点')
    .action(({ session, options }, teamsize) => {

    })
}