const { resolve } = require('path')
const { formatTimestamp } = require('./utils')
const { ContextEx, ImageGenerator } = require('./utils.canvas')

const ImageRes = new Map()

class MarketListImageGenerator extends ImageGenerator {
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
   * @param {import('./market').MarketListImageData} data
   * @returns {Promise<import('koishi-plugin-canvas').Canvas>}
   */
  async generate(data) {
    const f = {
      text: this.fonts.text,
      number: this.fonts.number
    }

    const canvas = this.ctxCanvas.createCanvas()
    canvas.width = 1240
    canvas.height = data.list.length * 84 + 220

    const ctx = canvas.getContext('2d')
    const ex = new ContextEx(ctx)

    ctx.fillStyle = '#F9F8F5'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    let offY

    ctx.fillStyle = '#000'
    ctx.font = f.text(40)
    const offsetX = ex.drawText(data.name, 10, 50)

    ctx.font = f.text(32)
    ex.drawText(data.server, offsetX + 18, 50)

    offY = 92

    ctx.font = f.text(24)
    ex.drawText('物品', 10, offY)
    ex.drawText('单价', 210, offY)
    ex.drawText('数量', 320, offY)
    ex.drawText('总价', 570, offY)
    ex.drawText('出售雇员', 630, offY)
    ex.drawText('最后更新时间', 920, offY)

    ctx.fillStyle = '#f5f3ed'
    for (let i = 0; i < data.list.length; i++) {
      ctx.fillRect(10, 102 + i * 84, canvas.width - 20, 40)
    }

    /**
     * @param {import('./market').MarketListItemParsed} item
     * @param {number} y
     */
    const listItem = (item, y) => {
      if (item.status == 'error') {
        ctx.textAlign = 'left'
        ctx.font = f.text(32)
        ex.drawText(item.item ?? '[ 物品未解析成功 ]', 10, y)

        ctx.textAlign = 'center'
        ctx.font = f.text(24)
        ex.drawText(item.message, canvas.width / 2, y + 40)
      } else {
        ctx.font = f.text(32)
        ctx.textAlign = 'left'
        const offsetX = ex.drawText(item.item, 10, y)

        if (item.itemhq) {
          ctx.drawImage(ImageRes.get('hq-icon'), offsetX + 14, y - 28, 32, 32)
        }

        y = y + 42 // Go to next line.

        if (item.reshq) {
          ctx.drawImage(ImageRes.get('hq-icon'), 10, y - 28, 32, 32)
        }

        ctx.textAlign = 'right'
        ctx.font = f.number(32)

        ex.drawMonoNumber(item.unit.toLocaleString('en-US'), 260, y)
        ex.drawText('×', 286, y)
        ex.drawMonoNumber(item.qty.toLocaleString('en-US'), 370, y)
        ex.drawText('=', 396, y)
        ex.drawMonoNumber(item.total.toLocaleString('en-US'), 620, y)

        ctx.textAlign = 'left'
        ctx.font = f.text(24)
        ex.drawText(`${item.seller} @ ${item.server}`, 630, y)

        ctx.fillStyle = '#ebedef'
        ctx.fillRect(910, y - 32, canvas.width - 20, 42)

        ctx.fillStyle = '#000'
        ctx.font = f.text(32)
        ex.drawText(formatTimestamp(item.lastUpdate), 920, y)
      }
    }

    ctx.fillStyle = '#000'
    for (let i = 0; i < data.list.length; i++) {
      const item = data.list[i]
      offY = 134 + 84 * i
      listItem(item, offY)
    }

    ctx.fillStyle = '#000'
    ctx.fillRect(10, 60, canvas.width - 20, 4)
    ctx.fillRect(10, data.list.length * 84 + 102, canvas.width - 20, 4)
    for (let i = 0; i < data.list.length * 2; i++) {
      ctx.fillRect(10, 100 + i * 42, canvas.width - 20, 1)
    }

    ctx.fillStyle = '#333'
    ctx.font = f.text(24)
    ctx.fillText('此结果由2bot查询Universalis生成', 10, canvas.height - 40)
    ctx.fillText('Universalis地址：https://universalis.app/', 10, canvas.height - 10)

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

module.exports = MarketListImageGenerator