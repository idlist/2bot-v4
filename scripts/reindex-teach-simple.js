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

const reindex = async () => {
  let qCounter = 1
  const length = (await query('SELECT MAX(id) AS max FROM dialogue'))[0].max
  for (let i = 1; i <= length; i++) {
    const res = await query('SELECT id FROM dialogue WHERE id = ?', [i])
    if (!res.length) continue

    const data = res[0]
    const id = data.id
    await query('UPDATE dialogue SET id = ? WHERE id = ?', [qCounter, id])
    qCounter++
  }

  await query('ALTER TABLE dialogue AUTO_INCREMENT = 1')
  console.log(`${length} questions has been re-indexed to ${qCounter - 1} questions.`)
  pool.end()
}

reindex()