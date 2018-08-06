import { join, map, values } from 'lodash'

import View from './View'
import history from '../services/history'

const REGEX_ROUTE = /<(\s|)+route(\W+\w+\s*=\s*["']([^"']+)["'])+(\s|)+\/>/
const REGEX_ATTR = /(\W+\w+)\s*=\s*["']([^"']+)["']/
const wrap = (text) => join(map(text.split(','), (p) => `'${p.trim()}'`), ',')
const createAttr = (ats) => ats.map(([n, v]) => `${n}="${v}"`).join(' ')
const textProcess = (txt, rgx, cb) => {
  let a
  while ((a = rgx.exec(txt))) {
    if (a.index === rgx.lastIndex) {
      rgx.lastIndex++
    }

    txt = cb(a, txt)
  }

  return txt
}

const parseAttribute = (nTxt) => {
  let attrs = []
  textProcess(nTxt, REGEX_ATTR, (a, txt) => {
    attrs.push([a[1].trim(), a[2].trim()])
    return txt.replace(a[0], '')
  })

  return attrs
}

const template = (attrs) => {
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

  if (path && component) {
    attrs.push(['path', nextPath])
    return `{{#if ${permisions} ${path}}}<${component} ${createAttr(attrs)}/>{{/if}}`
  }

  throw new Error('xx')
}
class Router extends View {
  template() {
    let tmpl = this.route

    this.routeSet = Object.create(null)
    tmpl = textProcess(tmpl, REGEX_ROUTE, (m, txt) => {
      const attrs = parseAttribute(m[0])
      const path = attrs.find((i) => i[0] === 'path')[1]
      this.routeSet[path] = new RegExp(`^(${path}/|${path}$)`)
      return txt.replace(m[0], template(attrs))
    })

    return tmpl
  }

  match(path) {
    const _path = this.parent ? this.parent.nextPath : this.get('path')
    const paths = this.routeSet
    if (paths[path].test(_path)) {
      this.nextPath = '/' + _path.replace(paths[path], '')
      return true
    }

    if (values(paths).every((r) => !r.test(_path))) {
      history.navigate('/notfound')
    }

    return false
  }

  hasPermissions() {
    return true
  }
}

export default Router
