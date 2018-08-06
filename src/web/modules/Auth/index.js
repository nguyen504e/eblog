import { Components, Route } from '../../decorators'
import Login from './components/Login'
import Logout from './components/Logout'
import Router from '../../base/Router'
import _store from './store'
import template from './template.html'

@Components({ Login, Logout })
@Route(template)
class Auth extends Router {}

export const view = Auth
export const store = _store
