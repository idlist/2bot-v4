/**
 * @param {import('./stats').UserMessageCount[]} ranking
 * @returns {Promise<string>}
 */
const formatRanking = (ranking) => {
  return ranking.map((item, i) => `${i + 1} - ${item.name}: ${item.message} 条`).join('\n')
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