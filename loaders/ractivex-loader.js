const ractive = require('ractive')
const Prettier = require('prettier')
const prettierConfig = Prettier.resolveConfig.sync(__dirname)

const regex = /template\s*\(\s*\)\s*{\W+return\s+/
const findClosingParen = (text, openPos = 1) => {
  let closePos = openPos
  let counter = 1
  while (counter > 0) {
    if (closePos > text.length) {
      throw new Error('Error syntax')
    }
    const c = text[++closePos]
    if (c === '(') {
      counter++
    } else if (c === ')') {
      counter--
    }
  }

  return closePos
}

module.exports = function(code) {
  this.cacheable()
  const m = regex.exec(code)

  if (!m) {
    return code
  }

  const begin = m[0].length + m.index

  const end = findClosingParen(code, begin)
  const template = JSON.stringify(ractive.parse(code.slice(begin + 1, end)))
  const result = [code.slice(0, begin + 1), template, code.slice(end, -1)]

  return Prettier.format(result.join(''), prettierConfig)
}
