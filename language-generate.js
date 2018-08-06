const fs = require('fs')
const path = require('path')

const { forOwn, pick } = require('lodash')

const glob = require('fast-glob')
const translate = require('google-translate-api')

const safeMap = require('./utils/safeMap')
const writeJSON = require('./utils/writeJSON')

const files = glob.sync(['src/web/{modules,components}/**/*.{js,html}'])
const regx = /__\(['|"](.*)['|"].*\)/g
const regxn = /__n\(['|"](.*)['|"].*\)/g

const matchLoop = (regx, src, cb) => {
  let m
  while ((m = regx.exec(src)) !== null) {
    if (m.index === regx.lastIndex) {
      regx.lastIndex++
    }

    cb(m[1])
  }
}

const extract = (f) => {
  return new Promise((rs, rj) => {
    fs.readFile(f, 'utf8', (err, src) => {
      if (err) {
        return rj(err)
      }
      const l = safeMap()
      matchLoop(regx, src, (v) => (l[v] = v))
      matchLoop(regxn, src, (v) => (l[v] = { one: v, other: v }))
      return rs(l)
    })
  })
}

const tasks = files.map((f) => extract(f))
Promise.all(tasks).then((objs) => {
  objs = objs.filter((o) => Object.keys(o).length)
  const lang = Object.assign(safeMap(), ...objs)
  const langFiles = glob.sync(['src/web/languages/*.json'])
  const langList = langFiles.reduce((rev, f) => {
    const filePath = path.resolve(__dirname, './' + f)
    rev[filePath] = require(filePath)
    return rev
  }, safeMap())

  forOwn(langList, async (obj, f) => {
    const keys = Object.keys(lang)
    obj = pick(obj, keys)
    for (let i = keys.length; i--; ) {
      const k = keys[i]
      if (!obj[k]) {
        const tr = await translate(k, { from: 'en', to: path.basename(f, '.json') })
        obj[k] = tr.text
      }
    }
    writeJSON(obj, f)
  })
})
