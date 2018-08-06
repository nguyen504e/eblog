import { sentence, snake } from 'change-case'
import pluralize from 'pluralize'

export default function(collectionName) {
  return function(target) {
    if (!collectionName) {
      const name = target.name
      const names = sentence(name.replace(/Model$/, '')).split(' ')
      const lastIndex = names.length - 1
      names[lastIndex] = pluralize(names[lastIndex])
      collectionName = snake(names.join(' '))
    }

    target.prototype.collectionName = collectionName

    target.prototype.collection = function() {
      return this.collectionName
    }
  }
}
