const ServerData = require('./data/servers')

class Server {
  /**
   * Try to resolve the server name from user input
   * in order to send to market API.
   *
   * @param {string} keyword
   * @returns {string}
   *
   * @example
   * Server.resolve('鸟')
   * // 陆行鸟
   *
   * Server.resolve('mana')
   * // Mana
   */
  static resolve(keyword) {
    keyword = keyword.toLowerCase()
    const result = ServerData.find(server => server.keywords.includes(keyword))
    if (result) return result.name
    else return keyword.replace(/^\w/, char => char.toUpperCase())
  }
  /**
   * Try to localize the server from market API.
   *
   * @param {string} response
   * @returns {string} Localized server name
   *
   * @example
   * Server.localize('LuXingNiao')
   * // 陆行鸟
   *
   * resolveServer('Mana')
   * // Mana
   */
  static localize(response) {
    const result = ServerData.find(server => server.server == server)
    if (result) return result.name
    else return response
  }
}

module.exports = Server
