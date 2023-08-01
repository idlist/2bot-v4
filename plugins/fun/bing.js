/**
 * @param {import('koishi').Context} ctx
 */
module.exports = (ctx) => {
  ctx.command('bing <content:text>', '你不会必应吗')
    .usage('帮你准备好必应搜索的链接，只用点进去看结果了。')
    .action((_, content) => {
      return `你不会必应吗？去看看 https://www.bing.com/search?&q=${encodeURIComponent(content)}`
    })
}