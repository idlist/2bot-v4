const { exec: execCallback } = require('child_process')
const { promisify } = require('util')

const secret = require('../../koishi.secret')

/**
 * @param {number} b
 * @returns {string}
 */
const formatBytes = b => {
  let order = 0
  const orderUnit = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  while (b >= 1024) {
    b = b / 1024
    order += 1
  }
  return `${b.toFixed(2)} ${orderUnit[order]}`
}

/**
 * @param {string} title
 * @param {number} rx
 * @param {number} tx
 * @returns {string}
 */
const displayBytes = (title, rx, tx) => {
  return `${title}：`
    + `${formatBytes(rx + tx)} `
    + `（接收 ${formatBytes(rx)}，发送 ${formatBytes(tx)}）\n`
}

const exec = promisify(execCallback)

/**
 * @param {import('koishi').Context} Context
 */
module.exports = ctx => {
  if (secret.platform != 'linux') return

  const logger = ctx.logger('vnstat')

  ctx.command('admin/vnstat', '服务器数据用量', { authority: 4 })
    .action(async () => {
      try {
        const resolve = await exec('vnstat --iface eth0 --json 1')
        if (resolve.stderr) throw resolve.stderr
        /**
         * @type {import('./server-usage').VnStatOutput}
         */
        const payload = JSON.parse(resolve.stdout)
        const data = payload.interfaces[0]

        const updated = data.updated
        const total = data.traffic.total
        const month = data.traffic.month[0]
        const today = data.traffic.day[0]

        return (
          '最后更新：服务器时间 ' +
          `${updated.date.year}/${updated.date.month}/${updated.date.day} ` +
          `${updated.time.hour}:${updated.time.minute} \n` +
          displayBytes('总计', total.rx, total.tx) +
          displayBytes('本月', month.rx, month.tx) +
          displayBytes('本日', today.rx, today.tx)
        ).trim()
      } catch (error) {
        logger.warn(error)
        return '执行指令途中出现错误。'
      }
    })
}
