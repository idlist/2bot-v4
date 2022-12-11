const { sleep } = require('koishi')

const maxRecall = 5

/**
 * @type {Record<string, number[]>}
 */
const RecentSent = {}

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = (ctx) => {
  ctx.on('send', (session) => {
    const cid = session.cid

    if(!RecentSent[cid]) RecentSent[cid] = []
    const list = RecentSent[cid]

    list.push(session.messageId)
    if (list.length > maxRecall) list.shift()
  })

  ctx.command('admin/recall [count]', '撤回消息', { authority: 2 })
    .usage(`撤回发送的消息，最多 ${maxRecall} 条。`)
    .action(async ({ session }, count = 1) => {
      const cid = session.cid
      const list = RecentSent[cid]

      if (!list) return '没有近期发送的消息。'
      if (!list.length) return '可撤回消息数已达上限。'

      const length = list.length
      if (count <= length) {
        const targets = list.splice(length - count, count)
        for (const message of targets) {
          session.bot.deleteMessage(cid, message)
          await sleep(500)
        }
      } else {
        for (const message of list) {
          session.bot.deleteMessage(cid, message)
          await sleep(500)
        }
        delete RecentSent[cid]
        return (
          '可撤回消息数已达上限。' +
          `最多可撤回 ${length} 条，尝试撤回 ${count} 条。`
        )
      }
    })
}