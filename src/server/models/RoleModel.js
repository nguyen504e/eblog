import { Collection, Use } from '../decorators'
import { BaseModel } from './BaseModel'
import timestamp from './plugins/timestamp'

@Collection()
@Use(timestamp)
class RoleModel extends BaseModel {
}

export default RoleModel
