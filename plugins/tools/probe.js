const probe = require('probe-image-size')
const { h } = require('koishi')

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = (ctx) => {
  ctx.command('probe', '检测图片大小')
    .action(async ({ session }) => {
      if (!session.quote) return

      const content = session.quote.content
      if (!content) return

      const parsed = h.parse(content)

      /**
       * @param {h[]} el
       */
      const flattenElement = (el) => {
        const stack = [...el]

        /** @type {h[]} */
        const flatten = []

        while (stack.length > 0) {
          const current = stack.pop()
          /** @type {h} */
          const pure = {
            type: current.type,
            attrs: { ...current.attrs },
          }
          flatten.push(pure)

          const children = current.children
          if (children.length > 0) {
            stack.push(...children)
          }
        }

        return flatten
      }

      const flatten = flattenElement(parsed)
      /** @type {[number, probe.ProbeResult][]} */
      const results = []

      await Promise.all(flatten.map(async (fragment, i) => {
        if (fragment.type != 'img') return

        const result = await probe(fragment.attrs.src)
        results.push([i, result])
      }))

      if (!results.length) {
        return '引用的信息不含图片信息。'
      }

      results.sort((a, b) => a[0] - b[0])

      if (results.length == 1) {
        const result = results[0][1]
        return `MIME：${result.mime}，尺寸：${result.width} * ${result.height}。`
      } else {
        return results.map((tuple, i) => {
          const result = tuple[1]
          return `第 ${i + 1} 张图的 MIME：${result.mime}，尺寸：${result.width} * ${result.height}。`
        }).join('\n')
      }
    })
}