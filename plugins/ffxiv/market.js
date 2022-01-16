const { isDeepStrictEqual } = require('util')
const { s } = require('koishi')
const Server = require('./market.server')
const API = require('./market.api')
const MarketImageGenerator = require('./market.image')

/**
 * @param {import('koishi').Context} ctx
 * @param {import('./index').Config} config
 */
module.exports = (ctx, config) => {
  const logger = ctx.logger('ff.market')

  const generator = new MarketImageGenerator(ctx.canvas, config)

  /**
   * @param {string} keyword
   * @param {'shorten' | 'lengthen'} direction
   * @returns {string}
   */
  const findSubsTable = (keyword, direction) => {
    if (!(typeof keyword == 'string')) return '参数数量似乎不够。'

    /**
     * @type {import('./market'.MarketShortcodeItem[])}
     */
    const result = API.searchShortcodes(keyword, { direction: direction }).slice(0, 10)

    const typeText = direction ? '缩写规则' : '全称'
    const showResult = () => direction == 'shorten'
      ? result.map(item => `${item.full} - ${item.code}`).join('\n')
      : result.map(item => `${item.code} - ${item.full}`).join('\n')

    if (!result.length) {
      return `没有找到包含 ${keyword} 的${typeText}。`
    } else if (result.length <= 10) {
      return `共找到包含 ${keyword} 的 ${result.length} 条${typeText}：\n${showResult()}`
    } else {
      return `共找到包含 ${keyword} 的 ${result.length} 条${typeText}，仅显示前10条：\n${showResult()}`
    }
  }

  /**
   * @param {string} rawServer
   * @param {string[]} item
   * @param {string} lang
   * @returns {Promise<string | import('koishi-plugin-canvas').Canvas>}
   */
  const getMarketData = async (rawServer, item, lang) => {
    const server = Server.parse(rawServer)
    const resolve = await API.getMarketItemData(server, item, lang)

    if (resolve.status == 'error') return resolve.message
    const { name, hq, nq, payload } = resolve

    const listing = payload.listings
    const lastUpdate = payload.lastUploadTime
    const average = payload.currentAveragePrice.toFixed(2)

    /**
     * @param {import('./market').MarketPayloadListing} item
     * @returns {import('./market').MarketListing}
     */
    const extractItem = item => {
      return {
        seller: item.retainerName,
        server: item.worldName ? Server.localize(item.worldName) : server,
        hq: item.hq,
        unit: item.pricePerUnit,
        qty: item.quantity,
        total: item.total
      }
    }

    /**
     * @type {import('./market').MarketListingCounted[]}
     */
    const extractedList = []

    let listCount = 0
    let lastItem, itemRepeat

    for (const item of listing) {
      if (hq && !item.hq) continue
      if (nq && item.hq) continue

      const extractedItem = extractItem(item)

      if (!lastItem) {
        lastItem = extractedItem
        itemRepeat = 1
      } else if (isDeepStrictEqual(extractedItem, lastItem)) {
        itemRepeat++
      } else {
        const countedItem = {
          ...lastItem,
          repeat: itemRepeat
        }
        itemRepeat = 1
        extractedList.push(countedItem)
        lastItem = extractedItem
        listCount++
        if (listCount >= 10) break
      }
    }

    return await generator.generate({
      item: name,
      hq: hq,
      nq: nq,
      server: server,
      average: average,
      lastUpdate: lastUpdate,
      list: extractedList
    })
  }

  ctx
    .command('ff.market <server> [...item]', '查询市场')
    .alias('ff.m')
    .usage('部分缩写将被正则替换为全称，替换规则可用选项查询。')
    .option('lengthen', '-f <code> 查询缩写的全称')
    .option('shorten', '-s <full> 查询全称的缩写')
    .option('language', '-l <lcode> 注明物品名语言（en：英语，ja：日语）')
    .shortcut('查市场', { fuzzy: true, prefix: true })
    .shortcut(/^查(.+)区市场\s+(.+)$/, { args: ['$1', '$2'], prefix: true })
    .shortcut(/^用(.+)(语|文)查市场\s+(.+)\s+(.+)/, {
      args: ['$3', '$4'], options: { language: '$1' }, prefix: true
    })
    .before(({ session, options }, ...args) => {
      if (args.length < 2 && (!options.shorten && !options.lengthen)) {
        return session.execute('help ff.market')
      }
    })
    .before(({ options }) => {
      if (options.find && options.shorten) return '不可以同时查询缩写与全称。'
    })
    .action(async ({ options }, server, ...item) => {
      const result = await getMarketData(server, item, options.language)
      if (typeof result == 'string') return result

      try {
        const imageData = result.toBase64()
        return s('image', { url: `base64://${imageData}` })
      } catch (error) {
        logger.error(error)
        return '图片发送出错。'
      }
    })
    .action(({ options }) => {
      if (!options.lengthen) return
      return findSubsTable(options.lengthen, 'lengthen')
    })
    .action(({ options }) => {
      if (!options.shorten) return
      return findSubsTable(options.shorten, 'shorten')
    })
}
