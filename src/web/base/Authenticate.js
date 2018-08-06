import { forEach } from 'lodash';

import { APP_LOGIN, APP_LOGOUT } from '../actionTypes'

class Authenticate {
/*   constructor(store) { */
  //   this.permissions = this.extractPermissions(store.getState())
  //   store.subscribe(() => this.onStateChange(store))
  // }
/*  */
  onStateChange(store) {
    const state = store.getState()
    const { lastAction } = state
    if (lastAction === APP_LOGIN) {
      this.permissions = this.extractPermissions(state)
    } else if (lastAction === APP_LOGOUT) {
      this.permissions = {}
    }
  }

  extractPermissions(state) {
    const permissions = {}

    forEach(state.auth, (p) => {
      permissions[p] = true
    })

    return permissions
  }

  hasPermission(permissionName) {
    return this.permissions[permissionName]
  }

  hasPermissions(permissions = []) {
    return permissions.some((item) => this.permissions[item])
  }
}

export default Authenticate
