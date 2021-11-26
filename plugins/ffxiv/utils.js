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
 * @returns string
 */
const truncateString = str => {
  str = str.replace(/\s+/g, ' ').trim()
  if (str.length >= 100) {
    return str.substr(0, 100) + '...'
  } else return str
}

module.exports.truncateString = truncateString
module.exports.range = range