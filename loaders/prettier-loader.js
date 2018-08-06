const prettier = require('prettier')

const prettierConfig = require('../.prettierrc.js')

prettierConfig.parser = 'babylon'
module.exports = function(source) {
  return prettier.format(source, prettierConfig)
}
