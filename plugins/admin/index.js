module.exports.name = 'admin'

module.exports.apply = ctx => {
  ctx.command('admin', '管理工具')

  ctx.plugin(require('./server-usage'))
}