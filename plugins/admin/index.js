module.exports.name = 'admin'

module.exports.apply = ctx => {
  ctx.command('admin', '管理功能')

  ctx.plugin(require('./ping'))
  ctx.plugin(require('./server-usage'))
}