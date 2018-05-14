import Koa from 'koa'
import KoaRouter from 'koa-router'
import KoaBody from 'koa-bodyparser'
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa'
import { makeExecutableSchema } from 'graphql-tools'
import resolvers from './resolver'
import typeDefs from './schema.graphql'
import jwt from 'koa-jwt'

import db from './service/db'
import models from './models'
import config from './config'
import { info } from './log'

const { port, secret, apiPath } = config

const app = new Koa()
app.use(KoaBody())

// Middleware below this line is only reached if JWT token is valid
app.use(jwt({ secret, passthrough: true }))

let schema = makeExecutableSchema({ typeDefs, resolvers })
const router = new KoaRouter()
router.post(apiPath, graphqlKoa({ schema }))

if (_DEV_MODE_) {
  router.get(apiPath, graphiqlKoa({ endpointURL: apiPath }))
}

app.use(router.routes())
app.use(router.allowedMethods())

models.connect().then(() => {
  process.on('SIGINT', () => {
    db.disconnect().then(() => {
      info('Mongodb disconnected on app termination')
      process.exit(0)
    })
  })

  app.listen(port)
})
