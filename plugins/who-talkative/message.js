const { t } = require('koishi')
const { formatRanking } = require('./utils')

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

  ctx.command('tktv.now', t('tktv.now'))
    .shortcut('tktv.now-shortcut')
    .action(async ({ session }) => {
      const now = new Date()
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