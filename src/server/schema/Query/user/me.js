import { ObjectID } from 'mongodb'

import User from '../../User'
import UserModel from '../../../models/UserModel'

export default {
  type: User,
  async resolve(...ctx) {
    if (!ctx.state.id) {
      throw new Error('NOT AUTH')
    }
    let model = await UserModel.findOne({ _id: ObjectID(ctx.state.id) })
    return model.get()
  }
}
