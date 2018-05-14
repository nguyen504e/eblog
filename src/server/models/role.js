import { Model } from 'mongorito'
import timestamp from '../dbPlugins/timestamp'

class Role extends Model {}

Role.use(timestamp)

export default Role
