export const Css = function(val) {
  return function(target) {
    target.prototype.css = val
  }
}

export const Route = function(val) {
  return function(target) {
    target.prototype.route = val
  }
}
export const Template = function(val) {
  return function(target) {
    target.prototype.template = val
    if (module.hot) {
      target.prototype.cachedTemplate = val
    }
  }
}

export const Permission = function(...permisions) {
  return function(target) {
    target.prototype.permissions = function() {
      return permisions
    }
  }
}

export const Components = function(components) {
  return function(target) {
    target.components = target.components || {}
    Object.assign(target.components, components)
  }
}

export const Static = function(key, val) {
  return function(target) {
    target[key] = val
  }
}
