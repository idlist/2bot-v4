// https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/misc/sign/wbi.md#javascript

const axios = require('axios')
const { createHash } = require('crypto')

// @ts-format-ignore-region
const mixinKeyEncodeTable = [
  46, 47, 18,  2, 53,  8, 23, 32,
  15, 50, 10, 31, 58,  3, 45, 35,
  27, 43,  5, 49, 33,  9, 42, 19,
  29, 28, 14, 39, 12, 38, 41, 13,
  37, 48,  7, 16, 24, 55, 40, 61,
  26, 17,  0,  1, 60, 51, 30,  4,
  22, 25, 54, 21, 56, 59,  6, 63,
  57, 62, 11, 36, 20, 34, 44, 52,
]
// @ts-format-ignore-endregion

/**
 * @param {string} source
 */
const getMixinKey = (source) => {
  let key = ''
  mixinKeyEncodeTable.forEach((n) => key += source[n])
  return key.substring(0, 32)
}

const getWbiKey = async () => {
  const { data } = await axios.get('https://api.bilibili.com/x/web-interface/nav', {
    responseType: 'json',
  })

  const seg1 = data.data.wbi_img.img_url
  const seg2 = data.data.wbi_img.sub_url

  /**
   * @param {string} segment
   */
  const extractKey = (segment) => {
    return segment
      .substring(segment.lastIndexOf('/') + 1)
      .split('.')[0]
  }

  return extractKey(seg1) + extractKey(seg2)
}

/**
 * @param {Record<string, unknown>} params
 * @param {string} wbiKey
 */
const encodeWbi = (params, wbiKey) => {
  const mixinKey = getMixinKey(wbiKey)
  const now = Math.floor(Date.now() / 1000)
  const filter = /[!'()*]/g
  const uri = encodeURIComponent

  params = {
    ...params,
    wts: now,
  }

  const query = Object.keys(params)
    .sort()
    .map((key) => `${uri(key)}=${uri(`${params[key]}`.replace(filter, ''))}`)
    .join('&')
  const hashBase = `${query}${mixinKey}`

  const md5 = createHash('md5')
  md5.update(hashBase)
  const wbiSign = md5.digest('hex')

  return `${query}&w_rid=${wbiSign}`
}

module.exports.getWbiKey = getWbiKey
module.exports.encodeWbi = encodeWbi