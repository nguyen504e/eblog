import { ApolloServer } from 'apollo-server-koa'
import Koa from 'koa'
import KoaBody from 'koa-bodyparser'
import jwt from 'koa-jwt'

import { info, error } from './log'
import config from './config'
import db from './service/db'
import memory from './service/memory'
import schema from './schema'

const { SERVER_PORT, TOKEN_SECRET } = config
const app = new Koa()
const server = new ApolloServer({ schema, debug: _DEV_MODE_, context: (context, next) => ({ context, next }) })

app.on('error', (e) => error(e))
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    error(err)
  }
})

app.use(KoaBody())
app.use(jwt({ secret: TOKEN_SECRET, passthrough: true }))
server.applyMiddleware({ app })

db.start().then(() => {
  info('DB connected')
  app.listen(SERVER_PORT)
})

process.on('SIGINT', () => {
  memory.forEach((mem) => mem.end(true))
  db.stop().then(() => {
    console.log('\n')
    info('Mongodb disconnected on app termination')
    process.exit(0)
  })
})
