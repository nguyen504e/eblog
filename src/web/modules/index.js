import { view as Auth, store as AuthStore } from './Auth'
import { Components, Route } from '../decorators'
import About from './About'
import Dashboard from './Dashboard'
import Footer from './components/Footer'
import Header from './components/Header'
import NotFound from './NotFound'
import Router from '../base/Router'
import template from './template.html'

@Route(template)
@Components({ About, Auth, Dashboard, NotFound, Footer, Header })
class Application extends Router {}

export const App = Application
export const stores = [AuthStore]
