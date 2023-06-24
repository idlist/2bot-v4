const axios = require('axios').default
const { getWbiKey, encodeWbi } = require('../../utils/bili-wbi')

const bSpaceApi = 'https://api.bilibili.com/x/space/wbi/arc/search'
const bVideoApi = 'https://api.bilibili.com/x/web-interface/view'
const mockHeader = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.37',
}

let wbiKey = ''

/**
 * @param {import('koishi').Context} ctx
 */
module.exports.apply = (ctx) => {
  const logger = ctx.logger('ff.fashion')

  ctx.command('ff.fashion', '时尚品鉴', { minInterval: 60 * 1000 })
    .alias('ff.nuan')
    .usage('抄一道 游玩C哩酱 (UID: 15503317) 的最新视频简介给你看。')
    .action(async () => {
      try {
        let retry = 0
        const maximumRetry = 5
        /**
         * @type {import('./fashion-report').BVideoListPayload}
         */
        let listData

        const params = { mid: 15503317 }

        while (retry < maximumRetry) {
          if (!wbiKey) wbiKey = await getWbiKey()
          const query = encodeWbi(params, wbiKey)
          console.log(query)

          /**
           * @type {import('./fashion-report').BVideoListPayload}
           */
          const { data } = await axios.get(`${bSpaceApi}?${query}`, {
            header: { ...mockHeader },
          })

          if (data.code == 0) {
            listData = data
            break
          }

          wbiKey = await getWbiKey()
          retry += 1
        }

        if (retry >= maximumRetry) {
          return '访问 bilibili 的 API 时出错。'
        }

        let latestReport
        for (const video of listData.data.list.vlist) {
          if (video.title.indexOf('时尚品鉴') != -1) {
            latestReport = video
            break
          }
        }

        if (!latestReport) return '没有偷到暖暖攻略……'

        /**
         * @type {import('./fashion').BVideoPayload}
         */
        const { data: reportData } = await axios.get(bVideoApi, {
          params: { aid: latestReport.aid },
          header: { ...mockHeader },
        })

        const rawReport = reportData.data.desc

        const reportContent = rawReport.split('\n')
        const report = []
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

        return (
          reportData.data.title.split()[0] + '\n' +
          `(av: ${reportData.data.aid})\n` +
          report.join('\n').replace(/\*/g, '').replace(/—/g, '')
        )
      } catch (error) {
        logger.warn(error)
        return '出现了网络错误。'
      }
    })
}