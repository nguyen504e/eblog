import { Css, Template } from '../../../../decorators'
import { errorHere } from '../../../../Errors'
import View from '../../../../base/View'
import css from './css.scss'
import history from '../../../../services/history'
import template from './template.html'

@Css(css)
@Template(template)
class Login extends View {
  async onLogin() {
    const { email, digest } = this.get()
    this.set('error', null)
    try {
      await this.store.authenticate({ email, digest })
      const { path = '/' } = history.params()
      history.navigate(path)
    } catch (e) {
      this.set('error', errorHere(e))
    }
  }
}

export default Login
