import Application from './modules/Application'
import history from './services/history'

const target = document.getElementsByTagName('body')
new Application({target})
history.start()
