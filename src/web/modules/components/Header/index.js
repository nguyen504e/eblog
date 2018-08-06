import queryString from 'querystring';

import { CacheAuthQuery } from '../../../queries.graphql'
import { Template } from '../../../decorators'
import View from '../../../base/View'
import history from '../../../services/history'
import template from './template.html'

@Template(template)
class Header extends View {
  oninit() {
    super.oninit(...arguments)
    // this.set()
    this.client.watchQuery({ query: CacheAuthQuery, fetchPolicy: 'cache-only' }).subscribe({
      next: ({ data }) => {
        this.set('isLogin', !!data.auth)
      }
    })
  }

  onNavLogin({ original, node: { pathname } }) {
    original.preventDefault()
    const param = queryString.stringify({p: history.fragment})
    history.navigate(`${pathname}?${param}`)
  }
}

export default Header
