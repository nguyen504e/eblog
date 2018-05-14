import { isEmpty, isFunction, keys, values } from 'lodash'

import { MongoClient as DB } from 'mongodb'
import config from './config'
import data from './data'

const P = Promise
let { DB_CONNECTION, DB_NAME } = config

const models = keys(data)

const T = {}
const toolNames = ['dropCollection', 'toArray', 'createCollection', 'insertMany']
toolNames.forEach((n) => (T[n] = (ctx, d) => new P((rs, rj) => ctx[n](d, (e, m) => (e ? rj(e) : rs(m))))))
const connect = (str, n) => new P((rs, rj) => DB.connect(str, (e, dbs) => (e ? rj(e) : rs({ db: dbs.db(n), dbs }))))
const listCollections = (db) => new P((rs, rj) => db.listCollections().toArray((e, l) => (e ? rj(e) : rs(l))))

const process = async () => {
  try {
    const rows = await Promise.all(values(data).map((c) => (isFunction(c) ? c() : c)))
    console.log(`connect to ${DB_CONNECTION}`)
    const { db, dbs } = await connect(DB_CONNECTION, DB_NAME)
    const list = (await listCollections(db)).map(({ name }) => name)
    const exist = models.filter((m) => list.includes(m))
    await P.all(exist.map((c) => T.dropCollection(db, c)))
    await P.all(models.map((c) => T.createCollection(db, c)))
    const tasks = models.map((c, idx) => P.resolve(isEmpty(rows[idx]) || T.insertMany(db.collection(c), rows[idx])))
    return P.all(tasks).then(() => dbs)
  } catch (e) {
    throw e
  }
}

process()
  .then((dbs) => {
    dbs.close()
    console.log('COMPLETED')
  })
  .catch((e) => {
    console.log(e)
  })
