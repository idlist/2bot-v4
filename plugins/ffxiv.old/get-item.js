const { s } = require('koishi')
const axios = require('axios').default
const cheerio = require('cheerio')

const { truncateString } = require('./utils')

const wikiUrl = 'https://ff14.huijiwiki.com'

const retrivePage = (data, item) => {
  const $ = cheerio.load(data.parse.text['*'])
  const sendContent = $('div.infobox-item>div.ff14-content-box-block').text()
  return {
    url: `${wikiUrl}/wiki/${encodeURI(`物品:${item}`)}`,
    title: `物品：${item}`,
    content: truncateString(sendContent)
  }
}

const retriveItem = (data, item) => {
  const $ = cheerio.load(data.parse.text['*'])
  const sendContent = $('div.mw-parser-output>p').text()
  return {
    url: `${wikiUrl}/wiki/ItemSearch?name=${encodeURI(item)}`,
    title: '物品搜索 - ' + item,
    content: sendContent
  }
}

module.exports = async (options, item) => {
  try {
    const reqUrl = `${wikiUrl}/api.php`
    const pageParams = new URLSearchParams({
      action: 'parse',
      page: '物品:' + item,
      prop: 'text',
      utf8: '',
      format: 'json'
    })
    const itemParams = new URLSearchParams({
      action: 'parse',
      title: 'ItemSearch',
      prop: 'text',
      text: `{{ItemSearch|name=${item}}}`,
      utf8: '',
      format: 'json'
    })
    const res = await Promise.all([
      axios.get(reqUrl, { params: pageParams }),
      axios.get(reqUrl, { params: itemParams })
    ])

    let sendObj = {}
    if ('parse' in res[0].data) {
      sendObj = retrivePage(res[0].data, item)
    } else {
      sendObj = retriveItem(res[1].data, item)
    }

    if (options.share) {
      return sendObj.title + ' - ' + s('share', sendObj)
    } else {
      return `${sendObj.title}\n${sendObj.content}\n${sendObj.url}`
    }
  } catch (err) {
    console.log(err)
  }
}