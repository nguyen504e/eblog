import pino from 'pino'
import prettifier from 'pino-pretty'

import path from 'path'

import config from './config'

const { LOG_FILE_PATH, LOG_CONSOLE_LEVEL, LOG_LEVEL, LOG_FILE_ENABLE } = config

let logWarapper = function() {}

if (LOG_FILE_ENABLE) {
  const logFile = pino({ level: LOG_LEVEL }, pino.extreme(path.resolve(__dirname, LOG_FILE_PATH)))

  logWarapper = function(lev, ...args) {
    logFile[lev](args)
  }
}

if (_DEV_MODE_) {
  const oldLogWrapper = logWarapper
  const log = pino({ level: LOG_CONSOLE_LEVEL || LOG_LEVEL, prettyPrint: { levelFirst: true }, prettifier })

  logWarapper = function(lev, ...args) {
    log[lev](args)
    oldLogWrapper(lev, ...args)
  }
}

export const fatal = (...args) => logWarapper('fatal', ...args)
export const error = (...args) => logWarapper('error', ...args)
export const warn = (...args) => logWarapper('warn', ...args)
export const info = (...args) => logWarapper('info', ...args)
export const debug = (...args) => logWarapper('debug', ...args)
export const trace = (...args) => logWarapper('trace', ...args)
export default { fatal, error, warn, info, debug, trace }
