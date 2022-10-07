const { createPool } = require('mariadb')

const secret = require('../koishi.secret')
const mysql = secret.mysql

const pool = createPool({
  host: mysql.host,
  port: mysql.port,
  user: mysql.user,
  password: mysql.password,
  database: mysql.database,
  connectionLimit: 5,
})

const query = async (q, args) => await pool.query(q, args)

const migrate = async () => {
  const res = await query('SELECT id, answer FROM dialogue WHERE answer like \'[CQ:image%\'')

  const modified = [...res]

  for await (const item of modified) {
    const newImage = item.answer.replace(/\[CQ:image,url=(.+)\]/, '<image url="$1"/>')

    await query('UPDATE dialogue SET answer = ? WHERE id = ?', [newImage, item.id])
    console.log(`Migrated question ID ${item.id}.`)
  }

  console.log('Migrate finished.')
  pool.end()
}

migrate()