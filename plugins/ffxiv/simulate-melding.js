const axios = require('axios')

const RandomTable = []

/**
 * @param {import('koishi').Logger} logger
 */
const getRandomNumbers = async () => {
  const { data } = await axios.get('https://www.random.org/integers/', {
    params: {
      num: 1000,
      min: 1,
      max: 100,
      col: 1,
      base: 10,
      format: 'plain',
      rnd: 'new',
    },
  })
  let numbers = data.split('\n')
  numbers = numbers.slice(0, numbers.length - 1).map(n => Number(n))
  RandomTable.push(...numbers)
}

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  const logger = ctx.logger('ff.advmeld')

  ctx.command('ff.advmeld <prob>', '模拟禁断镶嵌')
    .shortcut('模拟禁断', { prefix: true, fuzzy: true })
    .usage('使用 random.org 的随机数表来模拟禁断镶嵌')
    .example('ff.advmeld 5  模拟 5% 概率下的禁断镶嵌')
    .action(async ({ session }, prob) => {
      if (!prob) return session.execute('help ff.advmeld')

      let count = 1
      prob = parseInt(prob)
      if (isNaN(prob) || prob > 100) prob = 100
      if (prob <= 0) prob = 1

      try {
        await getRandomNumbers()
        while (RandomTable[0] > prob) {
          count++
          RandomTable.shift()
          if (!RandomTable.length) await getRandomNumbers()
        }
        RandomTable.shift()

        let message = `[成功概率 ${prob} %] 成功将魔晶石禁断镶嵌在了装备上！`
        if (count > 1) message += `但是这途中损耗掉了 ${count - 1} 颗魔晶石……`
        return message
      } catch (error) {
        logger.warn(error)
        return 'random.org 无响应，请稍后尝试。'
      }
    })
}