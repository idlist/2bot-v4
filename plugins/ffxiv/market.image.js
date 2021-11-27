// const fs = require('fs')

const { createCanvas, loadImage } = require('canvas')
const { DateTime } = require('luxon')
const { s } = require('koishi')

let hqIcon, lookPhone
(async () => {
  hqIcon = await loadImage(`${__dirname}/assets/hq-icon.png`)
  lookPhone = await loadImage(`${__dirname}/assets/2bot_look_phone.png`)
})()

// const targetPath = './test/test.png'

module.exports = async (session, data) => {
  // let hqIcon = await loadImage(`${__dirname}/assets/hq-icon.png`)
  // let lookPhone = await loadImage(`${__dirname}/assets/2bot_look_phone.png`)

  const canvas = createCanvas()
  canvas.width = 1020
  canvas.height = 740

  const ctx = canvas.getContext('2d')
  ctx.textDrawingMode = 'glyph'

  ctx.fillStyle = '#EBEDEF'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  let offsetX, offsetY, text, size

  ctx.font = '40px msyh'
  ctx.fillStyle = '#000'
  ctx.fillText(data.item, 10, 50)
  if (data.hq) {
    offsetX = ctx.measureText(data.item).width
    ctx.drawImage(hqIcon, 12 + offsetX, 14, 40, 40)
  }
  ctx.fillRect(10, 64, 480, 1)

  ctx.font = '32px msyh'
  ctx.fillText(data.server, 10, 108)
  offsetX = ctx.measureText(data.server).width
  ctx.font = '24px msyh'
  text = '均价'
  ctx.fillText(text, 80 + offsetX, 108)
  offsetX += ctx.measureText(text).width
  ctx.font = '32px bahn'
  ctx.fillText(data.average, 84 + offsetX, 108)
  text = DateTime.fromMillis(data.lastUpdate).toFormat('yyyy/LL/dd TT')
  offsetX = ctx.measureText(text).width
  ctx.fillText(text, canvas.width - 10 - offsetX, 108)
  text = '最后更新时间'
  ctx.font = '24px msyh'
  offsetX += ctx.measureText(text).width
  ctx.fillText(text, canvas.width - 14 - offsetX, 108)

  ctx.font = '24px msyh'
  offsetY = 150
  ctx.fillText('重复数', 10, offsetY)
  ctx.fillText('HQ', 100, offsetY)
  ctx.fillText('单价', 310, offsetY)
  ctx.fillText('数量', 420, offsetY)
  ctx.fillText('总价', 670, offsetY)
  ctx.fillText('出售雇员', 730, offsetY)

  ctx.fillStyle = '#daebc7'
  ctx.fillRect(10, 160, canvas.width - 20, 40)
  ctx.fillStyle = '#f5dec6'
  ctx.fillRect(10, 582, canvas.width - 20, 40)

  ctx.fillStyle = '#000'
  ctx.fillRect(10, 120, canvas.width - 20, 4)
  ctx.fillRect(10, 622, canvas.width - 20, 4)
  ctx.fillRect(10, 580, canvas.width - 20, 2)
  for (let i = 0; i < 10; i++) {
    ctx.fillRect(10, 160 + i * 42, canvas.width - 20, 1)
  }

  const listItem = (item, setY) => {
    if (item.hq) {
      ctx.drawImage(hqIcon, 108, setY - 28, 32, 32)
    }
    ctx.font = '32px bahn'
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
    ctx.font = '24px msyh'
    ctx.textAlign = 'left'
    ctx.fillText(`${item.seller} @ ${item.server}`, 730, setY)
  }

  ctx.fillStyle = '#000'
  for (let i = 0; i < data.list.length; i++) {
    let item = data.list[i]
    offsetY = 194 + 42 * i
    listItem(item, offsetY)
  }
  ctx.font = '32px msyh'
  ctx.fillText('最高', 20, 614)
  listItem(data.highest, 614)

  ctx.font = '24px msyh'
  ctx.fillStyle = '#333'
  ctx.fillText('此结果由2bot查询Universalis生成', 10, canvas.height - 40)
  ctx.fillText('Universalis地址：https://universalis.app/', 10, canvas.height - 10)

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
