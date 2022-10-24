const { Random } = require('koishi')
const { onebot: bot, filters: { s1coders: { guild: s1coders } } } = require('../../koishi.secret')

/**
 * @type {number}
 */
let nextAlarm = 0

/**
 * @param {number} timestamp
 * @param {boolean} nextDay
 * @return {number}
 */
const calcNextAlarm = (timestamp, nextDay = true) => {
  const alarm = new Date(timestamp)

  if (nextDay) alarm.setDate(alarm.getDate() + 1)
  alarm.setHours(Random.int(13, 16))
  alarm.setMinutes(Random.int(0, 60))
  alarm.setSeconds(Random.int(0, 60))
  alarm.setMilliseconds(0)

  return alarm.getTime()
}

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  /**
   * @type {NodeJS.Timeout}
   */
  let handler

  ctx.on('ready', () => {
    const now = new Date()

    if (now.getHours() < 16) {
      nextAlarm = calcNextAlarm(now, false)
      if (nextAlarm < Date.now()) nextAlarm = calcNextAlarm(now)
    } else nextAlarm = calcNextAlarm(now)

    /**
     * @param {number} timeout
     * @returns {NodeJS.Timeout}
     */
    const alertTigang = timeout => {
      handler = setTimeout(() => {
        ctx.bots[`onebot:${bot.selfId}`].sendMessage(s1coders[0], '2bot 提醒您注意提肛。')
        handler = null

        const now = Date.now()
        nextAlarm = calcNextAlarm(now)
        handler = alertTigang(nextAlarm - now)
      }, timeout)
    }

    alertTigang(nextAlarm - Date.now())
  })

  ctx.on('dispose', () => { clearTimeout(handler) })
}