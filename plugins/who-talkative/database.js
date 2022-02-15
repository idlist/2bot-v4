/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  ctx.model.extend('talkative', {
    id: 'unsigned',
    platform: 'string',
    channel: 'string',
    date: 'date',
    user: 'string',
    message: 'unsigned'
  }, {
    primary: ['id'],
    autoInc: true
  })
}