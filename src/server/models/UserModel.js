import { flatten, uniq } from 'lodash'

import { Collection, Use } from '../decorators'
import { BaseModel } from './BaseModel'
import PermissionModel from './PermissionModel'
import RoleModel from './RoleModel'
import timestamp from './plugins/timestamp'

@Collection()
@Use(timestamp)
class UserModel extends BaseModel {
  async getPermissions() {
    const roleIds = this.get('roles')
    const roles = await RoleModel.find({ _id: { $in: roleIds } })
    const permissionIds = uniq(flatten(roles.map((role) => role.get('permissions'))))
    const permissions = await PermissionModel.find({ _id: { $in: permissionIds } })
    return permissions.map((p) => p.get('name'))
  }
}

export default UserModel
