export default function(key, val) {
  return function(target) {
    target[key] = val
  }
}
