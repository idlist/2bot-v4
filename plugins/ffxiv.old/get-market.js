const { readFile } = require('fs/promises')

const yaml = require('js-yaml')
const axios = require('axios').default
const { isEqual } = require('lodash')

const { ErrorContent, resolveServer, localizeServer } = require('./get-market-utils')
const getMarketImage = require('./get-market-image')

let Abbr
(async () => {
  Abbr = await readFile(`${__dirname}/data/market-abbr.yaml`, 'utf-8')
  Abbr = yaml.load(Abbr).sort((a, b) => a.abbr.localeCompare(b.abbr))
})()

const Method = {
  Shorten: 0,
  Find: 1
}

const resolveItemName = name => {
  Abbr.forEach(item => {
    const subsRegExp = new RegExp(item.abbr, 'g')
    name = name.replace(subsRegExp, item.full)
  })
  return name
}

const findSubsTable = (session, str, method) => {
  if (!(typeof str == 'string')) {
    session.send('参数数量似乎不够。')
    return
  }

  let result = [], len
  Abbr.forEach(item => {
    if (method == Method.Find && item.abbr.match(str)) {
      result.push(item)
    }
    if (method == Method.Shorten && item.full.match(str)) {
      result.push(item)
    }
  })

  len = result.length
  if (len > 10) result = result.slice(0, 10)

  const typeText = method ? '缩写规则' : '全称'
  const showResult = () => method == Method.Find
    ? result.map(item => `${item.abbr} - ${item.full}`).join('\n')
    : result.map(item => `${item.full} - ${item.abbr}`).join('\n')

  if (!len) {
    session.send(`没有找到包含 ${str} 的${typeText}。`)
  } else if (len <= 10) {
    session.send(`共找到包含 ${str} 的 ${len} 条${typeText}：\n${showResult()}`)
  } else {
    session.send(`共找到包含 ${str} 的 ${len} 条${typeText}，仅显示前10条：\n${showResult()}`)
  }
}

const getItemId = async (options, name) => {
  let apiUrl

  let lang
  switch (options.language) {
    case '英':
    case 'en':
      lang = 'en'
      break
    case '日':
    case 'ja':
    case 'jp':
      lang = 'ja'
      break
    default:
      lang = 'cn'
      break
  }
  if (lang == 'cn') apiUrl = 'https://cafemaker.wakingsands.com'
  else apiUrl = 'https://xivapi.com'

  try {
    let res = await axios.get(encodeURI(`${apiUrl}/search`
      + `?indexes=Item&language=${lang}&string=${name}`))
    let results = res.data.Results

    if (results.length) {
      return {
        name: results[0].Name,
        id: results[0].ID
      }
    } else return
  } catch (err) {
    if (err) console.log(err)
  }
}

const getItemData = async (options, server, item) => {
  if (typeof item != 'string') item = item.join(' ')

  let hq = false
  if (item.toLowerCase().match('hq') != null) {
    hq = true
    item = item.replace(/[hH][qQ]/g, '')
  }

  let nq = false
  if (item.toLowerCase().match('nq') != null) {
    nq = true
    item = item.replace(/[nN][qQ]/g, '')
  }

  item = resolveItemName(item)
  let targetItem = await getItemId(options, item)

  const info = {
    name: targetItem ? targetItem.name : item,
    server: server,
    hq: hq,
    nq: nq
  }

  if (!targetItem) return { ...info, errCode: 3 }

  try {
    let apiUrl = 'https://universalis.app/api'
    apiUrl = encodeURI(`${apiUrl}/${server}/${targetItem.id}`)
    let res = await axios.get(apiUrl)

    if (res.status != 200) return { ...info, errCode: 2 }
    if (!res.data.listings.length) return { ...info, errCode: 5 }

    return { ...info, data: res.data }
  } catch (err) {
    let errCode
    if (err.response) {
      if (err.response.status == 404) {
        errCode = 4
      } else if (err.respose.status == 403) {
        errCode = 2
      } else {
        errCode = 1
        console.log(err)
      }

      return { ...info, errCode: errCode }
    } else {
      console.log(err)
    }
  }

}

const getMarketData = async (session, options, server, item) => {
  if (!server || !item.length) {
    session.send('参数数量似乎不够。')
    return
  }

  server = resolveServer(server)
  let res = await getItemData(options, server, item)

  if ('errCode' in res) {
    session.send(ErrorContent[res.errCode])
    return
  }
  let { name, hq, nq, data } = res

  let listing = data.listings
  let lastUpdate = data.lastUploadTime
  let average = data.averagePrice.toFixed(2)

  const extractItem = item => {
    return {
      seller: item.retainerName,
      server: 'worldName' in item ? localizeServer(item.worldName) : server,
      hq: item.hq,
      unit: item.pricePerUnit,
      qty: item.quantity,
      total: item.total
    }
  }

  let extractedList = []
  let listCount = 0
  let lastItem, itemRepeat
  for (let item of listing) {
    if (hq && !item.hq) continue
    if (nq && item.hq) continue

    let extractedItem = extractItem(item)

    if (!lastItem) {
      lastItem = extractedItem
      itemRepeat = 1
    } else if (isEqual(extractedItem, lastItem)) {
      itemRepeat++
    } else {
      lastItem.repeat = itemRepeat
      itemRepeat = 1
      extractedList.push(lastItem)
      lastItem = extractedItem
      listCount++
      if (listCount >= 10) break
    }
  }

  let highestItem = extractItem(listing[listing.length - 1])
  highestItem.repeat = 1

  const marketData = {
    item: name,
    hq: hq,
    nq: nq,
    server: server,
    average: average,
    lastUpdate: lastUpdate,
    list: extractedList,
    highest: highestItem
  }
  getMarketImage(session, marketData)
}

module.exports = (session, options, server, item) => {
  if (options.find) {
    findSubsTable(session, options.find, Method.Find)
  } else if (options.shorten) {
    findSubsTable(session, options.shorten, Method.Shorten)
  } else {
    getMarketData(session, options, server, item)
  }
}

module.exports.check = options => {
  if (options.find && options.shorten) {
    return '不可以同时查询缩写与全称。'
  } else return
}

module.exports.getItemData = getItemData