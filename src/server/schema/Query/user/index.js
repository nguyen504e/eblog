import { INT } from '../../../base/GraphqlType';
import { UserSet } from '../../User'
import { listToJSON } from '../../../utils'
import UserModel from '../../../models/UserModel'
import checkPermission from '../../../service/checkPermission'
import me from './me'
import search from './search'

export default {
  type: UserSet,

  args: {
    limit: { type: INT, defaultValue: 10 }
  },

  async resolve({ limit }, ctx) {
    if (!checkPermission(ctx.state.id, 'USER_MANAGEMENT_VIEW')) {
      throw new Error('NOT AUTH')
    }

    try {
      return listToJSON(await UserModel.limit(limit).find())
    } catch (e) {
      throw e
    }
  },

  fields: {
    me,
    search
  }
}
