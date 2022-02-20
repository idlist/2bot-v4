const { readdir } = require('fs/promises')
const { resolve, basename } = require('path')
const { ContextEx, ImageGenerator } = require('./utils.canvas')

const PERC_NUM = [100, 99, 95, 75, 50, 25, 10]
const PERC_COLOR = ['#F1C40F', '#F96FC7', '#E67E22', '#9B59B6', '#3498DB', '#28B463', '#909497']

const ImageRes = new Map()

class LogsImageGenerator extends ImageGenerator {
  /**
   * @param {import('koishi-plugin-canvas').default} ctxCanvas
   * @param {import('./index').Config} config
   */
  constructor(ctxCanvas, config) {
    super(ctxCanvas, config)

    Promise.all([
      (async () => {
        const lookPhone = await ctxCanvas.loadImage(resolve(__dirname, 'assets/2bot_look-phone.png'))
        ImageRes.set('look-phone', lookPhone)
      })(),
      (async () => {
        const jobIconPaths = await readdir(resolve(__dirname, 'assets/jobs'))
        await Promise.all(jobIconPaths.map(async (iconPath) => {
          const shortCode = basename(iconPath, '.png')
          const icon = await ctxCanvas.loadImage(resolve(__dirname, 'assets/jobs', iconPath))
          ImageRes.set(shortCode, icon)
        }))
      })(),
    ])
  }

  /**
   * @param {import('./logs').LogsData} logsData
   * @returns {Promise<import('koishi-plugin-canvas').Canvas>}
   */
  async generate(logsData) {
    const f = {
      text: this.fonts.text,
      number: this.fonts.number,
    }

    const logsPrec = [1]
    for (let i = 1; i < logsData.data.length; i++) {
      logsPrec[i] = logsData.data[i] / logsData.data[0]
    }

    const canvas = this.ctxCanvas.createCanvas(840, 500)

    const ctx = canvas.getContext('2d')
    const ex = new ContextEx(ctx)

    ctx.fillStyle = '#ebedef'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    let offX, offY, size

    offY = 60

    ctx.fillStyle = '#000'
    ctx.font = f.text(40)
    ex.drawText(logsData.boss, 20, offY)

    size = 60
    ctx.drawImage(ImageRes.get(logsData.jobCode), canvas.width - size - 20, 12, size, size)

    ctx.textAlign = 'right'
    ctx.font = f.text(32)
    ex.drawText(logsData.job, canvas.width - size - 24, offY + 4)

    offY = 108

    ctx.textAlign = 'left'
    if (logsData.type == 'aDPS') ctx.fillStyle = '#d0104c'
    else ctx.fillStyle = '#77428d'
    offX = ex.drawText(logsData.type, 20, offY)

    ctx.fillStyle = '#000'
    ex.drawText(logsData.server, 32 + offX, offY)

    ctx.textAlign = 'right'
    ctx.font = f.text(32)
    offX = ex.drawText('条', canvas.width - 20, offY)

    ctx.font = f.number(32)
    offX += ex.drawMonoNumber(logsData.record, canvas.width - offX - 24, offY)

    ctx.font = f.text(28)
    ex.drawText(logsData.duration, canvas.width - offX - 28, offY)

    ctx.fillRect(20, 130, canvas.width - 40, 2)

    offY = 138

    ctx.font = f.number(32)
    for (let i = 0; i < PERC_NUM.length; i++) {
      ctx.fillStyle = PERC_COLOR[i]
      ctx.textAlign = 'right'
      ex.drawMonoNumber(PERC_NUM[i] + '%', 88, offY + (i + 1) * 40)
      ctx.fillRect(92, offY + i * 40 + 10, 480 * logsPrec[i], 40)

      ctx.fillStyle = '#000'
      ctx.textAlign = 'left'
      ex.drawMonoNumber(logsData.data[i], 480 * logsPrec[i] + 96, offY + (i + 1) * 40)
    }

    ctx.font = f.text(24)
    ctx.fillStyle = '#333'
    ctx.textAlign = 'left'
    ex.drawText('此结果由2bot查询fflogs生成', 20, canvas.height - 16)

    size = 120
    ctx.drawImage(ImageRes.get('look-phone'), canvas.width - size, canvas.height - size, size, size)

    const outputCanvas = await canvas.renderResize(0.5)

    /*
    const targetPath = './test/test.png'
    outputCanvas.saveAsSync(targerPath)
    */

    return outputCanvas
  }
}

module.exports = LogsImageGenerator