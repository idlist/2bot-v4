const { segment, sleep } = require('koishi')
const Server = require('./market.server')
const API = require('./market.api')
const ListAPI = require('./market-list.api')
const MarketListImageGenerator = require('./market-list.image')

/**
 * @param {boolean | string} name
 * @returns
 */
const findMarketList = (name) => {
  /**
   * @param {import('./market').MarketListItem[]} list
   * @returns {string}
   */
  const showResult = (list) => list.slice(0, 10).map((item) => item.name).join('\n')

  if (typeof name == 'boolean') {
    const list = ListAPI.getMarketList()
    const length = list.length

    if (length <= 10) return `现有 ${length} 个清单：\n${showResult(list)}`
    else return `现有 ${length} 个清单，仅显示前10条：\n${showResult(list)}`
  } else {
    const list = ListAPI.getMarketList(name)
    const length = list.length

    if (!length) return `没有找到包含 ${name} 的清单。`
    else if (length <= 10) return `共找到包含 ${name} 的 ${length} 个清单：\n${showResult(list)}`
    else return `共找到包含 ${name} 的 ${length} 个清单，仅显示前10条：\n${showResult(list)}`
  }
}

/**
 * @param {string} name
 * @returns {string}
 */
const showListDetail = (name) => {
  if (!name) return '未提供清单名。'
  const list = ListAPI.showMarketList(name)

  if (!list) return `没有找到清单 ${name}。`
  return `清单 ${name} 包括：\n${list.items.join('\n')}`
}

/**
 * @param {MarketListImageGenerator} generator
 * @param {string} rawServer
 * @param {string} name
 * @returns {Promise<string | import('koishi-plugin-canvas').Canvas>}
 */
const getMarketListData = async (generator, rawServer, name) => {
  const server = Server.parse(rawServer)
  const list = ListAPI.showMarketList(name)
  if (!list) return '未找到清单。'

  const { items, options } = list

  /**
   * @type {import('./market').MarketResolve[]}
   */
  const itemResolve = []

  for (const item of items) {
    itemResolve.push(await API.getMarketItemData(server, item, options?.language))
    await sleep(200)
  }

  /**
   * @type {import('./market').MarketListItemParsed[]}
   */
  const parsedList = itemResolve.map((item) => {
    /**
     * @type {Partial<import('./market').MarketPayloadListing>}
     */
    let lowest = {}
    if (item.status == 'success') lowest = item.payload.listings[0]

    return {
      status: item.status,
      message: 'message' in item ? item.message : undefined,
      seller: lowest?.retainerName,
      server: 'worldName' in lowest ? Server.localize(lowest.worldName) : server,
      item: 'name' in item ? item.name : undefined,
      itemhq: 'hq' in item ? item.hq : undefined,
      reshq: lowest?.hq,
      unit: lowest?.pricePerUnit,
      qty: lowest?.quantity,
      total: lowest?.total,
      lastUpdate: 'payload' in item ? item.payload.lastUploadTime : undefined,
    }
  })

  if (parsedList.every((item) => item.status == 'error')) {
    return '所有请求均失败，请检查输入或尝试查询单件物品。'
  }

  return await generator.generate({
    name: name,
    server: server,
    list: parsedList,
  })
}

/**
 * @param {import('koishi').Context} ctx
 * @param {import('./index').Config} config
 */
module.exports = (ctx, config) => {
  const logger = ctx.logger('ff.marketlist')
  const generator = new MarketListImageGenerator(ctx.canvas, config)

  ctx.command('ff.marketlist <server> <listname>', '查询市场清单', { authority: 2 })
    .alias('ff.mlist')
    .usage('使用预设的清单查询市场。')
    .option('list', '-l [name] 显示或查询可用清单')
    .option('detail', '-d <listname> 显示清单内容')
    .shortcut('查清单', { fuzzy: true, prefix: true })
    .before(({ session, options }, ...args) => {
      if (args.length < 2 && (!options.list && !options.detail)) {
        return session.execute('help ff.marketlist')
      }
    })
    .before(({ options }) => {
      if (options.list && options.detail) return '不可以同时查询多个项目。'
    })
    .action(({ options, next }) => {
      if (!('list' in options)) return next()
      return findMarketList(options.list)
    })
    .action(({ options, next }) => {
      if (!('detail' in options)) return next()
      return showListDetail(options.detail)
    })
    .action(async (_, server, name) => {
      const result = await getMarketListData(generator, server, name)
      if (typeof result == 'string') return result

      try {
        const imageData = result.toBase64()
        return segment('image', { url: `base64://${imageData}` })
      } catch (error) {
        logger.error(error)
        return '图片发送出错。'
      }
    })
}