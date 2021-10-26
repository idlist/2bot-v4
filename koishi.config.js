const secret = require('./secret')

/**
 * @type {import('@koishijs/cli').AppConfig}
 */
module.exports = {
  prefix: '-',
  nickname: ['2bot', '阿尔博特', '阿尔伯特'],
  minSimilarity: 0,
  autoAssign: true,
  autoAuthorize: session => {
    if (secret.admin.includes(session.uid)) return 5
    else return 1
  },

  logLevel: {
    command: 3
  },
  logTime: 'MM/dd hh:mm:ss',
  logDiff: false,

  plugins: {
    'adapter-onebot': secret.onebot,
    'database-mysql': secret.mysql
  }
}