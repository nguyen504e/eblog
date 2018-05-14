const convert = require('koa-connect')
const proxy = require('http-proxy-middleware')
const history = require('connect-history-api-fallback')
const cosmiconfig = require('cosmiconfig')
const pkgConfig = require('./package.json')

/* eslint-disable no-process-env */
process.env.MODE = 'development'
process.env.TARGET = 'web'
/* eslint-enable no-process-env */

const { config, isEmpty } = cosmiconfig(pkgConfig.name).loadSync()
if (isEmpty) {
  throw new Error('Missing config file')
}
const { port, apiPath } = Object.assign({ port: 8999 }, config)

module.exports = {
  port: 9000,

  add(app) {
    app.use(convert(proxy(apiPath, { target: `http://localhost:${port}` })))
    app.use(convert(history()))
  }
}
