const { maxBy } = require('lodash')
const { h, Random } = require('koishi')

/**
 * @type {import('./roll').RollStatus}
 */
const State = {}

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = (ctx) => {
  ctx.command('ff.roll', '模拟 Roll 点')
    .alias('ff.roll')
    .option('start', '-s [teamsize] 发起 Roll 点，默认人数为轻锐小队')
    .option('end', '-e 停止 roll 点')
    .usage('teamsize 可以是 2 - 8 人')
    .example('ff.roll -s 4  发起轻锐小队 Roll 点')
    .example('ff.roll  参与 Roll 点')
    .example('ff.roll -e  中途结束 Roll 点')
    .action(({ session, options }) => {
      const cid = session.cid

      if (
        State[cid] &&
        options.start &&
        !options.end
      ) {
        return '已经开始 Roll 点，请使用 ff.roll 参与 Roll 点。'
      }

      let starterText
      if (!State[cid]) {
        if (!options.start) return '尚未开始 Roll 点，请先开始一局 Roll 点。'

        let teamsize = parseInt(options.start)
        if (isNaN(teamsize)) teamsize = 4
        if (teamsize > 8) teamsize = 8
        if (teamsize < 2) teamsize = 2

        let specialSizeText = ''
        if (teamsize == 4) specialSizeText = '轻锐小队'
        if (teamsize == 8) specialSizeText = '满编小队'

        State[cid] = {
          isRolling: true,
          teamsize: teamsize,
          member: [],
        }
        starterText = [
          h('at', { id: session.userId }),
          ' 发起了 ',
          (specialSizeText || `${teamsize} 人`),
          ' Roll 点，使用 ff.roll 指令参加！',
        ]
      }

      let rollText
      if (!options.end) {
        const existedResults = [], existedUsers = []

        for (const user of State[cid].member) {
          if (user.id == session.userId) {
            return '你已经参与 Roll 点，不能重复参与。'
          }
          existedUsers.push(user.id)
          existedResults.push(user.result)
        }

        let rollResult = -1
        do {
          rollResult = Random.int(1, 100)
        } while (existedResults.includes(rollResult))

        State[cid].member.push({
          id: session.userId,
          result: rollResult,
        })
        rollText = [h('at', { id: session.userId }), ' 参与了 Roll 点。']
      }

      if (
        options.end ||
        State[cid].member.length >= State[cid].teamsize
      ) {
        const result = [...State[cid].member]
        delete State[cid]
        const winner = maxBy(result, (item) => item.result)

        const resultText = [
          ...result.map((member) => h('p', [
            h('at', { id: member.id }),
            ` Roll 到了 ${member.result} 点。`,
          ])),
          h('p', [
            '恭喜',
            h('at', { id: winner.id }),
            '获得了箱子！',
          ]),
        ]

        if (!options.end) {
          return [
            h('p', rollText),
            h('p'),
            ...resultText,
          ]
        }

        const terminateText = [
          h('at', { id: session.userId }),
          ' 中止了 Roll 点。',
        ]
        if (result.length <= 1) return terminateText

        return [
          h('p', terminateText),
          h('p'),
          ...resultText,
        ]
      }

      if (options.start) return starterText
      return rollText
    })
}