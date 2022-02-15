const EmptyStats = {
  yesterday: {},
  week: {},
  month: {},
  year: {},
  overall: {}
}

const CachedStats = {}

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  ctx.on('ready', async () => {
    const results = await ctx.database.get('talkative_stats', {})

    results.forEach(result => {
      CachedStats[`${result.platform}:${result.channel}`] = {
        yesterday: result.yesterday,
        week: result.week,
        month: result.month,
        year: result.year,
        overall: result.overall
      }
    })
  })

  ctx.on('message', async (session) => {
    if (!CachedStats[session.cid]) {
      // Init statistics.
      const results = await ctx.database.get('talkative_stats', {
        platform: session.platform,
        channel: session.channel
      })

      if (!results.length) {
        ctx.database.create('talkative_stats', {
          platform: session.platform,
          channel: session.channelId,
          ...EmptyStats
        })
      }
    }
  })
}