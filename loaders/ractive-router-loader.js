const REGEX_ROUTE = /<(\s|)+route(\W+\w+\s*=\s*["']([^"']+)["'])+(\s|)+\/>/
const REGEX_ATTR = /(\W+\w+)\s*=\s*["']([^"']+)["']/

// const src = `
// <content class="h-100 d-flex flex-column justify-content-between">
// <main>
// <Header />
// <content class="py-4">
// <route component="About" path="/about" />
// <route component="Auth" path="/auth" />
// <route component="Daskboard" path="/" />
// </content>
// </main>
// <Footer />
// </content>`

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
          nextPath = `{{@this.nextPath}}`
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

    attrs.push(['path', nextPath])
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
    let hasIndex
    while ((m = REGEX_ROUTE.exec(str)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === REGEX_ROUTE.lastIndex) {
        REGEX_ROUTE.lastIndex++
      }
      const attrs = parseAttribute(m[0])
      hasIndex = attrs.some((i) => i[0] === 'path' && i[1] === '/')
      str = str.replace(m[0], template(attrs))
    }

    if (hasIndex) {
      str = str + '\n{{#unless isMatched}}{{@this.navNotFound()}}{{/unless}}'
    }

    return str
  }

  this.cacheable()
  source = parseRouter(source)
  console.log(source)
  return source
}

// module.exports(src)
