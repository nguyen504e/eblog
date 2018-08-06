import { ObjectID as ID } from 'mongodb'
import { assign, find, times } from 'lodash'
import { hashSync } from 'bcrypt'

import config from '../config'
import faker from '../faker'
import roles from './roles'

const { SEC_SALT_ROUNDS } = config

const data = times(10, () => {
  const created = faker.date.past()
  return {
    _id: new ID(),
    created,
    email: faker.internet.email(),
    userName: faker.internet.userName(),
    updated: faker.date.between(created, new Date()),
    digest: hashSync(faker.internet.password(), SEC_SALT_ROUNDS),
    roles: [find(roles, { name: 'PUBLIC' })._id]
  }
})

assign(data[0], {
  email: 'npnguyen@tma.com.vn',
  userName: 'admin',
  digest: hashSync('1', SEC_SALT_ROUNDS),
  roles: [find(roles, { name: 'ADMIN' })._id]
})

export default data
