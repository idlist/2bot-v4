const { readFile } = require('fs/promises')
const { resolve } = require('path')
const yaml = require('js-yaml')
const { Random } = require('koishi')

let Pool
(async () => {
  Pool = yaml.load(await readFile(resolve(__dirname, 'data.yaml'), 'utf-8'))
  for (const rarity in Pool) {
    Pool[rarity] = Pool[rarity].split('\n')
    Pool[rarity].pop()
  }
})()

const gachaOnce = () => {
  const prob = Random.real(1)

  if (prob <= 0.69) return `${Random.pick(Pool.N)} (N)`
  else if (prob <= 0.89) return `${Random.pick(Pool.R)} (R)`
  else if (prob <= 0.97) return `${Random.pick(Pool.SR)} (SR)`
  else return `${Random.pick(Pool.UR)} (UR)`
}

/**
 * @param { import('koishi').Context } ctx
 */
module.exports = (ctx) => {
  ctx.command('gacha', '抽卡', { maxUsage: 1, hidden: true })
    .shortcut('十连抽卡', { options: { tenfold: true } })
    .option('show', '-s 展示概率', { notUsage: true })
    .option('tenfold', '-t 十连抽卡')
    .action(({ session, options }) => {
      let name = session.author.nickname
      if (!name) name = session.author.username

      if (options.show) {
        return '概率如下：N(69%) R(20%) SR(8%) UR(3%)'
      }
      else if (options.tenfold) {
        const list = []
        for (let i = 0; i < 10; i++) {
          list.push(gachaOnce())
        }
        return `${name} 抽到了：${list.join('、')}。`
      } else {
        return `${name} 抽到了：${gachaOnce()}。`
      }
    })
}