import { Database } from 'mongorito'

import PermissionModel from '../models/PermissionModel'
import RoleModel from '../models/RoleModel'
import UserModel from '../models/UserModel'
import config from '../config'

const Models = [PermissionModel, RoleModel, UserModel]

export default {
  register() {
    const db = new Database(`${config.DB_CONNECTION}/${config.DB_NAME}`)
    Models.forEach((Model) => db.register(Model))
    return db
  },

  start() {
    const db = (this.db = this.register())
    return db.connect()
  },

  async stop() {
    return this.db && this.db.disconnect()
  }
}
