const getMarket = require('./get-market')
const getMarketList = require('./get-market-list')
const getLogs = require('./get-logs')
const getWiki = require('./get-wiki')
const getItem = require('./get-item')
const drawCard = require('./draw-card')
const chooseGate = require('./choose-gate')

module.exports.name = 'ff-utils'

module.exports.apply = ctx => {
  ctx.command('ff', 'FFXIV功能')

  /**
   * legacy scripts
   */

  ctx.command('ff/ff-cactpot', '仙人微彩')
    .shortcut('刮刮乐', { fuzzy: true, prefix: true })
    .action(() => '仙人微彩解答器 - http://super-aardvark.github.io/yuryu')

  ctx.command('ff/ff-report', '举报网站')
    .shortcut('举报', { fuzzy: true, prefix: true })
    .action(() => '违规处理平台 - https://actff1.web.sdo.com/project/20210621ffviolation/index.html#/index')

  ctx.command('ff/ff-draw', '抽一张占星卡')
    .shortcut('抽卡', { prefix: true })
    .action(drawCard)

  ctx.command('ff/ff-gate', '挖宝选门')
    .shortcut('选门', { prefix: true })
    .action(chooseGate)

  ctx.command('ff/ff-search <content>', '搜索Wiki')
    .alias('ff-s')
    .option('share', '-s 使用分享卡片发送结果（可能发不出来）')
    .shortcut('查维基', { fuzzy: true, prefix: true })
    .action(({ options }, content) => getWiki(options, content))

  ctx.command('ff/ff-item <item>', '搜索Wiki物品')
    .alias('ff-i')
    .option('share', '-s 使用分享卡片发送结果（可能发不出来）')
    .shortcut('查物品', { fuzzy: true, prefix: true })
    .action(({ options }, item) => getItem(options, item))

  ctx.command('ff/ff-market <server> [...item]', '查询市场')
    .alias('ff-m')
    .usage('部分缩写将被正则替换为全称，替换规则可用选项查询。')
    .option('find', '-f <abbr> 查询缩写的全称')
    .option('shorten', '-s <full> 查询全称的缩写')
    .option('language', '-l <lcode> 注明物品名语言（en：英语，ja：日语）')
    .shortcut('查市场', { fuzzy: true, prefix: true })
    .shortcut(/^查(.+)区市场\s+(.+)$/, { args: ['$1', '$2'], prefix: true })
    .shortcut(/^用(.+)(语|文)查市场\s+(.+)\s+(.+)/, { args: ['$3', '$4'], options: { language: '$1' }, prefix: true })
    .check(({ options }) => getMarket.check(options))
    .action(({ session, options }, server, ...item) => getMarket(session, options, server, item))

  ctx.command('ff/ff-marketlist <server> <listname>', '查询市场清单')
    .alias('ff-mlist')
    .usage('使用预设的清单查询市场。')
    .option('list', '-l [name] 显示或查询可用清单')
    .option('detail', '-d <listname> 显示清单内容')
    .shortcut('查清单', { fuzzy: true, prefix: true })
    .action(({ session, options }, server, listname) => getMarketList(session, options, server, listname))

  ctx.command('ff/ff-logs <boss> <job>', '查询logs')
    .usage('默认查询国服、rDPS。')
    .option('adps', '-a 查询aDPS')
    .option('global', '-g 查询国际服')
    .option('duration', '-d <day(s)> 设置查询时间段（1, 7, 14）')
    .shortcut('查logs', { fuzzy: true, prefix: true })
    .shortcut('查一天logs', { options: { duration: 1 }, fuzzy: true, prefix: true })
    .shortcut('查一周logs', { options: { duration: 7 }, fuzzy: true, prefix: true })
    .shortcut('查两周logs', { options: { duration: 14 }, fuzzy: true, prefix: true })
    .shortcut('查国际服logs', { options: { global: true }, fuzzy: true, prefix: true })
    .action(({ session, options }, boss, job) => getLogs(session, options, boss, job))

  /**
   * refactored scripts
   */

  ctx.plugin(require('./fashion-report'))
  ctx.plugin(require('./simulate-melding'))
}