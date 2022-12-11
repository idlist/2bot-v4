const { formatRanking, clamp } = require('./utils')

const Interval = 60 * 1000

const channelUsage = {}

const formatDuration = (m) => `${Math.floor(m / 1000)} 秒`

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = (ctx) => {
  ctx.on('message', async (session) => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    await ctx.database.upsert('talkative', [{
      platform: session.platform,
      channel: session.channelId,
      date: now,
      user: session.userId,
      message: { $add: [{ $: 'message' }, 1] },
    }])
  })

  ctx.command('talkative.now <limit>', '今日话痨榜')
    .shortcut('今日话痨榜')
    .userFields(['authority'])
    .action(async ({ session }, limit = 5) => {
      if (session.user.authority <= 1) limit = clamp(limit, 5, 1, 5)
      else limit = clamp(limit, 5, 1, 20)

      const now = new Date()
      const lastUsage = channelUsage[session.cid]
      if (lastUsage) {
        const cooldown = now.getTime() - lastUsage
        if (cooldown < Interval) {
          const remainingDuration = formatDuration(Interval - cooldown)
          return `不要看话痨榜看得太频繁啦！还有 ${remainingDuration}才能再次查看！`
        }
      }

      channelUsage[session.cid] = now.getTime()
      now.setHours(0, 0, 0, 0)

      const ranking = await ctx.database.get('talkative', {
        platform: session.platform,
        channel: session.channelId,
        date: now,
      }, {
        sort: { message: 'desc' },
        limit: limit,
      })

      const total = await ctx.database.eval('talkative', {
        $sum: 'message',
      }, {
        platform: session.platform,
        channel: session.channelId,
        date: now,
      })

      return `今日话痨榜（共 ${total} 条）：\n` + await formatRanking(session, ranking)
    })
}