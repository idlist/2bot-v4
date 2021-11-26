/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  ctx.command('ff.cactpot', '仙人微彩')
    .shortcut('刮刮乐', { fuzzy: true, prefix: true })
    .action(() => '仙人微彩解答器 - http://super-aardvark.github.io/yuryu')

  ctx.command('ff.report', '举报网站')
    .shortcut('举报', { fuzzy: true, prefix: true })
    .action(() => '违规处理平台 - https://actff1.web.sdo.com/project/20210621ffviolation/index.html#/index')

}