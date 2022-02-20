class ContextEx {
  /**
   * @param {import('koishi-plugin-canvas').CanvasRenderingContext2D} ctx
   */
  constructor(ctx) {
    this.ctx = ctx
  }

  /**
   * @param {string} text
   * @returns {number} Width of the rendered text.
   */
  textWidth(text) {
    return this.ctx.measureText(text).width
  }

  /**
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @returns {number} Width of the rendered text.
   */
  drawText(text, x, y) {
    const ctx = this.ctx

    ctx.fillText(text, x, y)
    return ctx.measureText(text).width
  }

  /**
   * Fill numbers with monospace.
   *
   * @param {string} num
   * @param {number} x
   * @param {number} y
   * @returns {number} Width of the rendered numbers.
   */
  drawMonoNumber(num, x, y) {
    const ctx = this.ctx
    const charList = num.split('')
    const monoWdth = 16

    let sign = 1
    if (ctx.textAlign == 'right') sign = -1

    let offX = 0

    const renderChar = (char, x, y) => {
      ctx.fillText(char, x, y)

      if (char.charCodeAt(0) >= 48 && char.charCodeAt(0) <= 57) {
        return monoWdth
      } else {
        return ctx.measureText(char).width
      }
    }

    if (sign == 1) {
      for (let i = 0; i < charList.length; i++) {
        offX += renderChar(charList[i], x + offX, y)
      }
    } else {
      for (let i = charList.length - 1; i >= 0; i--) {
        offX -= renderChar(charList[i], x + offX, y)
      }
    }

    return offX * sign
  }
}

class ImageGenerator {
  /**
   * @param {import('koishi-plugin-canvas').default} ctxCanvas
   * @param {import('./index').Config} config
   */
  constructor(ctxCanvas, config) {
    /**
     * @type {import('koishi-plugin-canvas').default}
     */
    this.ctxCanvas = ctxCanvas

    this.textFont = config.text.name
    this.textWeight = config.text.weight ?? 'normal'
    this.numberFont = config.number.name
    this.numberWeight = config.number.weight ?? 'normal'

    /**
     * @param {number} size
     */
    const text = (size) => {
      return `${this.textWeight} ${size}px ${this.textFont}`
    }

    /**
     * @param {number} size
     */
    const number = (size) => {
      return `${this.numberWeight} ${size}px ${this.numberFont}`
    }

    this.fonts = {
      text: text,
      number: number,
    }
  }
}

module.exports.ContextEx = ContextEx
module.exports.ImageGenerator = ImageGenerator
