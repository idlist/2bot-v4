require('@idlist/koishi-plugin-canvas')

/**
 * @param {import('koishi').Context} koishi
 * @param {string} font
 * @param {string[]} text
 * @returns {Promise<import('koishi-plugin-canvas').Canvas>}
 */
module.exports = async (koishi, font, text) => {
  const canvas = koishi.canvas.createCanvas()
  const ctx = canvas.getContext('2d')

  const textWidths = []
  ctx.font = `32px ${font}`
  for (const line of text) {
    textWidths.push(ctx.measureText(line).width)
  }
  const maxWidth = Math.max(...textWidths)

  canvas.width = maxWidth + 40
  canvas.height = text.length * 48 + 40
  ctx.fillStyle = '#fcf8e3'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.font = `32px ${font}`
  ctx.fillStyle = '#000'
  for (const [i, line] of text.entries()) {
    ctx.fillText(line, 20, 54 + i * 48)
  }

  const outputCanvas = await canvas.renderResize(0.5)

  return outputCanvas
}