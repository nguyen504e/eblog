import prt from 'sprintf-js'

class Language {
  constructor() {
    this.langs = navigator.languages
  }

  setup(langs) {
    return this.getLanguage(langs || this.langs).then((module) => {
      this.getMsg = module ? (k) => module.default[k] : (k) => k
    })
  }

  getLanguage(langs = []) {
    const map = {
      vi() {
        return import('../languages/vi.json')
      }
    }

    let len = langs.length
    while (len--) {
      let lang = langs[len]
      if (map[lang]) {
        return map[lang]
      }

      lang = lang.split('-')[0]
      if (map[lang]) {
        return map[lang]
      }
    }

    return Promise.resolve()
  }

  __(...args) {
    let msg = this.getMsg(args[0])
    if (args.length > 1) {
      msg = prt(msg, args.slice(1))
    }

    return msg
  }

  __n(singular, count) {
    let msg = this.getMsg(singular)
    count = parseInt(count, 10)
    if (count === 0) msg = msg.zero
    else msg = count > 1 ? msg.other : msg.one

    msg = prt(msg, [count])

    if (arguments.length > 2) msg = prt(msg, Array.from(arguments).slice(2))

    return msg
  }
}

export default new Language()
