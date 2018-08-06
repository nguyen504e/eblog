const lodash = require('lodash')
const path = require('path')
module.exports = {
  declarationKeyword({ pathToCurrentFile }) {
    if (pathToCurrentFile.startsWith('./src/')) {
      return 'import'
    }

    return 'const'
  },

  aliases: {
    template: './template.html',
    style: './style.scss',
    css: './css.scss'
  },

  namedExports: {
    lodash: lodash.keysIn(lodash)
  },

  environments: ['node']
}
