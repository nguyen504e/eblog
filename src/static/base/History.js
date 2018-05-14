let STATIC = null

class History {
  // Has the history handling already been started?
  static started = false

  static clickEvent = document.ontouchstart ? 'touchstart' : 'click'

  constructor() {
    // Ensure that `History` can be used outside of the browser.
    this.location = window.location
    this.history = window.history
  }

  // Start the hash change handling, returning `true` if the current URL matches
  // an existing route, and `false` otherwise.
  start(options = {}) {
    if (History.started) throw new Error('History has already been started')
    History.started = true

    // Add window event.
    window.addEventListener('popstate', this.checkUrl.bind(this), false)

    // Add click event.
    document.addEventListener(STATIC.clickEvent, this.onclick.bind(this), false)

    if (!options.silent) return this.loadUrl()
  }

  // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
  // but possibly useful for unit testing Routers.
  stop() {
    // Remove window listeners.
    window.removeEventListener('popstate', this.checkUrl.bind(this), false)

    // Remove DOM listeners.
    document.removeEventListener(STATIC.clickEvent, this.onclick.bind(this), false)

    // Some environments will throw when clearing an undefined interval.
    if (this._checkUrlInterval) clearInterval(this._checkUrlInterval)
    History.started = false
  }

  // Checks the current URL to see if it has changed, and if it has,
  checkUrl(/* e */) {
    if (this.location.pathname === this.fragment) {
      return false
    }

    this.loadUrl()
  }

  // Attempt to load the current URL fragment. If a route succeeds with a
  // match, returns `true`. If no defined routes matches the fragment,
  // returns `false`.
  loadUrl(fragment) {
    fragment = this.fragment = this.location.pathname
    this.onLoadUrl && this.onLoadUrl(fragment, this.location.search)
  }

  // Save a fragment into the hash history, or replace the URL state if the
  // 'replace' option is passed. You are responsible for properly URL-encoding
  // the fragment in advance.
  //
  // The options object can contain `trigger: true` if you wish to have the
  // route callback be fired (not usually desirable), or `replace: true`, if
  // you wish to modify the current URL without adding an entry to the history.
  navigate(fragment, { trigger, replace } = { trigger: true }) {
    if (!STATIC.started) {
      return false
    }

    if (this.fragment !== fragment) {
      this.fragment = fragment

      this.history[replace ? 'replaceState' : 'pushState']({}, document.title, fragment)

      if (trigger) {
        this.loadUrl(fragment.startsWith('/') ? fragment : `/${fragment}`)
      }
    }
  }

  _matcheEl(e) {
    // ensure link
    // use shadow dom when available if not, fall back to composedPath() for browsers that only have shady
    let el = e.path ? e.path[0] : e.composedPath ? e.composedPath()[0] : e.target

    // continue ensure link
    // el.nodeName for svg links are 'a' instead of 'A'
    while (el && 'A' !== el.nodeName.toUpperCase()) {
      el = el.parentNode
    }

    return el && 'A' === el.nodeName.toUpperCase() ? el : null
  }

  /**
   * Handle "click" events.
   */
  onclick(e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.defaultPrevented) return

    const el = this._matcheEl(e)
    if (!el) {
      return
    }

    const fragment = el.getAttribute('href')
    try {
      if (new URL(fragment)) {
        return
      }
    } catch (err) {
      e.preventDefault()
      this.navigate(fragment)
    }
  }
}

STATIC = History
export default History
