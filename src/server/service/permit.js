import { Role } from '../models';
import { User } from '../models';
import {permit} from './memory'

async function getPermissions(_id) {
  const user = await User.findOne({ _id })
  const role = await Role
}


export default (id, ...permissions) => {
  if(!permit.exists(id)) {

  }

}
