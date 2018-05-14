import { Template } from '../decorators';
import About from './about'
import Router from '../base/Router'
import history from '../services/history'
import template from './template.mustache'

@Template(template)
class Application extends Router {
  static components = {About}
  constructor() {
    super(...arguments)

    history.onLoadUrl = (path, searchString) => {
      this.set({ path, searchString })
    }

  }

  time() {
    return new Date()
  }
}
export default Application
