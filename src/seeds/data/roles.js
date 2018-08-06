import { ObjectID as ID } from 'mongodb'
import { pickId } from '../utils'
import p from './permissions'

export default [
  { _id: new ID(), name: 'ADMIN', permissions: p.map((p) => p._id) },
  { _id: new ID(), name: 'PUBLIC', permissions: pickId(p, 'name', ['VIEW']) },
  {
    _id: new ID(),
    name: 'USER_MANAGEMENT',
    permissions: pickId(p, 'name', ['USER_MANAGEMENT_EDIT', 'USER_MANAGEMENT_VIEW'])
  }
]
