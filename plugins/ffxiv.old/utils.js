/**
 * Truncate string that is too long.
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