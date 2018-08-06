import { assignIn, map } from 'lodash'

import { ApolloClient } from 'apollo-client'
import { ApolloLink, from } from 'apollo-link'
import { CachePersistor } from 'apollo-cache-persist'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache, defaultDataIdFromObject as dfId } from 'apollo-cache-inmemory'
import { withClientState } from 'apollo-link-state'
import storage from 'localforage'

import { AuthQuery, CacheAuthQuery } from './queries.graphql'
import { stores } from './modules'

const CACHE_VERSION = _CACHE_VERSION_
const CACHE_VERSION_KEY = 'CACHE_VERSION'

/**
 * At a given attribute this will merge all objects
 * in a list of objects found at that attribute.
 *
 * Example
 * const objectList = [
 *   {defaults: {x: true}},
 *   {defaults: {y: "foo"}},
 *   {defaults: {z: 123}}
 * ]
 *
 * // returns {x: true, y: "foo", z: 123}
 * mergeGet("defaults")(objectList)
 */

function mergeGet(att, stores) {
  return assignIn({}, ...map(stores, att))
}

const _ctx = { [CACHE_VERSION]: _CACHE_VERSION_ }

function getToken() {
  if (_ctx.token) {
    return _ctx.token
  }
  const client = getClient()
  if (!client) {
    return
  }
  try {
    const data = client.readQuery({ query: CacheAuthQuery })
    return (_ctx.token = data.auth.token)
  } catch (e) {
    return
  }
}
export async function setupStore() {
  if (_ctx.client) {
    return
  }

  const storage = getStorage()
  await storage.ready()

  const persistor = getPersistor()
  const currentVersion = await storage.getItem(CACHE_VERSION_KEY)

  if (currentVersion === CACHE_VERSION) {
    await persistor.restore()
  } else {
    await persistor.purge()
    await storage.setItem(CACHE_VERSION_KEY, CACHE_VERSION)
  }

  const authMiddleware = new ApolloLink((opr, forward) => {
    const token = getToken()
    token && opr.setContext(({ headers = {} }) => ({ headers: { ...headers, Authorization: `Bearer ${token}` } }))
    return forward(opr)
  })

  const httpLink = new HttpLink()
  const defaults = mergeGet('defaults', stores)
  const Mutation = mergeGet('mutations', stores)
  const cache = getCache()
  const clientState = withClientState({ cache, defaults, resolvers: { Mutation } })
  _ctx.client = new ApolloClient({ cache, link: from([authMiddleware, clientState, httpLink]) })
}

export function getStorage() {
  storage.config({ name: 'gpl', driver: storage.INDEXEDDB })

  if (!_ctx.storage) {
    _ctx.storage = storage
  }
  return _ctx.storage
}

export function getClient() {
  return _ctx.client
}

export function getPersistor() {
  if (!_ctx.persistor) {
    _ctx.persistor = new CachePersistor({ cache: getCache(), storage })
  }
  return _ctx.persistor
}

export function getCache() {
  if (!_ctx.cache) {
    _ctx.cache = new InMemoryCache({ dataIdFromObject: (o) => (o.__typename === 'Auth' ? 'Auth' : dfId(o)) })
  }
  return _ctx.cache
}

export async function authenticate(variables) {
  const client = getClient()
  try {
    const { data } = await client.query({ query: AuthQuery, variables, fetchPolicy: 'no-cache' })
    client.writeQuery({ query: CacheAuthQuery, data })
    _ctx.token = getToken()
  } catch (e) {
    throw e
  }
}

export async function unAuthenticate() {
  const client = getClient()
  // const data = client.readQuery({ query: CacheAuthQuery })
  // Object.assign(data.auth, { email: null, id: null, token: null, permissions: null })
  // client.writeQuery({ query: CacheAuthQuery, data })
  _ctx.token = null

  const persistor = getPersistor()
  const storage = getStorage()
  await client.resetStore()
  await persistor.purge()
  await storage.setItem(CACHE_VERSION_KEY, CACHE_VERSION)
}

export function isLogin() {
  try {
    const auth = getClient().readQuery({ query: CacheAuthQuery })
    return !!auth
  } catch (e) {
    return false
  }
}

_ctx.authenticate = authenticate
export default _ctx
