import { Model } from 'mongorito'
import timestamp from '../dbPlugins/timestamp'

class Permission extends Model {}

Permission.use(timestamp)

export default Permission
