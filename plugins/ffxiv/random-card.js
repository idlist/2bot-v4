const { readFile } = require('fs/promises')
const { resolve } = require('path')
const { segment, Random } = require('koishi')
const { range } = require('./utils')

const imageResources = new Map()

Promise.all(range(6).map(async (i) => {
  const x = i + 1
  const image = await readFile(resolve(__dirname, `assets/cards/${x}.png`))
  imageResources.set(x, image.toString('base64'))
}))

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  const logger = ctx.logger('ff.draw')

  ctx.command('ff.draw', '抽一张占星卡')
    .shortcut('抽卡', { prefix: true })
    .action(() => {
      try {
        const card = Random.int(1, 7)
        let cardMeaning = ''
        switch (card) {
          case 1:
            cardMeaning = '[日 / 近战]'
            break
          case 2:
            cardMeaning = '[月 / 近战]'
            break
          case 3:
            cardMeaning = '[星 / 近战]'
            break
          case 4:
            cardMeaning = '[日 / 远程]'
            break
          case 5:
            cardMeaning = '[月 / 远程]'
            break
          case 6:
            cardMeaning = '[星 / 远程]'
            break
        }
        return segment('image', { url: `base64://${imageResources.get(card)}` }) +
          ' ' + cardMeaning
      } catch (err) {
        logger.warn(err)
        return '出现了神秘错误。'
      }
    })

}