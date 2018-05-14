import { Database } from 'mongorito'
import config from '../config'

export default new Database(config.DB_CONNECTION)
