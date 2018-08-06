import { SERVER_API_PATH } from '../../../eblog.json'
import GraphqlFetch from '../base/GraphqlFetch'
import store from '../store'

class Fetch extends GraphqlFetch {
  get token() {
    const { auth = {} } = store.getState()
    return auth.token
  }
}

export default new Fetch(SERVER_API_PATH)
