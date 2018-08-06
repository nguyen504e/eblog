const { get, isEmpty } = require('lodash')
const webpack = require('webpack')
const webpackLog = require('webpack-log')
const path = require('path')

process.env.MODE = 'development'
process.env.MODULE = 'server'

const childProcess = require('child_process')
const config = require('./eblog.json')
const webpackConfig = require('./webpack.config')

const statsOptions = { modules: false, children: false, builtAt: false, entrypoints: false, colors: true }
const log = webpackLog({ level: 'info', name: 'bootstrap', timestamp: config.logTime })

const getEntry = (stats) => {
  const entrypoints = get(stats, 'compilation.entrypoints')
  if (entrypoints.size < 1) {
    throw new Error('Missing entry file')
  }

  return path.resolve(webpackConfig.output.path, `./${entrypoints.get('main').runtimeChunk.files[0]}`)
}

let proc = null
webpack(webpackConfig).watch(webpackConfig.watchOptions, (werr, stats) => {
  proc && proc.kill('SIGINT')

  log.info(stats.toString(statsOptions))

  if (!isEmpty(stats.errors)) {
    return
  }

  if (werr) {
    log.error(werr.stack || werr)
    return werr.details && log.error(werr.details)
  }

  log.info('RESTARTING SERVER...')
  const entry = getEntry(stats)
  proc = childProcess.fork(entry)
  log.info('SERVER STARTED.')

  // listen for errors as they may prevent the exit event from firing
  proc.on('error', (err) => err && log.error(err))

  // execute the callback once the process has finished running
  proc.on('exit', (code) => code > 0 && log.error(new Error(`exit code ${code}`)))
})
