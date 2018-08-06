import { Template } from '../../../../decorators'
import { isLogin, unAuthenticate } from '../../../../store'
import View from '../../../../base/View'
import history from '../../../../services/history'
import template from './template.html'

@Template(template)
class Logout extends View {
  oninit() {
    super.oninit(...arguments)
    !isLogin() && history.navigate('/')
  }
  async onLogout() {
    await unAuthenticate()
    history.navigate('/')
  }
}

export default Logout
