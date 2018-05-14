import View from './View'

class Router extends View {
  match(path) {
    const _path = this.get('path')
    if (!path) {
      return false
    }
    return new RegExp(`^(${_path}/|${_path}$)`).test(path)
  }

  nextPath(path) {
    return path.replace(this.pathRegex, '')
  }

  hasPermissions() {
    return true
  }
}

export default Router
