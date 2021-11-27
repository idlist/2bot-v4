const { readFile } = require('fs/promises')

const yaml = require('js-yaml')

const { ErrorContent, resolveServer, localizeServer } = require('./get-market-utils')
const { getItemData } = require('./get-market')
const getMarketListImage = require('./get-market-list-image')

let MarketList
(async () => {
  MarketList = await readFile(`${__dirname}/data/market-list.yaml`, 'utf-8')
  MarketList = yaml.load(MarketList)
})()

let findMarketList = listname => {
  let showResult = list => list.map(item => item.name).join('\n')

  if (typeof listname == 'boolean') {
    let len = MarketList.length

    if (len <= 10) return `现有 ${len} 个清单：\n${showResult(MarketList)}`
    else return `现有 ${len} 个清单，仅显示前10条：\n${showResult(MarketList)}`
  } else {
    let list = MarketList.filter(item => item.name.match(listname))
    let len = list.length
    if (len > 10) list = list.slice(0, 10)

    if (!len) return `没有找到包含 ${listname} 的清单。`
    else if (len <= 10) return `共找到包含 ${listname} 的 ${len} 个清单：\n${showResult(list)}`
    else return `共找到包含 ${listname} 的 ${len} 个清单，仅显示前10条：\n${showResult(list)}`
  }
}

let showListDetail = listname => {
  if (!listname) return '未提供清单名。'
  let list = MarketList.find(item => item.name == listname)

  return `清单 ${listname} 包括：\n${list.items.join('\n')}`
}

let getMarketListData = async (session, server, listname) => {
  if (!server || !listname) return '参数数量似乎不够。'

  server = resolveServer(server)
  let list = MarketList.find(item => item.name == listname)
  if (!list) return '未找到清单。'
  else list = [...list.items]

  let options = { ...list.options }
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

  getMarketListImage(session, { listname: listname, server: server, list: res })
}

module.exports = async (session, options, server, listname) => {
  if (options.list) {
    return findMarketList(options.list)
  } else if (options.detail) {
    return showListDetail(options.detail)
  } else {
    return await getMarketListData(session, server, listname)
  }
}