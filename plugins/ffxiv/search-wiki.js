const { s } = require('koishi')
const axios = require('axios').default
const cheerio = require('cheerio')
const { truncateString } = require('./utils')

const wikiUrl = 'https://ff14.huijiwiki.com'

/**
 * @param {import('./search-wiki').PagePayload} payload
 * @param {string} keyword
 * @returns {import('./search-wiki').ExtractResult}
 */
const extractPage = (payload, keyword) => {
  const title = payload.parse.title
  const $ = cheerio.load(payload.parse.text['*'])
  const content = $('div.mw-parser-output>*:not(table,.mbox)').text()
  return {
    url: `${wikiUrl}/wiki/${encodeURI(keyword)}`,
    title: title,
    content: truncateString(content)
  }
}

/**
 * @param {import('./search-wiki').SearchResultPayload} payload
 * @param {string} keyword
 * @returns {import('./search-wiki').ExtractResult}
 */
const extractSearchResult = (payload, keyword) => {
  const totalHits = payload.query.searchinfo.totalhits
  let content
  if (!totalHits) content = '没有搜索到结果。'
  else content = `共有 ${totalHits} 条结果。`
  return {
    url: `${wikiUrl}/index.php?search=${encodeURI(keyword)}`,
    title: `页面搜索 - ${keyword}`,
    content: content
  }
}

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  const logger = ctx.logger('ff.search')

  ctx
    .command('ff.search <keyword>', '搜索 Wiki')
    .alias('ff.s')
    .option('share', '-s 使用分享卡片发送结果（大概率发不出来）')
    .shortcut('查维基', { fuzzy: true, prefix: true })
    .action(async ({ options }, keyword) => {
      try {
        const requestUrl = `${wikiUrl}/api.php`

        const pageParams = new URLSearchParams({
          action: 'parse',
          page: keyword,
          prop: 'text',
          utf8: '',
          format: 'json'
        })
        const searchParams = new URLSearchParams({
          action: 'query',
          list: 'search',
          srsearch: keyword,
          srlimit: 1,
          utf8: '',
          format: 'json'
        })
        const [{ data: pageResult }, { data: searchResult }] = await Promise.all([
          axios.get(requestUrl, { params: pageParams }),
          axios.get(requestUrl, { params: searchParams })
        ])

        let extracted
        if ('parse' in pageResult) {
          extracted = extractPage(pageResult, keyword)
        } else {
          extracted = extractSearchResult(searchResult, keyword)
        }

        if (options.share) {
          return extracted.title + ' - ' + s('share', extracted)
        } else {
          return `${extracted.title}\n${extracted.content}\n${extracted.url}`
        }
      } catch (error) {
        logger.warn(error)
        return '网络请求出了问题，请稍后尝试。'
      }
    })
}