import User from '../../models/user'
import config from '../../config'
import jwt from 'jsonwebtoken'

const { algorithm, secret, exp } = config

export default {
  async auth({email, digest}) {
    const user = await User.findOne({ email })
    if (user.get('digest') === digest) {
      const id = user.get('id')
      const token = jwt.sign({ id }, secret, { algorithm, exp })
      return { id, token }
    }
  }
}
