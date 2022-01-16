const { resolve } = require('path')
const { formatTimestamp } = require('./utils')
const { ContextEx, ImageGenerator } = require('./utils.canvas')

const ImageRes = new Map()

class MarketImageGenerator extends ImageGenerator {
  /**
   * @param {import('koishi-plugin-canvas').default} ctxCanvas
   * @param {import('./index').Config} config
   */
  constructor(ctxCanvas, config) {
    super(ctxCanvas, config)

    Promise.all([
      (async () => {
        const hqIcon = await ctxCanvas.loadImage(resolve(__dirname, 'assets/hq-icon.png'))
        ImageRes.set('hq-icon', hqIcon)
      })(),
      (async () => {
        const lookPhone = await ctxCanvas.loadImage(resolve(__dirname, 'assets/2bot_look-phone.png'))
        ImageRes.set('look-phone', lookPhone)
      })()
    ])
  }

  /**
   * @param {import('./market').MarketImageData} data
   * @returns {Promise<import('koishi-plugin-canvas').Canvas>}
   */
  async generate(data) {
    const ftext = this.ftext
    const fnumber = this.fnumber

    const canvas = this.ctxCanvas.createCanvas(1020, 700)

    const ctx = canvas.getContext('2d')
    const ex = new ContextEx(ctx)

    ctx.fillStyle = '#F9F8F5'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    let offsetX, offsetY

    ctx.fillStyle = '#000'
    ctx.font = ftext(40)
    offsetX = ex.drawText(data.item, 10, 50)

    if (data.hq) {
      ctx.drawImage(ImageRes.get('hq-icon'), 12 + offsetX, 14, 40, 40)
    }

    ctx.fillRect(10, 64, 480, 1)

    ctx.font = ftext(32)
    offsetX = ex.drawText(data.server, 10, 108)

    ctx.font = ftext(24)
    offsetX += ex.drawText('均价', 80 + offsetX, 108)

    ctx.font = fnumber(32)
    ex.drawMonoNumber(data.average, 84 + offsetX, 108)

    ctx.textAlign = 'right'
    offsetX = ex.drawText(formatTimestamp(data.lastUpdate), canvas.width - 10, 108)

    ctx.font = ftext(24)
    ex.drawText('最后更新时间', canvas.width - 14 - offsetX, 108)

    ctx.textAlign = 'left'
    ctx.font = ftext(24)
    offsetY = 152
    ex.drawText('重复数', 10, offsetY)
    ex.drawText('HQ', 100, offsetY)
    ex.drawText('单价', 310, offsetY)
    ex.drawText('数量', 420, offsetY)
    ex.drawText('总价', 670, offsetY)
    ex.drawText('出售雇员', 730, offsetY)

    ctx.fillStyle = '#daebc7'
    ctx.fillRect(10, 160, canvas.width - 20, 40)

    ctx.fillStyle = '#000'
    ctx.fillRect(10, 120, canvas.width - 20, 4)
    ctx.fillRect(10, 580, canvas.width - 20, 4)
    for (let i = 0; i < 10; i++) {
      ctx.fillRect(10, 160 + i * 42, canvas.width - 20, 1)
    }

    /**
     * @param {import('./market').MarketListingCounted} item
     * @param {number} y
     */
    const listItem = (item, y) => {
      if (item.hq) {
        ctx.drawImage(ImageRes.get('hq-icon'), 108, y - 28, 32, 32)
      }

      ctx.textAlign = 'right'
      ctx.font = fnumber(32)
      if (item.repeat > 1) ex.drawMonoNumber(item.repeat, 80, y)

      ex.drawMonoNumber(item.unit.toLocaleString('en-US'), 360, y)
      ex.drawText('×', 386, y)
      ex.drawMonoNumber(item.qty.toLocaleString('en-US'), 470, y)
      ex.drawText('=', 496, y)
      ex.drawMonoNumber(item.qty.toLocaleString('en-US'), 720, y)

      ctx.textAlign = 'left'
      ctx.font = ftext(24)
      ex.drawText(`${item.seller} @ ${item.server}`, 730, y)
    }

    ctx.fillStyle = '#000'
    for (let i = 0; i < data.list.length; i++) {
      const item = data.list[i]
      offsetY = 194 + 42 * i
      listItem(item, offsetY)
    }

    ctx.fillStyle = '#333'
    ctx.font = ftext(24)
    ex.drawText('此结果由2bot查询Universalis生成', 10, canvas.height - 40)
    ex.drawText('Universalis地址：https://universalis.app/', 10, canvas.height - 10)

    const size = 120
    ctx.drawImage(ImageRes.get('look-phone'), canvas.width - size, canvas.height - size, size, size)

    const outputCanvas = await canvas.renderResize(0.5)

    /*
    const targetPath = './test/test.png'
    outputCanvas.saveAsSync(targerPath)
    */

    return outputCanvas
  }
}

module.exports = MarketImageGenerator