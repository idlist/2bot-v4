const { segment } = require('koishi')
const imagify = require('./imagify')
const NameList = require('./name-list.json')
const NameListMap = require('./name-list-map.json')
const Names = NameListMap.map((rows) => rows.map((i) => NameList[i - 1]))
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
  '乾以用九，坤以用六，其他以变卦卦辞占',
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

  const figures = results.map((i) => map[i])
  const orders = figures.map((side, i) => getOrder(i, side))
  const display = figures.map((i) => i ? '|' : '¦').join(' ')
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

module.exports.inject = ['canvas']

/**
 * @param {import('koishi').Context} ctx
 */
module.exports.apply = (ctx, config) => {
  const logger = ctx.logger('hexagram')

  ctx.command('hexagram', '电子算卦')
    .shortcut('迫真算卦')
    .usage('算卦结果无科学依据，仅供娱乐。')
    .action(async ({ session }) => {
      const results = []

      try {
        const data = await ctx.http.get('https://www.random.org/integers/', {
          params: {
            num: 18,
            min: 0,
            max: 1,
            col: 1,
            base: 2,
            format: 'plain',
            rnd: 'new',
          },
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

      let comments, shortComments = '参见 - '
      switch (changeSymbols.length) {
        case 0:
          comments = [
            `${main.name}卦辞：${main.meaning}`,
          ]
          shortComments += `${main.name}卦辞`
          break
        case 1: {
          const target = changeSymbols[0]
          const targetName = `${main.name}卦${main.orders[target]}`

          comments = [
            `${targetName}：${main.details[target]}`,
          ]
          shortComments += targetName
          break
        }
        case 2: {
          const upper = changeSymbols[1]
          const upperName = `${main.name}卦${main.orders[upper]}`
          const lower = changeSymbols[0]
          const lowerName = `${main.name}卦${main.orders[lower]}`

          comments = [
            `上爻 - ${upperName}：${main.details[upper]}`,
            `下爻 - ${lowerName}：${main.details[lower]}`,
          ]
          shortComments += `${upperName}；${lowerName}`
          break
        }
        case 3:
          comments = [
            `${main.name}卦辞：${main.meaning}`,
            `${change.name}卦辞：${change.meaning}`,
          ]
          shortComments += `${main.name}卦辞；${change.name}卦辞`
          break
        case 4: {
          const upper = staticSymbols[1]
          const upperName = `${change.name}卦${change.orders[upper]}`
          const lower = staticSymbols[0]
          const lowerName = `${change.name}卦${change.orders[lower]}`

          comments = [
            `上爻 - ${upperName}：${change.details[upper]}`,
            `下爻 - ${lowerName}：${change.details[lower]}`,
          ]
          shortComments += `${upperName}；${lowerName}`
          break
        }
        case 5: {
          const target = staticSymbols[0]
          const targetName = `${change.name}卦${change.orders[target]}`

          comments = [
            `${targetName}：${change.details[target]}`,
          ]
          shortComments += targetName
          break
        }
        case 6:
          switch (main.code) {
            case 1:
              comments = [
                `用九：${Meanings[0].details[6]}`,
                `坤卦：${Meanings[1].meaning}`,
              ]
              shortComments = '乾卦用九；坤卦卦辞'
              break
            case 2:
              comments = [
                `用六：${Meanings[1].details[6]}`,
                `乾卦：${Meanings[0].meaning}`,
              ]
              shortComments = '坤卦用六；乾卦卦辞'
              break
            default:
              comments = `${change.name}卦辞：${change.meaning}`
              shortComments `${change.name}卦辞`
          }
          break
      }

      const user = session.subtype == 'private'
        ? session.author.username
        : segment('at', { id: session.userId })

      const textImage = await imagify(ctx, config.font, [
        `主卦：${main.display}  ${main.fullName} (${main.code})`,
        `变卦：${change.display}  ${change.fullName} (${change.code})`,
        (changeSymbols.length ? `变${changeSymbols.map((c) => Orders[c]).join('、')}爻；` : '无变爻；'),
        `${HowTo[changeSymbols.length]}。`,
        ...comments,
      ])

      return `2bot 为 ${user} 算卦：\n` +
        segment('image', { url: 'base64://' + textImage.toBase64() }) + '\n' +
        shortComments
    })
}