const { s } = require('koishi')
const axios = require('axios').default
const cheerio = require('cheerio')
const { truncateString } = require('./utils')

const wikiUrl = 'https://ff14.huijiwiki.com'

/**
 * @param {import('./search-item').PagePayload} payload
 * @param {string} keyword
 * @returns {import('./search-item').ExtractResult}
 */
const extractPage = (payload, item) => {
  const $ = cheerio.load(payload.parse.text['*'])
  const content = $('div.infobox-item>div.ff14-content-box-block').text()
  return {
    url: `${wikiUrl}/wiki/${encodeURI(`物品:${item}`)}`,
    title: `物品：${item}`,
    content: truncateString(content)
  }
}

/**
 * @param {import('./search-item').PagePayload} payload
 * @param {string} keyword
 * @returns {import('./search-item').ExtractResult}
 */
const extractSearchResult = (payload, item) => {
  const $ = cheerio.load(payload.parse.text['*'])
  const content = $('div.mw-parser-output>p').text()
  return {
    url: `${wikiUrl}/wiki/ItemSearch?name=${encodeURI(item)}`,
    title: '物品搜索 - ' + item,
    content: content
  }
}

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  const logger = ctx.logger('ff.item')

  ctx
    .command('ff.item <item>', '搜索Wiki物品')
    .alias('ff.i')
    .option('share', '-s 使用分享卡片发送结果（大概率发不出来）')
    .shortcut('查物品', { fuzzy: true, prefix: true })
    .action(async ({ options }, item) => {
      try {
        const requestUrl = `${wikiUrl}/api.php`

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
        const [{ data: pageResult }, { data: searchResult }] = await Promise.all([
          axios.get(requestUrl, { params: pageParams }),
          axios.get(requestUrl, { params: itemParams })
        ])

        let extracted
        if ('parse' in pageResult) {
          extracted = extractPage(pageResult, item)
        } else {
          extracted = extractSearchResult(searchResult, item)
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