module.exports.name = 'admin'

module.exports.apply = ctx => {
  ctx.command('admin', '管理工具')

  ctx.plugin(require('./ping'))
  ctx.plugin(require('./echo'))
  ctx.plugin(require('./auth'))
  ctx.plugin(require('./recall'))
  ctx.plugin(require('./server-usage'))
}