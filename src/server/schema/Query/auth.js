import { compare } from 'bcrypt'
import jsonwebtoken from 'jsonwebtoken'

import { $STRING } from '../../base/GraphqlType'
import { CodeNotMatchedError, UserNotFoundError } from '../../Errors'
import { permit } from '../../service/memory'
import Auth from '../Auth'
import UserModel from '../../models/UserModel'
import config from '../../config'

const { TOKEN_ALGORITHM, TOKEN_SECRET, TOKEN_EXP } = config

export default {
  type: Auth,
  args: {
    email: { type: $STRING() },
    digest: { type: $STRING() }
  },
  async resolve(root, { email, digest }) {
    const user = await UserModel.findOne({ email })
    if (user) {
      const isMatch = await compare(digest, user.get('digest'))
      if (isMatch) {
        const id = user.get('_id')
        const permissions = await user.getPermissions()
        const tokenOptions = { algorithm: TOKEN_ALGORITHM, expiresIn: TOKEN_EXP }
        const token = jsonwebtoken.sign({ id, email }, TOKEN_SECRET, tokenOptions)

        const sessionKey = id.toString()
        await permit.delAsync(sessionKey)
        await permit.saddAsync(sessionKey, ...permissions)
        return { id, email, token, permissions }
      }
      throw new CodeNotMatchedError()
    }

    throw new UserNotFoundError()
  }
}
