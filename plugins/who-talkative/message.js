const { t } = require('koishi')
const { formatRanking } = require('./utils')

const Interval = 5 * 60 * 1000

const channelUsage = {}

const formatDuration = milliseconds => {
  const seconds = Math.ceil(milliseconds / 1000)
  if (seconds < 60) return t('tktv.seconds', seconds)
  const minutes = Math.floor(seconds / 60)
  return t('tktv.minutes', minutes) + t('tktv.seconds', seconds % 60)
}

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
    }], ['platform', 'channel', 'date', 'user'])
  })

  ctx.command('tktv.now', t('tktv.now'))
    .shortcut('tktv.now-shortcut')
    .action(async ({ session }) => {
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
        limit: 10
      })

      return t('tktv.now-title') + await formatRanking(session, ranking)
    })
}