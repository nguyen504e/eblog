import { ForbiddenError } from 'apollo-server'

import { $LIST, INT } from '../../base/GraphqlType'
import { listToJSON } from '../../utils'
import Permission from '../Permission'
import PermissionModel from '../../models/PermissionModel'
import checkPermission from '../../service/checkPermission'

export default {
  type: $LIST(Permission),
  args: {
    limit: { type: INT, defaultValue: 10 }
  },

  async resolve(root, { limit }, ctx) {
    if (!(await checkPermission(ctx, 'USER_MANAGEMENT_VIEW'))) {
      throw new ForbiddenError()
    }
    const permissions = await PermissionModel.limit(limit).find()
    return listToJSON(permissions)
  }
}
