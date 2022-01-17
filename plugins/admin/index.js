module.exports.name = 'admin'

module.exports.apply = ctx => {
  ctx.command('admin', '管理功能')

  ctx.plugin(require('./auth'))
  ctx.command('admin/auth')
  ctx.command('admin/myauth')

  ctx.plugin(require('./echo'))
  ctx.command('admin/echo')

  ctx.plugin(require('./recall'))
  ctx.command('admin/recall')

  ctx.plugin(require('./ping'))
  ctx.command('admin/ping')

  ctx.plugin(require('./server-usage'))
  ctx.command('admin/vnstat')
}