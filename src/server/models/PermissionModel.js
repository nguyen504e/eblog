import { Collection, Use } from '../decorators'
import { BaseModel } from './BaseModel'
import timestamp from './plugins/timestamp'

@Collection()
@Use(timestamp)
class PermissionModel extends BaseModel {}

export default PermissionModel
