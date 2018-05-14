import { Model } from 'mongorito'
import timestamp from '../dbPlugins/timestamp';

class User extends Model {

}

User.use(timestamp)

export default User
