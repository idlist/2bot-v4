const { t } = require('koishi')

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  // Modify commands.
  ctx.command('schedule', '定时命令')
  ctx.command('teach', { hidden: true })
    .usage('指令速查： https://s.idl.ist/teach-v4')
  ctx.command('teach.status', { hidden: true })
  ctx.command('dialogue', { hidden: true })

  // Move commands.
  ctx.command('fun/5k')
  ctx.command('fun/jrrp')

  // Modify internal template.
  t.set('internal', {
    // Remove redundant punctuations.
    'command-aliases': '别名：{0}',
    'command-authority': '最低权限：{0} 级',
    'command-max-usage': '已调用次数：{0}/{1}',
    'command-min-interval': '距离下次调用还需 {0}/{1} 秒'
  })

  // Quick fixes.
  ctx.command('admin/user', '用户管理')
}