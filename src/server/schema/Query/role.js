import { $LIST, INT } from '../../base/GraphqlType'
import { listToJSON } from '../../utils'
import Role from '../Role'
import RoleModel from '../../models/RoleModel'
import checkPermission from '../../service/checkPermission'
import { ForbiddenError } from 'apollo-server'

export default {
  type: $LIST(Role),
  args: {
    limit: { type: INT, defaultValue: 10 }
  },

  async resolve({ limit }, ctx) {
    if (!checkPermission(ctx.state.id, 'USER_MANAGEMENT_VIEW')) {
      throw new ForbiddenError()
    }
    const permissions = await RoleModel.limit(limit).find()
    return listToJSON(permissions)
  }
}
