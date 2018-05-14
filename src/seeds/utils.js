import { filter } from 'lodash'
export const pickId = (obj, keyName, keys) => {
  return filter(obj, (o) => keys.includes(o.keyName)).map((o) => o._id)
}
