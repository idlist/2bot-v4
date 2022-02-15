/**
 * @param {import('koishi').Session} session
 * @param {import('./stats').UserMessageCount[]} ranking
 */
const formatRanking = async (session, ranking) => {
  const users = await Promise.all(
    ranking.map(async (item) => {
      const user = await session.bot.getGuildMember(session.guildId, item.user)
      return user.nickname || user.username
    })
  )

  return ranking.map((item, i) => `${i} 位 - ${users[i]} [${item.user}]: ${item.message} 条`).join('\n')
}

module.exports.formatRanking = formatRanking