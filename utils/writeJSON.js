const prettier = require('prettier')
const fs = require('fs')

module.exports = function(data, file) {
  const rs = JSON.stringify(data)
  const source = prettier.format(rs, { parser: 'json' })
  fs.writeFileSync(file, source, 'utf8')
}
