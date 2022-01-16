const echo = require('@koishijs/plugin-echo')
const recall = require('@koishijs/plugin-recall')

module.exports.name = 'admin'

module.exports.apply = ctx => {
  ctx.command('admin', '管理工具')

  ctx.plugin(echo)
  ctx.command('admin/echo', '复述')

  ctx.plugin(recall)
  ctx.command('admin/recall', '撤回消息')

  ctx.plugin(require('./ping'))
  ctx.command('admin/ping')

  ctx.plugin(require('./server-usage'))
  ctx.command('admin/vnstat')
}