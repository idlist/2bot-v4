/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  ctx.model.extend('talkative_daily', {
    platform: 'string',
    channel: 'string',
    user: 'string',
    date: 'date',
    message: 'unsigned'
  }, {
    primary: ['platform', 'channel', 'user', 'date']
  })

  ctx.model.extend('talkative_stats', {
    platform: 'string',
    channel: 'string',
    yesterday: 'json',
    week: 'json',
    month: 'json',
    year: 'json',
    overall: 'json'
  }, {
    primary: ['platform', 'channel']
  })
}