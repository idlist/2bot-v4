const { s } = require('koishi')
const NameList = require('./name-list.json')
const NameListMap = require('./name-list-map.json')
const Names = NameListMap.map(rows => rows.map(i => NameList[i - 1]))
/**
 * @type {import('./index').SymbolMeaning[]}
 */
const Meanings = require('./meanings.json')

const Radix = [1, 2, 4]
const MapMain = [0, 0, 1, 1]
const MapChange = [1, 0, 1, 0]
const MapIsChange = [1, 0, 0, 1]

const SymbolNames = ['坤', '震', '坎', '兑', '艮', '离', '巽', '乾']
const Elements = ['地', '雷', '水', '泽', '山', '火', '风', '天']
const Orders = ['初', '二', '三', '四', '五', '上']
const Display = ['六', '九']
const HowTo = [
  '以本卦的卦辞占',
  '以本卦变爻的爻辞占',
  '以本卦变爻的爻辞占，以上爻爻辞为主',
  '以本卦与变卦的卦辞占，以本卦卦辞为主',
  '以变卦中不变爻的爻辞占，以下爻爻辞为主',
  '以变卦中不变爻的爻辞占',
  '乾以用九，坤以用六，其他以变卦卦辞占'
]

/**
 * @param {number} order
 * @param {number} side
 * @returns {string}
 */
const getOrder = (order, side) => {
  switch (order) {
    case 0:
    case 5:
      return Orders[order] + Display[side]
    default:
      return Display[side] + Orders[order]
  }
}

/**
 * @param {number[]} results
 * @param {number[]} map
 * @return {import('./index').AnalyzeResult}
 */
const analyzeSymbols = (results, map) => {
  let upper = 0, lower = 0

  for (let i = 0; i < 3; i++) lower += map[results[i]] * Radix[i]
  for (let i = 3; i < 6; i++) upper += map[results[i]] * Radix[i - 3]

  const figures = results.map(i => map[i])
  const orders = figures.map((side, i) => getOrder(i, side))
  const display = figures.map(i => i ? '|' : '¦').join(' ')
  const code = NameListMap[upper][lower]
  const name = Names[upper][lower]
  const meaning = Meanings[code - 1].meaning
  const details = Meanings[code - 1].details
  let fullName
  if (upper == lower) fullName = `${SymbolNames[upper]}为${Elements[upper]}`
  else fullName = Elements[upper] + Elements[lower] + Names[upper][lower]

  return { figures, orders, display, upper, lower, code, name, fullName, meaning, details }
}

module.exports.name = 'hexagram'

/**
 * @param {import('koishi').Context} ctx
 */
module.exports.apply = ctx => {
  const logger = ctx.logger('hexagram')

  ctx.command('hexagram', '电子迫真算卦')
    .shortcut('迫真算卦')
    .usage('说句老实话，我也不知道怎么算，看个乐就好！')
    .action(async ({ session }) => {
      const results = []

      try {
        const data = await ctx.http.get('https://www.random.org/cgi-bin/randbyte', {
          params: {
            nbytes: 3,
            format: 'b'
          }
        })

        const sides = []
        for (const char of data) {
          if (char == '0') sides.push(0)
          if (char == '1') sides.push(1)
          if (sides.length >= 18) break
        }
        for (let i = 0; i < 6; i++) {
          const result = sides.slice(i * 3, i * 3 + 3).reduce((a, b) => a + b)
          results.push(result)
        }
      } catch (error) {
        logger.warn(error)
        return '未能从 random.org 获取随机数，请稍后再试。'
      }

      const main = analyzeSymbols(results, MapMain)
      const change = analyzeSymbols(results, MapChange)

      const changeSymbols = []
      const staticSymbols = []
      results.forEach((result, i) => {
        if (MapIsChange[result]) changeSymbols.push(i)
        else staticSymbols.push(i)
      })

      let comments
      switch (changeSymbols.length) {
        case 0:
          comments = `${main.name}卦辞：${main.meaning}`
          break
        case 1: {
          const target = changeSymbols[0]
          comments = `${main.name}卦${main.orders[target]}：${main.details[target]}`
          break
        }
        case 2: {
          const upper = changeSymbols[1]
          const lower = changeSymbols[0]
          comments =
            `上爻 - ${main.name}卦${main.orders[upper]}：${main.details[upper]}\n` +
            `下爻 - ${main.name}卦${main.orders[lower]}：${main.details[lower]}`
          break
        }
        case 3:
          comments =
            `${main.name}卦辞：${main.meaning}\n` +
            `${change.name}卦辞：${change.meaning}`
          break
        case 4: {
          const upper = staticSymbols[1]
          const lower = staticSymbols[0]
          comments =
            `上爻 - ${change.name}卦${change.orders[upper]}：${change.details[upper]}\n` +
            `下爻 - ${change.name}卦${change.orders[lower]}：${change.details[lower]}`
          break
        }
        case 5: {
          const target = staticSymbols[0]
          comments = `${change.name}卦${change.orders[target]}：${change.details[target]}`
          break
        }
        case 6:
          switch (main.code) {
            case 1:
              comments =
                `用九：${Meanings[0].details[6]}\n` +
                `坤卦：${Meanings[1].meaning}`
              break
            case 2:
              comments =
                `用六：${Meanings[1].details[6]}\n` +
                `乾卦：${Meanings[0].meaning}`
              break
            default:
              comments = `${change.name}卦辞：${change.meaning}`
          }
          break
      }

      const user = session.subtype == 'private'
        ? session.author.username
        : s('at', { id: session.userId })

      return `2bot 为 ${user} 迫真算卦（仅作娱乐用途，不要迷信哦！）\n` +
        `主卦：${main.display}  ${main.fullName} (${main.code})\n` +
        `变卦：${change.display}  ${change.fullName} (${change.code})\n` +
        (changeSymbols.length ? `变${changeSymbols.map(c => Orders[c]).join('、')}爻，` : '无变爻，') +
        `启蒙断爻：${HowTo[changeSymbols.length]}\n` + comments
    })
}