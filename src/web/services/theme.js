import { keysIn } from 'lodash'

const map = {
  DEFAULT: () => import('../styles/themes/default/index.scss')
}

export const themes = keysIn(map)
class Theme {
  setup(themeName) {
    return this.changeTheme(themeName || 'DEFAULT')
  }

  changeTheme(themeName) {
    if (map[themeName]) {
      return map[themeName]().then((module) => {
        module.default.use()
      })
    }

    return Promise.resolve()
  }
}

export default new Theme()
