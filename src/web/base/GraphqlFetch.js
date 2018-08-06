import { defaults } from 'lodash'

export default class GraphqlFetch {
  get token() {
    return null
  }

  constructor(apiPath) {
    this.apiPath = apiPath
  }

  fetch(query, vars, opts) {
    // assert(query, 'query is required')
    vars = vars || {}
    opts = opts || {}
    opts.body = JSON.stringify({
      query: query,
      variables: vars
    })

    // default opts
    defaults(opts, {
      method: 'POST',
      headers: new Headers()
    })

    // default headers
    const headers = opts.headers
    if (this.token) {
      opts.headers.append('auth', this.token)
    }
    if (!headers.get('content-type')) {
      opts.headers.append('content-type', 'application/json')
    }

    return fetch(this.apiPath, opts)
      .then((res) => {
        if (res.ok) {
          return res.json()
        }
        throw Error(res.statusText)
      })
      .then((res) => {
        return JSON.parse(res.graphqlResponse)
      })
      .catch((error) => {
        return error
      })
  }
}
