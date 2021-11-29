const { createPool } = require('mysql')

const secret = require('../koishi.secret')

const db = secret.mysql

const pool = createPool({
  host: 'localhost',
  port: db.port,
  user: db.user,
  password: db.password,
  database: db.database
})

const query = (sql, values = []) => new Promise((resolve, reject) => {
  pool.query(sql, values, (error, result) => {
    if (error) {
      reject(error)
    }
    resolve(result)
  })
})

const reindex = async () => {
  let qCounter = 1
  const length = (await query('SELECT MAX(id) AS max FROM dialogue'))[0].max
  for (let i = 1; i <= length; i++) {
    const res = await query('SELECT id FROM dialogue WHERE id = ?', [i])
    if (!res.length) continue
    const data = res[0]

    const id = data.id
    const regexpStr = `(?<=^|,)(${id.toString()})(?=,|$)`
    const preds = await query('SELECT id, predecessors FROM dialogue WHERE predecessors REGEXP ?', [regexpStr])
    if (preds) {
      for (const pred of preds) {
        const newPred = pred.predecessors.replace(new RegExp(regexpStr), qCounter.toString())
        await query('UPDATE dialogue SET predecessors = ? WHERE id = ?', [newPred, pred.id])
      }
    }
    await query('UPDATE dialogue SET id = ? WHERE id = ?', [qCounter, id])
    qCounter++
  }

  await query('ALTER TABLE dialogue AUTO_INCREMENT = 1')
  console.log(`${length} questions has been re-indexed to ${qCounter - 1} questions.`)
  pool.end()
}

reindex()