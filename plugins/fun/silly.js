const { readFile } = require('fs/promises')
const { resolve } = require('path')
const { EOL } = require('os')
const { Random } = require('koishi')

/**
 * @type {string[]}
 */
const Silly = []

const readTextFile = async (path) => {
  const rawFile = await readFile(resolve(__dirname, path), 'utf-8')
  const lines = rawFile.split(EOL)
  Silly.push(...lines.filter(line => line.trim()))
}

Promise.all([
  readTextFile('data/silly.2019.txt'),
  readTextFile('data/silly.2020.txt'),
  readTextFile('data/silly.2021.txt'),
])

/**
 * @param {import('koishi').Context} ctx
 */
module.exports = ctx => {
  ctx.command('silly', '弱智句子')
    .action(() => Silly[Random.int(0, Silly.length - 1)])
}