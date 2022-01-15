const { resolve } = require('path')
const { formatTimestamp } = require('./utils')

const canvasResources = new Map()

class MarketImageGenerator {
  /**
   * @param {import('koishi-plugin-canvas').default} ctxCanvas
   * @param {import('./index').Config} config
   */
  constructor(ctxCanvas, config) {
    /**
     * @type {import('koishi-plugin-canvas').default}
     */
    this.ctxCanvas = ctxCanvas

    this.textFont = config.fonts.text.name
    this.textWeight = config.fonts.text.weight ?? 'normal'
    this.numberFont = config.fonts.number.name
    this.numberWeight = config.fonts.number.weight ?? 'normal'

    Promise.all([
      (async () => {
        const hqIcon = await ctxCanvas.loadImage(resolve(__dirname, 'assets/hq-icon.png'))
        canvasResources.set('hq-icon', hqIcon)
      })(),
      (async () => {
        const lookPhone = await ctxCanvas.loadImage(resolve(__dirname, 'assets/2bot_look-phone.png'))
        canvasResources.set('look-phone', lookPhone)
      })()
    ])
  }

  /**
   * @param {import('koishi-plugin-canvas').default} ctxCanvas
   * @param {import('./market').MarketImageData} data
   * @returns {import('koishi-plugin-canvas').Canvas}
   */
  generate(data) {
    /**
     * @param {number} size
     */
    const ftext = size => {
      return `${this.textWeight} ${size}px ${this.textFont}`
    }

    /**
     * @param {number} size
     */
    const fnumber = size => {
      return `${this.numberWeight} ${size}px ${this.numberFont}`
    }

    const canvas = this.ctxCanvas.createCanvas(1020, 700)

    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#F9F8F5'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    let offsetX, offsetY, text

    ctx.font = ftext(40)
    ctx.fillStyle = '#000'
    ctx.fillText(data.item, 10, 50)
    if (data.hq) {
      offsetX = ctx.measureText(data.item).width
      ctx.drawImage(canvasResources.get('hq-icon'), 12 + offsetX, 14, 40, 40)
    }
    ctx.fillRect(10, 64, 480, 1)

    ctx.font = ftext(32)
    ctx.fillText(data.server, 10, 108)
    offsetX = ctx.measureText(data.server).width
    ctx.font = ftext(24)
    text = '均价'
    ctx.fillText(text, 80 + offsetX, 108)
    offsetX += ctx.measureText(text).width
    ctx.font = fnumber(32)
    ctx.fillText(data.average, 84 + offsetX, 108)
    text = formatTimestamp(data.lastUpdate)
    offsetX = ctx.measureText(text).width
    ctx.fillText(text, canvas.width - 10 - offsetX, 108)
    text = '最后更新时间'
    ctx.font = ftext(24)
    offsetX += ctx.measureText(text).width
    ctx.fillText(text, canvas.width - 14 - offsetX, 108)

    ctx.font = ftext(24)
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
    for (let i = 0; i < 10; i++) {
      ctx.fillRect(10, 160 + i * 42, canvas.width - 20, 1)
    }

    const listItem = (item, setY) => {
      if (item.hq) {
        ctx.drawImage(canvasResources.get('hq-icon'), 108, setY - 28, 32, 32)
      }
      ctx.font = fnumber(32)
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
      ctx.font = ftext(24)
      ctx.textAlign = 'left'
      ctx.fillText(`${item.seller} @ ${item.server}`, 730, setY)
    }

    ctx.fillStyle = '#000'
    for (let i = 0; i < data.list.length; i++) {
      const item = data.list[i]
      offsetY = 194 + 42 * i
      listItem(item, offsetY)
    }

    ctx.font = ftext(24)
    ctx.fillStyle = '#333'
    ctx.fillText('此结果由2bot查询Universalis生成', 10, canvas.height - 40)
    ctx.fillText('Universalis地址：https://universalis.app/', 10, canvas.height - 10)

    const size = 120
    ctx.drawImage(canvasResources.get('look-phone'), canvas.width - size, canvas.height - size, size, size)

    const outputCanvas = this.ctxCanvas.createCanvas()
    const outputCtx = outputCanvas.getContext('2d')
    outputCanvas.width = canvas.width / 2
    outputCanvas.height = canvas.height / 2
    outputCtx.drawImage(canvas, 0, 0, outputCanvas.width, outputCanvas.height)

    /*
    const targetPath = './test/test.png'
    outputCanvas.saveAsSync(targerPath)
    */

    return outputCanvas
  }
}

module.exports = MarketImageGenerator