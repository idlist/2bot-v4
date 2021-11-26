const { capitalize } = require('lodash')

const Servers = require('./data/servers')

const ErrorContent = {
  1: '出了神秘错误，请尝试直接使用 https://universalis.app/ 。',
  2: '暂时无法访问 Universalis，请尝试直接使用 https://universalis.app/ 。',
  3: '未找到物品。',
  4: '物品不可出售。',
  5: '未找到服务器。'
}

const resolveServer = str => {
  let testStr = str.toLowerCase()
  let res = Servers.find(server => server.keywords.indexOf(testStr) != -1)
  if (res) return res.name
  else return capitalize(str)
}

const localizeServer = str => {
  let res = Servers.find(server => server.server == str)
  if (res) return res.name
  else return str
}

module.exports.resolveServer = resolveServer
module.exports.localizeServer = localizeServer
module.exports.ErrorContent = ErrorContent
