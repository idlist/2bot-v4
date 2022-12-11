/**
 * Generate an array ranged from 0 (inclusive) to `x` (exclusive)
 *
 * @param {number} x
 * @returns {number[]}
 */
const range = (x) => {
  return [...Array(x).keys()]
}

/**
 * Truncate lengthy string.
 *
 * @param {string} str
 * @returns {string}
 */
const truncateString = (str) => {
  str = str.replace(/\s+/g, ' ').trim()

  if (str.length >= 100) return str.substring(0, 100) + '...'
  else return str
}

/**
 * @param {number} timestamp
 * @return {string}
 */
const formatTimestamp = (timestamp) => {
  /**
   * @param {number} number
   * @param {number} digits
   * @returns {string}
   */
  const paddingZero = (number, digits) => number.toString().padStart(digits, '0')

  const date = new Date(timestamp)

  const year = paddingZero(date.getFullYear(), 4)
  const month = paddingZero(date.getMonth() + 1, 2)
  const day = paddingZero(date.getDate(), 2)
  const hours = paddingZero(date.getHours(), 2)
  const minutes = paddingZero(date.getMinutes(), 2)
  const seconds = paddingZero(date.getSeconds(), 2)

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
}

module.exports.truncateString = truncateString
module.exports.range = range
module.exports.formatTimestamp = formatTimestamp