const Prettier = require('prettier')
const Ractive = require('ractive')
const prettierConfig = Prettier.resolveConfig.sync(__dirname)

const REGEX_ROUTE = /<(\s|)+route(\W+\w+\s*=\s*["']([^"']+)["'])+(\s|)+\/>/
const REGEX_ATTR = /(\W+\w+)\s*=\s*["']([^"']+)["']/

module.exports = function(source) {
  function wrap(text) {
    return text
      .split(',')
      .map((p) => `'${p.trim()}'`)
      .join(',')
  }

  function createAttr(attrs) {
    return attrs.map(([attrName, attrValue]) => `${attrName}="${attrValue}"`).join(' ')
  }

  function template(attrs) {
    let path
    let component
    let permisions = ''
    let nextPath
    attrs = attrs.filter(([attrName, attrValue]) => {
      switch (attrName) {
        case 'path':
          path = `@this.match('${attrValue}')`
          nextPath = `@this.nextPath('${attrValue}')`
          break
        case 'component':
          component = attrValue
          break
        case 'permisions':
          permisions = `@this.hasPermissions(${wrap(attrValue)}) &&`
          break
        default:
          return true
      }
    })

    if (!path || !component) {
      throw new Error('xx')
    }

    attrs.push(['path', nextPath], ['searchString', '{{searchString}}'])
    return `{{#if ${permisions} ${path}}}<${component} ${createAttr(attrs)}/>{{/if}}`
  }

  function parseAttribute(routeNodeText) {
    let attrs = []
    let a
    while ((a = REGEX_ATTR.exec(routeNodeText)) !== null) {
      if (a.index === REGEX_ATTR.lastIndex) {
        REGEX_ATTR.lastIndex++
      }
      attrs.push([a[1].trim(), a[2].trim()])
      routeNodeText = routeNodeText.replace(a[0], '')
    }

    return attrs
  }

  function parseRouter(str) {
    let m

    while ((m = REGEX_ROUTE.exec(str)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === REGEX_ROUTE.lastIndex) {
        REGEX_ROUTE.lastIndex++
      }

      str = str.replace(m[0], template(parseAttribute(m[0])))
    }

    return str
  }

  this.cacheable()

  source = parseRouter(source)
  source = Prettier.format(`module.exports = ${JSON.stringify(Ractive.parse(source))};`, prettierConfig)
  return source
}
