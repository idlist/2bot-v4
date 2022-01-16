const axios = require('axios').default

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  const logger = ctx.logger('hhsh')

  ctx.command('hhsh <abbr>', '好好说话')
    .usage('调用外部 API，不对其结果负责。')
    .action(async ({ session }, abbr) => {
      try {
        if (!abbr) return session.execute('help hhsh')

        /**
         * @type {import('./hhsh').AbbrsPayload}
         */
        const resolve = await axios.post(
          'https://lab.magiconch.com/api/nbnhhsh/guess',
          { text: abbr }
        )
        const data = resolve.data[0]

        console.log(data)

        if ('trans' in data) {
          const word = data
          return `${word.name} 可能代表：${word.trans.join('、')}。`
        } else if (data.inputting.length) {
          const word = data
          return `${word.name} 可能代表：${word.inputting.join('、')}。`
        } else {
          return `没有找到 ${abbr} 可能代表的词……`
        }
      } catch (error) {
        logger.warn(error)
        return 'API 调用过程出现了错误。'
      }
    })
}