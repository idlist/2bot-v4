const packageRoute = 'https://www.npmjs.com/package'

module.exports.name = 'is-this-npm-package-exists'

/**
 * @param {import('koishi').Context} ctx
 */
module.exports.apply = ctx => {
  const logger = ctx.logger('itnpe')

  ctx.command('itnpe <name(s)>', '这个 npm 包存在吗')
    .usage('Is this npm package exists?\n' +
      '可一次性查询多个包名是否被占用，但不会发送对应包的链接。')
    .example('itnpe koishi  查询包名 koishi 是否被占用')
    .check(({ session }, ...names) => {
      if (!names.length) return session.execute('help itnpe')
    })
    .action(async (_, ...names) => {
      const occupied = []
      const free = []
      const errored = []
      for (const name of names) {
        try {
          await ctx.http.get(`${packageRoute}/${name}`)
          occupied.push(name)
          // return `包名 ${name} 被占用了：\nhttps://www.npmjs.com/package/${name}`
        } catch (error) {
          if (error.response.status == 404) {
            free.push(name)
          } else {
            logger.warn(error)
            errored.push(name)
          }
        }
      }

      let result = ''
      if (free.length) {
        result += `${free.join('、')} 没有被占用。\n`
      }
      if (occupied.length) {
        if (names.length == 1) {
          result += `${occupied.join('、')} 被占用了：\n${packageRoute}/${names[0]}\n`
        } else {
          result += `${occupied.join('、')} 被占用了。\n`
        }
      }
      if (errored.length) {
        result += `${errored.join('、')} 由于网络原因查询失败。`
      }

      return result
    })
}