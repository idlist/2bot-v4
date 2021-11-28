const { readFile } = require('fs/promises')
const { resolve } = require('path')
const yaml = require('js-yaml')

/**
 * @type {import('./market').MarketListItem[]}
 */
let MarketList
(async () => {
  MarketList = await readFile(resolve(__dirname, 'data/market-list.yaml'), 'utf-8')
  MarketList = yaml.load(MarketList)
  Object.freeze(MarketList)
})()

class ListAPI {
  /**
   * @param {string?} name
   * @returns {import('./market').MarketListItem[]}
   */
  static getMarketList(name) {
    if (!name) return MarketList
    else return MarketList.filter(item => item.name.match(name))
  }
  /**
   *
   * @param {string} name
   * @returns {import('./market').MarketListItem | undefined}
   */
  static showMarketList(name) {
    return MarketList.find(item => item.name == name)
  }
}

module.exports = ListAPI
