export default function(...plugins) {
  return function(target) {
    plugins.forEach((p) => target.use(p))
  }
}
