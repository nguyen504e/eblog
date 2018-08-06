const convert = require('koa-connect')
const history = require('connect-history-api-fallback')
const proxy = require('http-proxy-middleware')

const webpackServeWaitpage = require('webpack-serve-waitpage')

const config = require('./eblog.json')
const packageConfig = require('./package.json')

const title = packageConfig.name.toUpperCase()
const SERVE_PORT = config.SERVER_PORT + 11

process.env.MODE = 'development'
process.env.MODULE = 'web'
const webpackConfig = require('./webpack.config')

const statsOptions = {
  modules: false,
  children: false,
  builtAt: false,
  entrypoints: false,
  colors: true
}

module.exports = Object.assign(webpackConfig, {
  stats: statsOptions,
  serve: {
    port: SERVE_PORT,
    // hotClient: true,
    devMiddleware: {
      stats: statsOptions
    },
    add(app, middleware, options) {
      app.use(convert(proxy('/graphql', { target: `http://localhost:${config.SERVER_PORT}` })))
      app.use(convert(history()))
      app.use(webpackServeWaitpage({ title, ...options }))
    }
  }
})
