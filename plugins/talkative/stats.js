const schedule = require('node-schedule')
const outdent = require('outdent')
const { formatRanking, clamp } = require('./utils')
const { $ } = require('koishi')

const { createPool } = require('mariadb')
const { mysql } = require('../../koishi.secret')
const pool = createPool({
  host: mysql.host,
  port: mysql.port,
  database: mysql.database,
  user: mysql.user,
  password: mysql.password,
  connectionLimit: 5,
})

/**
 * @type {import('./stats').SummarizedStats}
 */
const Stats = {}

const Scopes = ['yesterday', 'week', 'month', 'year', 'overall']

const validate = (platform, channel) => {
  if (!Stats[platform]) Stats[platform] = {}
  if (!Stats[platform][channel]) Stats[platform][channel] = {}
  return Stats[platform][channel]
}

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = (ctx) => {
  const summarizeStats = async () => {
    /**
     * @param {string} platform
     * @param {string} channel
     * @param {keyof import('./stats').TalkativeStats} duration
     */
    const summarize = async (platform, channel, duration) => {
      const yesterday = new Date()
      yesterday.setHours(0, 0, 0, 0)
      yesterday.setDate(yesterday.getDate() - 1)

      let isPeriod = true, isOverall = false
      const timeWindow = new Date()
      timeWindow.setHours(0, 0, 0, 0)

      switch (duration) {
        case 'week':
          timeWindow.setDate(timeWindow.getDate() - 8)
          break
        case 'month':
          timeWindow.setDate(timeWindow.getDate() - 31)
          break
        case 'year':
          timeWindow.setDate(timeWindow.getDate() - 366)
          break
        case 'overall':
          isOverall = true
          break
        default:
          isPeriod = false
          break
      }

      let ranking, total

      const query = async (q, args) => await pool.query(outdent`${q}`, args)

      if (isOverall) {
        ranking = await query(`
          SELECT user, SUM(message) as message, name
          FROM talkative
          WHERE platform = ? AND channel = ?
          GROUP BY user
          ORDER BY message DESC
          LIMIT 20`, [platform, channel])

        total = await ctx.database.eval('talkative', (row) => {
          return $.sum(row.message)
        }, {
          platform: platform,
          channel: channel,
        })
      } else if (isPeriod) {
        ranking = await query(`
          SELECT user, SUM(message) as message, name
          FROM talkative
          WHERE platform = ? AND channel = ? AND date <= ? AND date >= ?
          GROUP BY user
          ORDER BY message DESC
          LIMIT 20`, [platform, channel, yesterday, timeWindow])

        total = await ctx.database.eval('talkative', (row) => {
          return $.sum(row.message)
        }, {
          platform: platform,
          channel: channel,
          date: { $lte: yesterday, $gte: timeWindow },
        })
      } else {
        ranking = await query(`
          SELECT user, message, name
          FROM talkative
          WHERE platform = ? AND channel = ? AND date = ?
          ORDER BY message DESC
          LIMIT 20`, [platform, channel, yesterday])

        total = await ctx.database.eval('talkative', (row) => {
          return $.sum(row.message)
        }, {
          platform: platform,
          channel: channel,
          date: yesterday,
        })
      }

      const statsChannel = validate(platform, channel)
      statsChannel[duration] = { ranking: ranking, total: total }
    }

    const channels = await ctx.database.get('channel', {}, ['platform', 'id'])

    await Promise.all(channels.map(async (channel) =>
      await Promise.all(Scopes.map(async (duration) =>
        await summarize(channel.platform, channel.id, duration),
      )),
    ))
  }

  let jobHandler

  ctx.on('ready', () => {
    summarizeStats()
    jobHandler = schedule.scheduleJob('* 0 * * *', summarizeStats)
  })

  ctx.on('dispose', () => {
    jobHandler.cancel()
  })

  ctx.command('talkative.yesterday', '昨日话痨榜')
    .shortcut('昨日话痨榜')
    .action(async ({ session }, limit = 5) => {
      limit = clamp(limit, 5, 1, 20)

      /** @type {import('./stats').TalkativeStatsByType} */
      const { ranking, total } = Stats[session.platform][session.channelId].yesterday
      if (!ranking.length) return '尚无数据，让话痨们再得瑟一会儿。'
      const limitedRanking = ranking.slice(0, limit)

      return `昨日话痨榜（共 ${total} 条）：\n` +
        formatRanking(limitedRanking)
    })

  ctx.command('talkative.week', '本周话痨榜')
    .shortcut('本周话痨榜')
    .action(async ({ session }, limit = 5) => {
      limit = clamp(limit, 5, 1, 20)

      /** @type {import('./stats').TalkativeStatsByType} */
      const { ranking, total } = Stats[session.platform][session.channelId].week
      if (!ranking.length) return '尚无数据，让话痨们再得瑟一会儿。'
      const limitedRanking = ranking.slice(0, limit)

      return `本周话痨榜（自昨日起 7 天，共 ${total} 条）：\n` +
        formatRanking(limitedRanking)
    })

  ctx.command('talkative.month', '本月话痨榜')
    .shortcut('本月话痨榜')
    .action(async ({ session }, limit = 5) => {
      limit = clamp(limit, 5, 1, 20)

      /** @type {import('./stats').TalkativeStatsByType} */
      const { ranking, total } = Stats[session.platform][session.channelId].month
      if (!ranking.length) return '尚无数据，让话痨们再得瑟一会儿。'
      const limitedRanking = ranking.slice(0, limit)

      return `本月话痨榜（自昨日起 30 天，共 ${total} 条）：\n` +
        formatRanking(limitedRanking)
    })

  ctx.command('talkative.year', '今年话痨榜')
    .shortcut('今年话痨榜')
    .action(async ({ session }, limit = 5) => {
      limit = clamp(limit, 5, 1, 20)

      /** @type {import('./stats').TalkativeStatsByType} */
      const { ranking, total } = Stats[session.platform][session.channelId].year
      if (!ranking.length) return '尚无数据，让话痨们再得瑟一会儿。'
      const limitedRanking = ranking.slice(0, limit)

      return `今年话痨榜（自昨日起 365 天，共 ${total} 条）：\n` +
        formatRanking(limitedRanking)
    })

  ctx.command('talkative.overall', '总计话痨榜')
    .shortcut('总计话痨榜')
    .action(async ({ session }, limit = 5) => {
      limit = clamp(limit, 5, 1, 20)

      /** @type {import('./stats').TalkativeStatsByType} */
      const { ranking, total } = Stats[session.platform][session.channelId].overall
      if (!ranking.length) return '尚无数据，让话痨们再得瑟一会儿。'
      const limitedRanking = ranking.slice(0, limit)

      return `总计话痨榜（共 ${total} 条）：\n` +
        formatRanking(limitedRanking)
    })
}