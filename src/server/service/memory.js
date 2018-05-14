import redis from 'redis'

export const permit = redis.createClient(0)
