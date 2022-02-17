const { t } = require('koishi')
const { formatRanking, clamp } = require('./utils')

const Interval = 60 * 1000

const channelUsage = {}

const formatDuration = m => t('tktv.seconds', Math.floor(m / 1000))

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  ctx.on('message', async (session) => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    await ctx.database.upsert('talkative', [{
      platform: session.platform,
      channel: session.channelId,
      date: now,
      user: session.userId,
      message: { $add: [{ $: 'message' }, 1] }
    }])
  })

  ctx.command('tktv.now <limit>', t('tktv.now'))
    .shortcut(t('tktv.now-shortcut'))
    .action(async ({ session }, limit = 5) => {
      limit = clamp(limit, 5, 1, 20)

      const now = new Date()
      const lastUsage = channelUsage[session.cid]
      if (lastUsage) {
        const cooldown = now.getTime() - lastUsage
        if (cooldown < Interval) {
          const remainingDuration = formatDuration(Interval - cooldown)
          return t('tktv.too-frequent', remainingDuration)
        }
      }

      channelUsage[session.cid] = now.getTime()
      now.setHours(0, 0, 0, 0)

      const ranking = await ctx.database.get('talkative', {
        platform: session.platform,
        channel: session.channelId,
        date: now
      }, {
        sort: { message: 'desc' },
        limit: limit
      })

      return t('tktv.now-title') + await formatRanking(session, ranking)
    })
}