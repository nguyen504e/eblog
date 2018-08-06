import redis from 'redis'
import { promisify } from 'util'

const client0 = redis.createClient()
const FN = [
  'del',
  'sadd',
  'sismember',
  'exists'
  // ,
  // 'scard',
  // 'sdiff',
  // 'sdiffstore',
  // 'sinter',
  // 'sinterstore',
  // 'smembers',
  // 'smove',
  // 'spop',
  // 'srandmember',
  // 'srem',
  // 'sscan',
  // 'sunion',
  // 'sunionstore'
]

const promisifyFns = (client) => {
  FN.forEach((fn) => {
    client[fn + 'Async'] = promisify(client[fn]).bind(client)
  })
  return client
}

export const permit = promisifyFns(client0)
export default [permit]
