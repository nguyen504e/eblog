import { Template } from '../../decorators'
import View from '../../base/View'
import template from './template.html'

@Template(template)
class NotFound extends View {}

export default NotFound
