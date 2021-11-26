const axios = require('axios').default

let randomTable = []

const getRandomNumbers = async () => {
  if (!randomTable.length) {
    try {
      const res = await axios.get('https://www.random.org/integers/', {
        params: {
          num: 1000,
          min: 1,
          max: 100,
          col: 1,
          base: 10,
          format: 'plain',
          rnd: 'new'
        }
      })
      let numbers = res.data.split('\n')
      numbers = numbers.slice(0, numbers.length - 1).map(n => Number(n))
      randomTable.push(...numbers)
    } catch (err) {
      console.log(err)
      return 1
    }
  }
}

/**
 * @param {*} ctx
 */
module.exports = async (ctx) => {
  ctx.command('ff/ff-amsim <prob>', '模拟禁断镶嵌')
    .shortcut('模拟禁断', { prefix: true, fuzzy: true })
    .usage('使用 random.org 的随机数表来模拟禁断镶嵌')
    .example('ff-amsim 5  模拟 5% 概率下的禁断镶嵌')
    .action(async (_, prob = 100) => {
      let count = 1
      prob = parseInt(prob)
      if (isNaN(prob)) prob = 100
      if (prob > 100) prob = 100
      if (prob <= 0) prob = 1

      try {
        let res = await getRandomNumbers()
        if (res) throw 1
        while (randomTable[0] > prob) {
          count++
          randomTable.shift()
          let res = await getRandomNumbers()
          if (res) throw 1
        }
        randomTable.shift()

        let msg = `[成功概率 ${prob} %] 成功将魔晶石禁断镶嵌在了装备上！`
        if (count > 1) msg += `但是这途中损耗掉了${count - 1}颗魔晶石……`
        return msg
      } catch (err) {
        if (err == 1) return '由于 random.org 无响应，此功能暂不可用'
      }
    })
}