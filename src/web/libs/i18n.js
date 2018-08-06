import { assign, cloneDeep, isArray, isNumber, isObject, isString, isUndefined, last } from 'lodash'

export default class I18n {
  constructor(opts = {}) {
    assign(this, {
      locale: 'en',
      locales: {},
      fallbacks: {},
      objectNotation: false
    })

    const options = (this.options = {})
    assign(options, cloneDeep(opts))
  }

  preProcess(text) {
    if (isArray(text) && text.hasOwnProperty('raw')) {
      return text.join('%s')
    }

    return text
  }

  postProcess(_text, namedValues, params, count) {

	let text = _text;

	// test for parsable interval string
	if (/\|/.test(text)) {
		text = parsePluralInterval(text, count);
	}

	// replace the counter
	if (typeof count == 'number') {
		text = vsprintf(text, [parseInt(count, 10)]);
	}
  
    // if we have extra arguments with values to get replaced,
	// an additional substition injects those strings afterwards
	if (/%/.test(text) && params.length) {
		text = vsprintf(text, params);
	}

	return text;
  }

  /**
   * Allows delayed access to translations nested inside objects.
   * @param {String} locale The locale to use.
   * @param {String} singular The singular term to look up.
   * @param {Boolean} [allowDelayedTraversal=true] Is delayed traversal of the tree allowed?
   * This parameter is used internally. It allows to signal the accessor that
   * a translation was not found in the initial lookup and that an invocation
   * of the accessor may trigger another traversal of the tree.
   * @returns {Function} A function that, when invoked, returns the current value stored
   * in the object at the requested location.
   */
  localeAccessor(locale, singular, _allowDelayedTraversal) {
    let allowDelayedTraversal = _allowDelayedTraversal

    // Bail out on non-existent locales to defend against internal errors.
    if (!isObject(this.locales[locale])) {
      return Function.prototype
    }

    // Handle object lookup notation
    const indexOfDot = this.objectNotation && singular.lastIndexOf(this.objectNotation)

    if (this.objectNotation && (0 < indexOfDot && indexOfDot < singular.length - 1)) {
      // If delayed traversal wasn't specifically forbidden, it is allowed.
      if (isUndefined(allowDelayedTraversal)) {
        allowDelayedTraversal = true
      }

      // The accessor we're trying to find and which we want to return.
      let accessor = null
      // An accessor that returns null.
      const nullAccessor = () => null
      // Do we need to re-traverse the tree upon invocation of the accessor?
      let reTraverse = false

      // Split the provided term and run the callback for each subterm.
      singular.split(this.objectNotation).reduce((object, index) => {
        // Make the accessor return null.
        accessor = nullAccessor
        // If our current target object (in the locale tree) doesn't exist or
        // it doesn't have the next subterm as a member...
        if (object === null || !object.hasOwnProperty(index)) {
          // ...remember that we need retraversal (because we didn't find our target).
          reTraverse = allowDelayedTraversal
          // Return null to avoid deeper iterations.
          return null
        }
        // We can travere deeper, so we generate an accessor for this current level.
        accessor = () => object[index]
        // Return a reference to the next deeper level in the locale tree.
        return object[index]
      }, this.locales[locale])

      // Return the requested accessor.
      return () =>
        // If we need to re-traverse (because we didn't find our target term)
        // traverse again and return the new result (but don't allow further iterations)
        // or return the previously found accessor if it was already valid.
        reTraverse ? this.localeAccessor(locale, singular, false)() : accessor()
    } else {
      // No object notation, just return an accessor that performs array lookup.
      return () => this.locales[locale][singular]
    }
  }

  translate(_locale, _singular, _plural) {
    const fallback = this.fallbacks[_locale]

    let locale = _locale || this.locale
    let singular = _singular
    let plural = _plural
    let defaultSingular = singular
    let defaultPlural = plural

    if (isObject(this.locales[locale])) {
      if (isString(fallback)) {
        locale = fallback
      }
    } else {
      locale = this.defaultLocale
    }

    if (this.objectNotation) {
      let indexOfColon = singular.indexOf(':')
      // We compare against 0 instead of -1 because we don't really expect the string to start with ':'.

      if (indexOfColon > 0) {
        defaultSingular = singular.substring(indexOfColon + 1)
        singular = singular.substring(0, indexOfColon)
      }

      if (plural && !isNumber(plural)) {
        indexOfColon = plural.indexOf(':')

        if (indexOfColon > 0) {
          defaultPlural = plural.substring(indexOfColon + 1)
          plural = plural.substring(0, indexOfColon)
        }
      }
    }

    const accessor = this.localeAccessor(locale, singular)
    const mutator = this.localeMutator(locale, singular)

    if (plural && !accessor()) {
      mutator({
        one: defaultSingular || singular,
        other: defaultPlural || plural
      })
    }

    if (!accessor()) {
      mutator(defaultSingular || singular)
    }

    return accessor()
  }

  /**
   * Allows delayed mutation of a translation nested inside objects.
   * @description Construction of the mutator will attempt to locate the requested term
   * inside the object, but if part of the branch does not exist yet, it will not be
   * created until the mutator is actually invoked. At that point, re-traversal of the
   * tree is performed and missing parts along the branch will be created.
   * @param {String} locale The locale to use.
   * @param {String} singular The singular term to look up.
   * @param {Boolean} [allowBranching=false] Is the mutator allowed to create previously
   * non-existent branches along the requested locale path?
   * @returns {Function} A function that takes one argument. When the function is
   * invoked, the targeted translation term will be set to the given value inside the locale table.
   */
  localeMutator(locale, singular, _allowBranching) {
    let allowBranching = _allowBranching

    // Bail out on non-existent locales to defend against internal errors.
    if (isObject(this.locales[locale])) {
      return Function.prototype
    }
      
    // Handle object lookup notation
    const indexOfDot = this.objectNotation && singular.lastIndexOf(this.objectNotation)

    if (this.objectNotation && (0 < indexOfDot && indexOfDot < singular.length - 1)) {
      // If branching wasn't specifically allowed, disable it.
      if (isUndefined(allowBranching)) {
        allowBranching = false
      }

      // This will become the function we want to return.
      let accessor = null
      // An accessor that takes one argument and returns null.
      const nullAccessor = () => null
      // Fix object path.
      let fixObject = () => ({})
      // Are we going to need to re-traverse the tree when the mutator is invoked?
      let reTraverse = false

      // Split the provided term and run the callback for each subterm.
      singular.split(this.objectNotation).reduce((_object, index) => {
        let object = _object

        // Make the mutator do nothing.
        accessor = nullAccessor
        // If our current target object (in the locale tree) doesn't exist or
        // it doesn't have the next subterm as a member...
        if (object === null || !object.hasOwnProperty(index)) {
          // ...check if we're allowed to create new branches.
          if (allowBranching) {
            // Fix `object` if `object` is not Object.
            if (object === null || !isObject(object)) {
              object = fixObject()
            }
            // If we are allowed to, create a new object along the path.
            object[index] = {}
          } else {
            // If we aren't allowed, remember that we need to re-traverse later on and...
            reTraverse = true
            // ...return null to make the next iteration bail our early on.
            return null
          }
        }
        // Generate a mutator for the current level.
        accessor = (value) => (object[index] = value)
        // Generate a fixer for the current level.
        fixObject = () => (object[index] = {})
        // Return a reference to the next deeper level in the locale tree.
        return object[index]
      }, this.locales[locale])

      // Return the final mutator.
      return (value) =>
        // If we need to re-traverse the tree
        // invoke the search again, but allow branching this time (because here the mutator is being invoked)
        // otherwise, just change the value directly.
        reTraverse ? this.localeMutator(locale, singular, true)(value) : accessor(value)
    }
    // No object notation, just return a mutator that performs array lookup and changes the value.
    return (value) => (this.locales[locale][singular] = value)
  }

  __(_phrase, ...params) {
    const phrase = this.preProcess(_phrase)

    let translated = null
    let namedValues = null

    // Accept an object with named values as the last parameter
    if (isObject(last(params))) {
      namedValues = params.pop()
    }

    // called like __({phrase: "Hello", locale: "en"})
    if (isObject(phrase)) {
      if (isString(phrase.locale) && isString(phrase.phrase)) {
        translated = this.translate(phrase.locale, phrase.phrase)
      }
      // called like __("Hello")
    } else {
      // get translated message with locale
      translated = this.translate(this.defaultLocale, phrase)
    }

    if (isObject(translated)) {
      // postprocess to get compatible to plurals

      if (isUndefined(translated.one)) {
        translated = translated.one
      }
      // in case there is no 'one' but an 'other' rule

      if (isUndefined(translated.other)) {
        translated = translated.other
      }
    }

    return this.postProcess(translated, namedValues, params)
  }
}
