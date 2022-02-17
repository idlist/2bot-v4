const NameList = require('./name-list.json')
const NameListMap = require('./name-list-map.json')
const Names = NameListMap.map(rows => rows.map(i => NameList[i - 1]))

const Radix = [1, 2, 4]
const MapMain = [0, 0, 1, 1]
const MapChange = [1, 0, 1, 0]
const MapIsChange = [1, 0, 0, 1]
const SymbolNames = ['坤', '震', '坎', '兑', '艮', '离', '巽', '乾']
const Elements = ['地', '雷', '水', '泽', '山', '火', '风', '天']

/**
 * @param {number[]} results
 * @param {number[]} map
 */
const analyzeSymbols = (results, map) => {
  let upper = 0, lower = 0

  for (let i = 0; i < 3; i++) lower += map[results[i]] * Radix[i]
  for (let i = 3; i < 6; i++) upper += map[results[i]] * Radix[i - 3]

  const code = NameListMap[upper][lower]
  const name = Names[upper][lower]
  let fullName
  if (upper == lower) fullName = SymbolNames[upper] + '为' + Elements[upper]
  else fullName = Elements[upper] + Elements[lower] + name
  const display = results.map(i => map[i] ? '|' : '¦').join('')

  return { display, upper, lower, code, name, fullName }
}

module.exports.name = 'hexagram'

/**
 * @param {import('koishi').Context} ctx
 */
module.exports.apply = ctx => {
  ctx.command('hexagram', '六爻算卦（迫真）', { hidden: true })
    .action(async () => {
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
      } catch (err) {
        console.log(err)
        return '未能从 random.org 获取随机数，请稍后再试。'
      }

      const main = analyzeSymbols(results, MapMain)
      const change = analyzeSymbols(results, MapChange)
      const changeSymbols = []
      results.forEach((result, i) => {
        if (MapIsChange[result]) changeSymbols.push(i + 1)
      })

      return '2bot 为你迫真算卦：\n' +
        `主卦：${main.display} 第 ${main.code} 卦 ${main.name}卦（${main.fullName}）\n` +
        `变卦：${change.display} 第 ${change.code} 卦 ${change.name}卦（${change.fullName}）\n` +
        `变第 ${changeSymbols.join('、')} 卦`
    })
}