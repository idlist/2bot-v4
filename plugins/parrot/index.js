const ReplaceList = require('./replace-list')

/** @type {import('./index').ParrotDataType} */
const ParrotData = {}

/**
 * @returns {number}
 */
const randomTrigger = () => {
  if (Math.random() < 0.1) {
    return 2
  } else {
    return Math.floor(Math.random() * 4) + 3
  }
}

/**
 * @param {string} message
 * @returns {string}
 */
const replacePhrases = (message) => {
  const flag = '%flag%'

  ReplaceList.map((word) => {
    const repReg = new RegExp(`${word[0]}(?!${flag})`, 'g')
    message = message.replace(repReg, `${word[1]}${flag}`)
  })
  message = message.replace(/%flag%/g, '')

  return message
}

module.exports.name = 'parrot'

/**
 * @param {import('koishi').Context} ctx
 */
module.exports.apply = (ctx) => {
  const cooldown = 60 * 10000

  ctx.middleware((session, next) => {
    if (session.content.startsWith('[') && session.content.endsWith(']')) {
      return next()
    }

    const cid = session.cid
    const channel = ParrotData[cid]

    if (channel) {
      if (channel.message == session.content) {
        channel.count++

        if (
          channel.count == channel.trigger &&
          channel.lastTriggered + cooldown <= Date.now()
        ) {
          let message = session.content

          if (Math.random() < 0.1) message = replacePhrases(message)
          channel.lastTriggered = Date.now()

          session.send(message)
        }
      } else {
        channel.message = session.content
        channel.trigger = randomTrigger()
        channel.count = 1
      }
    } else {
      ParrotData[cid] = {
        message: session.content,
        count: 1,
        trigger: randomTrigger(),
        lastTriggered: Date.now() - cooldown,
      }
    }

    return next()
  })
}