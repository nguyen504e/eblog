import { isEmpty } from 'lodash'

import UserModel from '../models/UserModel'
import { permit } from './memory'

function checkArgs(state, ...pers) {
  if (isEmpty(pers)) {
    return false
  }

  try {
    return state.user.id.toString()
  } catch (e) {
    return false
  }
}

async function setUpPermissions(id) {
  const exist = await permit.existsAsync(id)
  if (!exist) {
    const permissions = UserModel.getPermissions()
    await permit.saddAsync(id, ...permissions)
  }
}

export async function matchAll(state, ...pers) {
  const id = checkArgs(arguments)
  await setUpPermissions(id)
  return Promise.all(pers.map((p) => permit.sismemberAsync(id, p)))
}

export async function matchAny(state, ...pers) {
  const id = checkArgs(arguments)
  await setUpPermissions(id)
  return Promise.race(pers.map((p) => permit.sismemberAsync(id, p)))
}

export default matchAny
