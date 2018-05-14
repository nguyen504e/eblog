import cosmiconfig from 'cosmiconfig'
import configJson from '../../eblog.json'

let { config = {} } = cosmiconfig(_PACKAGE_NAME_).loadSync()
config = Object.assign(configJson, config)

export default config
