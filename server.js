const webpack = require('webpack')
const { get } = require('lodash')
const path = require('path')
const childProcess = require('child_process')
const weblog = require('webpack-log')
const cosmiconfig = require('cosmiconfig')
const fs = require('fs')

const { name: PKG_NAME } = require('./package.json')

/* eslint-disable no-process-env */
process.env.MODE = 'development'
process.env.TARGET = 'node'
/* eslint-enable no-process-env */

const { config } = cosmiconfig('webpack', { sync: true }).load() || {}
const log = weblog({ level: 'info', name: 'wdm', timestamp: config.logTime })

const CONFIG_FILE = `${PKG_NAME}.config.js`
fs.createReadStream(CONFIG_FILE).pipe(fs.createWriteStream(path.resolve(config.output.path, `./${CONFIG_FILE}`)))

const getEntry = stats => {
  const entrypoints = get(stats, 'compilation.entrypoints')
  if (entrypoints.size < 1) {
    throw new Error('Missing entry file')
  }

  return path.resolve(config.output.path, `./${entrypoints.get('main').runtimeChunk.files[0]}`)
}

let proc = null
webpack(config).watch(config.watchOptions, (werr, stats) => {
  if (werr) {
    log.error(werr.stack || werr)
    if (werr.details) {
      log.error(werr.details)
    }
  }

  proc && proc.kill('SIGINT')
  log.info('Restarting server...')
  proc = childProcess.fork(getEntry(stats))
  log.info('Server started.')

  // listen for errors as they may prevent the exit event from firing
  proc.on('error', err => {
    if (err) {
      log.error(err)
    }
  })

  // execute the callback once the process has finished running
  proc.on('exit', code => {
    const err = code === 0 ? null : new Error(`exit code ${code}`)
    log.error(err)
  })
})
