const { t } = require('koishi')
const schedule = require('node-schedule')
const outdent = require('outdent')
const { formatRanking, clamp } = require('./utils')

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
module.exports = ctx => {
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

      let ranking

      // Since koishi ORM does not support GROUP BY, use direct query instead.
      const query = async (q, args) => await ctx.database.mysql.query(outdent`${q}`, args)

      if (isOverall) {
        ranking = await query(`
          SELECT user, SUM(message) as message
          FROM talkative
          WHERE platform = ? AND channel = ?
          GROUP BY user
          ORDER BY message DESC
          LIMIT 10`, [platform, channel])
      } else if (isPeriod) {
        ranking = await query(`
          SELECT user, SUM(message) as message
          FROM talkative
          WHERE platform = ? AND channel = ? AND date <= ? AND date >= ?
          GROUP BY user
          ORDER BY message DESC
          LIMIT 10`, [platform, channel, yesterday, timeWindow])
      } else {
        ranking = await query(`
          SELECT user, message
          FROM talkative
          WHERE platform = ? AND channel = ? AND date = ?
          ORDER BY message DESC
          LIMIT 10`, [platform, channel, yesterday])
      }

      const statsChannel = validate(platform, channel)
      statsChannel[duration] = ranking
    }

    const channels = await ctx.database.get('channel', {}, ['platform', 'id'])

    await Promise.all(channels.map(async (channel) =>
      await Promise.all(Scopes.map(async (duration) =>
        await summarize(channel.platform, channel.id, duration)
      ))
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

  Scopes.forEach(duration => {
    ctx.command(`tktv.${duration} <limit>`, t(`tktv.${duration}`), {
      authority: ['year', 'overall'].includes(duration) ? 2 : 1
    }).shortcut(t(`tktv.${duration}-shortcut`))
      .action(async ({ session }, limit = 5) => {
        limit = clamp(limit, 5, 1, 10)
        /**
         * @type {import('./stats').UserMessageCount[]}
         */
        let ranking = Stats[session.platform][session.channelId][duration]
        if (!ranking.length) return t('tktv.no-data')
        ranking = ranking.slice(0, limit)

        return t(`tktv.${duration}.title`) + await formatRanking(session, ranking)
      })
  })
}