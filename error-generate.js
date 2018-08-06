const fs = require('fs')
const path = require('path')

const { camelCase, find, forOwn, get } = require('lodash')

const { default: generator } = require('@babel/generator')
const { default: template } = require('@babel/template')
const parser = require('@babel/parser')
const prettier = require('prettier')
const t = require('@babel/types')

const prettierConfig = require('./.prettierrc')

const serverClassPath = './src/server/Errors.js'
const clientClassPath = './src/web/Errors.js'

const src = `
import { ApolloError } from 'apollo-client'
import { GraphQLError } from 'graphql'
const CODE_LESS_EXTENSION = { code: 'NONE' }
export const PropheticErrorCode = { CodeLessError: 'NONE' }
const _c = PropheticErrorCode
export class PropheticError {
  constructor(codes) { this.codes = codes }
  inCodes(code) { return this.codes.indexOf(code) > -1 }
}
export class PropheticErrorHandled {
  constructor(c) { this.handler = function() {}; this.codes = c }
  inCodes(c, handler) { if (this.codes.indexOf(c) > -1) { this.handler = handler }; return this }
  handle() { return this.handler() }
}
const fc = (e) => {
  if (e instanceof ApolloError) { return e.graphQLErrors.map((ge) => { return fc(ge)[0] }) } 
  else if (e.extensions) { const { extensions: { code } = CODE_LESS_EXTENSION } = e; return [code] }
  return [_c.CodeLessError]
}
export const errorHere = (e) => { if (!e) { return new PropheticError([]) }; return new PropheticError(fc(e)) }
export const isThis = (e) => { if (!e) { return new PropheticErrorHandled([]) }; return new PropheticErrorHandled(fc(e)) }`

const errorClasses = fs.readFileSync(serverClassPath, 'utf8')
const errorClassesAst = parser.parse(errorClasses, { sourceType: 'module' })
const errorExport = errorClassesAst.program.body.filter(t.isExportNamedDeclaration)
const config = errorExport.reduce((prev, { declaration }) => {
  const constr = find(declaration.body.body, { kind: 'constructor' })
  const exp = find(constr.body.body, (n) => t.isSuper(get(n, 'expression.callee')))
  const args = exp.expression.arguments
  prev[declaration.id.name] = {
    message: args[1].value,
    code: args[2].value
  }
  return prev
}, {})

const ast = parser.parse(src, { sourceType: 'module' })
const body = ast.program.body.filter(t.isExportNamedDeclaration)
const PropheticErrorCode = body[0].declaration.declarations[0].init.properties
const PropheticError = body[1].declaration.body.body
const PropheticErrorHandled = body[2].declaration.body.body
const handlerTmpl = template('{return this.inCodes(_c.NAME, handler)}')
const getTmpl = template('{return this.inCodes(_c.NAME)}')

forOwn(config, (e, name) => {
  PropheticErrorCode.push(t.objectProperty(t.identifier(name), t.stringLiteral(e.code)))
  PropheticError.push(t.classMethod('get', t.identifier(camelCase('is' + name)), [], getTmpl({ NAME: name })))
  PropheticErrorHandled.push(
    t.classMethod('method', t.identifier(name), [t.identifier('handler')], handlerTmpl({ NAME: name }))
  )
})

prettierConfig.parser = 'babylon'
const code = prettier.format(generator(ast).code, prettierConfig)
fs.writeFile(path.resolve(__dirname, clientClassPath), code, 'utf8', (e) => {
  e && console.error(e)
})
