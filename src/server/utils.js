import { ObjectID } from 'mongodb'
import { first, isArray, isEmpty, isString, last, mapValues } from 'lodash'

export const getId = (obj) => obj.get('_id')
export const createRegexFilter = (val) => (isString(val) && val.length ? { $regex: val } : val)
export const parseTextFilter = (obj) => mapValues(obj, createRegexFilter)
export const count = async (Model, filter, { total }) => (total > 0 ? undefined : await Model.count(filter))
export const listToJSON = (models = []) => models.map((m) => m.get())

export const parseDateFilter = (dates) => {
  if (!isArray(dates) || isEmpty(dates)) {
    return dates
  }

  if (dates.length === 1) {
    return new Date(dates[0])
  }

  if (dates.length > 1) {
    return { $gte: new Date(first(dates)), $lte: new Date(last(dates)) }
  }
}

export const preparePaging = async (Model, page, cont) => {
  if (page) {
    const { number, size } = page
    return Model.skip(size * (number - 1)).limit(size)
  }

  if (cont) {
    const { index, size } = cont
    return Model.limit(size)
      .where('_id')
      .gt(ObjectID(index))
  }

  return Model
}
