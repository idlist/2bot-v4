const axios = require('axios').default

const bSpaceAPI = 'https://api.bilibili.com/x/space/arc/search'
const bVideoAPI = 'https://api.bilibili.com/x/web-interface/view'
const mockHeader = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36 Edg/92.0.902.78'
}

/**
 * @param {import('koishi').Context} ctx
 */
module.exports.apply = ctx => {
  const logger = ctx.logger('ff-fashion')

  ctx.command('ff.fashion', '时尚品鉴', { minInterval: 60 * 1000 })
    .alias('ff.nuan')
    .usage('抄一道 游玩C哩酱（UID: 15503317） 的最新视频简介给你看。')
    .action(async () => {
      try {
        /**
         * @type {import('./fashion-report').ListPayload}
         */
        const { data: listData } = await axios.get(bSpaceAPI, {
          params: { mid: 15503317 },
          header: { ...mockHeader }
        })

        let latestReport
        for (const video of listData.data.list.vlist) {
          if (video.title.indexOf('时尚品鉴') != -1) {
            latestReport = video
            break
          }
        }

        if (!latestReport) return '没有偷到暖暖攻略……'

        /**
         * @type {import('./fashion-report').ReportPayload}
         */
        const { data: reportData } = await axios.get(bVideoAPI, {
          params: { aid: latestReport.aid },
          header: { ...mockHeader }
        })

        const rawReport = reportData.data.desc

        const reportContent = rawReport.split('\n')
        let report = []
        let isContent = false
        for (const line of reportContent) {
          if (line.startsWith('【')) {
            report.push(line)
            isContent = true
          } else if (!line.trim()) {
            isContent = false
          } else if (isContent) {
            report.push(line)
          }
        }
        report = reportData.data.title.split()[0] + '\n' +
          `(bv: ${reportData.data.aid})\n` +
          report.join('\n').replace(/\*/g, '').replace(/—/g, '')

        return report
      } catch (err) {
        logger.warn(err)
        return '发生了网络错误。'
      }
    })
}