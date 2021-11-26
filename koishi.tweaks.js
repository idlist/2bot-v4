const { t } = require('koishi')

module.exports = ctx => {
  /*
  // modify description
  ctx.command('schedule', '定时命令')
  ctx.command('github', 'GitHub 功能')
  ctx.command('status', '查看 2bot 的状态')

  // move command
  ctx.command('common/5k')
  ctx.command('common/animal')
  ctx.command('common/aircon')
  ctx.command('common/jrrp')

  // hide command
  ctx.command('teach', { hidden: true })
    .usage('指令速查： https://s.idl.ist/teach')
  ctx.command('dialogue', { hidden: true })
  */

  // Modify internal template
  t.set('internal', {
    // Modify help text
    'global-help-epilog': '使用前缀“-”加指令名使用指令，“-help 指令名”查看帮助。',

    // Remove redundant punctuations
    'command-aliases': '别名：{0}',
    'command-authority': '最低权限：{0} 级',
    'command-max-usage': '已调用次数：{0}/{1}',
    'command-min-interval': '距离下次调用还需 {0}/{1} 秒。'
  })
}