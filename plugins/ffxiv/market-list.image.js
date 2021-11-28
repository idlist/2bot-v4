const { resolve } = require('path')
const { createCanvas, loadImage } = require('canvas')
const { formatTimestamp } = require('./utils')

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
 * @param {import('./market').MarketListImageData} data
 * @return {import('canvas').Canvas}
 */
module.exports = async (data) => {
  const canvas = createCanvas()
  canvas.width = 1240
  canvas.height = data.list.length * 84 + 220

  const ctx = canvas.getContext('2d')
  ctx.textDrawingMode = 'glyph'

  ctx.fillStyle = '#F9F8F5'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  let offsetY, text

  ctx.font = '40px ffxiv-text'
  ctx.fillStyle = '#000'
  ctx.fillText(data.name, 10, 50)
  const offsetX = ctx.measureText(data.name).width
  ctx.font = '32px ffxiv-text'
  ctx.fillText(data.server, offsetX + 18, 50)

  ctx.font = '24px ffxiv-text'
  offsetY = 90
  ctx.fillText('物品', 10, offsetY)
  ctx.fillText('单价', 210, offsetY)
  ctx.fillText('数量', 320, offsetY)
  ctx.fillText('总价', 570, offsetY)
  ctx.fillText('出售雇员', 630, offsetY)
  ctx.fillText('最后更新时间', 920, offsetY)

  ctx.fillStyle = '#f5f3ed'
  for (let i = 0; i < data.list.length; i++) {
    ctx.fillRect(10, 102 + i * 84, canvas.width - 20, 40)
  }

  /**
   * @param {import('./market').MarketListItemParsed} item
   * @param {number} setY
   */
  const listItem = (item, setY) => {
    if (item.status == 'error') {
      ctx.font = '32px ffxiv-text'
      ctx.textAlign = 'left'
      ctx.fillText(item.item ?? '[ 物品未解析成功 ]', 10, setY)
      ctx.font = '24px ffxiv-text'
      ctx.textAlign = 'center'
      ctx.fillText(item.message, canvas.width / 2, setY + 40)
    } else {
      ctx.font = '32px ffxiv-text'
      ctx.textAlign = 'left'
      text = item.item
      ctx.fillText(text, 10, setY)
      if (item.itemhq) {
        const setX = ctx.measureText(text).width
        ctx.drawImage(canvasResources.get('hq-icon'), setX + 14, setY - 28, 32, 32)
      }
      setY = setY + 42
      if (item.reshq) {
        ctx.drawImage(canvasResources.get('hq-icon'), 10, setY - 28, 32, 32)
      }
      ctx.font = '32px ffxiv-number'
      ctx.textAlign = 'right'
      ctx.fillText(item.unit.toLocaleString('en-US'), 260, setY)
      ctx.fillText('×', 286, setY)
      ctx.fillText(item.qty.toLocaleString('en-US'), 370, setY)
      ctx.fillText('=', 396, setY)
      ctx.fillText(item.total.toLocaleString('en-US'), 620, setY)
      ctx.font = '24px ffxiv-text'
      ctx.textAlign = 'left'
      ctx.fillText(`${item.seller} @ ${item.server}`, 630, setY)
      ctx.fillStyle = '#ebedef'
      ctx.fillRect(910, setY - 32, canvas.width - 20, 42)
      ctx.fillStyle = '#000'
      ctx.font = '32px ffxiv-number'
      ctx.fillText(formatTimestamp(item.lastUpdate), 920, setY)
    }
  }

  ctx.fillStyle = '#000'
  for (let i = 0; i < data.list.length; i++) {
    const item = data.list[i]
    offsetY = 134 + 84 * i
    listItem(item, offsetY)
  }

  ctx.fillStyle = '#000'
  ctx.fillRect(10, 60, canvas.width - 20, 4)
  ctx.fillRect(10, data.list.length * 84 + 102, canvas.width - 20, 4)
  for (let i = 0; i < data.list.length * 2; i++) {
    ctx.fillRect(10, 100 + i * 42, canvas.width - 20, 1)
  }

  ctx.font = '24px ffxiv-text'
  ctx.fillStyle = '#333'
  ctx.fillText('此结果由2bot查询Universalis生成', 10, canvas.height - 40)
  ctx.fillText('Universalis地址：https://universalis.app/', 10, canvas.height - 10)

  const size = 120
  ctx.drawImage(
    canvasResources.get('look-phone'),
    canvas.width - size,
    canvas.height - size,
    size,
    size
  )

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
