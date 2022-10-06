const { segment } = require('koishi')

/**
 * @type {Record<string, number>}
 */
const State = {}

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  ctx.command('poke <target>', '戳一戳')
    .shortcut('戳戳我', { prefix: true })
    .shortcut('戳戳', { prefix: true, fuzzy: true })
    .action(({ session }, target) => {
      const parsedTarget = target ? segment.parse(target)[0] : null

      if (!parsedTarget) {
        return segment('poke', { qq: session.userId })
      } else {
        return segment('poke', { qq: parsedTarget.data.id })
      }
    })

  ctx.on('notice/poke', session => {
    if (
      session.channelId &&
      session.senderId != session.selfId &&
      session.targetId == session.selfId
    ) {
      const cid = session.cid

      if (!State[cid]) State[cid] = 0

      switch (State[cid]) {
        case 0:
          session.send('戳什么戳！(ﾉ｀□´)ﾉ')
          if (Math.random() < 0.25) State[cid]++
          break
        case 1:
          session.send('再戳我就戳回去了！(╯￣Д￣)╯')
          State[cid]++
          break
        default:
          session.send(segment('poke', { qq: session.userId }))
          State[cid] = 0
      }
    }
  })
}