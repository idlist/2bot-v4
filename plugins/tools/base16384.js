const base16384 = require('base16384')

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = (ctx) => {
  ctx.command('b16384', 'base16384 加解密')
    .usage('使用 base16384 的算法加解密')

  ctx.command('b16384.encode <content:text>', 'base16384 加密')
    .action((_, content) => new TextDecoder('utf-16').decode(base16384.encode(content)))

  ctx.command('b16384.decode <content:text>', 'base16384 解密')
    .action((_, content) => new TextDecoder('utf-8').decode(base16384.decode(content)))
}