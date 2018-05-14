import db from '../service/db'
import user from './user'
import role from './role'
import permission from './permission'

const models = [role, user]
export default {
  async connect() {
    await db.connect()
    models.forEach((model) => db.register(model))
  }
}

export const User = user
export const Role = role
export const Permission = permission
