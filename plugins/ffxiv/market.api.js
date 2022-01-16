const { readFile } = require('fs/promises')
const { resolve } = require('path')
const { Logger } = require('koishi')
const yaml = require('js-yaml')
const axios = require('axios').default

/**
 * @type {import('./market').MarketShortcodeItem[]}
 */
let Shortcodes
(async () => {
  Shortcodes = yaml.load(await readFile(resolve(__dirname, 'data/market-shortcodes.yaml'), 'utf-8'))
  Shortcodes = Shortcodes.sort((a, b) => a.code.localeCompare(b.code))
  Object.freeze(Shortcodes)
})()

const logger = new Logger('ff.market')

const ErrorMessage = {
  // Internet error
  100: '出了神秘错误，请尝试直接使用 https://universalis.app/ 。',
  101: '暂时无法访问 Universalis，请尝试直接使用 https://universalis.app/ 。',
  111: '获取物品 ID 所用 API 暂时无法使用。',

  // Item error
  201: '未找到物品，可能由于输入错误或 API 未更新。',
  202: '物品不可出售。',

  // Request error
  301: '请求失败，可能是物品无人出售或服务器名字错误。'
}
Object.freeze(ErrorMessage)

class API {
  /**
   * @param {string} name
   * @returns {string}
   */
  static parseItemName(name) {
    Shortcodes.forEach(item => {
      const subsRegExp = new RegExp(item.code, 'g')
      name = name.replace(subsRegExp, item.full)
    })
    return name
  }

  /**
   * @param {string} keyword
   * @returns {'cn' | 'en' | 'ja'}
   */
  static parseLanguageCode(keyword) {
    switch (keyword) {
      case '英':
      case 'en':
        return 'en'
      case '日':
      case 'ja':
      case 'jp':
        return 'ja'
      default:
        return 'cn'
    }
  }

  /**
   * @param {string} keyword
   * @param {import('./market').SearchShortcodeOptions} options
   * @returns {string[]}
   */
  static searchShortcodes(keyword, options) {
    const result = []

    if (options.direction == 'shorten') {
      Shortcodes.forEach(item => {
        if (item.full.match(keyword)) result.push(item)
      })
    }
    if (options.direction == 'lengthen') {
      Shortcodes.forEach(item => {
        if (item.code.match(keyword)) result.push(item)
      })
    }

    return result
  }

  /**
   * @param {string} name
   * @param {string} langCode
   * @returns {Promise<import('./market').ItemResolve>}
   */
  static async getItemId(name, langCode) {
    let apiUrl

    const lang = API.parseLanguageCode(langCode)
    if (lang == 'cn') {
      apiUrl = 'https://cafemaker.wakingsands.com/search'
    } else {
      apiUrl = 'https://xivapi.com/search'
    }

    try {
      const { data: { Results: results } } = await axios.get(apiUrl, {
        params: {
          indexes: 'Item',
          language: lang,
          string: name
        }
      })

      if (results.length) {
        return {
          status: 'success',
          name: results[0].Name,
          id: results[0].ID
        }
      } else {
        return {
          status: 'error',
          message: ErrorMessage[201]
        }
      }
    } catch (error) {
      logger.warn(error)
      return {
        status: 'error',
        message: ErrorMessage[111]
      }
    }
  }

  /**
   * @param {string} server
   * @param {string | string[]} item
   * @param {string} lang
   * @returns {Promise<import('./market').MarketResolve>}
   */
  static async getMarketItemData(server, item, lang) {
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

    item = API.parseItemName(item)
    const targetItem = await API.getItemId(item, lang)
    if (targetItem.status == 'error') return targetItem

    /**
     * @type {import('./market').ItemQuery}
     */
    const query = {
      status: 'success',
      name: targetItem.name,
      server: server,
      hq: hq,
      nq: nq
    }

    try {
      let apiUrl = 'https://universalis.app/api'
      apiUrl = encodeURI(`${apiUrl}/${server}/${targetItem.id}`)
      const { status, data } = await axios.get(apiUrl)

      if (status != 200) {
        return {
          ...query,
          status: 'error',
          message: ErrorMessage[101]
        }
      }
      if (!data.listings.length) {
        return {
          ...query,
          status: 'error',
          message: ErrorMessage[301]
        }
      }

      return {
        ...query,
        payload: data
      }
    } catch (error) {
      /**
       * @type {import('axios').AxiosError}
       */
      const { response } = error

      if (response) {
        switch (response.status) {
          case 404:
            return {
              ...query,
              status: 'error',
              message: ErrorMessage[202]
            }
          case 403:
          case 500:
            return {
              ...query,
              status: 'error',
              message: ErrorMessage[101]
            }
          default:
            logger.warn(error)
            return {
              ...query,
              status: 'error',
              message: ErrorMessage[100]
            }
        }
      }

      logger.warn(error)
      return {
        ...query,
        status: 'error',
        message: ErrorMessage[100]
      }
    }
  }
}

module.exports = API