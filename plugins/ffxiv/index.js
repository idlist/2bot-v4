module.exports.name = 'ffxiv'

/**
 * @param {import('koishi').Context} context
 */
module.exports.apply = context => {
  context.command('ff', 'FFXIV 功能')

  context.plugin(require('./random-gate'))
  context.plugin(require('./draw-ast-card'))
  context.plugin(require('./fashion-report'))
}