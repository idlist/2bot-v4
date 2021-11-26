const { readFile } = require('fs/promises')
const { resolve } = require('path')
const { s, Random } = require('koishi')

const imageResources = new Map()

Promise.all([
  (async () => {
    const image = await readFile(resolve(__dirname, './assets/choose-left.png'))
    imageResources.set('left', image.toString('base64'))
  })(),
  (async () => {
    const image = await readFile(resolve(__dirname, './assets/choose-right.png'))
    imageResources.set('right', image.toString('base64'))
  })()
])

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  ctx
    .command('ff.gate', '挖宝选门')
    .shortcut('选门', { prefix: true })
    .action(() => {
      const result = Random.pick(['left', 'right'])
      return s('image', { url: `base64://${imageResources.get(result)}` })
    })
}