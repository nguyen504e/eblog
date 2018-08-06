import { isEmpty } from 'lodash'

import { UserFilterInput, UserSet } from '../../User'
import { count, listToJSON, parseDateFilter, parseTextFilter, preparePaging } from '../../../utils'
import ContinuousInput from '../../ContinuousInput'
import PageInput from '../../PageInput'
import UserModel from '../../../models/UserModel'
import checkPermission from '../../../service/checkPermission'

export default {
  name: 'User Search Result',
  type: UserSet,
  args: {
    filter: UserFilterInput,
    page: PageInput,
    cont: ContinuousInput
  },

  async resolve({ filter, page, cont }, ctx) {
    if (!checkPermission(ctx.state.id, 'USER_MANAGEMENT_VIEW')) {
      throw new Error('NOT AUTH')
    }
    const { firstName, lastName, email, created, roles } = filter
    const size = page.size || cont.size
    const parsedFilter = parseTextFilter({ firstName, lastName, email })
    parsedFilter.created = parseDateFilter(created)

    if (!isEmpty(roles)) {
      parsedFilter.roles = roles.length === 1 ? roles[0] : { $in: roles }
    }

    const model = preparePaging(UserModel, page, cont).where(parsedFilter)

    try {
      const data = listToJSON(await model.find())
      const total = await count(UserModel, parsedFilter, page)
      return { data, total, size }
    } catch (e) {
      throw e
    }
  }
}
