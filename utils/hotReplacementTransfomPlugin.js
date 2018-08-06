const { default: template } = require('@babel/template')

const options = {
  plugins: ['dynamicImport']
}

const hotAcceptComponents = (components, templatePath) => {
  const aCName = []
  const aCParams = []
  const aComponents = []
  const aCPath = []
  if (components) {
    components.forEach((c) => {
      aCName.push(c.key)
      aCParams.push(`${c.key}: ${c.key}.default`)
      aComponents.push(`import('${c.val}')`)
      aCPath.push(`'${c.val}'`)
    })
  }

  if(templatePath) {
    aCPath.push(`'${templatePath}'`)
    aComponents.push(`import('${templatePath}')`)
    aCName.push('template')
  }

  const src = `
    if(module.hot) {
      const _t_s = this
      module.hot.accept([${aCPath.join(', ')}], () => {
        const tasks = Promise.all([${aComponents.join(', ')}])       

        tasks.then(([${aCName.join(', ')}]) => {
          const cps = ${ aCParams.length ? `{${aCParams.join(', ')}}` : 'null' }
          const tpl = ${templatePath ? 'template.default' : 'null'}

          if(cps) {
            _t_s.components = cps
          }

          _t_s.resetTemplate(tpl || _t_s.cachedTemplate)
        }) 
      })
    }`

  return template(src, options)()
}

module.exports = function plug({ types: t }) {
  return {
    visitor: {
      ClassDeclaration(path) {
        const decorators = path.node.decorators
        const body = path.get('body')

        if (!decorators) {
          return
        }

        let templateDecorator = null
        let componentDecorator = null

        const findImportPath = (name) => {
          const importEx = path.container.find(
            (n) => n.type === 'ImportDeclaration' && n.specifiers.some((s) => s.local.name === name)
          )
          return importEx && importEx.source.value
        }

        decorators.forEach((d) => {
          const name = d.expression.callee.name
          if (name === 'Template') {
            templateDecorator = findImportPath(d.expression.arguments[0].name)
          } else if (name === 'Components') {
            componentDecorator = d.expression.arguments[0].properties.map((p) => ({
              key: p.key.name,
              val: findImportPath(p.value.name)
            }))
          }
        })

        if (!templateDecorator && !componentDecorator) {
          return
        }

        let oninit = null
        path.node.body.body.some((f) => f.key.name === 'oninit' && (oninit = f))

        if (!oninit) {
          oninit = t.classMethod('method', t.identifier('oninit'), [], t.blockStatement([]))
          oninit.params = [t.restElement(t.identifier('args'))]
          oninit.body.body.push(
            t.expressionStatement(
              t.callExpression(t.memberExpression(t.super(), t.identifier('oninit')), [
                t.spreadElement(t.identifier('args'))
              ])
            )
          )

          body.unshiftContainer('body', oninit)
        }

        oninit.body.body.push(hotAcceptComponents(componentDecorator, templateDecorator))
      }
    }
  }
}
