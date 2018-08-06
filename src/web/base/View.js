import Ractive from '../libs/Ractive.js'
import store from '../store'

export default class View extends Ractive {
  get client() {
    return store.client
  }

  get store() {
    return store
  }

  oninit() {}
}
