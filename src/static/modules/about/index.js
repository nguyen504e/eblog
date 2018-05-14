import { Template } from '../../decorators';
import View from '../../base/View';
import template from './template.mustache'

@Template(template)
class About extends View {
}

export default About
