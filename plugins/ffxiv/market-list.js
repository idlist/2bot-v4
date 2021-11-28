const Server = require('./market.server')
const API = require('./market.api')
const ListAPI = require('./market-list.api')
const generateMarketListImage = require('./market-list.image')

/**
 * @param {boolean | string} name
 * @returns
 */
const findMarketList = name => {
  /**
   * @param {import('./market').MarketListItem[]} list
   * @returns {string}
   */
  const showResult = list => list.slice(0, 10).map(item => item.name).join('\n')

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

const showListDetail = name => {
  if (!name) return '未提供清单名。'
  const list = ListAPI.showMarketList(name)

  return `清单 ${name} 包括：\n${list.items.join('\n')}`
}

const getMarketListData = async (server, name) => {
  server = Server.parse(server)
  let list = ListAPI.showMarketList(name)
  if (!list) return '未找到清单。'
  else list = [...list.items]

  const options = { ...list.options }
  let res = await Promise.all(list.map((item, i) => {
    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          resolve(getItemData(options, server, item))
        }, i * 200)
      } catch (err) {
        reject(err)
      }
    })
  }))

  res = res.map(item => {
    let lowest = {}
    if (!('errCode' in item)) lowest = item.data.listings[0]
    return {
      seller: lowest.retainerName,
      server: 'worldName' in lowest ? localizeServer(lowest.worldName) : server,
      item: item.name,
      itemhq: item.hq,
      reshq: lowest.hq,
      unit: lowest.pricePerUnit,
      qty: lowest.quantity,
      total: lowest.total,
      lastUpdate: 'data' in item ? item.data.lastUploadTime : undefined,
      errCode: item.errCode
    }
  })

  if (res.every(item => item.errCode)) {
    if (res.every(item => item.errCode == 1)) {
      return ErrorContent[1]
    } else if (res.every(item => item.errCode == 3)) {
      return '清单内的所有物品都不可出售。'
    } else if (res.every(item => item.errCode == 4)) {
      return ErrorContent[4]
    } else if (res.every(item => item.errCode == 5)) {
      return ErrorContent[5]
    } else {
      return ErrorContent[0]
    }
  }

  generateMarketListImage(session, { listname: name, server: server, list: res })
}

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  ctx
    .command('ff.marketlist <server> <listname>', '查询市场清单')
    .alias('ff.mlist')
    .usage('使用预设的清单查询市场。')
    .option('list', '-l [name] 显示或查询可用清单')
    .option('detail', '-d <listname> 显示清单内容')
    .shortcut('查清单', { fuzzy: true, prefix: true })
    .before(({ session, options }, ...args) => {
      if (args.length < 2 && (!options.list || !options.detail)) {
        return session.execute('help ff.marketlist')
      }
    })
    .before(({ options }) => {
      if (options.list && options.detail) return '不可以同时查询多个项目。'
    })
    .action(async (_, server, listname) => {
      return await getMarketListData(server, listname)
    })
    .action(({ options }) => {
      if (!options.detail) return
      return showListDetail(options.detail)
    })
    .action(({ options }) => {
      if (!options.list) return
      return findMarketList(options.list)
    })
}