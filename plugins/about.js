module.exports.name = 'about'

/**
 * @param {import('koishi').Context} ctx
 */
module.exports.apply = ctx => {
  ctx.command('about', '关于 2bot')
    .action(() => {
      return (
        '2bot 是由日地地 (me@idl.ist) 所搭建的没什么功能的 bot！\n' +
        '使用 Koishi 框架在 Node.js 上运行。\n' +
        '仓库地址： https://github.com/idlist/2bot-v4'
      )
    })
}