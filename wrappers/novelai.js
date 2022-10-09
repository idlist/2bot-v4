const novelai = require('koishi-plugin-novelai')

const secret = require('../koishi.secret')
const filters = secret.filters
const token = secret.novelai.token

module.exports.name = 'novelai-wrapper'

/**
 * @param {import('koishi').Context} ctx
 */
module.exports.apply = ctx => {
  ctx.platform('onebot')
    .guild(...filters['novelai'].guild)
    .plugin(novelai, {
      token: token,
      allowAnlas: false,
    })

  ctx.platform('onebot')
    .guild(...filters['novelai-furry'].guild)
    .plugin(novelai, {
      token: token,
      model: 'furry',
    })
}