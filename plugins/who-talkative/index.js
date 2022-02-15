const { t } = require('koishi')

module.exports.name = 'who-talkative'

module.exports.using = ['database']

t.set('tktv', {
  'desc': '话痨统计',
  'usage': '看看群里谁最话痨',

  'now': '今日话痨榜',
  'now-shortcut': '今日话痨榜',
  'now-title': '实时话痨榜：\n',
  'yesterday': '昨日话痨榜',
  'yesterday-shortcut': '昨日话痨榜',
  'yesterday-title': '昨日话痨榜：\n',
  'week': '本周话痨榜',
  'week-shortcut': '本周话痨榜',
  'week-title': '本周话痨榜（从昨天算起 7 天）：\n',
  'month': '本月话痨榜',
  'month-shortcut': '本月话痨榜',
  'month-title': '本月话痨榜（从昨天算起 30 天）：\n',
  'year': '今年话痨榜',
  'year-shortcut': '今年话痨榜',
  'year-title': '今年话痨榜（从昨天算起 365 天）：\n',
  'overall': '总计话痨榜',
  'overall-shortcut': '总计话痨榜',
  'overall-title': '全时段话痨榜：\n',

  'seconds': ' {0} 秒',
  'too-frequent': '不要看话痨榜看得太频繁啦！还有{0}才能再次查看！',
  'no-data': '尚无数据，让话痨们再得瑟一会儿。'
})

/**
 * @param {import('koishi').Context} ctx
 */
module.exports.apply = ctx => {
  ctx.command('tktv', t('tktv.desc'))
    .usage(t('tktv.usage'))

  ctx.plugin(require('./database'))

  ctx = ctx.channel()
  ctx.plugin(require('./stats'))
  ctx.plugin(require('./message'))
}