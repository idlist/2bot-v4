// const fs = require('fs')

const { createCanvas, loadImage } = require('canvas')
const { s } = require('koishi')

const PERC_NUM = [100, 99, 95, 75, 50, 25, 10]
const PERC_COLOR = ['#F1C40F', '#F96FC7', '#E67E22', '#9B59B6', '#3498DB', '#28B463', '#909497']

let lookPhone
(async () => {
  try {
    lookPhone = await loadImage(`${__dirname}/assets/2bot_look_phone.png`)
  } catch (err) {
    console.log(err)
  }
})()

// const targetPath = './test/test.png'

module.exports = async (session, logsData) => {
  // let lookPhone = await loadImage(`${__dirname}/assets/2bot_look_phone.png`)

  let jobIcon = await loadImage(`${__dirname}/assets/jobs/${logsData.jobcode}.png`)

  let logsPrec = [1]
  for (let i = 1; i < logsData.data.length; i++) {
    logsPrec[i] = logsData.data[i] / logsData.data[0]
  }

  const canvas = createCanvas()
  canvas.width = 840
  canvas.height = 480

  const ctx = canvas.getContext('2d')
  ctx.textDrawingMode = 'glyph'

  ctx.fillStyle = '#ebedef'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  let offX, offY, text, size

  offY = 60

  ctx.fillStyle = '#000'
  ctx.font = '40px msyh'
  ctx.fillText(logsData.boss, 20, offY )

  size = 60
  ctx.drawImage(jobIcon, canvas.width - size - 20, 12, size, size)

  ctx.font = '32px msyh'
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

  ctx.font = '28px msyh'
  ctx.fillText(logsData.duration, canvas.width - offX - 28, offY)

  ctx.fillRect(20, 130, canvas.width - 40, 2)

  offY = 138

  ctx.font = '32px bahn'
  for (let i = 0; i < PERC_NUM.length; i++) {
    ctx.fillStyle = PERC_COLOR[i]
    ctx.textAlign = 'right'
    ctx.fillText(PERC_NUM[i] + '%', 88, offY + (i + 1) * 40)
    ctx.fillRect(92, offY + i * 40 + 10, 480 * logsPrec[i], 40)
    ctx.fillStyle = '#000'
    ctx.textAlign = 'left'
    ctx.fillText(logsData.data[i], 480 * logsPrec[i] + 96, offY + (i + 1) * 40)
  }

  ctx.font = '24px msyh'
  ctx.fillStyle = '#333'
  ctx.fillText('此结果由2bot查询fflogs生成', 20, canvas.height - 16)

  size = 120
  ctx.drawImage(lookPhone, canvas.width - size, canvas.height - size, size, size)

  const oCanvas = createCanvas()
  const oCtx = oCanvas.getContext('2d')
  oCanvas.width = canvas.width / 2
  oCanvas.height = canvas.height / 2
  oCtx.drawImage(canvas, 0, 0, oCanvas.width, oCanvas.height)

  /*
  const stream = oCanvas.createPNGStream()
  const out = fs.createWriteStream(targetPath)
  stream.pipe(out)
  */

  oCanvas.toBuffer((err, buffer) => {
    try {
      if (err) throw err
      let content = buffer.toString('base64')
      session.send(s('image', { url: `base64://${content}` }))
    } catch (err) {
      if (err) console.log(err)
    }
  })
}