const { readFile } = require('fs/promises')
const { s, Random } = require('koishi')

module.exports = async () => {
  try {
    let img = await readFile(`${__dirname}/assets/choose_${Random.pick(['left', 'right'])}.png`)
    return s('image', { url: `base64://${img.toString('base64')}` })
  } catch (err) {
    console.log(err)
  }
}