const { t } = require('koishi')

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  // Modify commands.
  ctx.command('schedule', '定时指令')
  ctx.command('teach', { hidden: true })
    .usage('指令速查： https://s.idl.ist/teach-v4')
  ctx.command('teach.status', { hidden: true })
  ctx.command('dialogue', { hidden: true })

  // Move commands.
  ctx.command('admin/usage')
  ctx.command('admin/timer')
  ctx.command('fun/jrrp')
  ctx.command('fun/animal')
  ctx.command('fun/hexagram')
  ctx.command('imgen/5k')

  // Modify internal template.
  t.set('internal', {
    // Remove redundant punctuations.
    'command-aliases': '别名：{0}',
    'command-authority': '最低权限：{0} 级',
    'command-max-usage': '已调用次数：{0}/{1}',
    'command-min-interval': '距离下次调用还需 {0}/{1} 秒'
  })
}