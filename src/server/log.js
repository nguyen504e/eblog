import fs from 'fs'
import pino from 'pino'
import { multistream } from 'pino-multi-stream'
import path from 'path'
import config from './config'

const { LOG_PATH, LOG_CONSOLE_LEVEL, LOG_LEVEL, LOG_FILE_ENABLE } = config

const pretty = pino.pretty();
pretty.pipe(process.stdout)

const streams = [{ stream: pretty.pipe(process.stdout), level: LOG_CONSOLE_LEVEL || LOG_LEVEL }];

if(LOG_FILE_ENABLE) {
  streams.push({ stream: fs.createWriteStream(path.resolve(__dirname, LOG_PATH)), level: LOG_LEVEL })
}

const log = pino({ level: 'debug' }, multistream(streams));

export default log
export const fatal = (...args) => log.fatal(args)
export const error = (...args) => log.error(args)
export const warn = (...args) => log.warn(args)
export const info = (...args) => log.info(args)
export const debug = (...args) => log.debug(args)
export const trace = (...args) => log.trace(args)
