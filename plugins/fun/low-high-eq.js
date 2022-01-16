const { resolve } = require('path')
const { s } = require('koishi')

const canvasResources = new Map()

module.exports.using = ['canvas']

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  Promise.all([
    (async () => {
      const baseImage = await ctx.canvas.loadImage(resolve(__dirname, 'assets/low-high-eq.jpg'))
      canvasResources.set('base-image', baseImage)
    })()
  ])

  const ctxCanvas = ctx.canvas

  /**
   * @param {string} left
   * @param {string} right
   * @returns {string | import('koishi-plugin-canvas').Canvas}
   */
  const generateImage = (left, right) => {
    const canvas = ctxCanvas.createCanvas()
    canvas.width = 450
    canvas.height = 373

    const ctx = canvas.getContext('2d')

    ctx.drawImage(canvasResources.get('base-image'), 0, 0, 450, 373)

    const widthLimit = 195

    const fillIn = (text, centerX, centerY, color) => {
      let fontSize = 24, lineNumber = 1
      let firstLine = '', secondLine = ''
      ctx.fillStyle = color

      ctx.font = `${fontSize}px SHSans`
      while (ctx.measureText(text).width > widthLimit && fontSize > 16) {
        ctx.font = `${--fontSize}px SHSans`
      }

      if (fontSize == 16 && ctx.measureText(text).width > widthLimit) {
        for (let i = 0; i < text.length; i++) {
          firstLine += text[i]
          if (ctx.measureText(firstLine).width > widthLimit) {
            firstLine = firstLine.slice(0, firstLine.length - 1)
            secondLine = text.slice(i, text.length)
            break
          }
        }
        if (ctx.measureText(secondLine).width > widthLimit) {
          throw new Error('内容太长了……')
        }
        lineNumber = 2
      }

      if (lineNumber == 1) {
        ctx.fillText(text, centerX - ctx.measureText(text).width / 2, centerY + fontSize / 3)
      } else if (lineNumber == 2) {
        ctx.fillText(firstLine, centerX - ctx.measureText(firstLine).width / 2, centerY - 6)
        ctx.fillText(secondLine, centerX - ctx.measureText(secondLine).width / 2, centerY + 16)
      }
    }

    try {
      fillIn(left, 111, 261, '#fff')
      fillIn(right, 334, 261, '#000')
    } catch (error) {
      return error.message
    }

    /*
    const targetPath = './test/test.jpg'
    canvas.saveAs(targetPath)
    */

    return canvas
  }

  const logger = ctx.logger('lheq')

  ctx
    .command('lheq <left> <right>', '生成“低情商高情商”图')
    .example('lheq 男同竟在我身边 这里竟然就是大鸟转转转酒吧')
    .before(({ session }, ...args) => {
      if (args.length < 2) return session.execute('help lheq')
    })
    .action((_, left, right) => {
      const canvas = generateImage(left, right)
      if (typeof canvas == 'string') return canvas

      try {
        const imageData = canvas.toBase64()
        return s('image', { url: `base64://${imageData}` })
      } catch (error) {
        logger.warn(error)
        return '发生了神秘错误。'
      }
    })
}