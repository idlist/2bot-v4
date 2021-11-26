const { readFile } = require('fs/promises')
const { s, Random } = require('koishi')

module.exports = async () => {
  try {
    let card = Random.int(1, 7)
    let cardIcon = await readFile(`${__dirname}/assets/cards/${card}.png`)
    let cardMeaning = ''
    switch (card) {
      case 1:
        cardMeaning = '[日 / 近战]'
        break
      case 2:
        cardMeaning = '[月 / 近战]'
        break
      case 3:
        cardMeaning = '[星 / 近战]'
        break
      case 4:
        cardMeaning = '[日 / 远程]'
        break
      case 5:
        cardMeaning = '[月 / 远程]'
        break
      case 6:
        cardMeaning = '[星 / 远程]'
        break
    }
    return s('image', { url: `base64://${cardIcon.toString('base64')}` }) + ' ' + cardMeaning
  } catch (err) {
    console.log(err)
  }
}