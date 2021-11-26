// const fs = require('fs')

const { createCanvas, loadImage } = require('canvas')
const { DateTime } = require('luxon')
const { s } = require('koishi')

const { ErrorContent } = require('./get-market-utils')

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
  canvas.width = 1240
  canvas.height = data.list.length * 84 + 220

  const ctx = canvas.getContext('2d')
  ctx.textDrawingMode = 'glyph'

  ctx.fillStyle = '#ebedef'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  let offsetX, offsetY, text, size

  ctx.font = '40px msyh'
  ctx.fillStyle = '#000'
  ctx.fillText(data.listname, 10, 50)
  offsetX = ctx.measureText(data.listname).width
  ctx.font = '32px msyh'
  ctx.fillText(data.server, offsetX + 18, 50)

  ctx.font = '24px msyh'
  offsetY = 90
  ctx.fillText('物品', 10, offsetY)
  ctx.fillText('单价', 210, offsetY)
  ctx.fillText('数量', 320, offsetY)
  ctx.fillText('总价', 570, offsetY)
  ctx.fillText('出售雇员', 630, offsetY)
  ctx.fillText('最后更新时间', 920, offsetY)

  ctx.fillStyle = '#dbdddf'
  for (let i = 0; i < data.list.length; i++) {
    ctx.fillRect(10, 102 + i * 84, canvas.width - 20, 40)
  }

  const listItem = (item, setY) => {
    if (item.errCode) {
      ctx.font = '32px msyh'
      ctx.textAlign = 'left'
      ctx.fillText(item.item ?? '[ 物品未解析成功 ]', 10, setY)
      ctx.font = '24px msyh'
      ctx.textAlign = 'center'
      ctx.fillText(ErrorContent[item.errCode], canvas.width / 2, setY + 40)
    } else {
      ctx.font = '32px msyh'
      ctx.textAlign = 'left'
      text = item.item
      ctx.fillText(text, 10, setY)
      if (item.itemhq) {
        let setX = ctx.measureText(text).width
        ctx.drawImage(hqIcon, setX + 14, setY - 28, 32, 32)
      }
      setY = setY + 42
      if (item.reshq) {
        ctx.drawImage(hqIcon, 10, setY - 28, 32, 32)
      }
      ctx.font = '32px bahn'
      ctx.textAlign = 'right'
      ctx.fillText(item.unit.toLocaleString('en-US'), 260, setY)
      ctx.fillText('×', 286, setY)
      ctx.fillText(item.qty.toLocaleString('en-US'), 370, setY)
      ctx.fillText('=', 396, setY)
      ctx.fillText(item.total.toLocaleString('en-US'), 620, setY)
      ctx.font = '24px msyh'
      ctx.textAlign = 'left'
      ctx.fillText(`${item.seller} @ ${item.server}`, 630, setY)
      ctx.fillStyle = '#ebedef'
      ctx.fillRect(910, setY - 32, canvas.width - 20, 42)
      ctx.fillStyle = '#000'
      ctx.font = '32px bahn'
      ctx.fillText(DateTime.fromMillis(item.lastUpdate).toFormat('yyyy/LL/dd TT'), 920, setY)
    }
  }

  ctx.fillStyle = '#000'
  for (let i = 0; i < data.list.length; i++) {
    let item = data.list[i]
    offsetY = 134 + 84 * i
    listItem(item, offsetY)
  }

  ctx.fillStyle = '#000'
  ctx.fillRect(10, 60, canvas.width - 20, 4)
  ctx.fillRect(10, data.list.length * 84 + 102, canvas.width - 20, 4)
  for (let i = 0; i < data.list.length * 2; i++) {
    ctx.fillRect(10, 100 + i * 42, canvas.width - 20, 1)
  }

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
