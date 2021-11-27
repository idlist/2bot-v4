const { readdir } = require('fs/promises')
const { resolve, basename } = require('path')

const { createCanvas, loadImage } = require('canvas')

const PERC_NUM = [100, 99, 95, 75, 50, 25, 10]
const PERC_COLOR = ['#F1C40F', '#F96FC7', '#E67E22', '#9B59B6', '#3498DB', '#28B463', '#909497']

const canvasResources = new Map()

Promise.all([
  (async () => {
    const image = await loadImage(resolve(__dirname, 'assets/2bot_look-phone.png'))
    canvasResources.set('look-phone', image)
  })(),
  (async () => {
    const jobIconPaths = await readdir(resolve(__dirname, 'assets/jobs'))
    await Promise.all(jobIconPaths.map(async (iconPath) => {
      const shortCode = basename(iconPath, '.png')
      const icon = await loadImage(resolve(__dirname, 'assets/jobs', iconPath))
      canvasResources.set(shortCode, icon)
    }))
  })()
])

/**
 * @param {import('./logs').LogsData} logsData
 * @returns {import('canvas').Canvas}
 */
module.exports = logsData => {
  const logsPrec = [1]
  for (let i = 1; i < logsData.data.length; i++) {
    logsPrec[i] = logsData.data[i] / logsData.data[0]
  }

  const canvas = createCanvas()
  canvas.width = 840
  canvas.height = 500

  const ctx = canvas.getContext('2d')
  ctx.textDrawingMode = 'glyph'

  ctx.fillStyle = '#ebedef'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  let offX, offY, text, size

  offY = 60

  ctx.fillStyle = '#000'
  ctx.font = '40px ffxiv-text'
  ctx.fillText(logsData.boss, 20, offY )

  size = 60
  ctx.drawImage(canvasResources.get(logsData.jobCode), canvas.width - size - 20, 12, size, size)

  ctx.font = '32px ffxiv-text'
  ctx.textAlign = 'right'
  text = logsData.job
  ctx.fillText(text, canvas.width - size - 24, offY)

  offY = 108

  ctx.textAlign = 'left'
  text = logsData.type
  if (text == 'aDPS') ctx.fillStyle = '#d0104c'
  else ctx.fillStyle = '#77428d'
  ctx.fillText(text, 20, offY)
  offX = ctx.measureText(text).width

  ctx.fillStyle = '#000'
  ctx.fillText(logsData.server, 32 + offX, offY)

  ctx.textAlign = 'right'
  text = logsData.record
  ctx.fillText(text, canvas.width - 20, offY)
  offX = ctx.measureText(text).width

  ctx.font = '28px ffxiv-text'
  ctx.fillText(logsData.duration, canvas.width - offX - 28, offY)

  ctx.fillRect(20, 130, canvas.width - 40, 2)

  offY = 138

  ctx.font = '32px ffxiv-number'
  for (let i = 0; i < PERC_NUM.length; i++) {
    ctx.fillStyle = PERC_COLOR[i]
    ctx.textAlign = 'right'
    ctx.fillText(PERC_NUM[i] + '%', 88, offY + (i + 1) * 40)
    ctx.fillRect(92, offY + i * 40 + 10, 480 * logsPrec[i], 40)
    ctx.fillStyle = '#000'
    ctx.textAlign = 'left'
    ctx.fillText(logsData.data[i], 480 * logsPrec[i] + 96, offY + (i + 1) * 40)
  }

  ctx.font = '24px ffxiv-text'
  ctx.fillStyle = '#333'
  ctx.fillText('此结果由 2bot 查询 fflogs 生成', 20, canvas.height - 16)

  size = 120
  ctx.drawImage(canvasResources.get('look-phone'), canvas.width - size, canvas.height - size, size, size)

  const outputCanvas = createCanvas()
  const outputCtx = outputCanvas.getContext('2d')
  outputCanvas.width = canvas.width / 2
  outputCanvas.height = canvas.height / 2
  outputCtx.drawImage(canvas, 0, 0, outputCanvas.width, outputCanvas.height)

  /*
  const { createWriteStream } = require('fs')

  const stream = outputCanvas.createPNGStream()
  const out = fs.createWriteStream('./test/test.png')
  stream.pipe(out)
  */

  return outputCanvas
}