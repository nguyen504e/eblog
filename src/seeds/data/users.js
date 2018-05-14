import faker from '../faker'
import { times, assign, find } from 'lodash'
import bcrypt from 'bcrypt'
import config from '../config'
import roles from './roles'

const { SEC_SALT_ROUNDS } = config

const data = times(10, () => {
  const created = faker.date.past()
  return {
    email: faker.internet.email(),
    userName: faker.internet.userName(),
    created,
    updated: faker.date.between(created, new Date()),
    digest: faker.internet.password(),
    roles: [find(roles, { name: 'PUBLIC' })._id]
  }
})

assign(data[0], {
  email: 'npnguyen@tma.com.vn',
  userName: 'admin',
  digest: '1',
  roles: [find(roles, { name: 'ADMIN' })._id]
})

async function generate() {
  const tasks = data.map((user) => {
    return bcrypt.hash(user.digest, SEC_SALT_ROUNDS).then((hash) => {
      user.digest = hash
      return user
    })
  })

  return Promise.all(tasks).then(() => data)
}

export default generate()
