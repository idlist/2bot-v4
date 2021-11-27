const { readFile } = require('fs/promises')
const { resolve } = require('path')
const axios = require('axios').default
const yaml = require('js-yaml')
const { s } = require('koishi')
const generateLogsImage = require('./logs.image')

const Jobs = require('./data/jobs')

/**
 * @type {import('./logs').BossData[]}
 */
let Bosses
(async () => {
  Bosses = yaml.load(await readFile(resolve(__dirname, 'data/bosses.yaml'), 'utf-8'))
})()

const SERVER = { CN: 1, GLOBAL: 2 }
Object.freeze(SERVER)

/**
 * @param {string} str
 * @return {import('./logs').BossData}
 */
const resolveBoss = str => {
  for (const boss of Bosses) {
    if (boss.keywords.includes(str.toLowerCase())) return { ...boss }
  }
}

/**
 * @param {string} str
 * @return {ResolvedJob}
 */
const resolveJob = str => {
  for (const job of Jobs) {
    if (job.keywords.includes(str.toLowerCase())) {
      return {
        name: job.keywords[0],
        code: job.keywords[1],
        logsCode: job.name
      }
    }
  }
}

/**
 * @param {import('koishi').Context} ctx
 * @returns
 */
module.exports = ctx => {
  const logger = ctx.logger('ff.logs')

  const shortcutConfig = { fuzzy: true, prefix: true }

  ctx.command('ff.logs <boss> <job>', '查询logs')
    .usage('默认查询国服、rDPS。')
    .option('adps', '-a 查询aDPS')
    .option('global', '-g 查询国际服')
    .option('duration', '-d <day(s)> 设置查询时间段（1, 7, 14）')
    .shortcut('查logs', { ...shortcutConfig })
    .shortcut('查一天logs', { options: { duration: 1 }, ...shortcutConfig })
    .shortcut('查一周logs', { options: { duration: 7 }, ...shortcutConfig })
    .shortcut('查两周logs', { options: { duration: 14 }, ...shortcutConfig })
    .shortcut('查国际服logs', { options: { global: true }, ...shortcutConfig })
    .action(async ({ session, options }, bossStr, jobStr) => {
      if (!bossStr || !jobStr) return session.execute('help ff.logs')

      const boss = resolveBoss(bossStr)
      if (!boss) return '没找到或已不再统计该Boss，或者作者摸了。'

      const job = resolveJob(jobStr)
      if (!job) return '没找到职业。'

      const serverArea = options.global ? SERVER.GLOBAL : SERVER.CN
      const server = (serverArea == SERVER.CN) ? boss.server.cn : boss.server.global
      let duration
      switch (options.duration) {
        case 1:
          duration = 1
          break
        case 14:
          duration = 14
          break
        default:
          duration = 7
          break
      }
      const type = options.adps ? 'adps' : 'rdps'

      const logsUrl = 'https://www.fflogs.com/zone/statistics/table/'
        + `${boss.zoneId}/dps/${boss.id}/${boss.diff}/${boss.teamsize}/`
        + `${server}/100/1/${duration}/0/Global/${job.logsCode}/All/0/`
        + `normalized/single/0/-1/?keystone=15&dpstype=${type}`

      let data
      try {
        const res = await axios.get(logsUrl, {
          headers: {
            referer: 'https://www.fflogs.com'
          }
        })
        data = res.data
      } catch (error) {
        logger.warn(error)
        return '网络请求出了问题，请稍后尝试。'
      }

      const seriesData = data.match(/(?<=series\d*.data.push\()\d+.\d+(?=\))/g)
      let recordNumber = data.match(/(?<=<td class="main-table-number">\n)[\d,]+/g)
      if (!recordNumber) recordNumber = 0
      else recordNumber = recordNumber[1]

      if (seriesData == null || !recordNumber) return '没找到数据。'

      let durationText
      switch (duration) {
        case 1:
          durationText = '1天数据'
          break
        case 7:
          durationText = '1周数据'
          break
        case 14:
          durationText = '2周数据'
          break
      }

      /**
       * @type {import('./logs').LogsData}
       */
      const logsData = {
        boss: boss.name,
        job: job.name,
        jobCode: job.code,
        server: serverArea == SERVER.CN ? '国服' : '国际服',
        type: type == 'adps' ? 'aDPS' : 'rDPS',
        duration: durationText,
        record: recordNumber + '条',
        data: seriesData.map(str => parseFloat(str).toFixed(2))
      }

      const canvas = generateLogsImage(logsData)

      try {
        const imageData = canvas.toBuffer().toString('base64')
        return s('image', { url: `base64://${imageData}` })
      } catch (error) {
        logger.error(error)
        return '图片发送出错。'
      }
    })
}

