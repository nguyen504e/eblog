import Ractive from 'ractive/ractive.js'

import { isLogin } from '../store'
import language from '../services/language'

Ractive.defaults.data = {
  __() {
    return language.__(...arguments)
  },
  __n() {
    return language.__n(...arguments)
  },
  _isLogin() {
    return isLogin()
  }
}

export default Ractive
