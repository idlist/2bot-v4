/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  ctx.model.extend('talkative', {
    platform: 'string',
    channel: 'string',
    date: 'date',
    user: 'string',
    message: 'unsigned'
  }, {
    primary: ['platform', 'channel', 'user', 'date']
  })
}