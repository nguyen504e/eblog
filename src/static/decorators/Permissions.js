export default function (...permisions) {
  return function (target) {
    target.prototype.permissions = function() {
      return permisions
    };
  }
}
