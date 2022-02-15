/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  ctx.on('message', async (session) => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    await ctx.database.upsert('talkative_daily', [{
      platform: session.platform,
      channel: session.channelId,
      user: session.userId,
      date: now,
      message: { $add: [{ $: 'message' }, 1] }
    }])
  })

  ctx.command('tktv', '话痨统计')

  ctx.command('tktv.now', '今日话痨')
    .action(async ({ session }) => {
      const ranking = await ctx.database.get('talkative_daily', {
        platform: session.platform,
        channel: session.channelId
      }, {
        sort: { message: 'desc' },
        limit: 10
      })

      const users = await Promise.all(
        ranking.map(async (item) => {
          const user = await session.bot.getGuildMember(session.guildId, item.user)
          return user.nickname || user.username
        })
      )

      return '今日话痨榜：\n' +
        ranking.map((item, i) => `${users[i]} [${item.user}]: ${item.message} 条`).join('\n')
    })
}