export default function(route) {
  return function(target) {
    target.prototype.route = function() {
      return route
    }
  }
}
