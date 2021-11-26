const { s } = require('koishi')
const axios = require('axios').default
const cheerio = require('cheerio')

const { truncateString } = require('./utils')

const wikiUrl = 'https://ff14.huijiwiki.com'

const retrivePage = (data, content) => {
  const title = data.parse.title
  const $ = cheerio.load(data.parse.text['*'])
  const sendContent = $('div.mw-parser-output>*:not(table,.mbox)').text()
  return {
    url: `${wikiUrl}/wiki/${encodeURI(content)}`,
    title: title,
    content: truncateString(sendContent)
  }
}

const retriveSearchResult = (data, content) => {
  const totalHits = data.query.searchinfo.totalhits
  let sendContent
  if (!totalHits) sendContent = '没有搜索到结果。'
  else sendContent = `共有${totalHits}条结果。`
  return {
    url: `${wikiUrl}/index.php?search=${encodeURI(content)}`,
    title: `页面搜索 - ${content}`,
    content: sendContent
  }
}

module.exports = async (options, content) => {
  try {
    const reqUrl = `${wikiUrl}/api.php`
    const pageParams = new URLSearchParams({
      action: 'parse',
      page: content,
      prop: 'text',
      utf8: '',
      format: 'json'
    })
    const searchParams = new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: content,
      srlimit: 1,
      utf8: '',
      format: 'json'
    })
    const res = await Promise.all([
      axios.get(reqUrl, { params: pageParams }),
      axios.get(reqUrl, { params: searchParams })
    ])

    let sendObj = {}
    if ('parse' in res[0].data) {
      sendObj = retrivePage(res[0].data, content)
    } else {
      sendObj = retriveSearchResult(res[1].data, content)
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