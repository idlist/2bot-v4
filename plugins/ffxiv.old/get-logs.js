const fs = require('fs/promises')

const axios = require('axios').default
const { cloneDeep } = require('lodash')
const hjson = require('hjson')

const getLogsImage = require('./get-logs-image')

const Jobs = require('./data/jobs')
let Bosses
(async () => {
  try {
    Bosses = hjson.parse(await fs.readFile(__dirname + '/data/bosses.hjson', 'utf-8'))
  } catch (err) {
    console.log(err)
  }
})()

const SV_CN = 1
const SV_GLOBAL = 2

const resolveBoss = str => {
  for (let boss of Bosses) {
    let isBoss = false
    boss.keywords.forEach(keyword => {
      if (str.toLowerCase() == keyword) isBoss = true
    })
    if (isBoss) {
      let res = cloneDeep(boss)
      delete res.keywords
      return res
    }
  }
}

const resolveJob = str => {
  for (let job of Jobs) {
    let isJob = false
    job.keywords.forEach(keyword => {
      if (str.toLowerCase() == keyword) isJob = true
    })
    if (isJob) {
      return {
        name: job.keywords[0],
        code: job.keywords[1],
        logsCode: job.name
      }
    }
  }
}

module.exports = async (session, options, boss, job) => {
  if (!boss || !job) return '参数数量似乎不够。'

  boss = resolveBoss(boss)
  if (!boss) return '没找到或已不再统计该Boss，或者作者摸了。'

  job = resolveJob(job)
  if (!job) return '没找到职业。'

  let serverArea = options.global ? SV_GLOBAL : SV_CN
  let server = serverArea == SV_CN ? boss.server.cn : boss.server.global
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
  let type = options.adps ? 'adps' : 'rdps'

  let logsUrl = 'https://www.fflogs.com/zone/statistics/table/'
    + `${boss.zoneId}/dps/${boss.id}/${boss.diff}/${boss.teamsize}/`
    + `${server}/100/1/${duration}/0/Global/${job.logsCode}/All/0/`
    + `normalized/single/0/-1/?keystone=15&dpstype=${type}`
  let res = await axios.get(logsUrl, {
    headers: {
      referer: 'https://www.fflogs.com'
    }
  })
  let data = res.data

  let seriesData = data.match(/(?<=series\d*.data.push\()\d+.\d+(?=\))/g)
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

  let logsData = {
    boss: boss.name,
    job: job.name,
    jobcode: job.code,
    server: serverArea == SV_CN ? '国服' : '国际服',
    type: type == 'adps' ? 'aDPS' : 'rDPS',
    duration: durationText,
    record: recordNumber + '条',
    data: seriesData.map(str => parseFloat(str).toFixed(2))
  }
  getLogsImage(session, logsData)
}

