/**
 * @param {number} x
 * @returns {number[]}
 */
const range = (x) => {
  return [...Array(x).keys()]
}

module.exports.range = range