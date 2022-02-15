/**
 * @param {import('koishi').Session} session
 * @param {import('./stats').UserMessageCount[]} ranking
 * @returns {Promise<string>}
 */
const formatRanking = async (session, ranking) => {
  const users = await Promise.all(
    ranking.map(async (item) => {
      const user = await session.bot.getGuildMember(session.guildId, item.user)
      return user.nickname || user.username
    })
  )

  return ranking.map((item, i) => `第 ${i + 1} - ${users[i]}: ${item.message} 条`).join('\n')
}

/**
 * @param {any} value
 * @param {number} def
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const clamp = (value, def, min, max) => {
  value = parseInt(value)
  if (isNaN(value)) return def
  else if (value <= min) return min
  else if (value >= max) return max
  else return value
}

module.exports.clamp = clamp
module.exports.formatRanking = formatRanking