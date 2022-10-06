const { sleep } = require('koishi')

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  ctx.on('command-added', async (command) => {
    switch (command.name) {
      // Modify commands.
      case 'teach':
        await sleep(0)
        ctx.command('teach', { hidden: true })
          .usage('指令速查： https://s.idl.ist/teach-v4')
        break
      case 'teach.status':
        ctx.command('teach.status', { hidden: true })
        break
      case 'dialogue':
        ctx.command('dialogue', { hidden: true })
        break
      case 'channel':
        ctx.command('admin/channel')
        break
      case 'echo':
        ctx.command('admin/echo')
        break
      case 'recall':
        ctx.command('admin/recall')
        break
      case 'user':
        ctx.command('admin/user')
        break
      case 'usage':
        ctx.command('admin/user/usage')
        break
      case 'timer':
        ctx.command('admin/user/timer')
        break
      case 'aircon':
        ctx.command('fun/aircon')
        break
      case 'jrrp':
        ctx.command('fun/jrrp')
        break
      case 'animal':
        ctx.command('fun/animal')
        break
      case 'hexagram':
        ctx.command('fun/hexagram')
        break
      case 'itnpe':
        ctx.command('fun/itnpe')
        break
      case '5k':
        ctx.command('imgen/5k')
        break
      case 'novelai':
        ctx.command('imgen/novelai')
        break
    }
  })
}