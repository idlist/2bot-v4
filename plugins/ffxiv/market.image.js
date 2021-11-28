const { resolve } = require('path')
const { createCanvas, loadImage } = require('canvas')
const { DateTime } = require('luxon')

const canvasResources = new Map()
Promise.all([
  (async () => {
    const hqIcon = await loadImage(resolve(__dirname, 'assets/hq-icon.png'))
    canvasResources.set('hq-icon', hqIcon)
  })(),
  (async () => {
    const lookPhone = await loadImage(resolve(__dirname, 'assets/2bot_look-phone.png'))
    canvasResources.set('look-phone', lookPhone)
  })()
])

/**
 * @param {import('./market').MarketImageData} data
 * @returns {import('canvas').Canvas}
 */
module.exports = async (data) => {
  const canvas = createCanvas()
  canvas.width = 1020
  canvas.height = 700

  const ctx = canvas.getContext('2d')
  ctx.textDrawingMode = 'glyph'

  ctx.fillStyle = '#F9F8F5'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  let offsetX, offsetY, text

  ctx.font = '40px ffxiv-text'
  ctx.fillStyle = '#000'
  ctx.fillText(data.item, 10, 50)
  if (data.hq) {
    offsetX = ctx.measureText(data.item).width
    ctx.drawImage(canvasResources.get('hq-icon'), 12 + offsetX, 14, 40, 40)
  }
  ctx.fillRect(10, 64, 480, 1)

  ctx.font = '32px ffxiv-text'
  ctx.fillText(data.server, 10, 108)
  offsetX = ctx.measureText(data.server).width
  ctx.font = '24px ffxiv-text'
  text = '均价'
  ctx.fillText(text, 80 + offsetX, 108)
  offsetX += ctx.measureText(text).width
  ctx.font = '32px ffxiv-number'
  ctx.fillText(data.average, 84 + offsetX, 108)
  text = DateTime.fromMillis(data.lastUpdate).toFormat('yyyy/LL/dd TT')
  offsetX = ctx.measureText(text).width
  ctx.fillText(text, canvas.width - 10 - offsetX, 108)
  text = '最后更新时间'
  ctx.font = '24px ffxiv-text'
  offsetX += ctx.measureText(text).width
  ctx.fillText(text, canvas.width - 14 - offsetX, 108)

  ctx.font = '24px ffxiv-text'
  offsetY = 150
  ctx.fillText('重复数', 10, offsetY)
  ctx.fillText('HQ', 100, offsetY)
  ctx.fillText('单价', 310, offsetY)
  ctx.fillText('数量', 420, offsetY)
  ctx.fillText('总价', 670, offsetY)
  ctx.fillText('出售雇员', 730, offsetY)

  ctx.fillStyle = '#daebc7'
  ctx.fillRect(10, 160, canvas.width - 20, 40)

  ctx.fillStyle = '#000'
  ctx.fillRect(10, 120, canvas.width - 20, 4)
  ctx.fillRect(10, 580, canvas.width - 20, 4)
  for (let i = 0; i < 9; i++) {
    ctx.fillRect(10, 160 + i * 42, canvas.width - 20, 1)
  }

  const listItem = (item, setY) => {
    if (item.hq) {
      ctx.drawImage(canvasResources.get('hq-icon'), 108, setY - 28, 32, 32)
    }
    ctx.font = '32px ffxiv-number'
    ctx.textAlign = 'right'
    if (item.repeat > 1) {
      offsetX = ctx.measureText(item.repeat).width
      ctx.fillText(item.repeat, 80, setY)
    }
    text = item.unit.toLocaleString('en-US')
    ctx.fillText(text, 360, setY)
    ctx.fillText('×', 386, setY)
    text = item.qty.toLocaleString('en-US')
    ctx.fillText(text, 470, setY)
    ctx.fillText('=', 496, setY)
    text = item.total.toLocaleString('en-US')
    ctx.fillText(text, 720, setY)
    ctx.font = '24px ffxiv-text'
    ctx.textAlign = 'left'
    ctx.fillText(`${item.seller} @ ${item.server}`, 730, setY)
  }

  ctx.fillStyle = '#000'
  for (let i = 0; i < data.list.length; i++) {
    const item = data.list[i]
    offsetY = 194 + 42 * i
    listItem(item, offsetY)
  }

  ctx.font = '24px ffxiv-text'
  ctx.fillStyle = '#333'
  ctx.fillText('此结果由2bot查询Universalis生成', 10, canvas.height - 40)
  ctx.fillText('Universalis地址：https://universalis.app/', 10, canvas.height - 10)

  const size = 120
  ctx.drawImage(canvasResources.get('look-phone'), canvas.width - size, canvas.height - size, size, size)

  const outputCanvas = createCanvas()
  const outputCtx = outputCanvas.getContext('2d')
  outputCanvas.width = canvas.width / 2
  outputCanvas.height = canvas.height / 2
  outputCtx.drawImage(canvas, 0, 0, outputCanvas.width, outputCanvas.height)

  /*
  const { createWriteStream } = require('fs')
  const targetPath = './test/test.png'

  const stream = outputCanvas.createPNGStream()
  const out = createWriteStream(targetPath)
  stream.pipe(out)
  */

  return outputCanvas
}
