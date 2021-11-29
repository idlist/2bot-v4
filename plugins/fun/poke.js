const { s } = require('koishi')

/**
 * @type {Record<string, number>}
 */
const Status = {}

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  ctx.command('poke <target>', '戳一戳')
    .shortcut('戳戳我', { prefix: true })
    .shortcut('戳戳', { prefix: true, fuzzy: true })
    .action(({ session }, target) => {
      const parsedTarget = target ? s.parse(target)[0] : null

      if (!parsedTarget) {
        return s('poke', { qq: session.userId })
      } else {
        return s('poke', { qq: parsedTarget.data.id })
      }
    })

  ctx.on('notice/poke', session => {
    if (
      session.channelId &&
      session.senderId != session.selfId &&
      session.targetId == session.selfId
    ) {
      if (!Status[session.cid]) Status[session.cid] = 0

      switch (Status[session.cid]) {
        case 0:
          session.send('戳什么戳！(ﾉ｀□´)ﾉ')
          if (Math.random() < 0.25) Status[session.cid]++
          break
        case 1:
          session.send('再戳我就戳回去了！(╯￣Д￣)╯')
          Status[session.cid]++
          break
        default:
          session.send(s('poke', { qq: session.userId }))
          Status[session.cid] = 0
      }
    }
  })
}