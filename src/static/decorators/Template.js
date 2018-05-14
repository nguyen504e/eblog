export default function (tmp) {
  return function (target) {
    target.prototype.template = function () {
      return tmp;
    };
  };
}
